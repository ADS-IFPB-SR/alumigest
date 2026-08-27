# Feature Specification: Sprint 10 — Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento

**Feature**: `007-contas-receber-parcelamento`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

No modelo operacional da Alumiportas, a grande maioria dos contratos de esquadrias e vidros envolve divisão de pagamentos: **50% de Sinal de Entrada** (para compra de matéria-prima) e **50% de Saldo na Entrega/Instalação**, ou parcelamento no cartão/boleto em até 12x.

Atualmente, o controle de quais clientes já pagaram o sinal e quais estão com saldo devedor pendente na entrega é feito em cadernos ou planilhas desconectadas.

Esta sprint entrega:
1. **Geração Automática do Plano de Contas a Receber**: Desdobramento inteligente do valor do pedido em títulos a receber (`AccountReceivable`), com centavos residuais na 1ª parcela e permissão de edição manual de datas/valores.
2. **Gestão de Sinais de Entrada (50%) e Saldos**: Acompanhamento dinâmico dos status (`A_VENCER`, `VENCIDO`, `PAGO_PARCIAL`, `PAGO`, `CANCELADO`).
3. **Painel Financeiro de Contas a Receber**: Visão consolidada por período de vencimento com alertas visuais de inadimplência.
4. **Posição Financeira do Cliente & Recibos em PDF**: Extrato de débitos e emissão de recibos oficiais de quitação via OpenPDF.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Desdobramento Automático e Edição de Parcelas 🎯 MVP

**Como** Vendedor e Financeiro da Alumiportas,
**Quero** que a criação do Pedido de Venda gere automaticamente os títulos a receber, permitindo ajustes manuais de datas e valores,
**Para que** o plano de recebimento reflita fielmente o acordo com o cliente.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Geração de 2 parcelas (50% + 50%) com centavo residual
  Dado que um pedido de R$ 100,01 é criado com condição "50% Entrada"
  Quando o plano de contas a receber é gerado
  Então a 1ª parcela (Entrada) deve ser de R$ 50,01 com vencimento imediato
  E a 2ª parcela (Saldo) deve ser de R$ 50,00 com vencimento na data de entrega
  E a soma exata das parcelas deve ser R$ 100,01
```

---

### User Story 2 (P1) — Painel de Contas a Receber e Inadimplência 🎯 MVP

**Como** Diretor Financeiro,
**Quero** visualizar todas as parcelas a vencer, recebidas e vencidas em atraso, com alerta para clientes inadimplentes,
**Para que** eu possa realizar cobrança proativa e prever o fluxo de caixa.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Identificação de títulos vencidos
  Dado que existem parcelas com vencimento anterior a hoje sem pagamento
  Quando o financeiro acessa o painel de Contas a Receber
  Então esses títulos devem ser exibidos em vermelho com status "VENCIDO" e cálculo de dias em atraso
```

---

### User Story 3 (P2) — Extrato Financeiro do Cliente e Recibo de Quitação

**Como** Cliente e Financeiro,
**Quero** emitir o Recibo de Pagamento e Extrato do Cliente em PDF,
**Para que** sirva como comprovante formal de quitação total ou parcial.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Emissão do Recibo de Quitação de Parcela
  Dado que uma parcela foi paga
  Quando o usuário clica em "Emitir Recibo"
  Então o sistema faz o download de um PDF A4 com dados da Alumiportas, cliente, valor por extenso e quitação
```

---

## 3. Requisitos Funcionais

1. **RF01 - Geração Automática por Condição**: Divisão em títulos a receber conforme condição comercial.
2. **RF02 - Regra de Centavos**: O centavo residual de divisões ímpares é somado na primeira parcela.
3. **RF03 - Validação de Integridade**: A soma das parcelas deve obrigatoriamente bater com o `valor_liquido` do pedido.
4. **RF04 - Alerta Não-Bloqueante de Inadimplência**: Clientes com parcelas em atraso são sinalizados com banner vermelho de aviso sem travar a operação.
5. **RF05 - Emissão de Recibo em PDF**: Geração de documento de quitação via OpenPDF.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Ajuste de Parcelas)**: Sugestão automática inteligente + edição manual livre de datas e valores (com validação de soma total).
- **Q2 (Centavos)**: Centavo residual alocado na 1ª parcela (Entrada/Sinal).
- **Q3 (Inadimplência)**: Alerta visual em vermelho no cadastro e propostas sem bloqueio de emissão.