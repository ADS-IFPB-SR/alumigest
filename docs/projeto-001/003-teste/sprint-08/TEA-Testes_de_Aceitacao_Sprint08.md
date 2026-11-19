# 🧪 TEA — Testes de Aceitação — Sprint 08

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 08 — Venda Avulsa de Partes (US-46), Central 360° do Cliente (US-47) e Correções de Usabilidade Kanban (#524 / #525) |
| **Período** | 27/10/2026 a 09/11/2026 (Baseline consolidada em 08/11/2026) |
| **Versão da Baseline** | B-ALG-v0.8.0-S08-01 (`release/v0.8.0`) |
| **QA Responsável** | Equipe de QA AlumiGest (Joseph / Herbert / Victor) |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Tríade Documental de Testes (`TEA`, `RTM`, `RET`) |
| **Status Geral** | 🟢 **100% HOMOLOGADO (Backend, Frontend e Suítes E2E Cypress)** |

---

## 1. 🎯 Objetivos de Qualidade e Critérios de Aceitação da Sprint 08

A **Sprint 08** entregou duas funcionalidades estratégicas de operação comercial e atendimento integrado, além dos ajustes visuais priorizados pelo PO no encerramento da Sprint 07:

1. **Venda Avulsa de Partes & Seletor Integrado do Catálogo (`US-46` [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477) & `US-46.5` [#551](https://github.com/ADS-IFPB-SR/alumigest/issues/551)):**
   - Filtragem dinâmica de insumos ativos via `GET /api/v1/materials?category={category}` (`GLASS`, `PROFILE`, `FILM`, `HARDWARE`), com auto-preenchimento do preço unitário padrão e dropdown limpo focado em Nome e Família (correção do `BUG-043`).
   - Cálculo transparente de perfil de alumínio por metro linear (barras até `6000 mm`) sem acréscimos ocultos no checkout (correção do `BUG-042`), com arredondamento comercial padronizado.
   - Aplicação compulsória do piso mínimo de **$0,25\text{ m}^2$ (`RN-02` / `RN-001`)** para vidros com alerta visual na interface.
   - Cálculo de película por $\text{m}^2$ com fator de perda de bobina configurável e validação bloqueante para larguras superiores à largura máxima da bobina (`RN-04`).
   - Venda de ferragens por unidade inteira com ocultação dos inputs dimensionais ($L \times A$).
   - Cliente Balcão padrão (`V24`) garantido via `resolveClient` (`BUG-041`), listagem canônica em `/vendas/avulsa`, criação em `/vendas/avulsa/nova`, exportação de PDF e geração de etiquetas térmicas.
   - Isolamento automatizado de massa de testes no PostgreSQL via `DELETE /api/v1/test-support/cleanup` (`BUG-044`).

2. **Central 360° do Cliente (`US-47` [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496) & `US-47.5` [#556](https://github.com/ADS-IFPB-SR/alumigest/issues/556)):**
   - Layout Master-Detail na rota `/clientes` com sidebar pesquisável (`aside[aria-label="Lista de Clientes"]`), Hero Card PF/PJ e 3 KPIs consolidados via `GET /api/v1/clientes/{id}/dashboard` (excluindo cancelamentos do faturamento contratado).
   - Aba **Orçamentos** com tabela gerencial, download de PDF da proposta e compartilhamento direto via WhatsApp.
   - Aba **Ordens de Serviço (O.S.)** responsiva em `1366x768` e `1920x1080`, com expansão de esquadrias físicas em milímetros (`📐 L x A mm`), download da **Ficha Técnica A4** (`GET /api/v1/orders/{id}/production-sheet/pdf`) e emissão de **Etiquetas Térmicas 100×60 mm**.
   - Tratamento de empty states, resiliência em falha HTTP 500 e contraste semântico em Modo Escuro.

3. **Ajustes Residuais do Painel Kanban (`#524` & `#525`):**
   - Remoção de item duplicado na Sidebar (`PR #544`) e habilitação de scroll vertical fluido nas colunas do Kanban (`PR #540`).

---

## 2. 📋 Matriz BDD Canônica de Cenários E2E (End-to-End)

### 2.1 Cenários E2E Visuais e Isolamento Real — Venda Avulsa (`us46_venda_avulsa_visual.cy.ts`)

| # | Cenário E2E | Arquivo `.cy.ts` | Estratégia & Massa | Dado | Quando | Então | Status |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| 1 | **Carregamento Inicial da Tela de Venda Avulsa e Layout Limpo** | `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` | E2E Full-Stack Real + Cleanup PostgreSQL | Usuário acessa `/vendas/avulsa/nova` | A página e seletores carregam com "Cliente Balcão" padrão | Abas de categoria, autocomplete de catálogo e tabela vazia são exibidos sem poluição visual | 🟢 Aprovado |
| 2 | **Adição de Perfil de Alumínio (1 metro linear) com Cálculo Transparente** | `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` | E2E Full-Stack Real (`PROFILE` + `POST /calculate-item`) | Aba Alumínio ativa com perfil de R$ 80,00/m selecionado | Operador informa `1000` mm (1 metro) e insere o item | Exibe `1,0000 m × R$ 80,00 = R$ 80,00` sem sobretaxa surpresa no checkout | 🟢 Aprovado |
| 3 | **Adição de Vidro Pequeno com Aplicação Obrigatória de Piso Mínimo (0,25 m²)** | `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` | E2E Full-Stack Real (`GLASS`) | Vidro selecionado na aba Vidros | Operador informa `300` mm × `400` mm ($0,12\text{ m}^2$ nominal) | Sistema aplica tarifa mínima compulsória de $0,25\text{ m}^2$ com alerta `[data-testid="warning-minimum-area"]` | 🟢 Aprovado |
| 4 | **Venda Completa Multimaterial, Salvamento no Banco e Modais de Exportação** | `frontend/cypress/e2e/part-sales/us46_venda_avulsa_visual.cy.ts` | E2E Full-Stack Real (`POST /api/v1/part-sales` + `DELETE cleanup`) | Carrinho multimaterial com Perfil, Vidro, Película e Ferragem | Operador salva a venda e aciona PDF e Etiquetas | Venda `VP-YYYY-NNNN` é persistida no PostgreSQL, modais abrem corretamente e o hook `after()` limpa a massa | 🟢 Aprovado |

---

### 2.2 Cenários E2E de Regras de Domínio e Borda — Venda Avulsa (`us46_venda_avulsa_partes.cy.ts`)

| # | Código | Cenário BDD / TEA | Dado | Quando | Então | Status |
|:---:|:---:|---|---|---|---|:---:|
| 1 | **TC-46-HP01** | Cotação de ferragem unitária e bloqueio de inputs L/A | Operador seleciona aba Ferragens em `/vendas/avulsa/nova` | Seleciona uma ferragem do catálogo e informa quantidade inteira | Inputs de largura e altura permanecem ocultos; badge unitário e cálculo imediato são exibidos | 🟢 Aprovado |
| 2 | **TC-46-HP02** | Cotação de perfil de alumínio por metro linear | Operador na aba Alumínio | Seleciona perfil e informa comprimento em mm ($\le 6000\text{ mm}$) | Comprimento é convertido para metros com 4 casas e multiplicado pelo preço/m | 🟢 Aprovado |
| 3 | **TC-46-HP03** | Venda de vidro sob medida faturado pela área real ($> 0,25\text{ m}^2$) | Operador na aba Vidros | Informa dimensões acima do piso mínimo (ex: $1000 \times 1200\text{ mm}$) | Faturamento utiliza a área real ($1,20\text{ m}^2$) sem alerta de piso mínimo | 🟢 Aprovado |
| 4 | **TC-46-HP05** | Abertura do modal de PDF a partir da lista após criação | Venda recém-criada em `/vendas/avulsa/nova` | Operador navega para `/vendas/avulsa` e aciona impressão PDF | Modal `[data-testid="modal-pdf-part-sale"]` renderiza espelho completo da venda | 🟢 Aprovado |
| 5 | **TC-46-SP01 / SP02** | Bloqueio de submissão com quantidades e dimensões zeradas | Item em preenchimento com valor `0` ou inválido | Operador tenta inserir item sem dimensão/quantidade válida | Validação inline impede inclusão na tabela de itens | 🟢 Aprovado |
| 6 | **TC-46-SP03** | Alerta impeditivo quando largura da película excede a bobina | Aba Película selecionada com bobina configurada | Informa largura superior ao limite máximo da bobina | Sistema exibe `[data-testid="warning-film-oversized"]` e bloqueia cálculo inválido | 🟢 Aprovado |
| 7 | **TC-46-EC01** | Aplicação obrigatória do piso mínimo de vidro ($0,25\text{ m}^2$) | Aba Vidros com dimensões $200 \times 300\text{ mm}$ ($0,06\text{ m}^2$) | Sistema calcula prévia e adiciona item | Área cobrada é elevada para $0,2500\text{ m}^2$ mantendo registro da medida informada | 🟢 Aprovado |
| 8 | **TC-46-EC02** | Imutabilidade e blindagem de preços da cotação salva (`RN-03`) | Venda salva no banco com preço snapshot | Consulta detalhes ou recarrega a venda salva | Valores unitários e totais permanecem congelados independentemente de alterações futuras no catálogo | 🟢 Aprovado |

---

### 2.3 Cenários E2E de Listagem e Modais — Vendas Avulsas (`us46_lista_vendas_avulsas.cy.ts`)

| # | Cenário E2E | Rota | Asserções Principais | Status |
|:---:|:---|:---|:---|:---:|
| 1 | **Renderização da listagem e validação de seeds** | `/vendas/avulsa` | Cabeçalho `Vendas Avulsas de Partes`, colunas da tabela, contador total e botão `+ Nova Venda` | 🟢 Aprovado |
| 2 | **Controles de paginação (10 / 20 por página e navegação)** | `/vendas/avulsa` | Alternância de `select-page-size` e botões `btn-next-page` / `btn-prev-page` atualizando intervalo | 🟢 Aprovado |
| 3 | **Filtro por status comercial** | `/vendas/avulsa` | Filtro `APPROVED` ("Concluída"), `DRAFT` ("Rascunho / Orçamento") e reset ("") | 🟢 Aprovado |
| 4 | **Busca textual por código ou cliente com debounce** | `/vendas/avulsa` | Digitação de `VP-2026-0002` filtra linha após debounce de 500 ms | 🟢 Aprovado |
| 5 | **Modais de ação rápida (Detalhes, PDF e Etiquetas Elgin L42)** | `/vendas/avulsa` | Abertura e fechamento determinístico dos modais `[data-testid="modal-details-part-sale"]`, `modal-pdf-part-sale` e `modal-thermal-labels` | 🟢 Aprovado |
| 6 | **Fluxo E2E completo com retorno e highlight na lista** | `/vendas/avulsa` → `/nova` | Criação de nova venda, retorno à listagem com destaque da venda recém-criada e limpeza em cascata | 🟢 Aprovado |

---

### 2.4 Cenários E2E e Integração — Central 360° do Cliente (`us47_hub_360_cliente.cy.ts`)

| # | Código | Cenário BDD / TEA | Dado | Quando | Então | Status |
|:---:|:---:|---|---|---|---|:---:|
| 1 | **TC-47-HP01** | Busca dinâmica, seleção na sidebar e Hero Card com 3 KPIs | Operador na rota `/clientes?id={id}` | Carrega `GET /api/v1/clientes/{id}/dashboard` | Hero Card exibe nome, badge PF/PJ, localização, telefone/CPF e 3 KPIs consolidados | 🟢 Aprovado (3801ms) |
| 2 | **TC-47-HP02** | Gestão de propostas na aba Orçamentos (PDF e WhatsApp) | Cliente selecionado na aba Orçamentos | Operador inspeciona propostas | Tabela exibe códigos, datas, status, valores e ações de PDF e WhatsApp codificado | 🟢 Aprovado (1164ms) |
| 3 | **TC-47-HP03** | Tabela de O.S. sem compressão visual (`1366x768` e `1920x1080`) | Aba `Ordens de Serviço (O.S.)` aberta | Alterna entre viewports desktop | Colunas (`Código O.S.`, `Data`, `Situação`, `Valor`, `Esquadrias`, `Ações`) preservam legibilidade | 🟢 Aprovado (1285ms) |
| 4 | **TC-47-HP04** | Detalhamento de esquadrias físicas em milímetros (`📐 L x A mm`) | Linha de O.S. exibida na tabela | Operador clica na O.S. | Drawer detalha esquadrias, quantidades, medidas nominais em mm, acabamento e vidro | 🟢 Aprovado (1299ms) |
| 5 | **TC-47-HP05** | Download da Ficha Técnica A4 de corte | O.S. com esquadrias vinculadas | Clica em "Ficha Técnica" | Dispara `GET /api/v1/orders/{id}/production-sheet/pdf` e exibe toast de sucesso | 🟢 Aprovado (1169ms) |
| 6 | **TC-47-HP06** | Modal de Etiquetas Térmicas (100×60 mm) Elgin L42 | O.S. com esquadrias vinculadas | Clica em "Etiquetas" | Abre `[data-testid="thermal-label-modal"]` com paginação por folha e botão imprimir | 🟢 Aprovado (1207ms) |
| 7 | **TC-47-HP07** | Redirecionamento "+ Novo Orçamento" pré-preenchido | Hero Card exibido | Clica em `+ Novo Orçamento` | Navega para `/orcamentos/novo?clienteId={id}` com cliente selecionado | 🟢 Aprovado (1040ms) |
| 8 | **TC-47-SP01** | Empty States elegantes para clientes sem movimentação | Cliente novo com KPIs zerados | Alterna entre Orçamentos e O.S. | Exibe estados vazios orientativos sem erros ou tabelas quebradas | 🟢 Aprovado (1107ms) |
| 9 | **TC-47-SP02** | Resiliência em falha de API (erro 500/rede) | Endpoint dashboard retorna HTTP 500 | Operador seleciona cliente | Sidebar mestre permanece operante e área de detalhe exibe fallback amigável | 🟢 Aprovado (7912ms) |
| 10 | **TC-47-SP03** | Busca sem resultados na barra lateral | Operador digita termo inexistente | Filtro retorna lista vazia | Sidebar exibe mensagem "Nenhum cliente encontrado." | 🟢 Aprovado (1744ms) |
| 11 | **TC-47-EC01** | O.S. volumosa com múltiplas esquadrias | O.S. com 9+ itens de esquadria | Expande detalhamento | Grid e rolagem adaptam-se sem overflow horizontal nem quebra do layout mestre | 🟢 Aprovado (1212ms) |
| 12 | **TC-47-EC02** | Contraste e tokens semânticos em Modo Escuro (`dark:`) | Tema escuro ativo no Hub 360° | Operador navega entre abas | Hero Card, KPIs e tabelas mantêm contraste M3 legível | 🟢 Aprovado (946ms) |
| 13 | **INT-BACK-01** | Integração Backend Hub 360° (`ClientHubControllerIntegrationTest`) | Contexto Spring + JPA | Executa `/dashboard`, `/budgets` e `/orders` | Valida agregações excluindo canceladas, paginação, medidas em mm e HTTP 200/404 | 🟢 Aprovado |

---

## 3. 🧪 Suíte de Testes Unitários e Integração Homologados

Na baseline **`release/v0.8.0`**, o repositório contabilizou **89 classes de teste Java no backend**, **122 suítes Vitest no frontend** (**1.025 testes passando**) e **39 specs E2E Cypress** totais:

| Camada | Escopo Focado da Sprint 08 | Ferramentas | Testes | Aprovados | Status |
|---|---|---|:---:|:---:|:---:|
| **Backend Unitário & Integração (Sprint 08)** | `MaterialControllerTest`, `MaterialRepositoryTest`, `PartSaleControllerTest`, `PartSaleServiceImplTest`, `ClientHubControllerIntegrationTest`, cálculos `partsale.calculator` e `orders` | JUnit 5, Mockito, MockMvc, H2 / PostgreSQL | 40 (escopo focado S08) | 40 | 🟢 100% |
| **Frontend Componentes & Hooks (Acumulado)** | `MaterialAutocomplete`, `AluminumItemFields`, `GlassItemFields`, `FilmItemFields`, `PartSaleForm`, `CustomerHubPage`, `CustomerHeroCard`, `CustomerBudgetsTab`, `CustomerOrdersTab` | Vitest, React Testing Library, happy-dom | 1.025 (122 suítes) | 1.025 | 🟢 100% |
| **E2E Cypress PWA (Sprint 08)** | `us46_venda_avulsa_visual.cy.ts` (4), `us46_venda_avulsa_partes.cy.ts` (8), `us46_lista_vendas_avulsas.cy.ts` (6), `us47_hub_360_cliente.cy.ts` (12) | Cypress 13, TypeScript | 30 blocos (4 specs S08) | 30 | 🟢 100% |

---

## 4. 🏁 Parecer de Homologação dos Critérios de Aceitação

* [x] **100% dos Critérios de Aceitação das US-46, US-46.5, US-47 e US-47.5 validados e aprovados.**
* [x] **Tríade documental centralizada estabelecida:** [`TEA`](./TEA-Testes_de_Aceitacao_Sprint08.md), [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint08.md) e [`RET`](./RET-Relatorio_Execucao_Testes_Sprint08.md).
* [x] **Defeitos detectados in-sprint (`BUG-041` a `BUG-045`) registrados no `RBD` e blindados por regressão.**
* [x] **Ajustes de usabilidade do Kanban (`#524` e `#525`) concluídos e integrados na release `v0.8.0`.**

---

*Documento homologado pela Equipe de Engenharia e QA AlumiGest — Baseline B-ALG-v0.8.0-S08-01 — 08/11/2026*
