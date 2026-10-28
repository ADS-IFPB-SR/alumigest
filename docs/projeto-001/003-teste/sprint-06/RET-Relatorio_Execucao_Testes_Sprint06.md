# 🧪 RET — Relatório de Execução de Testes — Sprint 06

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 06 — Ordens de Serviço (O.S.) / Pedidos de Venda, Lock de Preços e Comprovante Oficial (Release 2) |
| **Versão da Baseline** | `B-ALG-v0.6.0-S06-01` (Release 2) |
| **Planejamento BDD** | [`TEA-Testes_de_Aceitacao_Sprint06.md`](./TEA-Testes_de_Aceitacao_Sprint06.md) |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint06.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint06.md) |
| **Ata de Review & Retrospectiva** | [`ATA-Sprint_06_Review_e_Retrospective.md`](../../001-atas-reuniao/ATA-Sprint_06_Review_e_Retrospective.md) |
| **Período** | 29/09/2026 a 12/10/2026 (Consolidação em 14/10/2026) |
| **QA Responsável** | Herbert Carvalho dos Santos / Joseph Cavalcante / Equipe AlumiGest |
| **Status Geral** | 🟢 **APROVADO (100% dos Cenários BDD e Testes de Integração)** |

---

## 1. 🎯 Escopo dos Testes da Sprint 06

A **Sprint 06** marcou a validação e homologação do início da **Release 2 (Gestão Fabril & Pedidos)** do AlumiGest, focando nos requisitos de formalização comercial e garantias de contrato:

1. **Conversão Atômica de Orçamento em Ordem de Serviço (US-13 / Issue #137):**
   - Validação da transação atômica `@Transactional` com geração unívoca de código sequencial anual `PED-YYYY-NNNN`.
   - Bloqueio estrito de conversão duplicada (retorno HTTP 409 Conflict ou 422 Unprocessable Entity).
   - Validação do modal de aprovação (`OrderApprovalModal.tsx`) com seleção de canal (WhatsApp, Presencial, Telefone, E-mail) e sugestão automática de data de entrega (+15 dias corridos).
2. **Snapshot Imutável e Lock de Preços (US-14 / Issue #138):**
   - Validação de blindagem jurídica: clonagem profunda (*deep copy*) em 3 níveis replicando medidas nominais (L x A mm), cores, vidros, ferragens e preços unitários.
   - Simulação de reajuste posterior de catálogo de materiais, comprovando que ordens convertidas permanecem 100% inalteradas.
3. **Máquina de Estados e Cancelamento Controlado (US-15 / Issue #139):**
   - Validação das transições de ciclo de vida (`CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO` / `CANCELADO`).
   - Validação de cancelamento com justificativa obrigatória ($\ge 10$ caracteres) e bloqueio contra cancelamento de pedidos já em produção.
   - Reabertura condicional do orçamento vinculado (`US-15.2`).
4. **Comprovante Oficial em PDF e Homologação Ponta a Ponta (US-16 / Issue #140):**
   - Teste de layout A4 institucional do comprovante de venda via OpenPDF (`OrderPdfService`), com cabeçalho institucional, discriminação de esquadrias e paginação.
   - Bateria de testes de integração com MockMvc e banco H2 (`US-16.3 / PR #420`).
   - Execução e homologação da suite E2E com Cypress e do roteiro `quickstart.md` (`US-16.4 / PR #447`).

---

## 2. 📋 Resultados dos Planos de Teste Executados

| Plano de Teste | Issue GitHub | Escopo | Status | Detalhes |
|---|:---:|---|:---:|---|
| **US-13** | [#137](https://github.com/ADS-IFPB-SR/alumigest/issues/137) | Conversão de Orçamento em Ordem de Serviço (Backend + Frontend) | 🟢 **APROVADO** | PR #423 mesclada |
| **US-14** | [#138](https://github.com/ADS-IFPB-SR/alumigest/issues/138) | Snapshot Imutável e Lock de Preços (*Deep Copy* em 3 níveis) | 🟢 **APROVADO** | PRs #406 e #445 mescladas |
| **US-15** | [#139](https://github.com/ADS-IFPB-SR/alumigest/issues/139) | Máquina de Estados, Cancelamento com Justificativa e Reabertura | 🟢 **APROVADO** | PRs #418, #419 e #446 mescladas |
| **US-16.1 / US-16.2** | [#140](https://github.com/ADS-IFPB-SR/alumigest/issues/140) | Comprovante PDF via OpenPDF, Navegação Sidebar e OpenAPI | 🟢 **APROVADO** | PR #459 mesclada |
| **US-16.3** | [#365](https://github.com/ADS-IFPB-SR/alumigest/issues/365) | Testes de Integração Backend (`OrderControllerIntegrationTest`) | 🟢 **APROVADO** | PR #420 mesclada |
| **US-16.4** | [#366](https://github.com/ADS-IFPB-SR/alumigest/issues/366) | Testes de Sistema E2E (Cypress), BDD e Quickstart | 🟢 **APROVADO** | PR #447 mesclada |

---

## 3. 🐛 BUGs Identificados e Corrigidos na Sprint 06 (Catálogo RBD)

Durante a fase de testes e homologação da US-14 e US-16, foram identificados e corrigidos 4 defeitos registrados no catálogo oficial [RBD](../RBD-Registro_de_Bugs_e_Defeitos.md):

| BUG ID | Issue | Descrição Resumida | Severidade | Status | Resolução |
|:---:|:---:|:---|:---:|:---:|:---|
| **BUG-024** | [#424](https://github.com/ADS-IFPB-SR/alumigest/issues/424) | Insumo de categoria `FILM` sobrepunha a descrição de `tipoVidro` | 🔴 Alta | ✅ Corrigido | Extração de vidro em duas passagens com isolamento estrito de película (`c871c5e`) |
| **BUG-025** | [#422](https://github.com/ADS-IFPB-SR/alumigest/issues/422) | Extrator de puxadores falhava por divergência de chave (`model` vs `handleType`) | 🔴 Alta | ✅ Corrigido | Suporte a `handleType` e mapeamento de dimensões nominais (`ccc44e5`) |
| **BUG-026** | [#433](https://github.com/ADS-IFPB-SR/alumigest/issues/433) | Inversão de precedência no snapshot e omissão de `slidingMode` | 🔴 Alta | ✅ Corrigido | Precedência `options` $\rightarrow$ `item.templateConfig` $\rightarrow$ `product` e suporte a `slidingMode` (`4e4788c`) |
| **BUG-027** | [#421](https://github.com/ADS-IFPB-SR/alumigest/issues/421) | Duplicação do índice ordinal `# 1` na tabela de itens do pedido | 🟡 Média | ✅ Corrigido | Ajuste na avaliação booleana de base 0 no frontend (`c3b47e0`) |

---

## 4. 🔍 Qualidade de Código (SonarQube & Cobertura de Testes)

- **SonarQube Quality Gate:** ✅ Aprovado em todos os PRs (#423, #445, #446, #447, #459).
- **Cobertura em Código Novo (New Code Coverage):** $\ge 80\%$ no backend (pacote `br.edu.ifpb.alumigest.orders`) e no frontend (`frontend/src/features/orders`).
- **Segurança & SAST:** Zero vulnerabilidades ou brechas OWASP identificadas.
- **Testes de Integração:** Suite `OrderControllerIntegrationTest` executando com banco H2 em memória, validando respostas HTTP, headers, downloads binários e cenários de conflito 409.
- **Testes E2E (Cypress):** Fluxo completo de conversão, listagem, inspeção de itens com lock de preços e download do comprovante PDF homologado com sucesso.

---

## 5. 📊 Resumo Executivo de QA da Sprint 06

```
┌──────────────────────────────────────────────────────────────────┐
│                 RESULTADO DOS TESTES SPRINT 06                   │
├──────────────────────────────────────────────────────────────────┤
│ US-13 (Conversão de Orçamento em O.S.): APROVADO (100% cenários) │
│ US-14 (Snapshot Imutável & Lock Preços): APROVADO (100% cenários) │
│ US-15 (Máquina de Estados & Cancelamento): APROVADO (100%)       │
│ US-16 (Comprovante PDF & E2E):          APROVADO (100%)          │
│ Bateria de Testes MockMvc / H2 (US-16.3): APROVADO (24 testes)    │
│ Suite E2E Cypress / Quickstart (US-16.4): APROVADO               │
│ BUGs Corrigidos no Ciclo: 4 (#421, #422, #424, #433)             │
│ Quality Gate SonarQube: APROVADO                                 │
│ Release 2 - Baseline v0.6.0: HOMOLOGADA E PROMOVIDA PARA MAIN    │
└──────────────────────────────────────────────────────────────────┘
```

---

*Relatório de Testes homologado pelo QA / Equipe AlumiGest — Sprint 06 — 14/10/2026*
