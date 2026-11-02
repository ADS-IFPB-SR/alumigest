# [US-37.6] Criar records `SalesCatalogResponse`, `BudgetDraftSyncRequest` e `BudgetDraftSyncResponse` no backend

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.6`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 3: Backend Contracts & DTOs`
- **User Story**: [US2 - Backend Sync Engine]
- **Sub-área**: `Backend`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/`
- **Labels Sugeridas**: `release-3`, `backend`, `java`, `dto`, `records`, `clean-code`

---

## 🎯 Objetivo & Descrição

Criar os DTOs imutáveis (Records Java 21) para o protocolo de sincronização comercial:
1. `SalesCatalogResponse`: lista de templates ativos (id, código, nome, medidas mínimas/máximas padrão), acabamentos de alumínio, opções de vidros, componentes de ferragens e lista resumida de clientes recentes.
2. `BudgetDraftSyncRequest`: rascunho de orçamento criado offline (`clientDraftId`, `clientId`, `clientName`, `clientPhone`, `templateId`, `widthMm`, `heightMm`, `aluminumColor`, `glassType`, `notes`, `createdAt`).
3. `BudgetDraftSyncResponse`: resultado do processamento (`clientDraftId`, `budgetId`, `budgetCode`, `totalAmount`, `status`, `message`).

---

## 🛠️ Checklist de Implementação

- [ ] Criar `SalesCatalogResponse.java` com records aninhados para tipologias e catálogos de matérias-primas.
- [ ] Criar `BudgetDraftSyncRequest.java` com validações via Bean Validation (`@NotNull`, `@Positive`).
- [ ] Criar `BudgetDraftSyncResponse.java` contendo identificador oficial do orçamento gerado e valor calculado pelo motor oficial.

---

## ✅ Critérios de Aceitação

1. Records implementados de forma imutável com tipos estritos (`UUID`, `BigDecimal`, `Long`, `String`).
2. Validação rigorosa dos dados de entrada (largura e altura obrigatórias e positivas).
3. `mvn clean compile` sem erros.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
