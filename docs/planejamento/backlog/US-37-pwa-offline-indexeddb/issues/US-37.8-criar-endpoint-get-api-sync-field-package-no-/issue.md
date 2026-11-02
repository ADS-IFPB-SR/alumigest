# [US-37.8] Criar endpoints `GET /api/v1/sync/sales-catalog` e `POST /api/v1/sync/budget-drafts` no `SyncController`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.8`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 3: Controller & API Contracts`
- **User Story**: [US2 - Backend Sync Engine]
- **Sub-área**: `Backend`
- **Execução Paralela**: ❌ Não
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`
- **Labels Sugeridas**: `release-3`, `backend`, `java`, `rest-api`, `spring-boot`, `swagger`

---

## 🎯 Objetivo & Descrição

Criar os endpoints RESTful no `SyncController`:
1. `GET /api/v1/sync/sales-catalog`: responde com o catálogo comercial estruturado para cache do PWA (`200 OK`).
2. `POST /api/v1/sync/budget-drafts`: recebe lote de rascunhos em JSON, processa no `SyncService` e retorna lista de `BudgetDraftSyncResponse` com os orçamentos oficiais criados (`200 OK` / `207 Multi-Status`).
3. Documentar no Swagger OpenAPI com tags e descrições técnicas.

---

## 🛠️ Checklist de Implementação

- [ ] Criar classe `SyncController` com anotações `@RestController`, `@RequestMapping("/api/v1/sync")`, `@RequiredArgsConstructor`.
- [ ] Implementar endpoint `GET /sales-catalog`.
- [ ] Implementar endpoint `POST /budget-drafts` com validação de payload `@Valid`.
- [ ] Adicionar anotações Swagger/OpenAPI (`@Operation`, `@ApiResponse`).
- [ ] Criar testes de integração com `MockMvc` em `SyncControllerTest`.

---

## ✅ Critérios de Aceitação

1. Endpoints respondem com códigos HTTP padronizados (`200 OK`, `400 Bad Request`, `401 Unauthorized`).
2. Testes de integração `SyncControllerTest` passando com sucesso.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
