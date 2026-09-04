# Feature Specification: Sprint 6 — Etiquetas de Identificação de Peças e Kanban de Produção

**Feature**: `003-producao-kanban-etiquetas`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Created**: 2026-08-27  
**Updated**: 2026-09-04  
**Status**: APPROVED (Reestruturada após Decisão de Escopo)  

---

## 1. Visão Geral & Contexto de Negócio

Após a conversão de um orçamento em Pedido de Venda (`Order`), o AlumiGest dá suporte à gestão da oficina da Alumiportas de forma direta, prática e sem burocracia excessiva.

> ⚠️ **Nota de Decisão Arquitetural (ADR - Simplificação de Escopo)**:  
> Por decisão unânime da equipe de engenharia e produto, as propostas iniciais de geração de dezenas de entidades individuais de "Ordem de Produção (OP)" por esquadria física e uso de "Scanner móvel de QR Code com câmera" foram descartadas do projeto. Identificou-se que esse modelo adicionava overhead operacional e complexidade desnecessária para a rotina da vidraçaria/serralheria.  
> **Novo modelo adotado**: A gestão de chão de fábrica é centrada no **Pedido de Venda (`Order`)** como um todo através de um **Painel Kanban de Produção** e na **identificação física imediata das peças cortadas/montadas através de etiquetas adesivas impressas diretamente a partir dos itens do pedido (`OrderItem`)**.

Esta sprint introduz:
1. **Emissão de Etiquetas Físicas de Identificação de Peças (100x50mm)**: Geração de etiquetas adesivas com dados 100% legíveis (cliente, código do pedido, modelo da esquadria, dimensões nominais L x A mm, cor do alumínio, tipo de vidro e numeração da peça no lote).
2. **Painel Kanban de Produção por Pedido de Venda**: Acompanhamento visual do fluxo de produção nas colunas oficiais de ciclo de vida do pedido (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`).

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido

> Como encarregado de produção da oficina,  
> Quero emitir etiquetas adesivas térmicas de identificação para cada esquadria de um pedido de venda aprovado,  
> Para colar nos perfis/peças cortadas, garantindo que os montadores identifiquem claramente as medidas, cliente e especificações sem confusão na oficina.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-17.1**: Criar serviço `LabelPdfService` usando OpenPDF com layout de etiqueta física (100x50mm) contendo dados do pedido, cliente, medidas nominais (L x A mm), cor do perfil, tipo de vidro e numeração da peça (ex: Peça 1 de 2) em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- **US-17.2**: Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no `OrderController` retornando o documento `application/pdf`
- **US-17.3**: Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios e paginação exata pela quantidade de peças em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- **US-17.4**: Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) disparando o download do arquivo PDF

---

### 📌 US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda

> Como encarregado de fábrica e gestor comercial,  
> Quero acompanhar o andamento dos pedidos de venda aprovados através de um painel visual Kanban,  
> Para monitorar gargalos, prazos de entrega acordados e transicionar pedidos entre as etapas de produção de forma ágil.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-18.1**: Implementar endpoint `PATCH /api/orders/{id}/production-status` no `OrderController` com validação das transições permitidas (`AGUARDANDO_PRODUCAO` → `EM_PRODUCAO` → `CONCLUIDO`) e atualização automática da `data_conclusao`
- **US-18.2**: Criar hook React Query (`useProductionKanban.ts`) e serviços de API para listar pedidos agrupados por status de produção
- **US-18.3**: Criar componente `OrderProductionCard` no frontend exibindo código do pedido, cliente, data prevista de entrega, badges de alerta de prazo e total de esquadrias
- **US-18.4**: Criar componente `ProductionKanbanBoard` com colunas (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) e movimentação ágil de cartões
- **US-18.5**: Criar página `ProductionKanbanPage` com filtros de busca por cliente, período de entrega e código do pedido em `frontend/src/pages/ProductionKanbanPage.tsx`
- **US-18.6**: Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend
- **US-18.7**: Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend

---

## 3. Requisitos Funcionais

1. **RF01 - Decomposição em Etiquetas Físicas**: Para cada `OrderItem` com `quantidade = N`, o gerador de etiquetas emite $N$ etiquetas individuais com indicação do índice (ex: `1/2`, `2/2`).
2. **RF02 - Dados da Etiqueta**: A etiqueta contém: Código do Pedido (`PED-YYYY-NNNN`), Nome do Cliente, Descrição do Produto, Medidas Nominais (`Largura x Altura mm`), Cor do Perfil, Tipo do Vidro e Sentido de Abertura.
3. **RF03 - Colunas do Kanban**: O painel Kanban reflete exatamente os status industriais do Pedido:
   - `AGUARDANDO_PRODUCAO`: Pedido aprovado aguardando início do corte/fabricação.
   - `EM_PRODUCAO`: Pedido em processo ativo de corte e montagem na oficina.
   - `CONCLUIDO`: Pedido fabricado e disponível para expedição/instalação.
4. **RF04 - Auditoria de Conclusão**: Ao mover um pedido para `CONCLUIDO`, o sistema preenche automaticamente o campo `data_conclusao = CURRENT_DATE`.
5. **RF05 - Identificação Visual de Atraso**: Pedidos com `data_previsao_entrega` anterior à data atual ou vencendo nos próximos 2 dias recebem destaque visual de prioridade no Kanban.

---

## 4. Cenários BDD / Gherkin

### Cenário 1: Emissão de etiquetas para pedido com múltiplos itens
```gherkin
Dado que existe um pedido aprovado "PED-2026-0005" contendo:
  | Item | Descrição | Quantidade | Largura | Altura | Cor |
  | 1    | Janela 2 Folhas | 2 | 1200 | 1000 | Branco |
  | 2    | Porta Pivotante | 1 | 900  | 2100 | Preto  |
Quando o encarregado clica em "Imprimir Etiquetas"
Então o sistema gera um arquivo PDF de 3 páginas (formato 100x50mm)
E as páginas 1 e 2 identificam as unidades da "Janela 2 Folhas" com "Peça 1 de 2" e "Peça 2 de 2"
E a página 3 identifica a "Porta Pivotante" com "Peça 1 de 1"
```

### Cenário 2: Movimentação de pedido no Kanban de Produção
```gherkin
Dado que o pedido "PED-2026-0010" está com status "AGUARDANDO_PRODUCAO"
Quando o operador arrasta o card para a coluna "EM_PRODUCAO"
Então o status do pedido no backend é atualizado para "EM_PRODUCAO"
E o card passa a ser exibido na respectiva coluna sem necessidade de recarregar a página
```