# Especificação Funcional: US-38 — Sincronizar Fila de Alterações e Fotos em Segundo Plano

**Identificador**: `US-38`  
**Issue GitHub**: [#163](https://github.com/ADS-IFPB-SR/alumigest/issues/163)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como instalador de campo da Alumiportas, desejo que todas as ações realizadas sem sinal de internet (mudança de status de O.S., fotos do "Antes/Depois" e assinaturas digitais) fiquem guardadas em uma fila persistente no smartphone e sejam sincronizadas automaticamente em segundo plano com o servidor assim que o sinal de rede retornar, garantindo integridade de dados e eliminando retrabalho.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Enfileiramento Seguro de Mutações no IndexedDB Local**
  - **Dado que** o instalador está offline e conclui a O.S. com anexação de fotos,
  - **Quando** clica em "Salvar / Concluir",
  - **Então** o sistema armazena a ação na tabela `syncQueue` do IndexedDB,
  - **E** atribui um identificador único `mutationId` (UUID), timestamp local e status `PENDING`,
  - **E** exibe feedback visual amigável: "Alteração salva localmente. Será sincronizada assim que você estiver online".

- [ ] **Cenário 2: Disparo Automático via Evento de Rede e Background Sync**
  - **Dado que** existem 3 itens na fila de sincronização pendente,
  - **Quando** o dispositivo detecta sinal de internet (evento `online`),
  - **Então** o hook `useOfflineQueue` inicia automaticamente o envio dos itens em lote,
  - **E** atualiza o indicador no header com ícone de spinner e texto "Sincronizando 3 alterações...".

- [ ] **Cenário 3: Processamento Idempotente em Lote no Backend**
  - **Dado que** o frontend envia o payload `SyncBatchRequest` para `/api/v1/sync/batch`,
  - **Quando** o backend processa o lote através do `SyncService`,
  - **Então** aplica cada mutação respeitando a cronologia original,
  - **E** se uma `mutationId` já tiver sido processada anteriormente, ignora a duplicação retornando sucesso idempotente,
  - **E** retorna o `SyncBatchResponse` com a lista de itens sincronizados com sucesso.

- [ ] **Cenário 4: Política de Retentativa com Backoff Exponencial para Falhas de Rede**
  - **Dado que** ocorre uma instabilidade passageira no sinal móvel durante o envio de uma foto pesada,
  - **Quando** a requisição falha com timeout ou erro de rede,
  - **Então** o item permanece na fila, incrementa `retryCount = retryCount + 1`,
  - **E** agenda nova tentativa aplicando backoff exponencial (ex: 5s, 15s, 45s).

- [ ] **Cenário 5: Gaveta Visual da Fila de Sincronização (`SyncQueueDrawer`)**
  - **Dado que** o instalador deseja conferir o que ainda está pendente de envio,
  - **Quando** toca no badge de sincronização do cabeçalho,
  - **Então** uma gaveta lateral é aberta listando cada item enfileirado com descrição, miniatura da foto, horário e status,
  - **E** disponibiliza o botão "Sincronizar Agora" para forçar o disparo manual se desejado.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Ordem Cronológica Estrita):** As mutações referentes a uma mesma Ordem de Serviço devem ser despachadas e processadas na ordem exata em que foram criadas no cliente.
- **RN-02 (Idempotência Obrigatória):** Toda mutação offline deve carregar um UUID `mutationId`. O backend deve persistir os `mutationIds` processados para evitar gravação em duplicidade caso o cliente reenvie o lote após perda de ACK.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e hooks em inglês: `SyncBatchRequest`, `SyncBatchResponse`, `mutationId`, `entityType`, `actionType`, `payload`, `retryCount`, `syncStatus` (`PENDING`, `SYNCING`, `SYNCED`, `FAILED`).

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Tabela:** `processed_sync_mutations` (id, `mutation_id`, `entity_type`, `processed_at`)
- **Endpoints:**
  - `POST /api/v1/sync/batch` (recebimento e processamento transacional de lote de mutações)
- **DTOs:** `SyncBatchRequest` e `SyncBatchResponse`

### Frontend (React 19 / Dexie.js / TanStack Query / Tailwind)
- **Hooks & Componentes:**
  - `useOfflineQueue.ts` (gerenciador de fila, despachante e backoff)
  - `SyncQueueDrawer.tsx` (interface com itens pendentes e acionamento manual)
  - `SyncStatusBadge.tsx` (indicador no cabeçalho da aplicação)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário do `SyncServiceTest` validando transacionalidade, garantia de idempotência com UUID repetido e tratamento de erros.
- [ ] Teste unitário do hook `useOfflineQueue` validando enfileiramento offline e disparo de lote pós-reconexão.
- [ ] Teste E2E Cypress simulando corte de rede, ação de conclusão de O.S., retorno da rede e verificação do status final sincronizado.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-38.1](issues/US-38.1-criar-record-syncbatchrequest-e-syncbatchresp/issue.md) | Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/` | 🔲 No Backlog |
| [US-38.2](issues/US-38.2-implementar-metodo-processarlote-syncbatchreq/issue.md) | Implementar método `processarLote(SyncBatchRequest request)` no `SyncService` | 🔲 No Backlog |
| [US-38.3](issues/US-38.3-criar-endpoint-post-api-sync-batch-no-synccon/issue.md) | Criar endpoint POST `/api/v1/sync/batch` no `SyncController` | 🔲 No Backlog |
| [US-38.4](issues/US-38.4-criar-testes-unitarios-do-syncservicetest/issue.md) | Criar testes unitários do `SyncServiceTest` | 🔲 No Backlog |
| [US-38.5](issues/US-38.5-criar-custom-hook-useofflinequeue-com-process/issue.md) | Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático | 🔲 No Backlog |
| [US-38.6](issues/US-38.6-criar-componente-syncqueuedrawer-com-lista-de/issue.md) | Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora" | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-38-sincronizacao-fila-fotos-background`
