# 📋 Issues da Sprint 9 — Pagamento e Cobrança via PIX

Este diretório contém todas as **27 issues** detalhadas da Sprint 9 prontas para desenvolvimento, organizadas por pastas individuais para cada tarefa.

---

## 📑 Lista de Issues por Fase


### Phase 1: Setup & Foundational

- [T001: Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance`](T001-criar-package-br-edu-ifpb-alumigest-finance-e/issue.md)
- [T002: Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions`](T002-criar-migration-flyway-backend-src-main-resou/issue.md)
- [T003: Criar enums `PaymentType`, `PaymentMethod`, `PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`](T003-criar-enums-paymenttype-paymentmethod-payment/issue.md) `[P]`
- [T004: Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java`](T004-criar-entidade-jpa-payment-em-backend-src-mai/issue.md)
- [T005: Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java`](T005-criar-entidade-jpa-pixtransaction-em-backend-/issue.md)
- [T006: Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java`](T006-criar-repositorio-paymentrepository-em-backen/issue.md) `[P]`
- [T007: Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java`](T007-criar-repositorio-pixtransactionrepository-em/issue.md) `[P]`
- [T008: Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java`](T008-criar-gerador-de-payload-emv-br-code-pixpaylo/issue.md)

### Phase 2: User Story 1 - Geração de Cobrança PIX com QR Code (Priority: P1) 🎯 MVP

- [T009: Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java`](T009-criar-record-pixgeneraterequest-tipopagamento/issue.md) `[P]` `[US1]`
- [T010: Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java`](T010-criar-record-pixchargeresponse-txid-valor-pay/issue.md) `[P]` `[US1]`
- [T011: Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java`](T011-criar-interface-pixgatewayservice-e-implement/issue.md) `[US1]`
- [T012: Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java`](T012-implementar-servico-pixservice-gerarcobrancap/issue.md) `[US1]`
- [T013: Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java`](T013-criar-endpoint-post-api-payments-pix-generate/issue.md) `[US1]`
- [T014: Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest`](T014-criar-testes-unitarios-do-pixpayloadgenerator/issue.md) `[P]` `[US1]`

### Phase 3: User Story 2 - Confirmação Automática de Pagamento e Liberação (Priority: P1) 🎯 MVP

- [T015: Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java`](T015-criar-record-pixstatusresponse-em-backend-src/issue.md) `[P]` `[US2]`
- [T016: Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido](T016-implementar-metodo-liquidarpix-string-txid-st/issue.md) `[US2]`
- [T017: Criar endpoint GET /api/payments/pix/status/{txid} no `PixPaymentController` para polling de status](T017-criar-endpoint-get-api-payments-pix-status-tx/issue.md) `[US2]`
- [T018: Criar endpoint POST /api/webhooks/pix no `PixWebhookController`](T018-criar-endpoint-post-api-webhooks-pix-no-pixwe/issue.md) `[US2]`
- [T019: Criar endpoint POST /api/payments/pix/simulate/{txid} no `PixPaymentController` para testes no ambiente dev](T019-criar-endpoint-post-api-payments-pix-simulate/issue.md) `[US2]`
- [T020: Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest`](T020-criar-testes-de-integracao-rest-do-fluxo-de-l/issue.md) `[P]` `[US2]`

### Phase 4: User Story 3 - Modal PIX Interativo no Frontend (Priority: P1) 🎯 MVP

- [T021: Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts`](T021-criar-interfaces-typescript-e-servico-axios-p/issue.md) `[P]` `[US3]`
- [T022: Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts`](T022-criar-custom-hook-usepixpayment-com-polling-a/issue.md) `[US3]`
- [T023: Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx`](T023-criar-componente-pixpaymentmodal-com-qr-code-/issue.md) `[US3]`
- [T024: Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx`](T024-criar-componente-pixpaymentsuccessalert-com-a/issue.md) `[US3]`
- [T025: Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO`](T025-integrar-botao-gerar-pix-na-pagina-de-detalhe/issue.md) `[US3]`

### Phase 5: Polish & Cross-Cutting Concerns

- [T026: Documentar endpoints no OpenAPI/Swagger](T026-documentar-endpoints-no-openapi-swagger/issue.md) `[P]`
- [T027: Executar validação dos cenários de teste do `quickstart.md` da Sprint 9](T027-executar-validacao-dos-cenarios-de-teste-do-q/issue.md)
