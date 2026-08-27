# Tasks: Sprint 9 — Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola)

**Feature**: `006-pagamento-cobranca-pix`
**Generated**: 2026-08-27
**Source**: spec.md, plan.md, data-model.md, contracts/api-pix.md, research.md

---

## Phase 1: Setup & Foundational

**Purpose**: Migration Flyway V12, Entidades JPA, Repositories e Enums

- [ ] T001 Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance`
- [ ] T002 Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions`
- [ ] T003 [P] Criar enums `PaymentType`, `PaymentMethod`, `PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- [ ] T004 Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java`
- [ ] T005 Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java`
- [ ] T006 [P] Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java`
- [ ] T007 [P] Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java`
- [ ] T008 Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java`

---

## Phase 2: User Story 1 - Geração de Cobrança PIX com QR Code (Priority: P1) 🎯 MVP

**Goal**: Gerar cobrança PIX com QR Code dinâmico e código Copia e Cola associados a um pedido.

**Independent Test**: Gerar cobrança de R$ 1.000,00 para o pedido 1 e validar formato do payload EMV e imagem do QR Code.

- [ ] T009 [P] [US1] Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java`
- [ ] T010 [P] [US1] Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java`
- [ ] T011 [US1] Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java`
- [ ] T012 [US1] Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java`
- [ ] T013 [US1] Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java`
- [ ] T014 [P] [US1] Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest`

---

## Phase 3: User Story 2 - Confirmação Automática de Pagamento e Liberação (Priority: P1) 🎯 MVP

**Goal**: Liquidar cobrança PIX via webhook/simulação, atualizar o status do pedido para SINAL_PAGO e exibir confirmação no frontend.

**Independent Test**: Simular liquidação da cobrança e constatar atualização em tempo real no frontend via polling.

- [ ] T015 [P] [US2] Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java`
- [ ] T016 [US2] Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido
- [ ] T017 [US2] Criar endpoint GET /api/payments/pix/status/{txid} no `PixPaymentController` para polling de status
- [ ] T018 [US2] Criar endpoint POST /api/webhooks/pix no `PixWebhookController`
- [ ] T019 [US2] Criar endpoint POST /api/payments/pix/simulate/{txid} no `PixPaymentController` para testes no ambiente dev
- [ ] T020 [P] [US2] Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest`

---

## Phase 4: User Story 3 - Modal PIX Interativo no Frontend (Priority: P1) 🎯 MVP

**Goal**: Modal com exibição do QR Code, botão de cópia com toast, contador de validade e polling a cada 3 segundos.

**Independent Test**: Abrir modal no frontend, copiar código PIX para a área de transferência e receber notificação visual de pagamento liquidado.

- [ ] T021 [P] [US3] Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts`
- [ ] T022 [US3] Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts`
- [ ] T023 [US3] Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx`
- [ ] T024 [US3] Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx`
- [ ] T025 [US3] Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO`

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Documentação OpenAPI e validação final

- [ ] T026 [P] Documentar endpoints no OpenAPI/Swagger
- [ ] T027 Executar validação dos cenários de teste do `quickstart.md` da Sprint 9