# Especificação Funcional: US-24 — Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola

**Identificador**: `US-24`  
**Issue GitHub**: [#149](https://github.com/ADS-IFPB-SR/alumigest/issues/149)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  

---

## 🎯 Objetivo de Negócio
Gerar cobrança PIX integrada com provedor bancário (PSP) com QR Code dinâmico, código copia-e-cola e controle de expiração.

---

## 📋 Sub-Tarefas / Issues Vinculadas (14 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US](issues/US-24.1-criar-package-br-edu-ifpb-alumigest-finance-e/issue.md) | Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance` | 🔲 No Backlog |
| [US](issues/US-24.10-criar-record-pixchargeresponse-txid-valor-pay/issue.md) | Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java` | 🔲 No Backlog |
| [US](issues/US-24.11-criar-interface-pixgatewayservice-e-implement/issue.md) | Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java` | 🔲 No Backlog |
| [US](issues/US-24.12-implementar-servico-pixservice-gerarcobrancap/issue.md) | Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java` | 🔲 No Backlog |
| [US](issues/US-24.13-criar-endpoint-post-api-payments-pix-generate/issue.md) | Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java` | 🔲 No Backlog |
| [US](issues/US-24.14-criar-testes-unitarios-do-pixpayloadgenerator/issue.md) | Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest` | 🔲 No Backlog |
| [US](issues/US-24.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions` | 🔲 No Backlog |
| [US](issues/US-24.3-criar-enums-paymenttype-paymentmethod-payment/issue.md) | Criar enums `PaymentType`PaymentMethod`PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/` | 🔲 No Backlog |
| [US](issues/US-24.4-criar-entidade-jpa-payment-em-backend-src-mai/issue.md) | Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java` | 🔲 No Backlog |
| [US](issues/US-24.5-criar-entidade-jpa-pixtransaction-em-backend-/issue.md) | Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java` | 🔲 No Backlog |
| [US](issues/US-24.6-criar-repositorio-paymentrepository-em-backen/issue.md) | Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java` | 🔲 No Backlog |
| [US](issues/US-24.7-criar-repositorio-pixtransactionrepository-em/issue.md) | Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java` | 🔲 No Backlog |
| [US](issues/US-24.8-criar-gerador-de-payload-emv-br-code-pixpaylo/issue.md) | Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java` | 🔲 No Backlog |
| [US](issues/US-24.9-criar-record-pixgeneraterequest-tipopagamento/issue.md) | Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java` | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
