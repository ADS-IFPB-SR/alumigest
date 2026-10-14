# Especificação Funcional: US-19 — Consolidar Lista Linear e Plana de Corte da Ordem de Serviço (O.S.)

**Identificador**: `US-19`  
**Issue GitHub**: [#144](https://github.com/ADS-IFPB-SR/alumigest/issues/144)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como cortador e encarregado da oficina de serralheria e vidraçaria da Alumiportas, desejo consultar e imprimir a lista consolidada de corte (perfis lineares em barras e chapas planas de vidro) de uma Ordem de Serviço (`OS-YYYY-NNNN`) com medidas nominais em mm e quantidades agregadas por tipologia, para planejar os cortes de forma otimizada na bancada e reduzir perdas de matéria-prima.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Agregação Consolidada de Perfis Lineares de Alumínio**
  - **Dado que** o operador acessa os detalhes de uma Ordem de Serviço ativa com múltiplos itens e tipologias na tela `OrderDetailPage`,
  - **Quando** aciona a opção "Lista de Corte da O.S." (`CuttingListModal`),
  - **Então** o sistema agrupa todos os perfis de alumínio idênticos (mesmo código de perfil `profileCode`, acabamento `aluminumColor` e comprimento nominal `lengthMm`),
  - **E** exibe a quantidade total consolidada de barras a cortar, ângulo de corte (ex: `45° / 45°` ou `90° / 90°`) e identificação dos itens aos quais pertencem.

- [ ] **Cenário 2: Agregação Consolidada de Chapas Planas de Vidro**
  - **Dado que** a Ordem de Serviço possui esquadrias com vidros especificados,
  - **Quando** a aba/seção de vidraçaria da lista de corte for renderizada,
  - **Então** o sistema exibe a relação consolidada de peças planas agrupadas por especificação (`glassType`, espessura `thicknessMm`, largura `widthMm` e altura `heightMm`),
  - **E** exibe o total de peças físicas e a área líquida total em metros quadrados ($m^2$).

- [ ] **Cenário 3: Impressão e Download do Romaneio de Corte de Oficina**
  - **Dado que** o modal da lista de corte está aberto,
  - **Quando** o operador clica no botão "Imprimir Romaneio de Corte",
  - **Então** o sistema aciona a impressão direta via browser (`@media print`) formatada para papel A4 horizontal/vertical limpo com cabeçalho institucional, código `OS-YYYY-NNNN`, cliente, data de entrega e caixas de checagem manuais para o operador de serra.

- [ ] **Cenário 4: Tratamento para Ordem sem Itens de Fabricação**
  - **Dado que** uma O.S. não possui itens de corte válidos cadastrados,
  - **Quando** o endpoint `GET /api/v1/orders/{orderId}/cutting-list` for consumido,
  - **Então** o backend responde com status HTTP `422 Unprocessable Entity` com mensagem de negócio ("A ordem de serviço não possui itens com plano de corte disponível").

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Fidelidade ao Snapshot Imutável):** Os cálculos de cortes lineares e planos devem ser derivados exclusivamente das tabelas congeladas `tb_orders`, `tb_order_items` e dos esquemas paramétricos (`template_config`), sem recalcular a partir de tabelas mutáveis de catálogo.
- **RN-02 (Precisão Físico-Métrica):** As dimensões lineares devem ser exibidas em milímetros inteiros (`INTEGER`) e áreas em $m^2$ com escala de 4 casas decimais e arredondamento `CEILING`.
- **RN-03 (Diretriz de Idioma em Variáveis):** Atributos Java, DTOs e colunas de banco devem usar inglês técnico (`linearProfiles`, `glassSheets`, `profileCode`, `cutAngle`, etc.), com tradução para pt-BR exclusiva na UI.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoint:** `GET /api/v1/orders/{orderId}/cutting-list`
- **DTOs:** `CuttingListResponseDTO` (`orderId`, `orderCode`, `customerName`, `linearProfiles`, `glassSheets`) e `CuttingProfileItemDTO`
- **Service:** `CuttingListService.generateOrderCuttingList(UUID orderId)` com `@Transactional(readOnly = true)`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Componentes:** `CuttingListModal.tsx` com visualização em abas ("Perfis de Alumínio" e "Chapas de Vidro")
- **Hook:** `useOrderCuttingList(orderId)` integrado ao `ordersApi.getCuttingList`
- **Ações:** Botão "Lista de Corte" adicionado em `OrderDetailActions.tsx` e no modal do Kanban

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `CuttingListServiceTest` validando agregação de perfis de múltiplos itens sem duplicidade de linhas.
- [ ] Teste de integração REST validando retorno HTTP 200, formato JSON e headers.
- [ ] Componente visual `CuttingListModal.tsx` testado com filtros rápidos e impressão A4 funcional.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (8 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-19.1](issues/US-19.1-criar-record-cuttingitemdto-orderitemid-numer/issue.md) | Criar DTOs `CuttingProfileItemDTO` e `CuttingGlassItemDTO` com propriedades em inglês técnico | 🔲 No Backlog |
| [US-19.2](issues/US-19.2-criar-record-cuttinglistresponse-orderid-orde/issue.md) | Criar record `CuttingListResponseDTO` (`orderId`, `orderCode`, `customerName`, `linearProfiles`, `glassSheets`) | 🔲 No Backlog |
| [US-19.3](issues/US-19.3-criar-record-assemblysheetresponse-em-backend/issue.md) | Criar DTOs de agregação de medidas de corte | 🔲 No Backlog |
| [US-19.4](issues/US-19.4-implementar-servico-cuttinglistservice-gerarr/issue.md) | Implementar serviço `CuttingListService.generateOrderCuttingList(UUID orderId)` agregando perfis e vidros da O.S. | 🔲 No Backlog |
| [US-19.5](issues/US-19.5-criar-endpoint-get-api-production-orders-orde/issue.md) | Criar endpoint `GET /api/v1/orders/{orderId}/cutting-list` no controller | 🔲 No Backlog |
| [US-19.6](issues/US-19.6-criar-testes-unitarios-do-cuttinglistservice-/issue.md) | Criar testes unitários do `CuttingListServiceTest` com asserções de agrupamento e arredondamento | 🔲 No Backlog |
| [US-19.7](issues/US-19.7-criar-modal-cuttinglistmodal-no-frontend-exib/issue.md) | Criar modal `CuttingListModal` no frontend exibindo as abas de perfis e chapas de vidro | 🔲 No Backlog |
| [US-19.8](issues/US-19.8-adicionar-botao-lista-de-corte-na-tela-de-det/issue.md) | Adicionar botão "Lista de Corte" na tela de detalhes da O.S. (`OrderDetailPage.tsx`) | 🔲 No Backlog |

---

**Branch:** `feat/us-19-lista-corte-pedido`
