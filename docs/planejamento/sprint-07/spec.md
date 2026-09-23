# Feature Specification: Sprint 7 — Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina)

**Feature**: `004-lista-corte-ficha-montagem`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Ajustado para Pedidos e Itens — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Na rotina da serralheria e vidraçaria da Alumiportas, após a aprovação do pedido e emissão das etiquetas (Sprint 6), os cortadores e montadores necessitam de um documento operacional claro e sem ambiguidades para transformar os perfis de alumínio e chapas de vidro nos produtos finais.

> ⚠️ **Importante (Diretriz de Escopo)**: Conforme alinhamento do projeto, **não há cálculo automatizado com fórmulas matemáticas de desconto/nesting**. A funcionalidade é um **Romaneio de Oficina e Ficha Técnica de Montagem**, detalhando:
> - Medidas nominais das esquadrias (Largura x Altura em mm) e quantidades contratadas
> - Especificação do tipo de material (perfis de alumínio, chapas de vidro, ferragens e acessórios)
> - Cores e acabamentos dos perfis (branco, preto, bronze, fosco, etc.)
> - Especificação detalhada dos vidros (tipo, cor, espessura)
> - Lado e sentido de abertura (Direita, Esquerda, Correr, Maxim-ar, Basculante, Pivotante)
> - Relação de ferragens e componentes necessários por peça
> - Checklist físico para conferência de corte e montagem na bancada de trabalho

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-19: Consolidar Lista Linear e Plana de Corte do Pedido

#### 🎯 Objetivo de Negócio
> **Como** cortador e encarregado de produção da Alumiportas,  
> **Desejo** consultar e imprimir uma lista consolidada de corte (romaneio operacional) de todos os itens de um pedido de venda aprovado,  
> **Para que** eu possa visualizar de forma organizada todos os perfis de alumínio, chapas de vidro e ferragens a serem separados e cortados na oficina, reduzindo erros e agilizando a preparação dos materiais.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta com sucesso do Romaneio de Corte consolidado**
  - **Dado que** existe um pedido aprovado "PED-2026-0008" contendo 3 esquadrias distintas
  - **Quando** o usuário solicita a lista de corte via endpoint `GET /api/production/orders/{orderId}/cutting-list` ou pela interface
  - **Então** o sistema retorna status HTTP `200 OK` com payload contendo os dados consolidados do pedido
  - **E** a resposta inclui:
    1. Cabeçalho com código do pedido (`orderCodigo`), nome do cliente e data prevista de entrega
    2. Lista ordenada dos itens a serem cortados (`itens`)
    3. Para cada item: numeração sequencial (`numeroItem`), quantidade total, descrição da esquadria, dimensões nominais L x A (mm), cor do alumínio, tipo de vidro e sentido de abertura.

- [ ] **Cenário 2: Exibição estruturada no Modal de Lista de Corte no Frontend**
  - **Dado que** o encarregado está na página de detalhes do pedido (`OrderDetailPage.tsx`)
  - **Quando** ele clica no botão "Lista de Corte"
  - **Então** o sistema abre o modal `CuttingListModal`
  - **E** exibe uma tabela operacional clara dividida em:
    - Coluna de Identificação (Item, Modelo, Quantidade)
    - Coluna de Medidas Nominais (`Largura x Altura em mm`)
    - Coluna de Perfis (Cor e especificação)
    - Coluna de Vidros (Tipo, espessura e acabamento)
    - Coluna de Acessórios & Ferragens recomendadas
  - **E** disponibiliza um botão "Imprimir Romaneio" que aciona a impressão direta da tabela em modo limpo (CSS `@media print`).

- [ ] **Cenário 3: Consulta de lista de corte para pedido inexistente**
  - **Dado que** é feita uma requisição `GET /api/production/orders/99999/cutting-list` com ID inexistente
  - **Quando** a requisição for processada pelo backend
  - **Então** o sistema deve retornar o status HTTP `404 Not Found`
  - **E** a resposta deve conter mensagem explicativa informando que o pedido não foi localizado.

- [ ] **Cenário 4: Pedido sem itens ou sem dados de especificações**
  - **Dado que** um pedido foi recuperado mas possui itens com dimensões zeradas ou sem perfis cadastrados
  - **Quando** o romaneio é gerado
  - **Então** o sistema preserva os itens existentes preenchendo campos ausentes com marcadores visuais explícitos (ex: "Não informado" ou "-") sem gerar exceções internas (`NullPointerException`).

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Sem Fórmulas de Desconto/Nesting Complexo)**: A lista de corte consolida dados operacionais nominais (LxA mm) e características contratuais registradas no pedido, não realizando otimização matemática algorítmica de retalhos ou sobras.
- **RN-02 (Separação Lógica de Componentes)**: O romaneio deve evidenciar claramente a distinção entre materiais lineares (perfis de alumínio em barras/metros) e materiais planos (chapas de vidro em m²).
- **RN-03 (Imutabilidade Operacional)**: O romaneio é gerado a partir do snapshot dos itens do pedido (`OrderItem`), preservando fidedignidade com o que foi vendido ao cliente.

#### 🔌 Especificação Técnica
- **Backend**:
  - `CuttingItemDTO`: Record contendo `orderItemId`, `numeroItem`, `totalItens`, `descricao`, `larguraMm`, `alturaMm`, `corAluminio`, `tipoVidro`, `orientacaoAbertura`, `ferragens`.
  - `CuttingListResponse`: Record contendo `orderId`, `orderCodigo`, `clienteNome`, `dataPrevisaoEntrega`, `List<CuttingItemDTO> itens`.
  - `CuttingListService`: Método `gerarRomaneioPedido(Long orderId)` agregando dados congelados do pedido.
  - `ProductionReportController`: Endpoint `GET /api/production/orders/{orderId}/cutting-list`.
  - Testes unitários JUnit 5 cobrindo montagem do DTO, tratamento de lista vazia e pedido inexistente.
- **Frontend**:
  - `CuttingListModal.tsx`: Componente com tabela estilizada em Tailwind CSS com suporte a visualização responsiva e folha de estilo para impressão (`print:block`).
  - `useCuttingList.ts`: Hook React Query para busca dos dados de corte com cache e loading states.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-19.1**: Criar record `CuttingItemDTO` (orderItemId, numeroItem, totalItens, descricao, larguraMm, alturaMm, corAluminio, tipoVidro, orientacaoAbertura, ferragens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingItemDTO.java`
- **US-19.2**: Criar record `CuttingListResponse` (orderId, orderCodigo, clienteNome, dataPrevisaoEntrega, itens) em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/CuttingListResponse.java`
- **US-19.3**: Criar record `AssemblySheetResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/production/dto/AssemblySheetResponse.java`
- **US-19.4**: Implementar serviço `CuttingListService.gerarRomaneioPedido(Long orderId)` agregando dados congelados dos itens do pedido em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- **US-19.5**: Criar endpoint `GET /api/production/orders/{orderId}/cutting-list` no `ProductionReportController` em `backend/src/main/java/br/edu/ifpb/alumigest/production/controller/ProductionReportController.java`
- **US-19.6**: Criar testes unitários do `CuttingListService` em `backend/src/test/java/br/edu/ifpb/alumigest/production/service/CuttingListServiceTest.java`
- **US-19.7**: Criar modal `CuttingListModal` no frontend exibindo a tabela consolidada de corte em `frontend/src/features/production/components/CuttingListModal.tsx`
- **US-19.8**: Adicionar botão "Lista de Corte" na tela de detalhes do pedido (`OrderDetailPage.tsx`)

---

### 📌 US-20: Gerar Ficha Técnica de Montagem por Item do Pedido

#### 🎯 Objetivo de Negócio
> **Como** montador de esquadrias da Alumiportas,  
> **Desejo** consultar a ficha técnica individual de montagem de cada item do pedido com suas especificações completas de acessórios, vidro e sentido de abertura,  
> **Para que** eu possa realizar a montagem física da peça na bancada de trabalho seguindo rigorosamente os padrões de qualidade e checklist de fabricação.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta detalhada da Ficha Técnica de Montagem de um item**
  - **Dado que** existe um item de pedido cadastrado com ID `15` pertencente a uma Janela de Correr 2 Folhas
  - **Quando** o montador acessa a ficha técnica via endpoint `GET /api/production/order-items/15/assembly-sheet` ou pela interface
  - **Então** o sistema retorna status HTTP `200 OK` com os detalhes técnicos da peça
  - **E** os dados retornados incluem:
    1. Identificação da peça (código do pedido, número do item no pedido)
    2. Dimensões nominais de montagem (Largura: 1500mm, Altura: 1200mm)
    3. Especificação exata do vidro (ex: Vidro Temperado Incolor 8mm)
    4. Cor e acabamento dos perfis de alumínio (ex: Pintura Eletrostática Branca)
    5. Sentido e tipo de abertura (ex: Correr 2 Folhas, recolhimento central)
    6. Relação descritiva de roldanas, fechos, escovas de vedação e borrachas.

- [ ] **Cenário 2: Exibição visual com Checklist de Conferência na Oficina**
  - **Dado que** o montador abre a visualização da Ficha Técnica no componente `AssemblySheetView`
  - **Quando** o componente é renderizado na tela
  - **Então** ele exibe um cartão técnico com esquema visual dos parâmetros da esquadria
  - **E** apresenta uma seção de "Checklist de Conferência Operacional" com itens clicáveis/marcáveis:
    - [ ] Perfis cortados e esquadrejados
    - [ ] Usinagens e drenos executados
    - [ ] Vedação e borrachas instaladas
    - [ ] Vidros assentados e travados
    - [ ] Roldanas e fechos regulados e testados.

- [ ] **Cenário 3: Consulta para item de pedido inexistente**
  - **Dado que** é feita uma requisição `GET /api/production/order-items/99999/assembly-sheet`
  - **Quando** o backend processar a requisição
  - **Então** deve retornar status HTTP `404 Not Found`
  - **E** mensagem indicando que o item de pedido não foi localizado.

- [ ] **Cenário 4: Integração de navegação a partir da tela de Pedidos**
  - **Dado que** o operador está visualizando a listagem de itens em `OrderDetailPage.tsx`
  - **Quando** ele clica no ícone ou botão "Ficha Técnica" presente na linha de um item
  - **Então** a gaveta lateral ou modal da Ficha Técnica correspondente àquele item específico é exibida sem perda de contexto da página.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Detalhamento Completo por Peça)**: Toda ficha técnica de montagem deve exibir de forma clara e destacada o sentido de abertura e o lado de travamento do produto para prevenir erros irreversíveis de montagem na oficina.
- **RN-02 (Checklist Operacional Físico/Digital)**: O checklist serve como garantia de qualidade antes da liberação da esquadria para a etapa de expedição e transporte.
- **RN-03 (Imutabilidade dos Dados Técnicos)**: Os dados técnicos são lidos exclusivamente do item do pedido aprovado, mantendo a conformidade com o que foi validado tecnicamente pelo cliente.

#### 🔌 Especificação Técnica
- **Backend**:
  - `AssemblySheetResponse`: Record contendo dados completos de identificação, medidas, materiais e instruções de montagem.
  - `CuttingListService`: Método `gerarFichaMontagem(Long orderItemId)`.
  - `ProductionReportController`: Endpoint `GET /api/production/order-items/{id}/assembly-sheet`.
  - Testes unitários com JUnit 5 validando a consistência dos dados retornados e mapeamento de atributos.
- **Frontend**:
  - `AssemblySheetView.tsx`: Componente de visualização em formato de prancha de montagem com layout limpo e suporte a impressão.
  - Integração com `OrderDetailPage.tsx` e `CuttingListModal.tsx`.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-20.1**: Implementar método `gerarFichaMontagem(Long orderItemId)` no `CuttingListService` em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/CuttingListService.java`
- **US-20.2**: Adicionar endpoint `GET /api/production/order-items/{id}/assembly-sheet` no `ProductionReportController`
- **US-20.3**: Criar componente `AssemblySheetView` no frontend exibindo as orientações e acessórios da peça em `frontend/src/features/production/components/AssemblySheetView.tsx`
- **US-20.4**: Integrar a visualização da Ficha Técnica na página de detalhes do pedido (`OrderDetailPage.tsx`) e em modal de inspeção

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Romaneio Consolidado de Corte | **US-19** | US-19.1, US-19.2, US-19.4, US-19.5 | US-19.7, US-19.8 | US-19.6 (`CuttingListServiceTest`) |
| Ficha Técnica de Montagem por Item | **US-20** | US-20.1, US-20.2 | US-20.3, US-20.4 | `AssemblySheetServiceTest`, `AssemblySheetView.test.tsx` |
