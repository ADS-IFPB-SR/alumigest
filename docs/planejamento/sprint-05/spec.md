# Feature Specification: Sprint 5 — Aprovação de Orçamentos e Conversão em Pedidos de Venda (Lock de Preços)

**Feature**: `002-pedidos-lock-precos`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

No fluxo comercial da Alumiportas, após o cliente aprovar formalmente uma proposta orçamentária, a negociação deixa de ser uma estimativa e se torna um **contrato de venda vinculante (Pedido de Venda)**.

Atualmente, se os preços dos materiais base (perfis de alumínio, chapas de vidro, ferragens) sofrem reajuste na distribuidora ou no catálogo durante o período entre a aprovação e a fabricação, o sistema não pode alterar os valores contratados com o cliente. O pedido deve manter um **snapshot imutável (Lock de Preços)** de todos os valores financeiros, medidas e especificações técnicas acordadas.

Esta sprint entrega:
1. **Formalização da Aprovação do Orçamento**: Registro da aprovação com seleção de canal (WhatsApp, Presencial, Telefone, E-mail) e observações comerciais.
2. **Conversão Automatizada em Pedido de Venda**: Geração instantânea do pedido (`PED-YYYY-NNNN`) a partir do orçamento aprovado, mantendo rastreabilidade total.
3. **Mecanismo de Lock de Preços & Snapshot Técnico**: Congelamento de preços unitários, descontos, totais e configurações dos itens para proteger a margem e o contrato comercial.
4. **Gestão de Ciclo de Vida do Pedido**: Controle de status do pedido (`CRIADO`, `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`, `CANCELADO`) com sugestão automática de data de entrega (+15 dias corridos editáveis).
5. **Política de Cancelamento**: Cancelamento com justificativa obrigatória; o orçamento de origem permanece no histórico com opção explícita de reabertura para renegociação.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Aprovação de Orçamento e Geração de Pedido de Venda 🎯 MVP

**Como** Vendedor ou Administrador da Alumiportas,
**Quero** aprovar um orçamento formalmente selecionando o canal de confirmação e convertê-lo em um Pedido de Venda com um clique,
**Para que** a negociação seja oficializada e encaminhada para o fluxo fabril e financeiro.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Aprovar orçamento com sucesso e gerar pedido
  Dado que existe um orçamento com código "ORC-2026-0001" no status "ENVIADO" ou "RASCUNHO"
  Quando o vendedor clica em "Aprovar Orçamento e Gerar Pedido"
  E seleciona o canal de aprovação "WhatsApp"
  E aceita ou edita a data de entrega sugerida (+15 dias corridos da aprovação)
  Então o status do orçamento deve mudar para "APROVADO"
  E um novo Pedido de Venda deve ser criado com código sequencial (ex: "PED-2026-0001")
  E o pedido deve estar vinculado ao orçamento "ORC-2026-0001"
  E o status inicial do pedido deve ser "AGUARDANDO_PRODUCAO"

Cenário: Tentativa de aprovar orçamento já rejeitado ou expirado
  Dado que existe um orçamento no status "REJEITADO" ou "EXPIRADO"
  Quando o usuário tenta aprová-lo
  Então o sistema deve exibir uma mensagem de erro orientando a reabertura ou revalidação do orçamento
```

---

### User Story 2 (P1) — Snapshot Imutável e Lock de Preços 🎯 MVP

**Como** Diretor Comercial e Financeiro,
**Quero** que os preços e dados técnicos dos itens do pedido permaneçam 100% inalterados mesmo que o catálogo de materiais seja reajustado,
**Para que** a empresa não tenha divergências financeiras entre o valor cobrado do cliente e o relatório do pedido.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Reajuste de materiais no catálogo não afeta pedido gerado
  Dado que um pedido "PED-2026-0001" foi criado contendo um item "Janela 2F" com valor unitário R$ 450,00
  Quando o administrador altera o preço do vidro ou do perfil de alumínio no catálogo de materiais
  E visualiza os detalhes do pedido "PED-2026-0001"
  Então o item "Janela 2F" no pedido deve continuar com o valor unitário de R$ 450,00
  E os totais bruto, desconto e líquido do pedido devem permanecer exatamente iguais aos do momento da conversão
```

---

### User Story 3 (P2) — Gestão de Status, Prazos e Cancelamento

**Como** Gerente de Produção e Vendedor,
**Quero** visualizar a lista de pedidos em aberto com suas datas previstas de entrega, atualizar seus status ou cancelar pedidos não iniciados com justificativa,
**Para que** eu possa planejar a fila de fabricação e manter a integridade dos registros.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Cancelamento de pedido de venda com justificativa
  Dado que existe um pedido "PED-2026-0001" no status "AGUARDANDO_PRODUCAO"
  Quando o vendedor solicita o cancelamento informando a justificativa "Cliente desistiu da obra por motivos financeiros"
  Então o status do pedido deve mudar para "CANCELADO"
  E a justificativa deve ficar registrada no histórico do pedido
  E o orçamento de origem "ORC-2026-0001" permanece como "APROVADO", exibindo o botão "Reabrir Orçamento para Edição"
```

---

### User Story 4 (P2) — Emissão do Comprovante do Pedido de Venda

**Como** Cliente e Vendedor,
**Quero** emitir e imprimir o Comprovante do Pedido de Venda em PDF contendo o número do pedido, data prevista de entrega, canal de aprovação, resumo financeiro e itens contratados,
**Para que** sirva como contrato formal e garantia da transação.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Download do Comprovante do Pedido
  Dado que um pedido "PED-2026-0001" existe
  Quando o usuário clica em "Emitir Comprovante do Pedido"
  Então o sistema deve fazer o download do documento em PDF contendo cabeçalho institucional Alumiportas, código do pedido, dados do cliente, itens com medidas, prazos e condições financeiras congeladas
```

---

## 3. Requisitos Funcionais

1. **RF01 - Conversão 1-para-1**: Cada orçamento só pode gerar **um único** Pedido de Venda ativo. Orçamentos já convertidos não podem ser convertidos novamente (bloqueio por chave única/regra de negócio).
2. **RF02 - Cópia Profunda (Deep Copy) dos Itens**: No momento da conversão, todos os itens do orçamento (`BudgetItem`) devem ser clonados para itens do pedido (`OrderItem`), preservando dimensões, cores, orientações, ferragens, preços unitários e subtotais.
3. **RF03 - Código Sequencial do Pedido**: O código do pedido deve seguir o padrão `PED-YYYY-NNNN` (ex: `PED-2026-0001`), reiniciando a numeração anualmente.
4. **RF04 - Prazos e Previsão**: O sistema sugere automaticamente `dataPrevisaoEntrega = dataAprovacao + 15 dias corridos`, permitindo alteração manual pelo vendedor.
5. **RF05 - Canais de Aprovação**: O sistema deve suportar os canais `WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL` com campo texto complementar para observações.
6. **RF06 - Máquina de Estados do Pedido**:
   - `CRIADO` / `AGUARDANDO_PRODUCAO` → `EM_PRODUCAO` → `CONCLUIDO`
   - Qualquer status anterior a `EM_PRODUCAO` pode transicionar para `CANCELADO` com justificativa obrigatória.
7. **RF07 - Listagem e Filtros de Pedidos**: Permitir listar pedidos paginados com filtros por status, período de entrega e busca por cliente ou código.
8. **RF08 - Emissão de Comprovante**: Gerar documento de confirmação do pedido em PDF com identidade visual da Alumiportas.

---

## 4. Critérios de Sucesso (Technology-Agnostic)

1. **Eficiência Operacional**: A conversão de um orçamento em pedido de venda deve ocorrer em **menos de 1 segundo** após o clique do usuário.
2. **Integridade Financeira (Zero Divergência)**: 100% dos pedidos gerados devem apresentar exata paridade com os valores aprovados no orçamento de origem.
3. **Rastreabilidade Bidirecional**: A partir de um pedido, deve ser possível navegar até o orçamento original, e a partir do orçamento aprovado, acessar o pedido gerado em 1 clique.
4. **Disponibilidade do Comprovante**: O comprovante do pedido em PDF deve ser gerado e disponibilizado para download em menos de 2 segundos.

---

## 5. Entidades Principais

```text
Order (Pedido de Venda)
├── id (BIGSERIAL PK)
├── codigo (VARCHAR(20) - ex: PED-2026-0001, UNIQUE)
├── orcamento_id (BIGINT FK -> budgets, UNIQUE, NOT NULL)
├── cliente_nome, cliente_telefone, cliente_endereco (VARCHAR / TEXT)
├── status (Enum: CRIADO, AGUARDANDO_PRODUCAO, EM_PRODUCAO, CONCLUIDO, CANCELADO)
├── canal_aprovacao (Enum: WHATSAPP, PRESENCIAL, TELEFONE, EMAIL)
├── data_aprovacao (DATE NOT NULL)
├── data_previsao_entrega (DATE NOT NULL)
├── data_conclusao (DATE NULLABLE)
├── valor_bruto, valor_desconto, taxa_instalacao, taxa_frete, valor_liquido (NUMERIC(12,2))
├── condicao_pagamento, observacoes_pagamento, observacoes (VARCHAR / TEXT)
├── justificativa_cancelamento (TEXT NULLABLE)
├── created_at, updated_at (TIMESTAMP)
└── items (1:N -> OrderItem)

OrderItem (Item do Pedido de Venda - Snapshot)
├── id (BIGSERIAL PK)
├── order_id (BIGINT FK -> orders, NOT NULL)
├── product_id (BIGINT FK -> products, NULLABLE)
├── descricao (VARCHAR(300) NOT NULL)
├── largura_mm, altura_mm (INTEGER NOT NULL)
├── quantidade (INTEGER NOT NULL)
├── cor_aluminio, tipo_vidro, orientacao_abertura, ferragens (VARCHAR / TEXT)
├── valor_unitario, valor_total (NUMERIC(12,2) NOT NULL)
└── ordem (INTEGER NOT NULL)
```

---

## 6. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Canal de Aprovação)**: Seleção simples via Enum (`WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL`) + campo de texto para observações comerciais.
- **Q2 (Cancelamento de Pedido)**: O orçamento de origem permanece no status `APROVADO`. O sistema disponibiliza ação explícita de "Reabrir Orçamento para Edição", mantendo a rastreabilidade histórica.
- **Q3 (Prazo Padrão de Entrega)**: Preenchimento automático com data de aprovação + 15 dias corridos, totalmente editável pelo vendedor.

---

## 7. Premissas do Projeto (Assumptions)

- O orçamento de origem já possui todas as validações de descontos e dados do cliente validados pela Sprint 4.
- A geração das Ordens de Produção (OP) fabris e etiquetas QR Code será tratada na Sprint 6, consumindo os dados dos pedidos gerados nesta Sprint 5.