# 📌 Issues de Implementação — Sprint 09 — Integração de Pagamento PIX e Confirmação Automática

> Todas as sub-tarefas seguem o padrão decimal vinculadas às User Stories correspondentes.

## 📦 US-24: Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-24.1](US-24.1-criar-package-br-edu-ifpb-alumigest-finance-e/issue.md) | Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance` | `backlog` | 🔲 Aberta |
| [US-24.2](US-24.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions` | `backlog` | 🔲 Aberta |
| [US-24.3](US-24.3-criar-enums-paymenttype-paymentmethod-payment/issue.md) | Criar enums `PaymentType`PaymentMethod`PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/` | `backlog` | 🔲 Aberta |
| [US-24.4](US-24.4-criar-entidade-jpa-payment-em-backend-src-mai/issue.md) | Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java` | `backlog` | 🔲 Aberta |
| [US-24.5](US-24.5-criar-entidade-jpa-pixtransaction-em-backend-/issue.md) | Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java` | `backlog` | 🔲 Aberta |
| [US-24.6](US-24.6-criar-repositorio-paymentrepository-em-backen/issue.md) | Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java` | `backlog` | 🔲 Aberta |
| [US-24.7](US-24.7-criar-repositorio-pixtransactionrepository-em/issue.md) | Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java` | `backlog` | 🔲 Aberta |
| [US-24.8](US-24.8-criar-gerador-de-payload-emv-br-code-pixpaylo/issue.md) | Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java` | `backlog` | 🔲 Aberta |
| [US-24.9](US-24.9-criar-record-pixgeneraterequest-tipopagamento/issue.md) | Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java` | `backlog` | 🔲 Aberta |
| [US-24.10](US-24.10-criar-record-pixchargeresponse-txid-valor-pay/issue.md) | Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java` | `backlog` | 🔲 Aberta |
| [US-24.11](US-24.11-criar-interface-pixgatewayservice-e-implement/issue.md) | Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java` | `backlog` | 🔲 Aberta |
| [US-24.12](US-24.12-implementar-servico-pixservice-gerarcobrancap/issue.md) | Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java` | `backlog` | 🔲 Aberta |
| [US-24.13](US-24.13-criar-endpoint-post-api-payments-pix-generate/issue.md) | Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java` | `backlog` | 🔲 Aberta |
| [US-24.14](US-24.14-criar-testes-unitarios-do-pixpayloadgenerator/issue.md) | Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest` | `backlog` | 🔲 Aberta |

## 📦 US-25: Confirmar Pagamento PIX via Webhook com Liberação Automática

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-25.1](US-25.1-criar-record-pixstatusresponse-em-backend-src/issue.md) | Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java` | `backlog` | 🔲 Aberta |
| [US-25.2](US-25.2-implementar-metodo-liquidarpix-string-txid-st/issue.md) | Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido | `backlog` | 🔲 Aberta |
| [US-25.3](US-25.3-criar-endpoint-get-api-payments-pix-status-tx/issue.md) | Criar endpoint GET /api/payments/pix/status/{txid} no `PixPaymentController` para polling de status | `backlog` | 🔲 Aberta |
| [US-25.4](US-25.4-criar-endpoint-post-api-webhooks-pix-no-pixwe/issue.md) | Criar endpoint POST /api/webhooks/pix no `PixWebhookController` | `backlog` | 🔲 Aberta |
| [US-25.5](US-25.5-criar-endpoint-post-api-payments-pix-simulate/issue.md) | Criar endpoint POST /api/payments/pix/simulate/{txid} no `PixPaymentController` para testes no ambiente dev | `backlog` | 🔲 Aberta |
| [US-25.6](US-25.6-criar-testes-de-integracao-rest-do-fluxo-de-l/issue.md) | Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest` | `backlog` | 🔲 Aberta |

## 📦 US-26: Modal PIX Interativo no Frontend e Histórico de Transações

| Sub-Task | Tarefa | Alvo / Módulo | Status |
|---|---|---|:---:|
| [US-26.1](US-26.1-criar-interfaces-typescript-e-servico-axios-p/issue.md) | Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts` | `backlog` | 🔲 Aberta |
| [US-26.2](US-26.2-criar-custom-hook-usepixpayment-com-polling-a/issue.md) | Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts` | `backlog` | 🔲 Aberta |
| [US-26.3](US-26.3-criar-componente-pixpaymentmodal-com-qr-code-/issue.md) | Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx` | `backlog` | 🔲 Aberta |
| [US-26.4](US-26.4-criar-componente-pixpaymentsuccessalert-com-a/issue.md) | Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx` | `backlog` | 🔲 Aberta |
| [US-26.5](US-26.5-integrar-botao-gerar-pix-na-pagina-de-detalhe/issue.md) | Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO` | `backlog` | 🔲 Aberta |
| [US-26.6](US-26.6-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | `backlog` | 🔲 Aberta |
| [US-26.7](US-26.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste do `quickstart.md` da Sprint 9 | `backlog` | 🔲 Aberta |

