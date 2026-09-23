# Feature Specification: Sprint 6 — Etiquetas de Identificação de Peças e Kanban de Produção

**Feature**: `003-producao-kanban-etiquetas`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Reestruturada após Decisão de Escopo — Padrão BDD Gherkin)  

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

#### 🎯 Objetivo de Negócio
> **Como** encarregado de produção da oficina da Alumiportas,  
> **Desejo** emitir etiquetas adesivas térmicas de identificação (100x50mm) para cada exemplar físico de esquadria de um pedido de venda aprovado,  
> **Para que** os cortadores e montadores possam colar nos perfis e vidros, identificando medidas nominais, cliente, cor, vidro e numeração individual da peça sem confusão no chão de fábrica.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Emissão de PDF de etiquetas com paginação por unidade física**
  - **Dado que** existe um pedido aprovado "PED-2026-0005" com 2 itens:
    | Item | Descrição | Quantidade | Largura (mm) | Altura (mm) | Cor | Vidro |
    | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
    | 1 | Janela 2 Folhas | 2 | 1200 | 1000 | Branco | Incolor 8mm |
    | 2 | Porta Pivotante | 1 | 900 | 2100 | Preto | Fumê 10mm |
  - **Quando** o encarregado clica no botão "Imprimir Etiquetas" na tela de detalhes do pedido
  - **Então** o sistema gera e inicia o download de um arquivo PDF (`application/pdf`) contendo exatamente 3 páginas
  - **E** cada página corresponde a 1 etiqueta física individual no formato 100x50mm
  - **E** as páginas 1 e 2 exibem "Peça 1 de 2" e "Peça 2 de 2" da Janela 2 Folhas
  - **E** a página 3 exibe "Peça 1 de 1" da Porta Pivotante.

- [ ] **Cenário 2: Conteúdo e formatação dos dados na etiqueta física**
  - **Dado que** o sistema gera uma página de etiqueta para um item de pedido
  - **Quando** a etiqueta é renderizada pelo serviço de impressão térmica
  - **Então** o documento deve apresentar obrigatoriamente e em tipografia legível:
    1. Cabeçalho com o nome do sistema ("AlumiGest") e código do pedido (`PED-YYYY-NNNN`)
    2. Nome completo ou razão social do cliente
    3. Descrição do produto/modelo da esquadria
    4. Medidas nominais formatadas no padrão milimétrico: `Largura: {L} mm x Altura: {A} mm`
    5. Cor e acabamento do alumínio (ex: "Branco", "Preto", "Bronze")
    6. Especificação do vidro (ex: "Incolor 8mm Temperado")
    7. Sentido/orientação de abertura (ex: "Correr", "Giro Direita", "Maxim-ar")
    8. Numeração individual da peça: `Peça {i} de {total_do_item}`.

- [ ] **Cenário 3: Tentativa de emissão para pedido inexistente**
  - **Dado que** é feita uma requisição `GET /api/orders/99999/labels-pdf` para um pedido que não existe
  - **Quando** a requisição for processada pelo backend
  - **Então** o sistema deve retornar o status HTTP `404 Not Found`
  - **E** o payload JSON deve conter `error: "Pedido não encontrado com ID: 99999"`.

- [ ] **Cenário 4: Pedido sem itens cadastrados**
  - **Dado que** existe um pedido cadastrado mas que não possui nenhum item vinculado
  - **Quando** o usuário solicita a geração de etiquetas
  - **Então** o backend deve retornar o status HTTP `400 Bad Request` com mensagem informativa de que o pedido não possui itens a etiquetar.

- [ ] **Cenário 5: Experiência do usuário e feedback de download no Frontend**
  - **Dado que** o encarregado está na página de detalhes de um pedido aprovado (`OrderDetailPage.tsx`)
  - **Quando** ele clica no botão "Imprimir Etiquetas"
  - **Então** o botão deve entrar em estado de carregamento com spinner e texto "Gerando Etiquetas..."
  - **E** ao receber o stream de bytes com sucesso, o arquivo `etiquetas-PED-YYYY-NNNN.pdf` deve ser descarregado automaticamente
  - **E** uma notificação toast de sucesso deve informar "Etiquetas geradas com sucesso".

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Dimensão do Papel 100x50mm)**: O PDF deve ser configurado com tamanho de página personalizado de 100mm de largura por 50mm de altura (aprox. 283.46 x 141.73 pontos no OpenPDF), com margens mínimas de 3mm a 5mm para permitir impressão perfeita em impressoras térmicas (Zebra, Elgin, Argox).
- **RN-02 (Decomposição N/M por Unidade)**: Se um item possui quantidade $N$, devem ser geradas rigorosamente $N$ páginas consecutivas, com indicador `Peça i de N`, facilitando a colagem peça por peça na bancada de corte.
- **RN-03 (Imutabilidade dos Dados da Etiqueta)**: Os dados impressos na etiqueta devem ser extraídos diretamente do snapshot congelado do pedido (`OrderItem`), garantindo que alterações cadastrais posteriores não adulterem as peças físicas em fabricação.
- **RN-04 (Autenticação e Permissão)**: Apenas usuários autenticados com papéis `ADMIN`, `GERENTE` ou `OPERADOR` podem emitir etiquetas de produção.

#### 🔌 Especificação Técnica
- **Backend**:
  - `LabelPdfService`: Serviço responsável pela montagem do documento PDF em memória (`ByteArrayOutputStream`) utilizando OpenPDF (`com.github.librepdf:openpdf`), iterando sobre os itens e quantidades.
  - `OrderController`: Endpoint `GET /api/orders/{orderId}/labels-pdf` retornando `ResponseEntity<byte[]>` com headers `Content-Type: application/pdf` e `Content-Disposition: inline; filename="etiquetas-{codigo}.pdf"`.
  - Testes unitários com JUnit 5 e Mockito validando geração de bytes, layout correto e paginação exata pela soma das quantidades dos itens.
- **Frontend**:
  - `orderApi.ts`: Método `downloadOrderLabelsPdf(orderId: number)`.
  - `OrderDetailPage.tsx`: Botão de ação "Imprimir Etiquetas" com ícone de etiqueta/impressora, tratamento de loading e download via `blob`.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-17.1**: Criar serviço `LabelPdfService` usando OpenPDF com layout de etiqueta física (100x50mm) contendo dados do pedido, cliente, medidas nominais (L x A mm), cor do perfil, tipo de vidro e numeração da peça (ex: Peça 1 de 2) em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- **US-17.2**: Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no `OrderController` retornando o documento `application/pdf`
- **US-17.3**: Criar teste unitário do `LabelPdfService` validando geração de bytes não-vazios e paginação exata pela quantidade de peças em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/LabelPdfServiceTest.java`
- **US-17.4**: Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) disparando o download do arquivo PDF com feedback de loading e notificação toast

---

### 📌 US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda

#### 🎯 Objetivo de Negócio
> **Como** encarregado de fábrica e gestor comercial da Alumiportas,  
> **Desejo** acompanhar o andamento dos pedidos de venda aprovados através de um painel visual Kanban estruturado por etapas de fabricação,  
> **Para que** eu possa identificar gargalos em tempo real, monitorar prazos de entrega acordados com os clientes e transicionar pedidos entre as fases de produção de forma ágil e intuitiva.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Visualização do Quadro Kanban com colunas de status oficiais**
  - **Dado que** existem pedidos de venda cadastrados e aprovados no sistema em diferentes estágios de produção
  - **Quando** o usuário acessa a página do Kanban de Produção (`/producao`)
  - **Então** o sistema exibe 3 colunas principais de status de produção:
    1. **Aguardando Produção** (`AGUARDANDO_PRODUCAO`)
    2. **Em Produção** (`EM_PRODUCAO`)
    3. **Concluído** (`CONCLUIDO`)
  - **E** cada coluna exibe um contador com o total de pedidos presentes nela e o somatório de peças a fabricar.

- [ ] **Cenário 2: Exibição detalhada das informações no cartão do pedido**
  - **Dado que** um pedido é apresentado em uma das colunas do Kanban
  - **Quando** o usuário visualiza o cartão (`OrderProductionCard`)
  - **Então** o cartão deve exibir:
    1. Código formatado do pedido (`PED-YYYY-NNNN`)
    2. Nome do cliente
    3. Quantidade total de itens/esquadrias do pedido
    4. Data prevista de entrega formatada no padrão brasileiro (`dd/MM/yyyy`)
    5. Badge de status e atalho direto para a visualização dos detalhes do pedido.

- [ ] **Cenário 3: Movimentação de pedido e transição de status no Backend**
  - **Dado que** o pedido "PED-2026-0010" está com status `AGUARDANDO_PRODUCAO`
  - **Quando** o operador move o cartão para a coluna `EM_PRODUCAO` (seja via drag-and-drop ou seleção de ação no card)
  - **Então** o frontend dispara a requisição `PATCH /api/orders/{id}/production-status` com payload `{"productionStatus": "EM_PRODUCAO"}`
  - **E** o backend atualiza o status de produção no banco de dados e retorna `200 OK` com o DTO atualizado
  - **E** a interface move o cartão para a nova coluna imediatamente com atualização otimista ou invalidação do cache React Query.

- [ ] **Cenário 4: Preenchimento automático da data de conclusão ao finalizar pedido**
  - **Dado que** o pedido "PED-2026-0010" está com status `EM_PRODUCAO`
  - **Quando** o operador move o pedido para a coluna `CONCLUIDO`
  - **Então** o backend atualiza o status para `CONCLUIDO` e define o campo `data_conclusao` com a data atual (`LocalDate.now()`)
  - **E** caso o pedido seja retrocedido de `CONCLUIDO` para `EM_PRODUCAO`, a `data_conclusao` é limpa (`null`).

- [ ] **Cenário 5: Alerta visual de prioridade e atraso de entrega**
  - **Dado que** um pedido em produção possui `data_previsao_entrega`:
    - menor que a data atual (pedido atrasado); OU
    - nos próximos 2 dias corridos (prazo crítico)
  - **Quando** o cartão é renderizado no Kanban
  - **Então** o cartão deve apresentar um badge de alerta visual de alta visibilidade (vermelho para atrasado, amarelo/âmbar para prazo crítico)
  - **E** o cartão exibe os dias restantes ou dias de atraso (ex: "Atrasado há 3 dias", "Vence amanhã").

- [ ] **Cenário 6: Filtros dinâmicos de busca no Kanban**
  - **Dado que** o usuário está no painel Kanban com diversos cartões distribuídos
  - **Quando** ele digita o nome de um cliente ou código do pedido no campo de busca
  - **Então** apenas os cartões que atendem aos termos pesquisados permanecem visíveis em suas respectivas colunas
  - **E** os contadores das colunas refletem a quantidade de cartões filtrados.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Transições de Status Permitidas)**: As transições de status de produção válidas são:
  - `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO`
  - `EM_PRODUCAO` ➔ `CONCLUIDO`
  - `EM_PRODUCAO` ➔ `AGUARDANDO_PRODUCAO` (estorno/pausa de fábrica)
  - `CONCLUIDO` ➔ `EM_PRODUCAO` (reabertura de pedido por retrabalho)
  - Qualquer transição direta de `AGUARDANDO_PRODUCAO` para `CONCLUIDO` sem passar por `EM_PRODUCAO` deve ser rejeitada com `422 Unprocessable Entity`.
- **RN-02 (Preenchimento de Auditoria de Conclusão)**: A transição para `CONCLUIDO` grava compulsoriamente a data atual em `data_conclusao`.
- **RN-03 (Alerta Visual de Prazo de Entrega)**: Prazos com diferença $\le 2$ dias recebem destaque de atenção (`warning`); prazos vencidos recebem destaque de perigo (`danger/critical`).
- **RN-04 (Exclusão de Cancelados)**: Pedidos com status global `CANCELADO` não devem figurar nas colunas do Kanban de produção ativa.

#### 🔌 Especificação Técnica
- **Backend**:
  - `ProductionStatus` (Enum): `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`.
  - `OrderController`: Endpoint `PATCH /api/orders/{id}/production-status` recebendo DTO `UpdateProductionStatusRequest` e retornando `OrderResponse`.
  - `OrderService`: Método `atualizarStatusProducao(Long orderId, ProductionStatus novoStatus)` com validação das regras de negócio de transição e manipulação de `data_conclusao`.
  - Testes com JUnit 5 cobrindo todas as transições válidas, transições inválidas e integridade da `data_conclusao`.
- **Frontend**:
  - `ProductionKanbanPage.tsx`: Página principal do Kanban com barra de pesquisa, filtros e cabeçalho de produtividade.
  - `ProductionKanbanBoard.tsx`: Container do quadro com 3 colunas responsivas e acessíveis.
  - `OrderProductionCard.tsx`: Card informativo com badges de urgência, cliente, código, total de itens e menu de transição rápida de status.
  - `useProductionKanban.ts`: Hook React Query gerenciando consulta de pedidos agrupados e mutação otimista de status.
  - Rota `/producao` protegida com permissão de visualização para operadores e gerentes.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-18.1**: Implementar endpoint `PATCH /api/orders/{id}/production-status` no `OrderController` com validação das transições permitidas (`AGUARDANDO_PRODUCAO` → `EM_PRODUCAO` → `CONCLUIDO`) e atualização automática da `data_conclusao` em `backend/src/main/java/br/edu/ifpb/alumigest/order/controller/OrderController.java`
- **US-18.2**: Criar hook React Query (`useProductionKanban.ts`) e serviços de API para listar pedidos agrupados por status de produção em `frontend/src/features/production/hooks/useProductionKanban.ts`
- **US-18.3**: Criar componente `OrderProductionCard` no frontend exibindo código do pedido, cliente, data prevista de entrega, badges de alerta de prazo e total de esquadrias em `frontend/src/features/production/components/OrderProductionCard.tsx`
- **US-18.4**: Criar componente `ProductionKanbanBoard` com colunas (`AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`) e movimentação ágil de cartões em `frontend/src/features/production/components/ProductionKanbanBoard.tsx`
- **US-18.5**: Criar página `ProductionKanbanPage` com filtros de busca por cliente, período de entrega e código do pedido em `frontend/src/pages/ProductionKanbanPage.tsx`
- **US-18.6**: Configurar rota `/producao` no React Router e adicionar atalho "Produção (Kanban)" no menu lateral do frontend
- **US-18.7**: Documentar endpoints no OpenAPI/Swagger e criar testes unitários para a transição de status no backend

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Emissão de Etiquetas Físicas (100x50mm) | **US-17** | US-17.1, US-17.2 | US-17.4 | US-17.3 (`LabelPdfServiceTest`) |
| Painel Kanban de Produção | **US-18** | US-18.1, US-18.7 | US-18.2, US-18.3, US-18.4, US-18.5, US-18.6 | `OrderProductionStatusTest`, `ProductionKanbanBoard.test.tsx` |