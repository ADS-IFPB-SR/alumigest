# 🧪 TEA — Testes de Aceitação — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 08 — Venda Avulsa de Partes (US-46), Catálogo por Categoria (US-46.5) e Qualidade PROSA |
| **Período** | Novembro/2026 |
| **Versão** | 2.0 (Baseline B-ALG-v0.8.0-S08-01) |
| **QA Responsável** | Equipe de QA AlumiGest |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 08 (Foco US-46)

Validar os critérios de aceitação e a conformidade técnica das entregas do módulo de **Venda Avulsa de Partes (US-46 #477)** e **Listagem de Tipo de Material no Seletor (US-46.5 #551)**:
1. **Seleção e Autocomplete de Materiais por Categoria (`US-46.5 #551`):** Filtragem dinâmica via `GET /api/v1/materials?category={category}`, preenchimento automático do preço unitário padrão no formulário e dropdown focado apenas em Nome e Família.
2. **Cálculo Transparente de Perfil de Alumínio:** Apuração sem sobretaxas ocultas no checkout, embutindo a perda industrial de 5% no preço final proporcional ($1,0000\text{ m} \times \text{R\$ } 80,00 = \text{R\$ } 80,00$).
3. **Piso Mínimo de Vidro de $0,25\text{ m}^2$ (RN-02):** Aplicação compulsória de tarifação mínima para retalhos e peças menores que $0,25\text{ m}^2$.
4. **Película com Validação de Bobina (RN-04):** Apuração por metro quadrado com fator de perda de bobina e bloqueio quando a largura ultrapassa a largura máxima da bobina.
5. **Ferragens com Cobrança por Unidade Inteira:** Ocultação de dimensões físicas e apuração simplificada por quantidade multiplicada pelo preço unitário.
6. **Integridade de Dados e Isolamento em Testes:** Prevenção de inclusão sem material vinculado (CA 4), reset ao alternar categorias (CA 5) e exclusão em cascata no banco de dados após a execução da suíte E2E.

---

## 2. 📋 Cenários de Teste e Evidências de Execução (BDD / Gherkin)

### TEA-S08-01: Venda Avulsa de Partes e Seletor do Catálogo (`US-46 #477` & `US-46.5 #551`)
**Suíte Automatizada E2E**: `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts`  
**Comandos de Execução**: `npm run test:e2e:us46` (headless) ou `npm run test:e2e:us46:headed` (visual)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Autocomplete e busca textual de materiais por categoria (CA 1 & CA 2) | Usuário na tela `/venda-avulsa` na aba Alumínio | Digita "Suprema" no campo de material do catálogo | A API lista materiais ativos da categoria `PROFILE`; o dropdown exibe Nome e Família (sem poluição de preço); ao clicar, auto-preenche o preço unitário padrão | `MaterialAutocomplete.test.tsx` / Cypress ✅ Aprovado |
| 2 | Cálculo transparente de perfil de alumínio com perda inclusa | Perfil com valor de R$ 80,00/m selecionado | Informa 1000 mm (1 metro) e clica em "+ Inserir na Venda" | O cálculo exibe: $1,0000\text{ m} \times \text{R\$ } 80,00 = \text{R\$ } 80,00$; perda de 5% embutida sem acréscimo surpresa no total | `AluminumItemFields.test.tsx` / Cypress ✅ Aprovado |
| 3 | Piso mínimo compulsório de $0,25\text{ m}^2$ para vidro pequeno | Vidro temperado 8mm selecionado | Informa largura de 300 mm e altura de 400 mm ($0,12\text{ m}^2$ real) | O sistema aplica compulsoriamente a cobrança de $0,25\text{ m}^2$, exibindo badge informativo de piso mínimo | `GlassItemFields.test.tsx` / Cypress ✅ Aprovado |
| 4 | Venda de ferragens por unidade inteira | Categoria Ferragem selecionada | Informa 4 unidades de roldana regulável | Inputs de largura e altura ficam ocultos; exibe badge "Cobrança por Unidade"; subtotal apurado em tempo real | `PartSaleForm.test.tsx` / Cypress ✅ Aprovado |
| 5 | Bloqueio de inserção sem seleção de material (CA 4) | Categoria selecionada, mas sem escolher material do catálogo | Tenta clicar em "+ Inserir na Venda" | Botão fica desabilitado e formulário alerta a obrigatoriedade da seleção | `PartSaleForm.test.tsx` ✅ Aprovado |
| 6 | Reset imediato ao alternar abas de categorias (CA 5) | Dados preenchidos na aba Vidro | Operador clica na aba Alumínio | Estado do formulário de item e cálculos residuais são zerados, prevenindo inconsistências | `PartSaleMaterialForm.test.tsx` ✅ Aprovado |
| 7 | Persistência de venda multimaterial e exportação de PDF | Proposta preenchida com os 4 materiais | Operador clica em "Salvar e Concluir Venda" | Venda é persistida no PostgreSQL com código gerado; modais de PDF e etiquetas térmicas abrem com sucesso | Cypress E2E / PostgreSQL ✅ Aprovado |
| 8 | Limpeza automática e isolamento de banco de dados | Venda de teste gerada no PostgreSQL | Suíte Cypress finaliza a execução | Hook `after()` dispara `DELETE /api/v1/test-support/cleanup?partSaleCode=...` e remove registros sem deixar resíduos | `TestCleanupController.java` ✅ Aprovado |

---

## 3. 📊 Métricas Consolidadas de QA da Sprint 08 (US-46)

| Métrica de Qualidade | Meta Estabelecida | Resultado Conquistado na Sprint 08 | Status de Homologação |
|---|:---:|:---:|:---:|
| **Total de Testes Backend** | $\ge 30$ testes | **36 testes (4 classes)** | 🟢 100% Passando |
| **Total de Testes Frontend** | $\ge 50$ testes | **73 testes (13 suítes)** | 🟢 100% Passando |
| **Suíte E2E Cypress** | $\ge 1$ spec | **1 spec (4 cenários visuais homologados)** | 🟢 Homologado |
| **Bugs Bloqueantes em Aberto** | 0 | **0 bugs bloqueantes** | 🟢 Rating A |
| **Vulnerabilidades SAST / Segurança** | 0 | **0 vulnerabilidades** | 🟢 Rating A |
| **Cenários TEA Homologados** | 8 cenários | **8 cenários (100% Aprovados)** | 🟢 Homologado |

---

*Testes de Aceitação da Sprint 08 homologados com evidências de execução integrada e isolamento de dados — Versão 2.0 — Novembro/2026*

