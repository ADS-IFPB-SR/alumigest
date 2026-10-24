# Especificação Funcional: US-18 — Acompanhar Produção via Painel Kanban de Ordens de Serviço

**Identificador**: `US-18`  
**Issue GitHub**: [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)  
**Status**: 🟢 Concluída (Sprint 07)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como encarregado de fábrica, gerente de produção ou operador da Alumiportas, desejo acompanhar e gerenciar o avanço físico das Ordens de Serviço (O.S.) através de um painel Kanban visual organizado nas etapas fabris (`WAITING_PRODUCTION`, `IN_PRODUCTION` e `COMPLETED`), com suporte a movimentação via Drag-and-Drop e botões contextuais, indicadores de SLA de prazos de entrega, checklist de etapas construtivas por esquadria e filtros dinâmicos, para monitorar gargalos produtivos em tempo real e assegurar o cumprimento dos prazos acordados com os clientes.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Visualização do Quadro Kanban em 3 Colunas e KPIs de Fábrica**
  - **Dado que** o operador acessa o item "Kanban de Produção" no menu lateral (rota `/producao`),
  - **Quando** a página `ProductionKanbanPage` for carregada,
  - **Então** o sistema renderiza 3 colunas fabris distintas com tradução na UI:
    1. **Aguardando Produção** (`WAITING_PRODUCTION`)
    2. **Em Produção** (`IN_PRODUCTION`)
    3. **Concluído** (`COMPLETED`)
  - **E** cada coluna exibe um badge com a contagem atualizada de ordens de serviço,
  - **E** a barra superior de KPIs exibe métricas consolidadas: "OSs em Produção", "Área Total ($m^2$)", "OSs Urgentes" e "Entrega no Prazo (%)".

- [x] **Cenário 2: Apresentação Rica dos Cards de O.S. e Checklist de Etapas Fabris**
  - **Dado que** as Ordens de Serviço ativas são listadas nas respectivas colunas,
  - **Quando** o componente `OrderProductionCard` for renderizado,
  - **Então** exibe código da O.S. (`OS-YYYY-NNNN`) com link para detalhes, código do orçamento de origem (`ORC-YYYY-NNNN`), nome do cliente (`customerName`) e descrição das esquadrias contratadas,
  - **E** exibe tags informativas de linha de alumínio (ex: `Linha Gold`), acabamento de cor e status de estoque de insumos (`🟢 Insumos OK` ou `🔴 Falta Insumo`),
  - **E** exibe barra de progresso fabril com checklist interativo de etapas:
    1. Corte de Alumínio;
    2. Usinagem / Estamparia;
    3. Montagem & Acessórios;
    4. Colocação de Vidro;
    5. Embalagem & Expedição;
  - **E** exibe a data de entrega prometida com badge visual de urgência de prazo (SLA):
    - **Verde**: Prazo confortável ($> 3$ dias);
    - **Amarelo**: Prazo em atenção ($0$ a $3$ dias);
    - **Vermelho**: Prazo urgente ou vencido ($< 0$ dias).

- [x] **Cenário 3: Movimentação de Status via Drag & Drop ou Botões Contextuais**
  - **Dado que** uma O.S. está posicionada em uma coluna fabril,
  - **Quando** o operador arrasta o card para a próxima coluna ou aciona a ação contextual de transição ("Iniciar Produção" / "Concluir Produção"),
  - **Então** a interface exibe feedback visual (`dragging` e `drag-over`) e dispara requisição `PATCH /api/v1/orders/{id}/production-status`,
  - **E** a O.S. é movida com consistência reativa sem recarregar a tela, exibindo Toast notification de sucesso.

- [x] **Cenário 4: Preenchimento Automático da Data de Conclusão Real**
  - **Dado que** uma O.S. é movimentada para o status `COMPLETED`,
  - **Quando** a transição for confirmada no backend,
  - **Então** o campo `completion_date` da O.S. é preenchido atomicamente com a data atual (`LocalDate.now()`),
  - **E** todas as etapas construtivas do checklist de fábrica são automaticamente marcadas como concluídas ($100\%$).

- [x] **Cenário 5: Bloqueio de Transições Ilegais e Proteção de Pedidos Cancelados**
  - **Dado que** uma O.S. possui status `CANCELLED` ou o operador tenta realizar um salto ilegal de etapas (ex: pular de `WAITING_PRODUCTION` diretamente para `COMPLETED` sem passar por `IN_PRODUCTION`),
  - **Quando** o backend processar a alteração,
  - **Então** a operação é bloqueada com status HTTP `422 Unprocessable Entity` ("Transição de status fabril inválida"),
  - **E** o card retorna à sua coluna de origem na interface sem efeitos colaterais.

- [x] **Cenário 6: Filtros Rápidos de Busca e Seleção Operacional**
  - **Dado que** o quadro possui dezenas de ordens de serviço simultâneas,
  - **Quando** o usuário digita no campo de busca (`search` por código, cliente ou item) ou aplica os filtros de cabeçalho (Linha de Alumínio, Status de Estoque, Prioridade),
  - **Então** os cards das colunas são filtrados de forma reativa e instantânea, mantendo os contadores recalculados.

- [x] **Cenário 7: Abertura Rápida da Ficha Técnica / Cortes (Modal PCP)**
  - **Dado que** o operador necessita conferir o plano de corte de uma O.S. no Kanban,
  - **Quando** clica no ícone de visualização ("Ver Ficha Técnica / Cortes") do card,
  - **Então** o modal `OrderTechnicalSheetModal` é aberto exibindo cliente, acabamento, especificações do vidro e plano de corte detalhado dos perfis.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Fluxo Linear Estrito de Produção):** A máquina de estados fabril segue obrigatoriamente a sequência:
  $$\text{WAITING\_PRODUCTION} \longrightarrow \text{IN\_PRODUCTION} \longrightarrow \text{COMPLETED}$$
  Não são permitidos saltos diretos entre `WAITING_PRODUCTION` e `COMPLETED`.
- **RN-02 (Registro Determinístico de Conclusão):** Ao atingir o status `COMPLETED`, o campo `tb_orders.completion_date` deve ser obrigatoriamente preenchido com a data corrente.
- **RN-03 (Isolamento de Ordens Canceladas):** Ordens de serviço com status `CANCELLED` não devem ser exibidas nas colunas ativas do painel Kanban nem ter seu status alterado via endpoint fabril.
- **RN-04 (Concorrência e Idempotência):** Transições simultâneas da mesma O.S. devem ser tratadas com verificação atômica de status, prevenindo inconsistências visuais entre múltiplos operadores.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoint:** `PATCH /api/v1/orders/{id}/production-status`
- **DTOs:** `OrderProductionStatusRequestDTO` (`status: OrderStatus`) e `OrderResponseDTO`
- **Service:** `OrderProductionService.updateProductionStatus(UUID orderId, OrderStatus status)`
- **Validação:** Verificação estrita da máquina de estados e persistência de `completionDate`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Página:** `ProductionKanbanPage.tsx` na rota `/producao`
- **Componentes:**
  - `ProductionKanbanBoard.tsx` (quadro com as 3 colunas e handlers de Drag & Drop)
  - `OrderProductionCard.tsx` (card com SLA de prazo, tags, checklist de etapas e botões)
  - `OrderTechnicalSheetModal.tsx` (modal da ficha técnica e cortes de perfis)
  - `KanbanFilterBar.tsx` (campo de busca e seletores de linha, estoque e prioridade)
- **Hook:** `useProductionKanban()` gerenciando query e mutações com TanStack Query
- **Navegação:** Inclusão do link "Kanban de Produção" no menu lateral (`Sidebar.tsx`)

---

## 🛡️ Definition of Done (DoD)

- [x] Testes unitários de `OrderProductionService` cobrindo transições válidas e rejeitando transições ilegais com HTTP 422.
- [x] Testes de integração REST validando `PATCH /api/v1/orders/{id}/production-status` e gravação de `completion_date`.
- [x] Componente `ProductionKanbanBoard.tsx` testado com movimentação Drag & Drop e atualização reativa de contadores.
- [x] Filtros dinâmicos (busca textual, linha, estoque e prioridade) testados e sem atraso perceptível.
- [x] Cobertura de testes $\ge 80\%$ nas novas classes e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-18.1](issues/US-18.1-implementar-endpoint-patch-api-orders-id-production-status/issue.md) | Implementar endpoint `PATCH /api/v1/orders/{id}/production-status` no backend com validação de transição e `completionDate` | 🟢 Concluída |
| [US-18.2](issues/US-18.2-criar-hook-react-query-useproductionkanban/issue.md) | Criar hook React Query `useProductionKanban` e serviços Axios de produção no frontend | 🟢 Concluída |
| [US-18.3](issues/US-18.3-criar-componente-orderproductioncard-no-frontend/issue.md) | Criar componente `OrderProductionCard` no frontend exibindo dados da O.S., cliente, SLA e checklist de etapas | 🟢 Concluída |
| [US-18.4](issues/US-18.4-criar-componente-productionkanbanboard-com-colunas-de-status/issue.md) | Criar componente `ProductionKanbanBoard` com colunas (`WAITING_PRODUCTION`, `IN_PRODUCTION`, `COMPLETED`) e Drag & Drop | 🟢 Concluída |
| [US-18.5](issues/US-18.5-criar-pagina-productionkanbanpage-com-filtros-de-busca/issue.md) | Criar página `ProductionKanbanPage` com filtros de busca, estoque e prioridade | 🟢 Concluída |
| [US-18.6](issues/US-18.6-configurar-rota-producao-e-menu-lateral-no-frontend/issue.md) | Configurar rota `/producao` no React Router e adicionar atalho "Kanban de Produção" no menu lateral | 🟢 Concluída |
| [US-18.7](issues/US-18.7-documentar-endpoints-no-openapi-swagger-e-testes-unitarios/issue.md) | Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend | 🟢 Concluída |

---

**Branch:** `feat/us-18-painel-kanban-producao-pedidos`
