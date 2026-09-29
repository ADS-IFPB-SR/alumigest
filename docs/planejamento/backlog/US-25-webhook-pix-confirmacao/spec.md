# Especificação Funcional: US-25 — Confirmar Pagamento PIX via Webhook com Liberação Automática

**Identificador**: `US-25`  
**Issue GitHub**: [#150](https://github.com/ADS-IFPB-SR/alumigest/issues/150)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Receber notificações de confirmação de pagamento PIX via Webhook seguro com liquidação e avanço automático do pedido.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-25.1-criar-record-pixstatusresponse-em-backend-src/issue.md) | Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java` | 🔲 No Backlog |
| [US](issues/US-25.2-implementar-metodo-liquidarpix-string-txid-st/issue.md) | Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido | 🔲 No Backlog |
| [US](issues/US-25.3-criar-endpoint-get-api-payments-pix-status-tx/issue.md) | Criar endpoint GET /api/payments/pix/status/{txid} no `PixPaymentController` para polling de status | 🔲 No Backlog |
| [US](issues/US-25.4-criar-endpoint-post-api-webhooks-pix-no-pixwe/issue.md) | Criar endpoint POST /api/webhooks/pix no `PixWebhookController` | 🔲 No Backlog |
| [US](issues/US-25.5-criar-endpoint-post-api-payments-pix-simulate/issue.md) | Criar endpoint POST /api/payments/pix/simulate/{txid} no `PixPaymentController` para testes no ambiente dev | 🔲 No Backlog |
| [US](issues/US-25.6-criar-testes-de-integracao-rest-do-fluxo-de-l/issue.md) | Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
