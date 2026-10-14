# Especificação Funcional: US-22 — Consultar Posição de Estoque e Kardex de Movimentações

**Identificador**: `US-22`  
**Issue GitHub**: [#147](https://github.com/ADS-IFPB-SR/alumigest/issues/147)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como gestor financeiro, almoxarife ou responsável por compras da Alumiportas, desejo consultar a posição consolidada de estoque de matérias-primas (saldo físico, reservado e disponível) com alertas de ponto de pedido, e inspecionar a trilha cronológica detalhada (Kardex) de todas as movimentações de cada material, para apoiar decisões de compra, auditoria de perdas e inventários contábeis periódicos.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Listagem Paginada de Saldos com Badges de Reposição**
  - **Dado que** o usuário acessa o menu lateral "Estoque" (rota `/estoque`),
  - **Quando** a página `StockPage` for carregada,
  - **Então** o sistema exibe tabela paginada com código, descrição do material, unidade de medida, saldo físico (`physicalQuantity`), saldo reservado (`reservedQuantity`) e saldo disponível (`availableQuantity`),
  - **E** insumos cujo saldo disponível for menor ou igual ao estoque mínimo (`minStock`) exibem badge de alerta em tom âmbar/vermelho ("Ponto de Pedido").

- [ ] **Cenário 2: Consulta à Trilha Cronológica (Kardex) do Material**
  - **Dado que** o usuário seleciona um item da tabela de estoque,
  - **Quando** aciona a opção "Ver Kardex" / histórico,
  - **Então** a gaveta lateral (`KardexDrawer`) é aberta exibindo todas as movimentações ordenadas cronologicamente da mais recente para a mais antiga,
  - **E** cada linha exibe timestamp formatado, tipo de movimentação (`ENTRADA_COMPRA`, `RESERVA_PRODUCAO`, `BAIXA_PRODUCAO`, `CANCELAMENTO_RESERVA`), quantidade movimentada, saldo resultante e código da O.S. ou documento vinculado.

- [ ] **Cenário 3: Registro de Entrada Manual de Compras via Modal**
  - **Dado que** novos perfis ou ferragens chegaram à oficina com nota fiscal,
  - **Quando** o operador clica em "Nova Entrada / Ajuste" e submete o formulário `StockMovementModal`,
  - **Então** o sistema envia requisição `POST /api/v1/stock/movements`,
  - **E** a tabela de saldos e o Kardex são atualizados instantaneamente via revalidação do TanStack Query com notificação Toast.

- [ ] **Cenário 4: Filtros Rápidos por Grupo de Material e Alerta de Ruptura**
  - **Dado que** o estoque possui centenas de itens cadastrados,
  - **Quando** o usuário filtra por grupo (ex: `Perfis de Alumínio`, `Vidros`, `Ferragens`) ou marca o seletor "Apenas Abaixo do Mínimo",
  - **Então** a tabela é filtrada reativamente sem atraso perceptível.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Imutabilidade do Kardex):** Registros em `tb_stock_movements` são estritamente *append-only* (somente inclusão); edições ou deleções físicas são terminantemente proibidas para garantir conformidade de auditoria.
- **RN-02 (Rastreabilidade de Documento de Origem):** Toda movimentação automática deve guardar a referência da Ordem de Serviço vinculada (`order_id` / `order_code`).
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e colunas em inglês técnico (`physicalQuantity`, `reservedQuantity`, `availableQuantity`, `minStock`).

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/stock` (suporte a paginação, busca textual e filtro `belowMinimum`)
  - `GET /api/v1/stock/{materialId}/kardex` (histórico paginado de movimentações)
- **DTOs:** `StockItemResponseDTO`, `KardexMovementResponseDTO`, `StockMovementRequestDTO`
- **Service:** `StockQueryService.java` com métodos `@Transactional(readOnly = true)`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `StockPage.tsx` na rota `/estoque`
  - `StockTable.tsx` com formatação monetária e de unidades ($m$, $m^2$, un)
  - `KardexDrawer.tsx` com timeline interativa de movimentações
  - `StockMovementModal.tsx` com validação de formulário via `react-hook-form` e `zod`
- **Hook:** `useStock()` e `useKardex(materialId)`

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários de `StockQueryServiceTest` validando cálculo paginado e ordenação cronológica do Kardex.
- [ ] Teste de integração REST validando filtros, headers e retorno de saldos.
- [ ] Componente visual `StockPage.tsx` e `KardexDrawer.tsx` testados com feedback reativo de atualização.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-22.1](issues/US-22.1-criar-interfaces-typescript-e-schemas-zod-em-/issue.md) | Criar interfaces TypeScript e schemas Zod em `frontend/src/features/stock/types/stock.ts` | 🔲 No Backlog |
| [US-22.2](issues/US-22.2-criar-servico-de-api-axios-stockapi-ts-e-hook/issue.md) | Criar serviço de API Axios (`stockApi.ts`) e hooks React Query (`useStock.ts`) | 🔲 No Backlog |
| [US-22.3](issues/US-22.3-criar-componente-stocktable-com-badges-de-ale/issue.md) | Criar componente `StockTable` com badges de alerta amarelo em `frontend/src/features/stock/components/StockTable.tsx` | 🔲 No Backlog |
| [US-22.4](issues/US-22.4-criar-modal-stockmovementmodal-para-entrada-d/issue.md) | Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx` | 🔲 No Backlog |
| [US-22.5](issues/US-22.5-criar-componente-kardexdrawer-com-historico-d/issue.md) | Criar componente `KardexDrawer` com histórico de movimentações em `frontend/src/features/stock/components/KardexDrawer.tsx` | 🔲 No Backlog |
| [US-22.6](issues/US-22.6-criar-pagina-stockpage-e-registrar-rota-estoq/issue.md) | Criar página `StockPage` e registrar rota `/estoque` no React Router | 🔲 No Backlog |

---

**Branch:** `feat/us-22-posicao-estoque-kardex`
