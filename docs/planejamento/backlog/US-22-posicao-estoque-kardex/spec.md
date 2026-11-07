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

- [ ] **Cenário 1: Listagem Paginada de Saldos com Badges de Reposição e Necessidade de Compra**
  - **Dado que** o usuário acessa o menu lateral "Estoque" (rota `/estoque`),
  - **Quando** a página `StockPage` for carregada,
  - **Então** o sistema exibe tabela paginada com código, descrição do material, unidade de medida, saldo físico (`physicalQuantity`), saldo reservado (`reservedQuantity`) e saldo disponível (`availableQuantity`),
  - **E** insumos cujo saldo disponível for menor ou igual ao estoque mínimo (`minStock`) exibem badge de alerta em tom âmbar ("Ponto de Pedido"),
  - **E** insumos com saldo disponível negativo ($\text{availableQuantity} < 0$) exibem badge em tom vermelho `🔴 Necessidade de Compra (Falta X un/m)`, indicando com exatidão que há O.S. contratadas aguardando a compra daquele material.

- [ ] **Cenário 2: Consulta à Trilha Cronológica (Kardex) do Material**
  - **Dado que** o usuário seleciona um item da tabela de estoque,
  - **Quando** aciona a opção "Ver Kardex" / histórico,
  - **Então** a gaveta lateral (`KardexDrawer`) é aberta exibindo todas as movimentações ordenadas cronologicamente da mais recente para a mais antiga,
  - **E** cada linha exibe timestamp formatado, tipo de movimentação (`PURCHASE_ENTRY`, `PRODUCTION_RESERVATION`, `PRODUCTION_OUTFLOW`, `RESERVATION_CANCELLATION`), quantidade movimentada, saldo resultante e código da O.S. ou documento vinculado.

- [ ] **Cenário 3: Registro de Entrada Manual de Compras via Modal (Documento Livre e Preço de Compra)**
  - **Dado que** novos perfis, vidros ou ferragens chegaram à oficina com nota fiscal, recibo ou pedido da distribuidora,
  - **Quando** o operador clica em "Registrar Entrada" e submete o formulário `StockMovementModal` informando o documento (sem validação fiscal SEFAZ) e o preço de compra unitário pago ao fornecedor (`unitCost`),
  - **Então** o sistema envia requisição `POST /api/v1/stock/movements`,
  - **E** a tabela de saldos e o Kardex são atualizados instantaneamente via revalidação do TanStack Query com notificação Toast,
  - **E** ao abastecer materiais que estavam em falta, as O.S. pendentes são atualizadas para `🟢 Insumos Disponíveis`.

- [ ] **Cenário 4: Filtros Rápidos por Grupo de Material e Alerta de Ruptura**
  - **Dado que** o estoque possui centenas de itens cadastrados,
  - **Quando** o usuário filtra por grupo (ex: `Perfis de Alumínio`, `Vidros`, `Ferragens`) ou marca o seletor "Apenas com Necessidade de Compra",
  - **Então** a tabela é filtrada reativamente sem atraso perceptível.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Imutabilidade do Kardex):** Registros em `tb_stock_movements` são estritamente *append-only* (somente inclusão); edições ou deleções físicas são terminantemente proibidas para garantir conformidade de auditoria.
- **RN-02 (Rastreabilidade de Documento de Origem):** Toda movimentação automática deve guardar a referência da Ordem de Serviço vinculada (`order_id` / `order_code`) ou Venda Avulsa (`part_sale_id`).
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e colunas em inglês técnico (`physicalQuantity`, `reservedQuantity`, `availableQuantity`, `minStock`).
- **RN-04 (Interpretação de Saldo Disponível Negativo como Demanda de Compra):**
  - *Premissa Central:* A reserva de estoque não atua como barreira comercial, mas como termômetro de compras e controle de prioridade fabril.
  - Em conformidade com o modelo sob encomenda da Alumiportas, o saldo disponível negativo ($\text{availableQuantity} < 0$) não representa inconsistência ou erro de sistema; representa o volume líquido de matéria-prima que o setor de compras precisa encomendar aos fornecedores para atender os pedidos fechados.
- **RN-05 (Flexibilidade de Documento na Entrada de Materiais - Sem Validação SEFAZ):**
  - O registro de entrada de materiais aceita qualquer identificador em texto livre no campo `documentNumber` (número do pedido na loja distribuidora, recibo, romaneio ou número de NF em papel), sem exigir chave de acesso de 44 dígitos nem integração/validação fiscal na SEFAZ. O campo pode ser opcional em ajustes internos.
- **RN-06 (Custo Unitário como Custo de Aquisição/Compra):**
  - O campo `unitCost` (custo unitário) em movimentações de entrada refere-se estritamente ao valor de aquisição pago ao fornecedor por unidade de medida (barra, m², un), e NÃO ao preço de venda cobrado do cliente final. Este valor serve de base patrimonial para o Preço Médio Ponderado (PMP) e futura apuração do lucro real da obra (módulo financeiro US-30).

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
