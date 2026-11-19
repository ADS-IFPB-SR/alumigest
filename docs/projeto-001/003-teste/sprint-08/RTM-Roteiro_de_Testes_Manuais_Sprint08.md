# 📋 RTM — Roteiro de Testes Manuais — Sprint 08

| Informação | Detalhe |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | 08 — Venda Avulsa de Partes (US-46 / US-46.5) e Central 360° do Cliente (US-47 / US-47.5) |
| **Documento** | Roteiro Operacional de Execução Manual de Testes de Aceitação |
| **Público-Alvo** | Product Owner (PO), Engenheiros de QA, Desenvolvedores e Validadores |
| **Versão** | 1.0 (Estrutura em Fichas Operacionais Executivas — Sem Tabelas de Execução) |
| **Governança** | Docs-as-Code — Tríade Documental ([`TEA`](./TEA-Testes_de_Aceitacao_Sprint08.md) • [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint08.md) • [`RET`](./RET-Relatorio_Execucao_Testes_Sprint08.md)) |
| **Status** | 🟢 **HOMOLOGADO** (Baseado na Baseline `B-ALG-v0.8.0-S08-01`) |

---

## 1. 🎯 Visão Geral e Guia Rápido

Este documento é o **guia oficial para reprodução manual dos testes de aceitação** da Sprint 08. Ele espelha diretamente as suítes automatizadas E2E do Cypress implementadas para **Venda Avulsa de Partes (`/vendas/avulsa` e `/vendas/avulsa/nova`)** e **Central 360° do Cliente (`/clientes`)**, utilizando seletores reais da aplicação React/TypeScript.

### 📌 Como usar este roteiro:
1. Suba o ambiente local conforme a Seção 2.
2. Execute sequencialmente as **Fichas Operacionais** das Seções 3 (Venda Avulsa) e 4 (Central 360°).
3. Marque cada caixa `- [ ]` ao validar o comportamento na tela.
4. Confira a **Matriz Defensiva de Não-Regressão** (Seção 5) e preencha a **Folha de Homologação** (Seção 6).

---

## 2. ⚙️ Pré-requisitos de Ambiente e Massa de Testes

### 2.1 Como subir a aplicação localmente:
```bash
# 1. Subir o banco PostgreSQL
docker compose up -d postgres

# 2. Inicializar o backend Spring Boot (migrations Flyway V1..V25 aplicadas automaticamente)
cd backend
./mvnw spring-boot:run

# 3. Inicializar o frontend Vite
cd frontend
npm run dev
```

* Frontend Local: `http://localhost:5173`
* API Backend Local: `http://localhost:8080/api/v1` (ou `8081` conforme perfil de execução)

### 2.2 Massa de dados recomendada:
* **Cliente Padrão (`V24`):** `Cliente Balcão` já cadastrado automaticamente via migration `V24__seed_walk_in_client_and_part_sales.sql` (seed `VP-2026-0002` disponível na listagem).
* **Clientes com Histórico:** Ao menos 1 cliente PF/PJ com Orçamentos e Ordens de Serviço aprovadas contendo esquadrias vinculadas, e 1 cliente recém-cadastrado sem histórico para validar Empty States.
* **Catálogo Ativo:** Pelo menos 1 material ativo em cada categoria (`PROFILE` alumínio até 6000 mm, `GLASS` vidro, `FILM` película com largura de bobina configurada, `HARDWARE` ferragem).

---

## 3. 🛒 Módulo 1: Venda Avulsa de Partes & Catálogo (US-46 & US-46.5)

---

### 🧪 Cenário RTM-VP-01: Autocomplete por Categoria e Cotação de Ferragem Unitária
* 🎯 **Objetivo:** Validar a filtragem de materiais por categoria, limpeza visual do dropdown (`BUG-043`), preenchimento automático do preço e ocultação de dimensões para ferragens.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/part-sales/us46_venda_avulsa_partes.cy.ts` — `TC-46-HP01`
* 📍 **Ponto de Partida:** `/vendas/avulsa/nova`

#### 👣 Passo a Passo de Execução:
1. Acesse `/vendas/avulsa/nova` e verifique a seleção automática de `Cliente Balcão` no bloco de cliente (`[data-testid="select-client"]`).
2. Em **Categoria**, selecione **Ferragem** (`HARDWARE`) no componente `[data-testid="select-part-category"]`.
3. Confirme que os campos de largura e altura **não** são exibidos nesta categoria.
4. No campo de busca do catálogo `[data-testid="input-part-description"]`, digite parte do nome da ferragem e clique em uma opção `[data-testid^="material-option-"]`.
5. Verifique que o dropdown exibe Nome e Família sem badge redundante de preço, e que o campo `[data-testid="input-hardware-price"]` foi preenchido automaticamente.
6. Em `[data-testid="input-hardware-quantity"]`, informe `4` e inspecione `[data-testid="panel-calculated-hardware"]`.
7. Clique em `[data-testid="btn-add-part-item"]` para inserir o item na tabela `[data-testid="table-part-items"]`.

#### ✅ Critérios de Aceitação:
- [ ] Dropdown exibe Nome e Família sem poluição de badges duplicadas de preço.
- [ ] Campos de largura/altura ficam ocultos para `HARDWARE` com cobrança por unidade inteira.
- [ ] Subtotal unitário bate exatamente com `quantidade × preço unitário` e aparece corretamente em `[data-testid="table-part-items"]`.

---

### 🧪 Cenário RTM-VP-02: Cálculo Transparente de Perfil de Alumínio e Limite de Barra (6000 mm)
* 🎯 **Objetivo:** Garantir cobrança proporcional por metro linear sem acréscimos surpresa (`BUG-042`) e bloqueio acima de `6000 mm`.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` — Cenário 2 & `TC-46-HP02`
* 📍 **Ponto de Partida:** `/vendas/avulsa/nova`

#### 👣 Passo a Passo de Execução:
1. No seletor `[data-testid="select-part-category"]`, selecione **Perfil de Alumínio** (`PROFILE`).
2. Busque um perfil no campo `[data-testid="input-part-description"]` (ex: linha Suprema com preço R$ 80,00/m) e clique na opção sugerida.
3. No campo `[data-testid="input-aluminum-length"]`, digite `6500` (acima do limite padrão de barra de `6000 mm`) e observe a mensagem `[data-testid="error-aluminum-length"]`.
4. Corrija `[data-testid="input-aluminum-length"]` para `1000` (1 metro), mantenha `[data-testid="input-aluminum-quantity"]` em `1` e verifique o badge `[data-testid="badge-metro-linear"]` e o painel `[data-testid="panel-calculated-meters"]`.
5. Clique em `[data-testid="btn-add-part-item"]`.

#### ✅ Critérios de Aceitação:
- [ ] Barra superior a `6000 mm` exibe erro claro em `[data-testid="error-aluminum-length"]` e impede inclusão inválida.
- [ ] Para `1000 mm` a R$ 80,00/m, o painel `[data-testid="panel-calculated-meters"]` e o subtotal cobram exatamente `1,0000 m × R$ 80,00 = R$ 80,00` (sem +5% surpresa).

---

### 🧪 Cenário RTM-VP-03: Piso Mínimo Obrigatório de Vidro (0,25 m²) vs. Área Real
* 🎯 **Objetivo:** Validar a regra `RN-02` / `RN-001` que cobra no mínimo $0,25\text{ m}^2$ por peça de vidro quando a área real for inferior, mantendo área real quando maior.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` — Cenário 3, `TC-46-HP03` & `TC-46-EC01`
* 📍 **Ponto de Partida:** `/vendas/avulsa/nova`

#### 👣 Passo a Passo de Execução:
1. Selecione a categoria **Vidro** (`GLASS`) em `[data-testid="select-part-category"]`.
2. Escolha um vidro ativo no autocomplete `[data-testid="input-part-description"]`.
3. Informe `[data-testid="input-glass-width"]` = `300`, `[data-testid="input-glass-height"]` = `400` e `[data-testid="input-glass-quantity"]` = `1` ($0,12\text{ m}^2$ reais).
4. Observe o alerta `[data-testid="warning-minimum-area"]` e o painel `[data-testid="panel-calculated-glass-area"]`.
5. Clique em `[data-testid="btn-add-part-item"]`.
6. Em seguida, adicione outro vidro com `[data-testid="input-glass-width"]` = `1000` e `[data-testid="input-glass-height"]` = `1200` ($1,20\text{ m}^2$ reais) e confirme ausência do alerta de piso mínimo.

#### ✅ Critérios de Aceitação:
- [ ] Para $300 \times 400\text{ mm}$, `[data-testid="warning-minimum-area"]` é exibido e a cobrança usa **$0,2500\text{ m}^2$**.
- [ ] Para $1000 \times 1200\text{ mm}$, nenhum aviso de piso mínimo aparece e a cobrança utiliza **$1,2000\text{ m}^2$**.

---

### 🧪 Cenário RTM-VP-04: Película por m², Fator de Perda de Bobina e Bloqueio de Largura
* 🎯 **Objetivo:** Verificar validação dimensional contra a largura máxima da bobina (`TC-46-SP03`) e aplicação de perda percentual configurável.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/part-sales/us46_venda_avulsa_partes.cy.ts` — `TC-46-SP03`
* 📍 **Ponto de Partida:** `/vendas/avulsa/nova`

#### 👣 Passo a Passo de Execução:
1. Selecione **Película** (`FILM`) no seletor `[data-testid="select-part-category"]` e escolha uma película do catálogo.
2. Em `[data-testid="input-film-width"]`, informe uma largura maior que a da bobina cadastrada (ex: `2000` mm para bobina de `1520` mm) com altura `1000` mm.
3. Observe a exibição do alerta bloqueante `[data-testid="warning-film-oversized"]`.
4. Reduza `[data-testid="input-film-width"]` para `1000` mm, preencha `[data-testid="input-film-loss"]` conforme desejado e confira `[data-testid="panel-calculated-film-area"]`.
5. Adicione o item à venda.

#### ✅ Critérios de Aceitação:
- [ ] Largura superior à bobina ativa `[data-testid="warning-film-oversized"]` e impede adição inválida.
- [ ] Dentro da largura válida, `[data-testid="panel-calculated-film-area"]` aplica corretamente a área com fator de perda.

---

### 🧪 Cenário RTM-VP-05: Proteções de Formulário, Reset de Aba e Finalização da Venda
* 🎯 **Objetivo:** Validar bloqueio sem material, limpeza de estado ao trocar categoria, desconto, salvamento no banco (`Cliente Balcão`), PDF e Etiquetas.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` — Cenário 4 & `TC-46-EC02`
* 📍 **Ponto de Partida:** `/vendas/avulsa/nova`

#### 👣 Passo a Passo de Execução:
1. Sem selecionar material no autocomplete, verifique que o botão `[data-testid="btn-add-part-item"]` permanece bloqueado ou rejeita inclusão sem material vinculado.
2. Preencha medidas na aba Vidro e, antes de adicionar, alterne para **Alumínio** em `[data-testid="select-part-category"]` para confirmar que o rascunho anterior é zerado.
3. Com pelo menos 1 item válido em `[data-testid="table-part-items"]`, confira `[data-testid="summary-total-pieces"]`, `[data-testid="summary-total-measure"]` e `[data-testid="summary-subtotal"]`.
4. Informe um desconto válido em `[data-testid="input-discount-amount"]` e confira atualização imediata de `[data-testid="summary-total-amount"]`.
5. Clique em `[data-testid="btn-save-part-sale"]`.
6. Após confirmação com código `VP-YYYY-NNNN`, clique em `[data-testid="btn-export-pdf"]` e depois em `[data-testid="btn-print-labels"]`.

#### ✅ Critérios de Aceitação:
- [ ] Trocar de categoria limpa integralmente o formulário de item em edição (sem mistura de dimensões).
- [ ] Venda salva com sucesso para `Cliente Balcão` (HTTP 201), retornando código `VP-YYYY-NNNN` e totalizações congeladas.
- [ ] Botões `[data-testid="btn-export-pdf"]` e `[data-testid="btn-print-labels"]` abrem seus respectivos modais sem erros de console.

---

### 🧪 Cenário RTM-VP-06: Listagem `/vendas/avulsa`, Paginação, Filtros e Modais Rápidos
* 🎯 **Objetivo:** Validar gestão histórica das vendas avulsas, busca com debounce, filtro de status, paginação e modais da tabela.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/part-sales/us46_lista_vendas_avulsas.cy.ts`
* 📍 **Ponto de Partida:** `/vendas/avulsa`

#### 👣 Passo a Passo de Execução:
1. Navegue até `/vendas/avulsa` e confirme o título **Vendas Avulsas de Partes** e o botão `[data-testid="btn-new-part-sale"]`.
2. Altere `[data-testid="select-page-size"]` entre `10` e `20` e navegue com `[data-testid="btn-next-page"]` / `[data-testid="btn-prev-page"]`.
3. Selecione `APPROVED` e depois `DRAFT` no filtro `[data-testid="select-status-filter"]`; em seguida limpe o filtro (`""`).
4. No campo `[data-testid="input-search-part-sales"]`, digite `VP-2026-0002` (ou um código existente) e aguarde ~500 ms.
5. Na linha encontrada, clique em **Ver** para abrir `[data-testid="modal-details-part-sale"]` e feche com `[data-testid="btn-close-details-modal"]`.
6. Clique em `button[aria-label^="Imprimir PDF"]` para validar `[data-testid="modal-pdf-part-sale"]` e no botão de etiquetas térmicas para validar `[data-testid="modal-thermal-labels"]`.

#### ✅ Critérios de Aceitação:
- [ ] Paginação, filtro de status e busca debounced atualizam corretamente os registros da tabela.
- [ ] Os três modais (`modal-details-part-sale`, `modal-pdf-part-sale`, `modal-thermal-labels`) abrem com dados consistentes e fecham sem erros.

---

## 4. 👤 Módulo 2: Central 360° do Cliente (US-47 & US-47.5)

---

### 🧪 Cenário RTM-HUB-01: Master-Detail, Busca na Sidebar, Hero Card e 3 KPIs
* 🎯 **Objetivo:** Validar a visão unificada do cliente na rota `/clientes` com carregamento do Hero Card PF/PJ e indicadores agregados.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/customers/us47_hub_360_cliente.cy.ts` — `TC-47-HP01` & `TC-47-SP03`
* 📍 **Ponto de Partida:** `/clientes`

#### 👣 Passo a Passo de Execução:
1. Acesse `/clientes` pelo menu lateral **Clientes**.
2. Na barra lateral `aside[aria-label="Lista de Clientes"]`, digite um termo inexistente no campo de busca e confira a mensagem amigável `"Nenhum cliente encontrado."`.
3. Limpe a busca, pesquise por um cliente real com histórico e clique no cartão dele na sidebar.
4. No painel principal à direita, inspecione o título `h1`, badge `PF`/`PJ`, localização, telefone e documento no Hero Card.
5. Verifique os 3 cartões de KPI: **Total Contratado**, **Ordens de Serviço** e **Orçamentos Vinculados**.

#### ✅ Critérios de Aceitação:
- [ ] Sidebar `aside[aria-label="Lista de Clientes"]` filtra dinamicamente e exibe estado vazio amigável para buscas sem resultado.
- [ ] Hero Card exibe todos os dados cadastrais e os 3 KPIs excluem pedidos/orçamentos cancelados do total contratado.

---

### 🧪 Cenário RTM-HUB-02: Aba Orçamentos — Propostas, PDF, WhatsApp e `+ Novo Orçamento`
* 🎯 **Objetivo:** Conferir a gestão de propostas do cliente selecionado e os atalhos comerciais rápidos.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/customers/us47_hub_360_cliente.cy.ts` — `TC-47-HP02` & `TC-47-HP07`
* 📍 **Ponto de Partida:** `/clientes` com cliente selecionado na aba **Orçamentos**

#### 👣 Passo a Passo de Execução:
1. Com a aba **Orçamentos** ativa, verifique as colunas `Nº Orçamento`, `Data`, `Situação`, `Valor da Proposta` e `Ações Rápidas`.
2. Em uma linha de orçamento, localize os botões `button[aria-label^="Visualizar proposta em PDF do orçamento"]` e `a[aria-label^="Enviar proposta do orçamento"]`.
3. Clique no botão de visualização de PDF e verifique a abertura/download da proposta.
4. No Hero Card, clique no botão **`+ Novo Orçamento`**.

#### ✅ Critérios de Aceitação:
- [ ] Tabela de orçamentos exibe status semânticos e valores formatados em `R$`.
- [ ] Ação de WhatsApp aponta para link `wa.me` / API WhatsApp com mensagem pré-codificada e ação PDF carrega sem falhas.
- [ ] Botão `+ Novo Orçamento` redireciona para `/orcamentos/novo?clienteId={id}` já travado no cliente em foco.

---

### 🧪 Cenário RTM-HUB-03: Aba Ordens de Serviço (O.S.) — Drawer em mm, Ficha Técnica A4 e Etiquetas
* 🎯 **Objetivo:** Validar layout responsivo em desktop (`1366x768` e `1920x1080`), detalhamento de esquadrias (`📐 L x A mm`) e ações fabris diretas no Hub.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/customers/us47_hub_360_cliente.cy.ts` — `TC-47-HP03`, `TC-47-HP04`, `TC-47-HP05`, `TC-47-HP06` & `TC-47-EC01`
* 📍 **Ponto de Partida:** `/clientes` com cliente que possua O.S. ativa

#### 👣 Passo a Passo de Execução:
1. Clique na aba **`Ordens de Serviço (O.S.)`** e valide legibilidade das colunas (`Código O.S.`, `Data`, `Situação`, etc.) tanto em tela cheia quanto redimensionada para `1366x768`.
2. Clique sobre uma linha de O.S. para expandir o drawer de itens físicos.
3. Confira se cada esquadria exibe medidas nominais em milímetros (`📐 L x A mm`), cor/acabamento, vidro e quantidade.
4. Clique na ação **`Ficha Técnica`** e observe a requisição para `/api/v1/orders/{id}/production-sheet/pdf`.
5. Clique na ação **`Etiquetas`** para abrir o modal `[data-testid="thermal-label-modal"]` e feche com `[data-testid="btn-close-thermal-modal"]`.

#### ✅ Critérios de Aceitação:
- [ ] Nenhuma coluna da tabela de O.S. é comprimida ou cortada em `1366x768`.
- [ ] Drawer detalha todas as esquadrias em milímetros com rolagem fluida mesmo para O.S. volumosas (9+ itens).
- [ ] Ficha Técnica A4 dispara download PDF válido e Etiquetas Térmicas abre o modal `100×60 mm` corretamente.

---

### 🧪 Cenário RTM-HUB-04: Empty States, Resiliência a Erro 500 e Modo Escuro
* 🎯 **Objetivo:** Garantir robustez visual da Central 360° em cenários alternativos e modo escuro.
* 🤖 **Equivalente Automatizado:** `frontend/cypress/e2e/customers/us47_hub_360_cliente.cy.ts` — `TC-47-SP01`, `TC-47-SP02` & `TC-47-EC02`
* 📍 **Ponto de Partida:** `/clientes`

#### 👣 Passo a Passo de Execução:
1. Selecione um cliente recém-cadastrado sem histórico e navegue pelas abas **Orçamentos** e **Ordens de Serviço (O.S.)** para verificar os Empty States.
2. Com o DevTools (`F12`) > **Network** em Offline (ou simulando erro 500 no dashboard), clique em outro cliente na sidebar e observe o estado de fallback no painel direito mantendo a sidebar funcional.
3. Ative o Modo Escuro da interface e verifique contraste de cartões, KPIs, badges e tabelas no Hub 360°.

#### ✅ Critérios de Aceitação:
- [ ] Clientes sem movimentação exibem cards orientativos de estado vazio sem zeros quebrados ou erros.
- [ ] Falha de API preserva a sidebar mestre navegável e exibe erro tratável no painel de detalhe.
- [ ] Modo Escuro mantém legibilidade plena sem textos apagados ou bordas invisíveis.

---

## 5. 🛡️ Matriz Defensiva de Não-Regressão de Bugs

| Defeito / Issue | Comportamento que NÃO deve ocorrer | Cenário de Validação |
|:---:|:---|:---:|
| **BUG-041** | Falha HTTP 404/500 ao salvar Venda Avulsa selecionando `Cliente Balcão`. | Validado em `RTM-VP-05` |
| **BUG-042** | Acréscimo oculto (+5%) no checkout ao cotar perfil de alumínio (`1000 mm × R$ 80,00` devendo resultar `R$ 80,00`). | Validado em `RTM-VP-02` |
| **BUG-043** | Badge de preço poluindo os itens do dropdown de `MaterialAutocomplete`. | Validado em `RTM-VP-01` |
| **BUG-044** | Massa de teste E2E acumulando registros órfãos no PostgreSQL após execução Cypress. | Validado em `RTM-VP-05` |
| **BUG-045** | `NullPointerException` no Hub 360° ao consultar O.S. em testes integrados / mapeamentos. | Validado em `RTM-HUB-03` |
| **Issue #524** | Item duplicado do Kanban exibido na barra lateral de navegação. | Conferido na Sidebar global |
| **Issue #525** | Colunas do painel Kanban cortando cards inferiores sem barra de rolagem vertical. | Conferido em `/producao` |

---

## 6. 📝 Folha de Homologação Formal da Sprint 08

* **Data da Homologação:** 08/11/2026
* **Ambiente Testado:** `http://localhost:5173` (Local DEV) / PostgreSQL com migrations `V1..V25`
* **Homologador Responsável:** Equipe de QA / Product Owner AlumiGest
* **Total de Cenários Manuais Cobertos:** 10 fichas operacionais (6 de Venda Avulsa + 4 de Central 360° do Cliente)
* **Taxa de Aprovação:** **100% de Aprovação** nos fluxos validados
* **Parecer Final:**
  > "Os módulos de Venda Avulsa de Partes (com seleção por categoria do catálogo, regras de vidro mínimo, alumínio proporcional, película em bobina e listagem gerencial) e a Central 360° do Cliente (com Hero Card, KPIs, orçamentos, O.S., Ficha Técnica A4 e Etiquetas Térmicas) estão plenamente aderentes ao domínio da vidraçaria e esquadrias. Os ajustes #524 e #525 do Kanban foram validados em conjunto."

---

*AlumiGest — Documento de Governança Docs-as-Code homologado pela Equipe de QA e Tech Lead — Baseline B-ALG-v0.8.0-S08-01 — 08/11/2026*
