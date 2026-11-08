# 🧪 TEA — Testes de Aceitação — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 08 — Venda Avulsa de Partes (US-46), Central 360° do Cliente (US-47) e Qualidade PROSA |
| **Período** | Novembro/2026 |
| **Versão** | 2.0 (Baseline B-ALG-v0.8.0-S08-01) |
| **QA Responsável** | Equipe de QA AlumiGest |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 08 (Foco US-46 & US-47)

Validar os critérios de aceitação e a conformidade técnica das entregas do módulo de **Venda Avulsa de Partes (US-46 #477)**, **Listagem de Tipo de Material no Seletor (US-46.5 #551)** e **Central 360° do Cliente (US-47 #496 & US-47.5 #556)**:
1. **Seleção e Autocomplete de Materiais por Categoria (`US-46.5 #551`):** Filtragem dinâmica via `GET /api/v1/materials?category={category}`, preenchimento automático do preço unitário padrão no formulário e dropdown focado apenas em Nome e Família.
2. **Cálculo Transparente de Perfil de Alumínio:** Apuração sem sobretaxas ocultas no checkout, embutindo a perda industrial de 5% no preço final proporcional ($1,0000\text{ m} \times \text{R\$ } 80,00 = \text{R\$ } 80,00$).
3. **Piso Mínimo de Vidro de $0,25\text{ m}^2$ (RN-02):** Aplicação compulsória de tarifação mínima para retalhos e peças menores que $0,25\text{ m}^2$.
4. **Película com Validação de Bobina (RN-04):** Apuração por metro quadrado com fator de perda de bobina e bloqueio quando a largura ultrapassa a largura máxima da bobina.
5. **Ferragens com Cobrança por Unidade Inteira:** Ocultação de dimensões físicas e apuração simplificada por quantidade multiplicada pelo preço unitário.
6. **Central 360° do Cliente (`US-47 #496` & `US-47.5 #556`):** Visão holística Master-Detail, Hero Card com dados cadastrais, 3 KPIs consolidados, listagem e download de propostas/PDF/WhatsApp, tabela de O.S. sem quebra visual, drawer de esquadrias físicas com medidas nominais em milímetros (`📐 L x A mm`), download de Ficha Técnica A4 e emissão de Etiquetas Térmicas (100x60mm).
7. **Integridade de Dados e Isolamento em Testes:** Prevenção de inclusão sem material vinculado (CA 4), reset ao alternar categorias (CA 5) e exclusão em cascata no banco de dados após a execução da suíte E2E.

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

### TEA-S08-02: Central 360° do Cliente com Gestão Unificada (`US-47 #496` & `US-47.5 #556`)
**Suíte Automatizada E2E**: `frontend/cypress/e2e/customers/us47_hub_360_cliente.cy.ts`  
**Suíte de Integração Backend**: `backend/src/test/java/br/edu/ifpb/alumigest/clients/controller/ClientHubControllerIntegrationTest.java`  
**Comandos de Execução**: `npm run test:e2e:us47` (frontend) / `./mvnw test -Dtest=ClientHubControllerIntegrationTest` (backend)

| # | Código | Cenário BDD / TEA | Dado | Quando | Então | Status |
|---|:---:|---|---|---|---|:---:|
| 1 | **TC-47-HP01** | Busca dinâmica, seleção na sidebar e carregamento do Hero Card com 3 KPIs | Operador na rota `/clientes` com cliente selecionado | A página carrega os dados via `GET /api/clientes/{id}/dashboard` | Hero Card exibe avatar, nome, telefone, documento, localização; Grid consolida Total Contratado, Quantidade de O.S. e Orçamentos | 🟢 Aprovado (3801ms) |
| 2 | **TC-47-HP02** | Gestão de propostas na aba Orçamentos com ações rápidas | Cliente selecionado na aba Orçamentos | Operador visualiza propostas comerciais | Tabela exibe Nº Orçamento, Data, Situação, Valor; ações acionam PDF e link WhatsApp direto com payload codificado | 🟢 Aprovado (1164ms) |
| 3 | **TC-47-HP03** | Tabela de O.S. sem compressão visual (1366x768 e 1920x1080) | Operador acessa aba de Ordens de Serviço | Alterna entre resoluções 1366x768 e 1920x1080 | Cabeçalhos e células (Código, Data, Situação Fabril, Valor, Esquadrias, Ações) mantêm legibilidade sem truncamento | 🟢 Aprovado (1285ms) |
| 4 | **TC-47-HP04** | Detalhamento de esquadrias físicas com medidas nominais em mm | Linha da O.S. visível na tabela | Operador clica na linha da O.S. para expandir | Drawer abre exibindo esquadrias físicas, quantidade e medidas canônicas nominais `📐 L x A mm`, cores e vidros | 🟢 Aprovado (1299ms) |
| 5 | **TC-47-HP05** | Fluxo de download da Ficha Técnica A4 de corte | O.S. com esquadrias vinculadas | Operador clica no botão "Ficha Técnica" | Requisição `GET /api/orders/{id}/production-sheet/pdf` é disparada e toast de sucesso é renderizado | 🟢 Aprovado (1169ms) |
| 6 | **TC-47-HP06** | Modal de Etiquetas Térmicas (100x60mm) para impressora Elgin L42 | O.S. com esquadrias vinculadas | Operador clica no botão "Etiquetas" | Modal `ThermalLabelModal` abre com conferência de etiquetas, paginação por peça e botão de impressão | 🟢 Aprovado (1207ms) |
| 7 | **TC-47-HP07** | Redirecionamento para novo orçamento com cliente pré-selecionado | Operador no Hero Card do cliente | Clica no botão "+ Novo Orçamento" | Sistema navega para `/orcamentos/novo?clienteId={id}` travando cliente selecionado no fluxo | 🟢 Aprovado (1040ms) |
| 8 | **TC-47-SP01** | Empty States para clientes recém-cadastrados sem movimentação | Cliente novo sem orçamentos ou ordens selecionado | Carrega dashboard com KPIs zerados | Abas de Orçamentos e O.S. exibem cartões elegantes de estado vazio com orientação comercial | 🟢 Aprovado (1107ms) |
| 9 | **TC-47-SP02** | Tratamento de falha de conexão na API (erro 500/rede) | Falha no endpoint de dashboard | Operador navega no Hub | Sidebar mestre permanece intacta e pesquisável; detalhe exibe estado de fallback sem quebrar a UI | 🟢 Aprovado (7912ms) |
| 10 | **TC-47-SP03** | Busca sem resultados na barra lateral | Operador digita termo inexistente no searchbox | API retorna lista vazia | Sidebar exibe "Nenhum cliente encontrado." amigavelmente | 🟢 Aprovado (1744ms) |
| 11 | **TC-47-EC01** | O.S. volumosa com múltiplas esquadrias | O.S. com 9 ou mais esquadrias de grande porte | Operador expande drawer | Grid de esquadrias adapta-se com fluidez e rolagem vertical suave sem quebrar o layout mestre | 🟢 Aprovado (1212ms) |
| 12 | **TC-47-EC02** | Consistência visual e contraste em Modo Escuro | Interface em modo escuro (`dark:`) | Operador navega no Hub 360° | Tokens semânticos mantêm legibilidade, contraste e bordas suaves no Hero Card, KPIs e tabelas | 🟢 Aprovado (946ms) |
| 13 | **INT-BACK-01** | Teste de Integração Backend Hub 360° | `ClientHubControllerIntegrationTest.java` com H2/JPA | Executa endpoints `/api/clientes/{id}/dashboard`, `/budgets`, `/orders` | Valida agregações de KPIs (excluindo canceladas), paginação e medidas em mm com status 200 e 404 | 🟢 Aprovado (15.09s) |

---

## 3. 📊 Métricas Consolidadas de QA da Sprint 08 (US-46 & US-47)

| Métrica de Qualidade | Meta Estabelecida | Resultado Conquistado na Sprint 08 | Status de Homologação |
|---|:---:|:---:|:---:|
| **Total de Testes Backend** | $\ge 35$ testes | **40 testes (5 classes)** | 🟢 100% Passando |
| **Total de Testes Frontend (Vitest)** | $\ge 1000$ testes | **1025 testes (122 suítes)** | 🟢 100% Passando |
| **Suíte E2E Cypress (US-46 + US-47)** | $\ge 2$ specs | **2 specs (16 cenários homologados)** | 🟢 Homologado |
| **Bugs Bloqueantes em Aberto** | 0 | **0 bugs bloqueantes** | 🟢 Rating A |
| **Vulnerabilidades SAST / Segurança** | 0 | **0 vulnerabilidades** | 🟢 Rating A |
| **Cenários TEA Homologados** | 21 cenários | **21 cenários (100% Aprovados)** | 🟢 Homologado |

---

*Testes de Aceitação da Sprint 08 homologados com evidências de execução integrada e isolamento de dados — Versão 2.0 — Novembro/2026*
