# Feature Specification: Sprint 07 — Gestão Fabril: Etiquetas de Identificação de Peças & Painel Kanban de Produção

**Feature**: `003-etiquetas-kanban-producao`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Período da Sprint 07**: 13/10/2026 a 27/10/2026  
**Created**: 2026-10-14  
**Status**: 🟢 CONCLUÍDA (100% Entregue)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, todo o código-fonte (entidades, atributos Java, colunas SQL, DTOs e enums) é escrito em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para o Português do Brasil (`pt-BR`) é realizada estritamente na camada visual de UI do Frontend e nas mensagens ao usuário.

---

## 1. Visão Geral & Contexto de Negócio

A **Sprint 07** marca o início da esteira fabril e de fabricação do **AlumiGest**. Após a consolidação do módulo de Ordens de Serviço na **Sprint 06** (onde foram garantidos a conversão 1-para-1 a partir de orçamentos aprovados, o snapshot imutável de itens/preços e a emissão do comprovante oficial), a O.S. entra efetivamente no chão de fábrica.

Os dois grandes desafios operacionais resolvidos nesta sprint são:
1. **Identificação Física e Rastreabilidade das Peças (`US-17`)**: Em uma oficina de serralheria de alumínio, perfis cortados e esquadrias montadas precisam ser identificadas com precisão milimétrica. A emissão de etiquetas adesivas térmicas padronizadas (100x50mm) contendo cliente, código da O.S. (`OS-YYYY-NNNN`), medidas nominais em destaque ($L \times A$ mm), linha do perfil, cor do alumínio, vidro e numeração da peça física ("Peça 0X/0Y") garante que a equipe de corte, usinagem e montagem nunca troque esquadrias entre diferentes ordens de serviço.
2. **Gestão Visual do Fluxo de Produção (`US-18`)**: O encarregado de produção e os operadores necessitam de um painel visual unificado (Quadro Kanban) com as colunas `WAITING_PRODUCTION` (Aguardando Produção), `IN_PRODUCTION` (Em Produção) e `COMPLETED` (Concluído). O quadro deve destacar prazos de entrega com indicadores de urgência (SLA), quantidade total de peças, checklist interativo de etapas de fabricação e permitir movimentação fluida (Drag-and-Drop ou botões contextuais) até a finalização com preenchimento atômico do `completionDate`.

---

## 2. 👥 Histórias de Usuário da Sprint 07

### 📌 US-17: Emitir Etiquetas de Identificação de Peças por Item da Ordem de Serviço (Priority: P1) 🎯 MVP Fabril
**Issue GitHub**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)

#### 🎯 Objetivo de Negócio
> **Como** encarregado de produção, operador de corte ou montador da Alumiportas,  
> **Desejo** emitir e imprimir etiquetas adesivas de identificação em formato térmico (100x50mm) para cada exemplar físico de esquadria de uma Ordem de Serviço (O.S.), com visualização contínua em tela única e sem dependência de código de barras, contendo código da O.S. (`OS-YYYY-NNNN`), dados do cliente, medidas nominais em destaque ($L \times A$ mm), linha de perfil, acabamento de cor, especificação do vidro e identificação física da peça ("Peça 0X/0Y"),  
> **Para que** todas as esquadrias recebam identificação visual clara durante o corte, montagem e expedição, evitando trocas de peças e retrabalho na fábrica.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Geração de Etiquetas Térmicas (100x50mm) com Paginação por Exemplar Físico de Peça**
  - **Dado que** o operador visualiza uma Ordem de Serviço aprovada na página `OrderDetailPage` contendo itens com quantidades unitárias e múltiplas (ex: Item 1 com 2 janelas e Item 2 com 1 porta, totalizando 3 peças físicas)
  - **Quando** clica no botão "Imprimir Etiquetas (100x50mm)"
  - **Então** o backend compila um documento PDF único no formato térmico padronizado (100 mm de largura por 50 mm de altura, ou 283.46 pt $\times$ 141.73 pt)
  - **E** o documento possui paginação exata por peça física (3 páginas), exibindo em cada uma a numeração sequencial fracionada (ex: "Item 01 | Peça 01/03", "Item 01 | Peça 02/03", "Item 02 | Peça 03/03").

- [x] **Cenário 2: Tipografia Técnica Limpa de Alto Contraste (Sem Código de Barras)**
  - **Dado que** a etiqueta é renderizada para impressoras térmicas industriais (Zebra, Elgin, Argox) conforme `prototipo_etiquetas.html`
  - **Quando** os dados técnicos são diagramados no layout OpenPDF
  - **Então** cada etiqueta deve exibir obrigatoriamente:
    1. Cabeçalho com identificação da empresa (**AlumiGest ERP**) e nome do cliente;
    2. Código da O.S. (`OS-YYYY-NNNN`) e numeração do item e peça ("Item 01 | Peça 01/03");
    3. Descrição da esquadria (ex: "Janela de Correr 2 Folhas") e linha (ex: "Gold");
    4. Medidas nominais em destaque visual central: **Largura x Altura em mm** (ex: `📐 1200 x 1500 mm`);
    5. Acabamento do perfil (`aluminumColor`, ex: `🎨 Preto Anodizado`);
    6. Especificação do vidro (`glassType`, ex: `🪟 Incolor 6mm Temperado`);
    7. Local / Observações de entrega e instalação;
    8. Rodapé limpo com código do item, data de emissão e carimbo sem elementos de código de barras.

- [x] **Cenário 3: Visualização Prévia Contínua no Modal Frontend com Filtro por Item**
  - **Dado que** o operador aciona a ação de etiquetas na página de detalhes da O.S.
  - **Quando** o modal `ThermalLabelModal` for exibido
  - **Então** todas as etiquetas físicas são renderizadas em grade contínua em tela única
  - **E** o operador pode alternar os filtros rápidos: "Todas as Peças (N)", "Item 1 (X Peças)", "Item 2 (Y Peças)"
  - **E** a interface disponibiliza botões para "Baixar PDF" e "Imprimir Todas na Térmica" (usando `@media print` com `@page { size: 100mm 50mm; margin: 0; }`).

- [x] **Cenário 4: Download Direto de Arquivo PDF do Backend**
  - **Dado que** o usuário aciona a ação de baixar PDF das etiquetas
  - **Quando** o endpoint `GET /api/v1/orders/{orderId}/labels-pdf` for consumido
  - **Então** o backend responde com status HTTP `200 OK` e `Content-Type: application/pdf`
  - **E** o cabeçalho `Content-Disposition` sugere o nome de arquivo `etiquetas-OS-YYYY-NNNN.pdf`
  - **E** o frontend revoga determinística e imediatamente o Blob URL em memória (`URL.revokeObjectURL`) para prevenir vazamento de memória.

- [x] **Cenário 5: Tratamento para Ordens Inexistentes ou sem Itens**
  - **Dado que** um ID de O.S. inválido ou sem itens cadastrados é informado
  - **Quando** o endpoint `GET /api/v1/orders/{orderId}/labels-pdf` for acionado
  - **Então** o backend retorna HTTP `404 Not Found` (se ordem inexistente) ou `422 Unprocessable Entity` (se ordem não contiver itens) com mensagem amigável em pt-BR no payload padronizado `ErrorResponse`.

---

### 📌 US-18: Acompanhar Produção via Painel Kanban de Ordens de Serviço (Priority: P1) 🎯 Gestão Fabril
**Issue GitHub**: [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)

#### 🎯 Objetivo de Negócio
> **Como** encarregado de fábrica, gerente de produção ou operador da Alumiportas,  
> **Desejo** acompanhar e gerenciar o avanço físico das Ordens de Serviço (O.S.) através de um painel Kanban visual organizado nas etapas fabris (`WAITING_PRODUCTION`, `IN_PRODUCTION` e `COMPLETED`), com suporte a movimentação via Drag-and-Drop e botões contextuais, indicadores de SLA de prazos de entrega, checklist de etapas construtivas por esquadria e filtros dinâmicos,  
> **Para que** eu tenha visibilidade em tempo real dos gargalos da fábrica, controle de prazos de entrega e facilidade para atualizar o status da produção.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Visualização do Quadro Kanban em 3 Colunas e KPIs de Fábrica**
  - **Dado que** o operador acessa o item "Kanban de Produção" no menu lateral (rota `/producao`)
  - **Quando** a página `ProductionKanbanPage` for carregada
  - **Então** o sistema renderiza 3 colunas distintas com tradução na UI:
    1. **Aguardando Produção** (`WAITING_PRODUCTION`)
    2. **Em Produção** (`IN_PRODUCTION`)
    3. **Concluído** (`COMPLETED`)
  - **E** cada coluna exibe um badge com a contagem atualizada de ordens naquele estágio
  - **E** a barra superior exibe KPIs consolidados: "OSs em Produção", "Área Total ($m^2$)", "OSs Urgentes" e "Entrega no Prazo (%)".

- [x] **Cenário 2: Apresentação dos Cards de O.S. e Checklist de Etapas Fabris**
  - **Dado que** as Ordens de Serviço ativas são listadas nas respectivas colunas
  - **Quando** o componente `OrderProductionCard` for renderizado
  - **Então** exibe:
    - Código da O.S. (`OS-YYYY-NNNN`) em destaque com link para detalhes e código do orçamento de origem (`ORC-YYYY-NNNN`);
    - Nome do cliente (`customerName`);
    - Descrição das esquadrias contratadas e linha de alumínio;
    - Badge de estoque de insumos (`🟢 Insumos OK` ou `🔴 Falta Insumo`);
    - Barra de progresso com checklist interativo de etapas fabris (Corte de Alumínio, Usinagem/Estamparia, Montagem & Acessórios, Colocação de Vidro, Embalagem & Expedição);
    - Data de previsão de entrega com badge de urgência (SLA):
      - **Verde**: prazo restante $> 3$ dias;
      - **Amarelo**: prazo restante entre $0$ e $3$ dias (atenção);
      - **Vermelho**: prazo vencido / atrasado ($< 0$ dias).

- [x] **Cenário 3: Movimentação de Status via Drag & Drop ou Botões Contextuais**
  - **Dado que** uma O.S. está em uma coluna fabril
  - **Quando** o operador arrasta o card para a próxima coluna ou clica no botão contextual de avanço ("Iniciar Produção" / "Concluir Produção")
  - **Então** o backend processa a transição via `PATCH /api/v1/orders/{id}/production-status` com body `{"status": "IN_PRODUCTION"}`
  - **E** o card é movido imediatamente na interface com feedback de sucesso (Toast notification).

- [x] **Cenário 4: Preenchimento Automático da Data de Conclusão Real**
  - **Dado que** a produção de uma O.S. é finalizada (transição para `COMPLETED`)
  - **Quando** a transição é confirmada no backend
  - **Então** o campo `completion_date` da entidade `Order` é preenchido atomicamente com a data atual (`LocalDate.now()`)
  - **E** todas as etapas construtivas do checklist são marcadas como concluídas (100%).

- [x] **Cenário 5: Bloqueio de Transições Inválidas e Ordens Canceladas**
  - **Dado que** uma O.S. possui status `CANCELLED` ou o usuário tenta pular de `WAITING_PRODUCTION` diretamente para `COMPLETED`
  - **Quando** o endpoint `PATCH /api/v1/orders/{id}/production-status` é acionado
  - **Então** o backend rejeita a alteração retornando HTTP `422 Unprocessable Entity` com mensagem descritiva ("Transição de status fabril inválida")
  - **E** o estado do banco e da interface permanece consistente.

- [x] **Cenário 6: Filtros Rápidos de Busca e Seleção Operacional**
  - **Dado que** o quadro do Kanban contém dezenas de ordens de serviço
  - **Quando** o usuário digita no campo de busca (`search` por código ou cliente) ou aplica os filtros de linha, estoque e prioridade
  - **Então** os cards das colunas são filtrados de forma reativa e instantânea.

- [x] **Cenário 7: Abertura Rápida da Ficha Técnica / Cortes (Modal PCP)**
  - **Dado que** o operador necessita conferir o plano de corte de uma O.S.
  - **Quando** clica no ícone de visualização ("Ver Ficha Técnica / Cortes") do card
  - **Então** o modal `OrderTechnicalSheetModal` é aberto exibindo cliente, acabamento, especificações do vidro e plano de corte detalhado dos perfis.

---

## 3. 🛡️ Invariantes de Negócio & Regras Não-Negociáveis

1. **Invariante de Formato Térmico**: As etiquetas emitidas devem obrigatoriamente ter tamanho físico configurado em **100x50 mm** no PDF (`283.46 pt x 141.73 pt`), permitindo impressão direta em impressoras térmicas industriais (Zebra, Elgin, Argox) sem deformação de escala.
2. **Invariante de Contagem Física**: A quantidade total de páginas no arquivo de etiquetas deve ser rigorosamente igual à soma das quantidades de todos os itens da ordem ($\sum \text{quantity}$).
3. **Invariante de Integridade de Status**: A máquina de estados da produção segue rigorosamente:
   $$\text{WAITING\_PRODUCTION} \longrightarrow \text{IN\_PRODUCTION} \longrightarrow \text{COMPLETED}$$
   Nenhuma ordem de serviço pode pular etapas ou ser retrocedida/reativada a partir de `COMPLETED` pelo painel Kanban.
4. **Isolamento de Ordens Canceladas**: Ordens com status `CANCELLED` não devem poluir o fluxo operacional do chão de fábrica e não podem receber movimentação de status de produção.
5. **Diretriz de Idioma em Variáveis**: Todo o modelo relacional de banco e interfaces de API deve usar identificadores em **inglês técnico** (`snake_case` e `camelCase`), sendo a tradução vernácula para pt-BR realizada exclusivamente na UI do Frontend.
