# Especificação Funcional: US-37 — Instalar PWA e Consultar Pedidos e OS Offline via IndexedDB

**Identificador**: `US-37`  
**Issue GitHub**: [#162](https://github.com/ADS-IFPB-SR/alumigest/issues/162)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como instalador ou coordenador externo da Alumiportas, desejo instalar a aplicação web como um aplicativo nativo no smartphone (PWA) e consultar Ordens de Serviço (`OS-YYYY-NNNN`), detalhes de esquadrias e endereços de clientes mesmo em obras ou zonas rurais sem conectividade com a internet, através de cache local persistente em IndexedDB.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Instalação do Aplicativo via Prompt PWA**
  - **Dado que** o usuário acessa o AlumiGest via navegador móvel compatível (Chrome/Safari),
  - **Quando** o Service Worker detecta os critérios de instalabilidade PWA atendidos,
  - **Então** o sistema exibe o banner customizado "Instalar AlumiGest no Início",
  - **E** ao confirmar, o ícone é adicionado à tela inicial com abertura standalone sem barra de URL do navegador.

- [ ] **Cenário 2: Carga Inicial do Pacote de Trabalho Diário (Field Package)**
  - **Dado que** o instalador abre o aplicativo enquanto conectado à rede Wi-Fi/4G da serralheria,
  - **Quando** a autenticação é validada,
  - **Então** o sistema executa automaticamente a sincronização do endpoint `GET /api/v1/sync/field-package`,
  - **E** armazena no IndexedDB (`Dexie.js`) todas as Ordens de Serviço agendadas para sua equipe na semana, contatos de clientes e instruções técnicas de montagem.

- [ ] **Cenário 3: Operação em Modo Offline com Feedback Visual Imediato**
  - **Dado que** o dispositivo perde a conexão com a internet durante o deslocamento ou na obra,
  - **Quando** o hook `useNetworkStatus` detecta o evento `window.addEventListener('offline')`,
  - **Então** o componente `NetworkStatusBanner` exibe uma barra superior em âmbar informando "Modo Offline — Trabalhando com dados locais",
  - **E** a aplicação permanece 100% responsiva e navegável para as telas de detalhes da O.S. e checklist.

- [ ] **Cenário 4: Consulta aos Detalhes da O.S. a partir do Banco Local IndexedDB**
  - **Dado que** o instalador está offline e clica em uma Ordem de Serviço,
  - **Quando** a tela de detalhes é requisitada,
  - **Então** o repositório local Dexie recupera o registro da tabela local `serviceOrders`,
  - **E** exibe a lista completa de perfis, medidas em milímetros, ferragens e observações sem lançar erro de conexão.

- [ ] **Cenário 5: Transição Suave e Alerta ao Retornar à Conectividade**
  - **Dado que** o aparelho restabelece conexão com rede 4G/Wi-Fi,
  - **Quando** o evento `online` é disparado,
  - **Então** o banner âmbar se transforma em verde temporário ("Conexão restabelecida!") e desaparece após 4 segundos,
  - **E** inicia silenciosamente a checagem de atualizações no backend.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Isolamento de Dados por Equipe):** O pacote offline baixado contém estritamente as Ordens de Serviço alocadas para a equipe do usuário autenticado (`teamId`), preservando a segurança da informação.
- **RN-02 (Tolerância a Falhas):** Nenhuma falha de rede (`ERR_INTERNET_DISCONNECTED` ou `NetworkError`) pode quebrar a UI ou exibir tela em branco (white screen of death).
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades locais, hooks e DTOs em inglês: `FieldPackageResponse`, `offlineDb`, `serviceOrdersTable`, `isOnline`, `isSyncing`, `lastSyncedAt`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/sync/field-package?teamId=...` (retorna snapshot consolidado de O.S., pedidos e clientes)
- **DTO:** `FieldPackageResponse` (record Java 21)

### Frontend (React 19 / Vite PWA / Dexie.js / Tailwind)
- **Módulos & Configurações:**
  - `vite.config.ts` com `VitePWA` configurado (Workbox cache strategies, manifesto e ícones)
  - `offlineDb.ts` (banco IndexedDB tipado via Dexie)
  - `useNetworkStatus.ts` (hook de monitoramento de conectividade)
  - `NetworkStatusBanner.tsx` (componente visual de status de rede)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário do schema Dexie validando operações CRUD locais no IndexedDB simulado.
- [ ] Teste de Service Worker com Lighthouse PWA Audit atingindo score $\ge 90$.
- [ ] Validação manual/E2E desligando o tráfego de rede (Chrome DevTools Offline) e navegando com sucesso pelas O.S. baixadas.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (9 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-37.1](issues/US-37.1-instalar-e-configurar-vite-plugin-pwa-no-fron/issue.md) | Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen | 🔲 No Backlog |
| [US-37.2](issues/US-37.2-criar-schema-do-banco-local-indexeddb-com-dex/issue.md) | Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts` | 🔲 No Backlog |
| [US-37.3](issues/US-37.3-criar-custom-hook-usenetworkstatus-para-monit/issue.md) | Criar custom hook `useNetworkStatus` para monitorar conectividade | 🔲 No Backlog |
| [US-37.4](issues/US-37.4-criar-componente-networkstatusbanner-no-layou/issue.md) | Criar componente `NetworkStatusBanner` no layout principal | 🔲 No Backlog |
| [US-37.5](issues/US-37.5-criar-package-br-edu-ifpb-alumigest-sync-no-b/issue.md) | Criar package `br.edu.ifpb.alumigest.sync` no backend | 🔲 No Backlog |
| [US-37.6](issues/US-37.6-criar-record-fieldpackageresponse-em-backend-/issue.md) | Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java` | 🔲 No Backlog |
| [US-37.7](issues/US-37.7-implementar-servico-syncservice-obterpacoteca/issue.md) | Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando OPs e OSs | 🔲 No Backlog |
| [US-37.8](issues/US-37.8-criar-endpoint-get-api-sync-field-package-no-/issue.md) | Criar endpoint GET `/api/v1/sync/field-package` no `SyncController` | 🔲 No Backlog |
| [US-37.9](issues/US-37.9-implementar-rotina-de-pre-carregamento-no-dex/issue.md) | Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-37-pwa-offline-indexeddb`
