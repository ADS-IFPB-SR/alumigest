# Feature Specification: Sprint 11 — Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa

**Feature**: `008-baixa-pagamentos-fluxo-caixa`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Após a emissão dos títulos a receber (Sprint 10) e do módulo PIX (Sprint 9), o AlumiGest unifica o processamento e a conciliação financeira:
1. **Baixa Manual Multi-Método**: Liquidação de títulos em Dinheiro, Cartão (Débito/Crédito), Transferência Bancária ou Boleto.
2. **Baixa Parcial e Ajustes Comerciais**: Suporte a pagamentos parciais mantendo o mesmo título com status `PAGO_PARCIAL` e saldo devedor atualizado, com campos opcionais para descontos por pontualidade ou juros por atraso.
3. **Fluxo de Caixa Geral**: Acompanhamento diário e mensal de Entradas Realizadas x Previstas (baseado nas datas de vencimento dos títulos).
4. **Fechamento de Caixa Diário Consolidado**: Emissão de relatório de fechamento de caixa em PDF consolidando todos os recebimentos da empresa por forma de pagamento.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Baixa Manual com Suporte Parcial e Descontos/Juros 🎯 MVP

**Como** Operador Financeiro / Vendedor da Alumiportas,
**Quero** liquidar total ou parcialmente um título informando o método de pagamento, descontos ou acréscimos,
**Para que** o saldo financeiro do pedido e do cliente seja atualizado na hora.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Baixa integral com desconto por antecipação
  Dado que existe um título de R$ 1.000,00
  Quando o financeiro concede R$ 50,00 de desconto e registra pagamento de R$ 950,00 em "DINHEIRO"
  Então o título deve ser marcado como "PAGO"
  E o valor efetivamente recebido de R$ 950,00 é lançado no caixa da empresa

Cenário: Baixa parcial
  Dado que existe um título de R$ 1.000,00
  Quando o cliente paga R$ 600,00
  Então o título fica com status "PAGO_PARCIAL", valor_pago = R$ 600,00 e saldo_devedor = R$ 400,00
```

---

### User Story 2 (P1) — Painel de Fluxo de Caixa Diário e Mensal 🎯 MVP

**Como** Diretor da Alumiportas,
**Quero** visualizar o resumo consolidado de entradas realizadas e a projeção de vencimentos futuros,
**Para que** eu tenha controle do capital de giro e previsibilidade financeira.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Resumo diário de entradas por forma de pagamento
  Dado que no dia foram recebidos pagamentos em PIX, Dinheiro e Cartão
  Quando o gestor acessa o Fluxo de Caixa
  Então o painel exibe o total liquidado do dia agrupado por método
  E a curva de recebimentos projetada para os próximos 30 dias
```

---

### User Story 3 (P2) — Relatório de Fechamento de Caixa Diário em PDF

**Como** Gestor Financeiro,
**Quero** emitir o relatório de Fechamento de Caixa Consolidado da empresa em PDF,
**Para que** eu possa conferir os comprovantes físicos e extratos bancários ao final do dia.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Emissão do Fechamento de Caixa Geral do Dia
  Dado que o expediente foi concluído
  Quando o usuário clica em "Emitir Fechamento de Caixa"
  Então o sistema gera um PDF A4 com resumo consolidado de todas as entradas da Alumiportas no dia
```

---

## 3. Requisitos Funcionais

1. **RF01 - Modal de Baixa Manual**: Suporte a seleção de método (`DINHEIRO`, `CARTAO_CREDITO`, `CARTAO_DEBITO`, `TRANSFERENCIA_TED_DOC`, `BOLETO`, `PIX_MANUAL`) e campos opcionais de `desconto` e `juros`.
2. **RF02 - Saldo Parcial Sem Títulos Extras**: A baixa parcial mantém o mesmo registro de `AccountReceivable` com status `PAGO_PARCIAL`.
3. **RF03 - Atualização Automática do Pedido**: Quando 100% dos títulos do pedido forem liquidados, o status financeiro do pedido passa para `TOTALMENTE_PAGO`.
4. **RF04 - Projeção de Caixa**: Cálculo de entradas futuras somando títulos `A_VENCER` agrupados por semana/mês.
5. **RF05 - Fechamento Consolidado em PDF**: Relatório institucional em folha A4 consolidando todas as entradas da empresa.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Baixa Parcial)**: Manter o mesmo título com status `PAGO_PARCIAL` e saldo devedor atualizado (`saldo_devedor = valor_original - valor_pago`).
- **Q2 (Descontos e Juros)**: Inclusão de campos opcionais de Desconto Concedido e Juros/Acréscimo no modal de baixa.
- **Q3 (Fechamento de Caixa)**: Relatório consolidado geral da empresa em PDF.