# Especificação Funcional: US-37 — Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline

**Identificador**: `US-37`  
**Issue GitHub**: [#162](https://github.com/ADS-IFPB-SR/alumigest/issues/162)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como vendedor, orçamentista ou proprietário da Alumiportas, desejo instalar a aplicação como um aplicativo nativo (PWA) no computador (desktop/laptop) ou smartphone/tablet — abrindo diretamente pela área de trabalho ou tela inicial sem precisar digitar URLs no navegador — e ser capaz de navegar pelo catálogo de modelos/esquadrias e preencher rascunhos de orçamentos diretamente na obra ou no balcão mesmo sem conexão com a internet, persistindo os dados em IndexedDB local e sincronizando automaticamente com o backend para validação e cálculo oficial de preços assim que a conectividade for restabelecida.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Instalação Standalone do PWA sem Barra de URL (Desktop e Mobile)**
  - **Dado que** o vendedor acessa o sistema pelo Google Chrome, Edge ou Safari,
  - **Quando** o Service Worker detecta os critérios de instalabilidade PWA atendidos,
  - **Então** o sistema disponibiliza o botão "Instalar AlumiGest no Dispositivo",
  - **E** ao confirmar, o ícone é adicionado à Área de Trabalho / Barra de Tarefas (Windows) ou Tela de Início (Android/iOS), abrindo em janela nativa dedicada (`display: standalone`) sem barra de navegação de browser e sem necessidade de digitar URL.

- [ ] **Cenário 2: Cache Inteligente de Catálogo Comercial para Operação Offline**
  - **Dado que** o vendedor abre o aplicativo conectado à internet na serralheria,
  - **Quando** a autenticação é realizada,
  - **Então** o sistema executa silenciosamente a sincronização do catálogo via `GET /api/v1/sync/sales-catalog`,
  - **E** armazena no IndexedDB local (`Dexie.js`) a lista de templates de esquadrias ativos (portas, janelas, portões, basculantes), acabamentos de alumínio, tipos e espessuras de vidro, componentes de ferragens e os 50 clientes mais recentes.

- [ ] **Cenário 3: Elaboração e Persistência de Rascunho de Orçamento Offline**
  - **Dado que** o vendedor está na obra de um cliente em local sem cobertura de internet,
  - **Quando** acessa "Novo Orçamento", seleciona o cliente (ou digita nome/telefone provisório) e insere as medidas em milímetros (largura x altura) de uma esquadria do catálogo,
  - **Então** o sistema grava o registro na tabela local `budgetDrafts` do IndexedDB com UUID gerado localmente (`clientDraftId`), status `PENDING_SYNC` e data/hora local,
  - **E** exibe feedback visual claro: "Rascunho salvo no dispositivo. Será sincronizado assim que a conexão retornar."

- [ ] **Cenário 4: Indicador Visual de Conectividade e Fila de Sincronização**
  - **Dado que** o dispositivo entra em modo offline durante o atendimento,
  - **Quando** o hook `useNetworkStatus` detecta o desligamento da rede (`window.addEventListener('offline')`),
  - **Então** o componente `NetworkStatusBanner` exibe um badge discreto no topo: "Modo Offline — Orçamentos serão salvos localmente",
  - **E** um contador exibe o total de rascunhos pendentes de envio (`DraftsQueueIndicator: N pendentes`).

- [ ] **Cenário 5: Sincronização Automática com Cálculo Oficial no Backend (SOLID)**
  - **Dado que** o aparelho reconecta à internet (Wi-Fi ou 4G),
  - **Quando** o evento `online` é disparado,
  - **Então** o PWA envia automaticamente o lote de rascunhos para `POST /api/v1/sync/budget-drafts`,
  - **E** o backend Spring Boot aplica com exclusividade todo o motor de regras de precificação (`BudgetService`), calcula metros quadrados, peso de alumínio, perdas, margem de lucro e gera o código oficial do orçamento (`ORC-YYYY-NNNN`),
  - **E** o frontend atualiza o status do rascunho para `SYNCED`, exibindo notificação de sucesso e vinculando o orçamento oficial gerado.

---

## 📋 Regras de Negócio e Restrições Arquiteturais

- **RN-01 (Inviolabilidade da Lógica de Negócio no Backend - SOLID):** É estritamente proibido implementar regras de cálculo financeiro, precificação, fórmulas paramétricas de perfis ou rateio de custos no frontend da aplicação. O frontend offline apenas coleta e persiste as entradas brutas (medidas, quantidades, acabamentos e identificadores de templates). O backend é o detentor absoluto das regras de cálculo na sincronização.
- **RN-02 (Tolerância a Falhas e Idempotência):** Cada rascunho de orçamento gerado no cliente possui um `clientDraftId` (UUID v4). Caso ocorra falha no meio da sincronização ou retry de rede, o backend garante idempotência via `clientDraftId`, evitando duplicidade de orçamentos.
- **RN-03 (Estratégia Workbox Stale-While-Revalidate):** Todos os assets da aplicação (HTML, bundles JS/CSS, ícones SVG e miniaturas dos templates de esquadrias) devem permanecer disponíveis offline através de cache storage gerenciado pelo Service Worker.
- **RN-04 (Diretriz de Nomenclatura Técnica e Idioma):**
  - DTOs / Records: `SalesCatalogResponse`, `BudgetDraftSyncRequest`, `BudgetDraftSyncResponse`, `TemplateCatalogItemDto`
  - Enums: `SyncStatus` (`PENDING_SYNC`, `SYNCING`, `SYNCED`, `FAILED`)
  - IndexedDB: `offlineDb` tipado via `Dexie`, tabelas `salesCatalog`, `recentClients`, `budgetDrafts`

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/sync/sales-catalog` (retorna catálogo ativo de templates, cores de alumínio, vidros e componentes)
  - `POST /api/v1/sync/budget-drafts` (recebe lista de rascunhos brutos, executa motor de precificação e cria orçamentos oficiais)
- **Serviço:** `SyncService.java` (orquestra carga de catálogo e delega criação ao `BudgetService.java`)
- **Records Java 21:**
  - `SalesCatalogResponse.java`
  - `BudgetDraftSyncRequest.java`
  - `BudgetDraftSyncResponse.java`

### Frontend (React 19 / Vite PWA / Dexie.js / Tailwind)
- **Módulos & Configurações:**
  - `frontend/vite.config.ts`: plugin `VitePWA` configurado com manifesto nativo, ícones de desktop e mobile e regras de Workbox.
  - `frontend/src/features/pwa/db/offlineDb.ts`: instância Dexie gerenciando tabelas locais.
  - `frontend/src/features/pwa/hooks/useNetworkStatus.ts`: monitoramento reativo de online/offline.
  - `frontend/src/features/pwa/hooks/useSyncDrafts.ts`: lógica de disparo de sincronização e conciliação de rascunhos.
  - `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`: aviso visual superior de modo offline.
  - `frontend/src/features/pwa/components/DraftsQueueModal.tsx`: listagem e retry manual de rascunhos pendentes.

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário do schema Dexie validando operações CRUD locais no IndexedDB em ambiente de teste.
- [ ] Teste unitário do `SyncServiceTest` no backend validando idempotência por `clientDraftId` e delegação ao `BudgetService`.
- [ ] Teste de Service Worker com Lighthouse PWA Audit atingindo score $\ge 90$ e status de instalabilidade "Installable".
- [ ] Validação E2E no Chrome DevTools: alternar para "Offline", criar rascunho de orçamento com medidas de janela, voltar para "Online" e verificar a criação automática do orçamento oficial no backend.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-37.1](issues/US-37.1-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md) | Configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto standalone, ícones e atalho direto | 🔲 No Backlog |
| [US-37.2](issues/US-37.2-criar-schema-do-banco-local-indexeddb-com-dex/issue.md) | Criar schema do banco local IndexedDB com Dexie para catálogo e rascunhos de orçamentos | 🔲 No Backlog |
| [US-37.3](issues/US-37.3-criar-custom-hook-usenetworkstatus-para-monit/issue.md) | Criar custom hook `useNetworkStatus` e hook de sincronização `useSyncDrafts` | 🔲 No Backlog |
| [US-37.4](issues/US-37.4-criar-componente-networkstatusbanner-no-layou/issue.md) | Criar componente `NetworkStatusBanner` e modal de fila de rascunhos pendentes | 🔲 No Backlog |
| [US-37.5](issues/US-37.5-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) | Criar package `br.edu.ifpb.alumigest.sync` no backend para sincronização comercial | 🔲 No Backlog |
| [US-37.6](issues/US-37.6-criar-record-fieldpackageresponse-em-backend-/issue.md) | Criar records `SalesCatalogResponse`, `BudgetDraftSyncRequest` e `BudgetDraftSyncResponse` no backend | 🔲 No Backlog |
| [US-37.7](issues/US-37.7-implementar-servico-syncservice-obterpacoteca/issue.md) | Implementar `SyncService` no backend agregando catálogo e orquestrando cálculos com `BudgetService` | 🔲 No Backlog |
| [US-37.8](issues/US-37.8-criar-endpoint-get-api-sync-field-package-no-/issue.md) | Criar endpoints `GET /api/v1/sync/sales-catalog` e `POST /api/v1/sync/budget-drafts` | 🔲 No Backlog |
| [US-37.9](issues/US-37.9-implementar-rotina-de-pre-carregamento-no-dex/issue.md) | Integrar formulário de orçamento no frontend para salvar rascunho offline em IndexedDB e sincronizar | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-37-pwa-offline-indexeddb`
