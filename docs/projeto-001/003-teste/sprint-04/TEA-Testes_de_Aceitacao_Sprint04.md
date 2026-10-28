# 🧪 TEA — Testes de Aceitação e Cenários BDD — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos (US-09) e SonarQube |
| **Versão da Baseline** | `B-ALG-v0.4.0-S04-01` |
| **Roteiro Manual PO/QA** | [`RTM-Roteiro_de_Testes_Manuais_Sprint04.md`](./RTM-Roteiro_de_Testes_Manuais_Sprint04.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint04.md`](./RET-Relatorio_Execucao_Testes_Sprint04.md) |
| **Ata de Review & Retrospectiva** | [`ATA-Sprint_04_Review.md`](../../001-atas-reuniao/ATA-Sprint_04_Review.md) |
| **Status Global** | 🟢 Homologado e Automatizado (88% de Story Points Entregues / 100% de Testes Aprovados) |
| **Data de Homologação** | 14/09/2026 |

---

## 1. Visão Geral e Estratégia de Testes da Sprint 04

A Sprint 04 focou na refatoração arquitetural crítica do AlumiGest para garantir robustez nas regras de negócio e estabilidade de CI/CD:
1. **Templates Paramétricos em SVG (`US-05 #126`):** Renderização vetorial dos 10 modelos canônicos e validação de vão físico.
2. **Arquitetura de Orçamentos V2 (`US-46 #172`):** Criação atômica transacional de propostas orçamentárias com múltiplos itens inclusos via `POST /api/budgets` e eliminação de perdas de itens (correção do BUG-022 / Issue #300).
3. **Fundação de Descontos Comerciais (`US-09 #133`):** Cálculo determinístico de descontos percentuais e em valor monetário fixo, travas contra descontos abusivos $> 100\%$ e agregação de frete/instalação com `BigDecimal`.
4. **Resolução de Débitos Técnicos e SonarQube (`quality #245`):** Exclusão de DTOs e Mappers no JaCoCo, conformidade SonarLint e manutenção do Quality Gate com New Code Coverage $\ge 85\%$.
5. **Decisão de Engenharia da Homologação (`US-12 #136`):** Homologação da diluição dos critérios da Release 1 como Definition of Done (DoD) contínuo das histórias na Sprint 05.

---

## 2. Matriz Canônica BDD / E2E por História de Usuário

### US-05: Templates Paramétricos de Esquadrias no Studio CAD (Issue #126)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 01 | Renderização Vetorial dos 10 Modelos Canônicos | `WindowSvgPreview.test.tsx` | Vitest / Testing Library | Selecionado qualquer modelo canônico no Studio CAD | Informa vão L x A em milímetros | Renderiza SVG vetorial proporcional com cotas e indicação de folhas | ✅ Passou |
| 02 | Alerta Visual de Vão Físico Subdimensionado | `TemplateValidator.test.ts` | Teste Unitário Frontend | Vão com largura ou altura $< 400\text{ mm}$ informado | Validador do template processa os dados | Exibe alerta visual de dimensão crítica e bloqueia cálculo fabril impossível | ✅ Passou |
| 03 | Seletor Dinâmico de Insumos por Tipologia | `CategoryRequirementsSelector.test.tsx` | Vitest / Component Test | Modelo paramétrico selecionado no wizard | Usuário define opções de acabamento | Filtra e exibe apenas perfis, vidros e ferragens compatíveis | ✅ Passou |

---

### US-46: Refatoração do Módulo de Orçamentos Budget V2 (Issue #172)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 04 | Criação Atômica de Orçamento com Múltiplos Itens | `BudgetIntegrationTest` | Integração MockMvc Spring Boot / H2 | Payload `BudgetCreateRequest` com lista de itens preenchida | Requisição `POST /api/budgets` é enviada | Persiste cabeçalho e todos os itens em transação única sem descartar itens (elimina BUG-022) | ✅ Passou |
| 05 | Desacoplamento entre Orçamento e Cálculo de Itens | `BudgetServiceTest` / `BudgetItemServiceTest` | Teste Unitário Backend (Clean Architecture) | Itens com regras de corte e insumos específicos | `BudgetService` delega cálculo para `BudgetItemService` | O valor total bruto é somado com exatidão centesimal sem acoplamento cíclico | ✅ Passou |
| 06 | Saneamento e Integridade Referencial com Cascata | `BudgetCascadeTest` | Teste de Persistência JPA | Orçamento existente no banco com 5 itens vinculados | Disparada exclusão lógica do orçamento | O orçamento e seus itens são marcados como inativos preservando o histórico | ✅ Passou |

---

### US-09: Motor de Descontos e Condições Comerciais (Issue #133)

| # | Cenário E2E / Aceitação | Arquivo / Classe de Teste | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 07 | Aplicação de Desconto Percentual com Trava | `PricingCalculatorTest` | Teste Unitário Financeiro (BigDecimal) | Orçamento com subtotal bruto de R$ 2.000,00 | Informa desconto de 15% | Calcula redução de R$ 300,00 totalizando R$ 1.700,00 | ✅ Passou |
| 08 | Bloqueio de Desconto Abusivo Acima de 100% | `PricingCalculatorTest` | Validação de Domínio | Subtotal bruto de R$ 2.000,00 | Informa desconto de 105% ou valor monetário $>$ subtotal | Sistema bloqueia operação lançando `BusinessException` (HTTP 422) | ✅ Passou |
| 09 | Agregação de Custos de Frete e Instalação | `BudgetPricingServiceTest` | Teste Unitário de Precificação | Proposta orçamentária com valor líquido | Informa taxa de frete (R$ 80,00) e instalação (R$ 150,00) | Total final agrega taxas com arredondamento `HALF_EVEN` | ✅ Passou |

---

### Quality #245: Saneamento SonarQube e Quality Gate

| # | Cenário E2E / Aceitação | Ferramenta / Pipeline | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|---|---|---|---|---|---|:---:|
| 10 | Manutenção do Quality Gate com New Code Coverage | SonarQube Cloud / GitHub Actions | Análise Estática Automatizada | Build Maven do backend e bundle do frontend | Executa pipeline do SonarQube | New Code Coverage $\ge 85\%$, 0 bugs, 0 vulnerabilidades e Quality Gate PASSED | ✅ Passou |

---

## 3. Rastreabilidade com os Requisitos do Sistema

| Cenário TEA | Requisito Funcional (RF) | Regra de Negócio (RN) | Issue GitHub / PR |
|:---:|:---:|:---:|:---:|
| 01 – 03 | `RF-010` (Studio CAD SVG) | `RN-CAD01` (Proporção) / `RN-CAD02` (Vão Mínimo) | Issue #126 / PR #130 |
| 04 – 06 | `RF-009` (Orçamentos V2) | `RN-ORC03` (Persistência Atômica Multi-Itens) | Issue #172 / PR #180 |
| 07 – 09 | `RF-011` (Descontos e Taxas) | `RN-FIN01` (Trava de Desconto) / `RN-FIN02` (Frete) | Issue #133 / PR #142 |
| 10 | `RNF-001` (Confiabilidade de Código) | SonarQube Quality Gate Padrão | Issue #245 / Pipeline CI |
