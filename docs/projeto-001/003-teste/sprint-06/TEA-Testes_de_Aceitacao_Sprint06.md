# 🧪 TEA — Testes de Aceitação e Cenários BDD — Sprint 06

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 06 — Ordens de Serviço (O.S.) / Pedidos de Venda, Lock de Preços e Comprovante Oficial (Release 2) |
| **Versão da Baseline** | `B-ALG-v0.6.0-S06-01` (Release 2) |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint06.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint06.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint06.md`](./RET-Relatorio_Execucao_Testes_Sprint06.md) |
| **Ata de Review & Retrospectiva** | [`ATA-Sprint_06_Review_e_Retrospective.md`](../../001-atas-reuniao/ATA-Sprint_06_Review_e_Retrospective.md) |
| **Status Global** | 🟢 Homologado e Automatizado (100% dos Cenários Aprovados / Baseline v0.6.0) |
| **Data de Homologação** | 14/10/2026 |

---

## 1. Visão Geral e Estratégia de Testes da Sprint 06

A Sprint 06 marcou a homologação da **Release 2 (Gestão Fabril & Pedidos de Venda)** do AlumiGest:
1. **Conversão Atômica de Orçamentos (US-13 / Issue #137):** Transação atômica `@Transactional`, geração de código sequencial anual `PED-YYYY-NNNN` (ou `OS-YYYY-NNNN`), modal de aprovação (`OrderApprovalModal.tsx`) com seleção de canal (WhatsApp, Presencial, Telefone, E-mail) e data sugerida de entrega (+15 dias corridos).
2. **Snapshot Imutável e Lock de Preços (US-14 / Issue #138):** Blindagem jurídica contra reajustes futuros do catálogo, com clonagem profunda (*deep copy*) em 3 níveis (pedido, itens, opções).
3. **Máquina de Estados e Cancelamento Controlado (US-15 / Issue #139):** Ciclo de vida (`CREATED` ➔ `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED` / `CANCELLED`), cancelamento com justificativa obrigatória ($\ge 10$ caracteres) e reabertura condicional do orçamento (`US-15.2`).
4. **Comprovante Oficial em PDF (US-16 / Issue #140):** Emissão via OpenPDF (`OrderPdfService`), testes MockMvc com banco H2 (`US-16.3 / PR #420`) e suíte Cypress E2E (`US-16.4 / PR #447`).

---

## 2. Matriz Canônica BDD / E2E por História de Usuário

### US-13: Conversão Atômica de Orçamento em Ordem de Serviço (Issue #137)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 01 | Conversão Bem-Sucedida de Orçamento Aprovado | `cypress/e2e/orders/us13_conversao_ordem_servico_real.cy.ts` | E2E Cypress Fullstack | Orçamento elegível no status `SENT` ou `APPROVED` | Clica em `[data-testid="btn-approve-budget"]` e confirma conversão no modal | Cria pedido de venda com status `CREATED`, gera código sequencial e redireciona | ✅ Passou |
| 02 | Sugestão Automática de Entrega (+15 Dias) | `cypress/e2e/orders/us13_criterios_aceitacao_mock.cy.ts` | E2E Cypress com `cy.intercept` | Modal de aprovação aberto | Inspeciona campo `[data-testid="input-data-entrega"]` | Exibe data calculada para exatamente +15 dias corridos com selo de recomendação | ✅ Passou |
| 03 | Bloqueio de Conversão Duplicada (Idempotência) | `OrderControllerIntegrationTest` | Teste de Integração Spring Boot / H2 | Orçamento já convertido em pedido anteriormente | Tenta disparar novo `POST /api/orders/convert/{id}` | Sistema bloqueia transação retornando HTTP 409 Conflict | ✅ Passou |

---

### US-14: Snapshot Imutável e Lock de Preços (Issue #138)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 04 | Imutabilidade do Pedido frente a Reajuste de Catálogo | `cypress/e2e/orders/us14_3_blindagem_reajuste_catalogo.cy.ts` | E2E Cypress com Simulação de Reajuste | Pedido convertido com esquadrias e preços fixados | Preço de vidros e perfis do catálogo é reajustado em +50% | A Ordem de Serviço mantém rigorosamente os valores originais inalterados | ✅ Passou |
| 05 | Clonagem Profunda de Medidas e Opções (*Deep Copy*) | `cypress/e2e/orders/us14_2_imutabilidade_esquadrias_pedido.cy.ts` | E2E Cypress e Teste de Domínio JPA | Orçamento com múltiplas esquadrias personalizadas | Executa conversão para pedido | `OrderItem` e `OrderItemOption` clonam todos os atributos sem apontar para entidades mutáveis | ✅ Passou |

---

### US-15: Máquina de Estados e Cancelamento Controlado (Issue #139)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 06 | Cancelamento com Justificativa Obrigatória ($\ge 10$ chars) | `OrderServiceTest` / `CancelOrderModal.test.tsx` | Teste Unitário & Componente Frontend | Pedido no status `CREATED` ou `WAITING_PRODUCTION` | Abre `[data-testid="cancel-order-modal"]` e informa justificativa válida | Pedido transiciona para `CANCELLED` e registra motivo no histórico | ✅ Passou |
| 07 | Bloqueio de Cancelamento sem Justificativa Mínima | `CancelOrderModal.test.tsx` | Validação Zod / Client | Modal de cancelamento aberto | Informa justificativa com menos de 10 caracteres ou vazia | Botão de confirmação permanece desabilitado com mensagem de validação | ✅ Passou |
| 08 | Bloqueio de Cancelamento de Pedido em Produção | `OrderServiceTest` | Validação de Máquina de Estados | Pedido com status `IN_PRODUCTION` | Tenta disparar cancelamento | Backend lança `IllegalStateException` (HTTP 422) e impede alteração | ✅ Passou |

---

### US-16: Emissão do Comprovante Oficial em PDF e Homologação (Issue #140)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 09 | Download do Comprovante de Venda Oficial em PDF | `cypress/e2e/orders/us16_4_homologacao_quickstart.cy.ts` | E2E Cypress Quickstart | Pedido acessado na tela de detalhes | Clica no botão `[data-testid="btn-download-order-pdf"]` | Retorna binário PDF `PED-YYYY-NNNN.pdf` com cabeçalho institucional e paginação A4 | ✅ Passou |
| 10 | Bateria de Testes de Integração MockMvc (24 Testes) | `OrderControllerIntegrationTest` | Integração MockMvc Spring Boot (PR #420) | Banco H2 em memória | Executa suíte de endpoints `/api/orders` | 24 cenários cobrindo conversão, filtros, downloads e tratamento de erros aprovados | ✅ Passou |

---

## 3. Rastreabilidade com os Requisitos do Sistema

| Cenário TEA | Requisito Funcional (RF) | Regra de Negócio (RN) | Issue GitHub / PR |
|:---:|:---:|:---:|:---:|
| 01 – 03 | `RF-013` (Conversão de Orçamentos) | `RN-ORD01` (Idempotência) / `RN-ORD02` (Canal) | Issue #137 / PR #423 |
| 04 – 05 | `RF-014` (Snapshot Imutável) | `RN-ORD03` (Lock de Preços em 3 Níveis) | Issue #138 / PR #406 / PR #445 |
| 06 – 08 | `RF-015` (Máquina de Estados) | `RN-ORD04` (Justificativa) / `RN-ORD05` (Trava Fabril) | Issue #139 / PR #418 / PR #446 |
| 09 – 10 | `RF-016` (Comprovante em PDF) | `RN-ORD06` (Layout Institucional A4) | Issue #140 / PR #420 / PR #447 |
