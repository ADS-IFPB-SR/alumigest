# Feature Specification: Sprint 07 — Gestão Fabril: Etiquetas de Identificação de Peças & Painel Kanban de Produção

**Feature**: `003-etiquetas-kanban-producao`  
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica  
**Período da Sprint 07**: 13/10/2026 a 27/10/2026  
**Created**: 2026-10-14  
**Status**: APPROVED (Sprint Ativa — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

A **Sprint 07** marca o início da esteira fabril e de fabricação do **AlumiGest**. Após a consolidação do módulo de Pedidos de Venda na **Sprint 06** (onde foram garantidos a conversão 1-para-1 a partir de orçamentos, o snapshot imutável de itens/preços e a emissão do comprovante do pedido), o pedido entra efetivamente no chão de fábrica.

Os dois grandes desafios operacionais resolvidos nesta sprint são:
1. **Identificação Física e Rastreabilidade das Peças (`US-17`)**: Em uma oficina de serralheria de alumínio, perfis cortados e esquadrias montadas precisam ser identificadas com precisão milimétrica. A emissão de etiquetas adesivas térmicas padronizadas (100x50mm) contendo cliente, código do pedido, medidas nominais (L x A), cor do alumínio, vidro e numeração da peça física garante que a equipe de montagem, corte e expedição nunca troque esquadrias entre diferentes pedidos.
2. **Gestão Visual do Fluxo de Produção (`US-18`)**: O encarregado de produção e os operadores necessitam de um painel visual unificado (Quadro Kanban) com as colunas `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO` e `CONCLUIDO`. O quadro deve destacar prazos de entrega com indicadores de urgência (SLA), quantidade total de esquadrias e permitir a movimentação rápida de status até a conclusão do pedido com preenchimento da data de término.

---

## 2. 👥 Histórias de Usuário da Sprint 07

### 📌 US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido (Priority: P1) 🎯 MVP Fabril
**Issue GitHub**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)

#### 🎯 Objetivo de Negócio
> **Como** encarregado de produção ou operador de oficina da Alumiportas,  
> **Desejo** emitir e imprimir etiquetas adesivas de identificação em formato térmico (100x50mm) para cada peça física contratada em um Pedido de Venda,  
> **Para que** todas as esquadrias recebam identificação visual clara durante o corte, montagem e expedição, evitando trocas de peças e retrabalho na fábrica.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Geração de Etiquetas Térmicas (100x50mm) com Paginação por Peça Física**
  - **Dado que** o operador visualiza um pedido de venda na página `OrderDetailPage` contendo itens com quantidades unitárias e múltiplas (ex: Item 1 com 2 janelas e Item 2 com 1 porta, totalizando 3 peças)
  - **Quando** clica no botão "Imprimir Etiquetas"
  - **Então** o backend gera um documento PDF único no formato térmico padronizado (100 mm de largura por 50 mm de altura, ou 283.46 pt x 141.73 pt)
  - **E** o documento possui exatamente 3 páginas (1 página por exemplar físico de esquadria), indicando no rodapé a numeração sequencial (ex: "Peça 1 de 2", "Peça 2 de 2", "Peça 1 de 1").

- [ ] **Cenário 2: Dados Técnicos e Comerciais Obrigatórios na Etiqueta**
  - **Dado que** o serviço `LabelPdfService` compõe cada etiqueta
  - **Quando** renderiza o layout térmico institucional
  - **Então** cada etiqueta deve exibir obrigatoriamente:
    1. Cabeçalho com identificação da empresa (**Alumiportas**) e código do pedido (`PED-YYYY-NNNN`);
    2. Nome do cliente;
    3. Descrição/modelo do item (ex: "Janela 2 Folhas Móveis - Linha Suprema");
    4. Medidas nominais em destaque: **Largura x Altura em mm** (ex: `1200 x 1000 mm`);
    5. Cor e acabamento do alumínio (ex: `Branco`, `Preto Fosco`);
    6. Especificação do vidro (ex: `Incolor 4mm`, `Fumê 6mm`, `Sem Vidro`);
    7. Numeração da peça no item e data de previsão de entrega acordada.

- [ ] **Cenário 3: Download Direto com Feedback Visual no Frontend**
  - **Dado que** o usuário aciona a ação de impressão na página de detalhes do pedido
  - **Quando** a requisição ao endpoint `GET /api/orders/{orderId}/labels-pdf` é iniciada
  - **Então** o botão exibe spinner de carregamento e estado desabilitado
  - **E** ao retornar status HTTP `200 OK`, o navegador inicia automaticamente o download ou visualização do arquivo com nome padronizado `etiquetas-PED-YYYY-NNNN.pdf`
  - **E** uma notificação toast de sucesso informa que as etiquetas foram geradas.

- [ ] **Cenário 4: Tratamento para Pedidos Inexistentes ou sem Itens**
  - **Dado que** um ID de pedido inválido ou sem itens cadastrados é informado
  - **Quando** o endpoint `GET /api/orders/{orderId}/labels-pdf` é chamado
  - **Então** o backend retorna HTTP `404 Not Found` (se pedido inexistente) ou `422 Unprocessable Entity` (se pedido não contiver itens) com mensagem amigável em pt-BR.

---

### 📌 US-18: Acompanhar Produção via Painel Kanban de Pedidos de Venda (Priority: P1) 🎯 Gestão Fabril
**Issue GitHub**: [#143](https://github.com/ADS-IFPB-SR/alumigest/issues/143)

#### 🎯 Objetivo de Negócio
> **Como** encarregado de fábrica ou gestor de produção da Alumiportas,  
> **Desejo** acompanhar e gerenciar o avanço dos pedidos através de um quadro Kanban visual organizado nas colunas `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO` e `CONCLUIDO`,  
> **Para que** eu tenha visibilidade em tempo real dos gargalos da fábrica, controle de prazos de entrega e facilidade para atualizar o status da produção.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Visualização Inicial do Quadro Kanban em 3 Colunas Fabris**
  - **Dado que** o operador acessa a rota `/producao` pelo menu lateral "Produção (Kanban)"
  - **Quando** a página `ProductionKanbanPage` é carregada
  - **Então** o sistema exibe 3 colunas distintas:
    1. **Aguardando Produção** (`AGUARDANDO_PRODUCAO`)
    2. **Em Produção** (`EM_PRODUCAO`)
    3. **Concluído** (`CONCLUIDO`)
  - **E** cada coluna exibe um contador com o total de pedidos naquele estágio.

- [ ] **Cenário 2: Informações e Indicador de Prazo (SLA) nos Cards de Pedido**
  - **Dado que** os pedidos são distribuídos nas colunas correspondentes
  - **Quando** o componente `OrderProductionCard` é renderizado
  - **Então** exibe:
    - Código do Pedido (`PED-YYYY-NNNN`) em destaque com link para os detalhes do pedido;
    - Nome do cliente;
    - Quantidade total de peças / esquadrias contratadas;
    - Data prevista de entrega formatada (`DD/MM/AAAA`);
    - Badge de urgência de prazo:
      - **Verde**: prazo restante $> 3$ dias;
      - **Amarelo**: prazo restante entre $0$ e $3$ dias (atenção);
      - **Vermelho**: prazo vencido / atrasado ($< 0$ dias).

- [ ] **Cenário 3: Transição Válida de Status Fabril**
  - **Dado que** um pedido está na coluna `AGUARDANDO_PRODUCAO`
  - **Quando** o operador clica no botão "Iniciar Produção"
  - **Então** o backend processa a transição via `PATCH /api/orders/{id}/production-status` com body `{"status": "EM_PRODUCAO"}`
  - **E** o card é movido imediatamente para a coluna `EM_PRODUCAO` na interface.
  - **E** quando o pedido está em `EM_PRODUCAO` e o operador clica em "Concluir Produção", o status avança para `CONCLUIDO`.

- [ ] **Cenário 4: Preenchimento Automático da Data de Conclusão**
  - **Dado que** a produção de um pedido é finalizada (transição para `CONCLUIDO`)
  - **Quando** a transição é confirmada no backend
  - **Então** o campo `data_conclusao` da entidade `Order` é automaticamente preenchido com a data atual (`LocalDate.now()`)
  - **E** o card na coluna Concluído exibe a data em que o pedido foi finalizado.

- [ ] **Cenário 5: Bloqueio de Transições Inválidas e Pedidos Cancelados**
  - **Dado que** um pedido possui status `CANCELADO` ou o usuário tenta pular de `AGUARDANDO_PRODUCAO` diretamente para `CONCLUIDO`
  - **Quando** o endpoint `PATCH /api/orders/{id}/production-status` é acionado
  - **Então** o backend rejeita a alteração retornando HTTP `422 Unprocessable Entity` com mensagem descritiva ("Transição de status fabril inválida")
  - **E** o estado do banco e da interface não é corrompido.

- [ ] **Cenário 6: Filtros Rápidos de Busca na Tela de Produção**
  - **Dado que** a página do Kanban contém dezenas de pedidos
  - **Quando** o usuário digita no campo de busca (código ou cliente) ou seleciona um filtro de urgência (todos, atrasados, hoje)
  - **Então** os cards das colunas são filtrados de forma reativa e fluida.

---

## 3. 🛡️ Invariantes de Negócio & Regras Não-Negociáveis

1. **Invariante de Formato Térmico**: As etiquetas emitidas devem obrigatoriamente ter tamanho físico configurado em **100x50 mm** no PDF, permitindo impressão direta em impressoras térmicas industriais (Zebra, Elgin, Argox) sem deformação de escala.
2. **Invariante de Contagem Física**: A quantidade total de páginas no arquivo de etiquetas deve ser rigorosamente igual à soma das quantidades de todos os itens do pedido ($\sum \text{quantidade}$).
3. **Invariante de Integridade de Status**: A máquina de estados da produção segue rigorosamente:
   $$\text{AGUARDANDO\_PRODUCAO} \longrightarrow \text{EM\_PRODUCAO} \longrightarrow \text{CONCLUIDO}$$
   Nenhum pedido pode pular etapas ou ser reativado a partir de `CONCLUIDO` pelo Kanban.
4. **Isolamento de Pedidos Cancelados**: Pedidos com status `CANCELADO` não devem poluir o fluxo operacional do chão de fábrica e não podem receber movimentação de status de produção.
