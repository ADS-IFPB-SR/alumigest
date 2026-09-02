# 📌 Issues de Implementação — Sprint 09 — Integração de Pagamento PIX e Confirmação Automática

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-28: Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-28.1](US-28.1-criar-package-br-edu-ifpb-alumigest-finance-e/issue.md) | Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance` | `sprint-09` | 🔲 Aberta |
| [US-28.2](US-28.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions` | `sprint-09` | 🔲 Aberta |
| [US-28.3](US-28.3-criar-enums-paymenttype-paymentmethod-payment/issue.md) | Criar enums `PaymentType`, `PaymentMethod`, `PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/` | `sprint-09` | 🔲 Aberta |
| [US-28.4](US-28.4-criar-entidade-jpa-payment-em-backend-src-mai/issue.md) | Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java` | `sprint-09` | 🔲 Aberta |
| [US-28.5](US-28.5-criar-entidade-jpa-pixtransaction-em-backend-/issue.md) | Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java` | `sprint-09` | 🔲 Aberta |
| [US-28.6](US-28.6-criar-repositorio-paymentrepository-em-backen/issue.md) | Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java` | `sprint-09` | 🔲 Aberta |
| [US-28.7](US-28.7-criar-repositorio-pixtransactionrepository-em/issue.md) | Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java` | `sprint-09` | 🔲 Aberta |
| [US-28.8](US-28.8-criar-gerador-de-payload-emv-br-code-pixpaylo/issue.md) | Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java` | `sprint-09` | 🔲 Aberta |
| [US-28.9](US-28.9-criar-record-pixgeneraterequest-tipopagamento/issue.md) | Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java` | `sprint-09` | 🔲 Aberta |
| [US-28.10](US-28.10-criar-record-pixchargeresponse-txid-valor-pay/issue.md) | Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java` | `sprint-09` | 🔲 Aberta |
| [US-28.11](US-28.11-criar-interface-pixgatewayservice-e-implement/issue.md) | Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java` | `sprint-09` | 🔲 Aberta |
| [US-28.12](US-28.12-implementar-servico-pixservice-gerarcobrancap/issue.md) | Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java` | `sprint-09` | 🔲 Aberta |
| [US-28.13](US-28.13-criar-endpoint-post-api-payments-pix-generate/issue.md) | Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java` | `sprint-09` | 🔲 Aberta |
| [US-28.14](US-28.14-criar-testes-unitarios-do-pixpayloadgenerator/issue.md) | Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest` | `sprint-09` | 🔲 Aberta |

## 📦 US-29: Confirmar Pagamento PIX via Webhook com Liberação Automática

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-29.1](US-29.1-criar-record-pixstatusresponse-em-backend-src/issue.md) | Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java` | `sprint-09` | 🔲 Aberta |
| [US-29.2](US-29.2-implementar-metodo-liquidarpix-string-txid-st/issue.md) | Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido | `sprint-09` | 🔲 Aberta |
| [US-29.3](US-29.3-criar-endpoint-get-api-payments-pix-status-tx/issue.md) | Criar endpoint GET /api/payments/pix/status/{txid} no `PixPaymentController` para polling de status | `sprint-09` | 🔲 Aberta |
| [US-29.4](US-29.4-criar-endpoint-post-api-webhooks-pix-no-pixwe/issue.md) | Criar endpoint POST /api/webhooks/pix no `PixWebhookController` | `sprint-09` | 🔲 Aberta |
| [US-29.5](US-29.5-criar-endpoint-post-api-payments-pix-simulate/issue.md) | Criar endpoint POST /api/payments/pix/simulate/{txid} no `PixPaymentController` para testes no ambiente dev | `sprint-09` | 🔲 Aberta |
| [US-29.6](US-29.6-criar-testes-de-integracao-rest-do-fluxo-de-l/issue.md) | Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest` | `sprint-09` | 🔲 Aberta |

## 📦 US-30: Modal PIX Interativo no Frontend e Histórico de Transações

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-30.1](US-30.1-criar-interfaces-typescript-e-servico-axios-p/issue.md) | Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts` | `sprint-09` | 🔲 Aberta |
| [US-30.2](US-30.2-criar-custom-hook-usepixpayment-com-polling-a/issue.md) | Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts` | `sprint-09` | 🔲 Aberta |
| [US-30.3](US-30.3-criar-componente-pixpaymentmodal-com-qr-code-/issue.md) | Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx` | `sprint-09` | 🔲 Aberta |
| [US-30.4](US-30.4-criar-componente-pixpaymentsuccessalert-com-a/issue.md) | Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx` | `sprint-09` | 🔲 Aberta |
| [US-30.5](US-30.5-integrar-botao-gerar-pix-na-pagina-de-detalhe/issue.md) | Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO` | `sprint-09` | 🔲 Aberta |
| [US-30.6](US-30.6-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `sprint-09` | 🔲 Aberta |
| [US-30.7](US-30.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 9 | `sprint-09` | 🔲 Aberta |

