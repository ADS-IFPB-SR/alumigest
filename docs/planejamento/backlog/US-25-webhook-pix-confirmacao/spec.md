# Especificação Funcional: US-25 — Confirmar Pagamento PIX via Webhook com Liberação Automática

**Identificador**: `US-25`  
**Issue GitHub**: [#150](https://github.com/ADS-IFPB-SR/alumigest/issues/150)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como equipe financeira e encarregado de produção da Alumiportas, desejo que o sistema receba confirmações de pagamento PIX via Webhook assinado do provedor bancário (PSP) com conciliação automática, gravação do identificador ponta a ponta (`endToEndId`) e liberação imediata da Ordem de Serviço para a fábrica, garantindo agilidade na produção sem necessidade de conferência manual de comprovantes.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Liquidação Atômica de Pagamento PIX via Webhook**
  - **Dado que** uma transação PIX com status `PENDING` está vinculada a uma Ordem de Serviço,
  - **Quando** o provedor bancário envia notificação `POST /api/v1/webhooks/pix` contendo payload assinado com `txid`, `endToEndId`, `paidAmount` e `paymentTimestamp`,
  - **Então** o backend valida a assinatura HMAC/Token do webhook,
  - **E** transiciona o status do pagamento para `PAID`, preenchendo `end_to_end_id` e `paid_at`,
  - **E** responde ao provedor bancário com status HTTP `200 OK`.

- [ ] **Cenário 2: Idempotência Estrita no Recebimento de Webhooks**
  - **Dado que** um pagamento PIX já foi liquidado anteriormente (`PAID`),
  - **Quando** o provedor reenviar a notificação com o mesmo `endToEndId` ou `txid`,
  - **Então** o sistema reconhece a liquidação prévia sem duplicar créditos ou lançamentos financeiros, respondendo HTTP `200 OK` de forma idempotente.

- [ ] **Cenário 3: Liberação Automática da O.S. para Produção**
  - **Dado que** a política comercial exige sinal de entrada (ex: 50%) para liberar a fabricação,
  - **Quando** a liquidação do PIX atinge ou supera o valor da entrada exigida,
  - **Então** o status da O.S. transiciona atomicamente de `CREATED` para `WAITING_PRODUCTION`, disponibilizando-a imediatamente no painel Kanban da fábrica.

- [ ] **Cenário 4: Consulta de Status via Polling no Frontend**
  - **Dado que** o modal de pagamento PIX está aberto aguardando a transferência do cliente,
  - **Quando** o frontend consulta periodicamente `GET /api/v1/payments/pix/status/{txid}`,
  - **Então** assim que a liquidação for concluída, a resposta retorna `{ "status": "PAID" }`,
  - **E** o modal fecha automaticamente exibindo feedback de sucesso ("Pagamento Confirmado!").

- [ ] **Cenário 5: Endpoint de Simulação para Ambiente de Desenvolvimento e Testes**
  - **Dado que** os desenvolvedores ou analistas de QA estão testando o fluxo sem provedor bancário real,
  - **Quando** disparam `POST /api/v1/payments/pix/simulate/{txid}` (disponível apenas em perfis `dev` e `test`),
  - **Então** o backend simula a liquidação com sucesso gerando um `endToEndId` sintético.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Idempotência por `end_to_end_id`):** Constraint `UNIQUE` no banco de dados para `end_to_end_id` em `tb_payments`, impedindo qualquer duplicidade financeira.
- **RN-02 (Segurança de Webhook):** O endpoint de webhook deve validar header de autenticação (`X-Webhook-Secret` ou assinatura HMAC SHA-256).
- **RN-03 (Diretriz de Idioma em Variáveis):** Identificadores técnicos em inglês: `endToEndId`, `paidAmount`, `paymentTimestamp`, `txid`, `pixStatus`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `POST /api/v1/webhooks/pix` (recebimento seguro)
  - `GET /api/v1/payments/pix/status/{txid}` (polling para o frontend)
  - `POST /api/v1/payments/pix/simulate/{txid}` (simulação em ambiente de testes)
- **Service:** `PixService.java` com método `@Transactional public Payment settlePix(String txid, String endToEndId, BigDecimal amount)`
- **Segurança:** `WebhookSecurityFilter` validando header seguro contra secret configurado em `application.yml`

### Frontend (React 19 / Vite / TanStack Query)
- **Hook:** `usePixStatusPolling(txid)` com intervalo de 3s e parada automática após `PAID` ou timeout

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `PixServiceTest` validando liquidação, idempotência e rejeição de assinaturas inválidas.
- [ ] Teste de integração REST validando `POST /api/v1/webhooks/pix` e `GET /api/v1/payments/pix/status/{txid}`.
- [ ] Teste de concorrência com requisições duplicadas simultâneas sem lançamentos repetidos.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

**Branch:** `feat/us-25-webhook-pix-confirmacao`
