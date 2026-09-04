# Feature Specification: Sprint 9 — Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola)

**Feature**: `006-pagamento-cobranca-pix`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Com as etapas de orçamento, pedidos, produção fabril e estoque estabelecidas, a **Release 3 (v3.0.0)** inicia a automação financeira do AlumiGest.

O método de pagamento mais utilizado pelos clientes da Alumiportas para pagamento de sinais de entrada (50%) ou liquidação total à vista é o **PIX**. Atualmente, a conferência manual de comprovantes de PIX enviados por WhatsApp gera atrasos na liberação de pedidos e risco de fraudes com comprovantes falsos.

Esta sprint entrega:
1. **Geração de Cobrança PIX Dinâmica**: Emissão de QR Code e código "Copia e Cola" (Payload padrão BACEN / EMV) associados a um Pedido de Venda ou Orçamento com validade padrão de 24 horas.
2. **Arquitetura Híbrida de Provedor PIX**: Interface `PixGatewayService` com implementação para Gateway de Mercado (Asaas / EFI) e Simulador Mock integrado para testes locais e desenvolvimento.
3. **Detecção e Notificação de Pagamento em Tempo Real**: Atualização instantânea na tela via webhook/polling quando o cliente conclui o pagamento do PIX.
4. **Fluxo Financeiro Integrado**: Ao confirmar o pagamento do sinal (50%), o status financeiro do pedido é atualizado para `SINAL_PAGO`, habilitando com destaque o botão de "Liberar para Produção".

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-24: Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola

> Gerar cobrança PIX dinâmica para sinal de entrada (50%) ou pagamento à vista, exibindo QR Code e código copia e cola no orçamento e pedido.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-24.1**: Criar package `br.edu.ifpb.alumigest.finance` e diretório `frontend/src/features/finance`
- **US-24.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V12__create_payments_and_pix_schema.sql` com tabelas `payments` e `pix_transactions`
- **US-24.3**: Criar enums `PaymentType`, `PaymentMethod`, `PaymentStatus` e `PixStatus` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/`
- **US-24.4**: Criar entidade JPA `Payment` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/Payment.java`
- **US-24.5**: Criar entidade JPA `PixTransaction` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/PixTransaction.java`
- **US-24.6**: Criar repositório `PaymentRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PaymentRepository.java`
- **US-24.7**: Criar repositório `PixTransactionRepository` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/PixTransactionRepository.java`
- **US-24.8**: Criar gerador de payload EMV / BR Code `PixPayloadGenerator` com CRC16 CCITT em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixPayloadGenerator.java`
- **US-24.9**: Criar record `PixGenerateRequest` (tipoPagamento, valor, observacoes) com Bean Validation em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixGenerateRequest.java`
- **US-24.10**: Criar record `PixChargeResponse` (txid, valor, payloadCopiaECola, qrCodeBase64, dataExpiracao) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixChargeResponse.java`
- **US-24.11**: Criar interface `PixGatewayService` e implementação `MockPixGatewayServiceImpl` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/impl/MockPixGatewayServiceImpl.java`
- **US-24.12**: Implementar serviço `PixService.gerarCobrancaPix(Long orderId, PixGenerateRequest request)` com validade de 24h em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/PixService.java`
- **US-24.13**: Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java`
- **US-24.14**: Criar testes unitários do `PixPayloadGeneratorTest` e `PixServiceTest`

### 📌 US-25: Confirmar Pagamento PIX via Webhook com Liberação Automática

> Receber notificação de pagamento via Webhook seguro (Open Banking / PSP) e alterar automaticamente o status do pedido para liberado para produção.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-25.1**: Criar record `PixStatusResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/PixStatusResponse.java`
- **US-25.2**: Implementar método `liquidarPix(String txid, String e2eid)` no `PixService` atualizando o pagamento e o status financeiro do pedido
- **US-25.3**: Criar endpoint GET /api/payments/pix/status/{txid} no `PixPaymentController` para polling de status
- **US-25.4**: Criar endpoint POST /api/webhooks/pix no `PixWebhookController`
- **US-25.5**: Criar endpoint POST /api/payments/pix/simulate/{txid} no `PixPaymentController` para testes no ambiente dev
- **US-25.6**: Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest`

### 📌 US-26: Modal PIX Interativo no Frontend e Histórico de Transações

> Interface interativa no frontend com polling/SSE para detecção automática de pagamento e painel de histórico de transações PIX com simulador.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-26.1**: Criar interfaces TypeScript e serviço Axios (`pixApi.ts`) em `frontend/src/features/finance/services/pixApi.ts`
- **US-26.2**: Criar custom hook `usePixPayment` com polling automático a cada 3 segundos em `frontend/src/features/finance/hooks/usePixPayment.ts`
- **US-26.3**: Criar componente `PixPaymentModal` com QR Code, botão "Copiar Chave PIX" e timer regressivo em `frontend/src/features/finance/components/PixPaymentModal.tsx`
- **US-26.4**: Criar componente `PixPaymentSuccessAlert` com animação de confirmação em `frontend/src/features/finance/components/PixPaymentSuccessAlert.tsx`
- **US-26.5**: Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO`
- **US-26.6**: Documentar endpoints no OpenAPI/Swagger
- **US-26.7**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 9

## 3. Requisitos Funcionais

1. **RF01 - Geração de Payload PIX**: Geração de código copia e cola em conformidade com o padrão EMV QRCPS-MPM do Banco Central do Brasil.
2. **RF02 - Associação Rastreável**: Cada cobrança PIX (`PixTransaction`) vincula-se obrigatoriamente a um `Order` ou `Budget`.
3. **RF03 - Validade de 24 Horas**: Cada cobrança expira automaticamente após 24 horas, permitindo gerar uma nova cobrança se necessário.
4. **RF04 - Webhook Listener**: Endpoint seguro `/api/webhooks/pix` para recebimento de callbacks de PSPs bancários.
5. **RF05 - Modal Interativo**: Modal com renderização do QR Code, botão de cópia com feedback ("Copiado!"), timer e polling a cada 3 segundos.
6. **RF06 - Integração com Liberação Fabril**: Pedidos com sinal pendente exibem aviso amigável; após pagamento do sinal, a liberação fabril é desbloqueada.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Provedor Gateway)**: Gateway de Mercado (Asaas / EFI) + Simulador Mock integrado para testes locais e desenvolvimento.
- **Q2 (Validade do QR Code)**: 24 horas de validade padrão com opção de regenerar.
- **Q3 (Efeito no Pedido)**: Atualização do status financeiro para `SINAL_PAGO` e ativação em destaque verde do botão "Liberar para Produção".