# 🧪 TEA — Testes de Aceitação — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos/Condições (US-09) e Quality SonarQube |
| **Período** | 01/09/2026 a 14/09/2026 (14 dias) |
| **Versão** | 2.0 (Homologado com o Quadro Oficial ZenHub / GitHub Projects) |
| **QA Responsável** | Herbert Carvalho dos Santos / Equipe de QA AlumiGest |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 04

Validar os critérios de aceitação e a conformidade técnica das 5 demandas centrais da Sprint 04:
1. **Templates Paramétricos em SVG (`US-05 #126`):** Renderização vetorial dinâmica dos 10 modelos canônicos de esquadrias e validações dimensionais no Studio CAD.
2. **Arquitetura de Orçamentos V2 (`US-46 #172`):** Criação atômica transacional de propostas orçamentárias com múltiplos itens inclusos via `POST /api/budgets` e eliminação de perdas de itens (correção do BUG-022 / Issue #300).
3. **Fundação e Motor de Descontos Comerciais (`US-09 #133`):** Cálculo determinístico de descontos percentuais e em valor monetário fixo, condições de pagamento pré-configuradas e validação de alçadas financeiras com `BigDecimal`.
4. **Resolução de Débitos Técnicos e SonarQube (`quality #245`):** Exclusão de DTOs e Mappers das métricas do JaCoCo, conformidade com SonarLint e manutenção do Quality Gate com New Code Coverage $\ge 80\%$, zero bugs e zero vulnerabilidades.
5. **Decisão de Engenharia da Homologação (`US-12 #136`):** Homologação da diluição dos critérios da Release 1 como Definition of Done (DoD) contínuo das histórias US-09 e US-10 na Sprint 05.

---

## 2. 📋 Cenários de Teste e Evidências de Execução (BDD / Gherkin)

### TEA-S04-01: Templates Paramétricos de Esquadrias (`US-05 #126`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Renderização vetorial dos 10 modelos canônicos | Usuário seleciona qualquer um dos 10 modelos do catálogo (ex: Janela 2 Folhas Correr, Porta Pivotante, Maxim-ar) | Informa medidas de vão em mm ($W$ e $H$) | O Studio CAD renderiza o SVG vetorial proporcionalmente com cotas e sentido de abertura | StudioCAD Test ✅ Aprovado |
| 2 | Alerta visual para vão físico subdimensionado | Usuário informa largura ou altura $< 400\text{ mm}$ no configurador | Validador do template processa a entrada | Exibe alerta visual de dimensão crítica e bloqueia o cálculo de esquadria impossível de fabricar | TemplateValidator ✅ Aprovado |
| 3 | Seletor dinâmico de insumos por tipologia | Modelo paramétrico selecionado no wizard | Usuário define opções de acabamento | O `CategoryRequirementsSelector` lista apenas perfis, vidros e ferragens compatíveis com o modelo | ComponentTest ✅ Aprovado |

---

### TEA-S04-02: Refatoração do Módulo de Orçamentos V2 (`US-46 #172`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Criação atômica de orçamento com itens inclusos | Payload `BudgetCreateRequest` com dados do cliente e lista `items` preenchida | Requisição `POST /api/budgets` é enviada | O backend persiste o orçamento e todos os itens em transação única sem descartar itens | `BudgetIntegrationTest` ✅ Aprovado |
| 2 | Desacoplamento entre orçamento e cálculo de itens | Itens com regras de corte e insumos específicos | `BudgetService` delega cálculo para `BudgetItemService` | O valor total bruto é somado com exatidão centesimal sem acoplamento cíclico | `BudgetServiceTest` ✅ Aprovado |
| 3 | Saneamento e integridade referencial com cascata | Orçamento existente no banco com 5 itens vinculados | Disparada exclusão lógica do orçamento | O orçamento e seus itens são marcados como inativos preservando o histórico | `BudgetCascadeTest` ✅ Aprovado |

---

### TEA-S04-03: Descontos Comerciais e Condições de Pagamento (`US-09 #133`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Aplicação de desconto percentual (%) com recálculo | Orçamento no estado `DRAFT` com valor bruto de R$ 1.500,00 | Vendedor aplica desconto percentual de 10% | O sistema calcula o desconto em R$ 150,00 e define o valor líquido para R$ 1.350,00 | `PricingCalculatorTest` ✅ Aprovado |
| 2 | Aplicação de desconto em valor monetário fixo (R$) | Orçamento possui valor bruto de R$ 2.000,00 | Vendedor informa desconto fixo de R$ 200,00 | O sistema calcula o valor líquido em R$ 1.800,00 e o percentual correspondente de 10,0% | `PricingCalculatorTest` ✅ Aprovado |
| 3 | Bloqueio de desconto abusivo ou superior ao total | Orçamento possui valor bruto de R$ 2.000,00 | Tenta aplicar desconto de R$ 2.500,00 ou percentual superior a 100% | O sistema rejeita com `BusinessException` e HTTP 400 Bad Request | `PricingValidationTest` ✅ Aprovado |
| 4 | Composição de taxas de frete e instalação | Orçamento com desconto de R$ 100,00, frete de R$ 80,00 e instalação de R$ 150,00 | Motor processa o fechamento | `valorLiquido = (valorBruto - desconto) + frete + instalacao` é calculado com precisão `BigDecimal` | `PricingCalculatorTest` ✅ Aprovado |
| 5 | Persistência de condições de pagamento predefinidas | Vendedor seleciona "50% Entrada + 50% na Entrega" | Orçamento é salvo | O campo `condicaoPagamento` e observações comerciais são gravados no banco | `BudgetRepositoryTest` ✅ Aprovado |

---

### TEA-S04-04: Conformidade SonarQube e Débitos Técnicos (`quality #245`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Exclusão de DTOs e Mappers da Cobertura JaCoCo | Classes Record DTO, Mappers MapStruct e Entidades JPA | Executado `./mvnw clean verify` | Relatório JaCoCo XML exclui arquivos anêmicos e mede cobertura apenas nas classes de serviço | `pom.xml` JaCoCo ✅ Aprovado |
| 2 | Conformidade com Regras SonarLint Pré-Commit | Alterações de código submetidas para PR | Análise estática do SonarScanner no GitHub Actions | Quality Gate reporta 0 bugs, 0 vulnerabilidades e 0 security hotspots | SonarQube CI ✅ Aprovado |
| 3 | Limiar de Cobertura em Código Novo $\ge 80\%$ | Classes criadas e refatoradas na Sprint 04 | Pipeline de CI avalia New Code Coverage | Cobertura em código novo atinge $> 85\%$ nas regras de negócio | Quality Gate ✅ Aprovado |

---

### TEA-S04-05: Transição e Diluição da Homologação R1 (`US-12 #136`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Diluição dos Critérios da Release 1 para a Sprint 05 | Demanda de homologação em lote fechado da Release 1 | Deliberação conjunta de PO, Tech Lead e QA | Os critérios de aceitação da US-12 são distribuídos como Definition of Done (DoD) incremental das US-09 e US-10 da Sprint 05 | Acordo de Governança ✅ Aprovado |
| 2 | Prevenção de Gargalo de Entrega | Pacotes de software prontos para testes contínuos | Validações executadas em fluxo contínuo de PRs | Elimina a necessidade de congelamento de branch e viabiliza a entrega dos PDFs na Sprint 05 | Fluxo de Integração ✅ Aprovado |

---

## 3. 📊 Métricas Consolidadas de QA da Sprint 04

| Métrica de Qualidade | Meta Estabelecida | Resultado Conquistado na Sprint 04 | Status de Homologação |
|---|:---:|:---:|:---:|
| **Story Points Entregues** | 50 pts | **44 pts (88%)** | 🟢 Aprovado |
| **Total de Testes Automatizados no Backend** | $> 150$ testes | **242 testes (32 classes)** | 🟢 100% Passando |
| **Total de Specs E2E Cypress no Frontend** | $> 20$ specs | **24 specs automatizadas** | 🟢 100% Passando |
| **Cobertura de Código nos Serviços de Domínio** | $\ge 80\%$ | **$> 85\%$ nas regras de cálculo e orçamentos** | 🟢 Aprovado |
| **Vulnerabilidades SAST / Segurança** | 0 | **0 vulnerabilidades** | 🟢 Rating A |
| **Bugs Bloqueantes em Aberto** | 0 | **0 bugs bloqueantes** | 🟢 Rating A |
| **Cenários TEA Homologados na Sprint 04** | 15 cenários | **16 cenários (100% Aprovados)** | 🟢 Homologado |

---

*Testes de Aceitação da Sprint 04 homologados com evidências de execução integrada e SonarQube — Versão 2.0 — 24/09/2026*
