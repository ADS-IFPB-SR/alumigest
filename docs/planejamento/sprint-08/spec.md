# Feature Specification: Sprint 8 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2

**Feature**: `005-estoque-perdas-homologacao-r2`
**Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Com o motor de produção e chão de fábrica operando (Sprints 5, 6 e 7), o AlumiGest fecha o ciclo fabril da **Release 2 (v2.0.0)** integrando a gestão de materiais e estoque:
1. **Controle de Saldos em Tempo Real**: Gestão de estoque físico, reservado e disponível (`disponivel = saldo_fisico - reservado`) para perfis de alumínio (barras/metros), vidros (m²) e ferragens (unidades).
2. **Reserva e Baixa Automática**: Reserva dos materiais na liberação da produção e baixa física definitiva ao concluir o corte da esquadria.
3. **Flexibilidade Operacional**: Saldo insuficiente emite alerta visual amarelo na tela sem travar a produção da oficina.
4. **Registro de Perdas & Sucata**: Registro de quebras e sobras com motivo (manuseio, erro de corte, defeito de fábrica) para auditoria e controle de custos de matéria-prima, com descarte e baixa do estoque.
5. **Homologação da Release 2 (v2.0.0)**: Validação integrada do ciclo fabril completo: Orçamento Aprovado → Pedido Lock → OPs e QR Code → Romaneio de Corte → Baixa de Estoque e Perdas.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Reserva e Baixa Automática de Estoque 🎯 MVP

**Como** Almoxarife e Gerente de Produção,
**Quero** que os materiais sejam automaticamente reservados na liberação da produção e baixados ao concluir o corte,
**Para que** o saldo disponível de estoque reflita a realidade em tempo real sem lançamentos manuais repetitivos.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Reserva automática ao liberar produção
  Dado que um pedido "PED-2026-0001" é liberado para produção gerando OPs
  Quando o sistema cria as OPs
  Então os materiais base associados aos itens devem ter suas quantidades reservadas
  E o saldo disponível de cada material deve diminuir proporcionalmente

Cenário: Baixa definitiva ao concluir o corte da OP
  Dado que uma OP "OP-2026-0001-01" passa para o status "EM_MONTAGEM" (corte finalizado)
  Quando a transição é confirmada pelo operador
  Então as quantidades reservadas daquela peça são convertidas em baixa física definitiva do estoque
```

---

### User Story 2 (P1) — Apontamento de Perdas e Descarte de Sucata 🎯 MVP

**Como** Cortador e Almoxarife da Alumiportas,
**Quero** registrar a perda de um material (quebra de vidro, erro de corte de perfil) com justificativa e motivo padronizado,
**Para que** a empresa quantifique o índice de desperdício e dê baixa contábil na matéria-prima descartada.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Registro de perda de material
  Dado que ocorreu uma quebra de chapa de vidro temperado
  Quando o almoxarife/cortador acessa "Registrar Perda de Estoque"
  E seleciona o material "Vidro Temperado 8mm Incolor", informa quantidade "2.4 m²" e motivo "QUEBRA_MANUSEIO"
  Então o sistema debita a quantidade do estoque físico como perda/sucata
  E grava o registro com data/hora e operador responsável
```

---

### User Story 3 (P2) — Painel de Posição de Estoque & Kardex de Movimentações

**Como** Comprador e Diretor da Alumiportas,
**Quero** consultar a posição consolidada de estoque (físico, reservado, disponível), alertas de estoque mínimo e extrato de movimentações (Kardex),
**Para que** eu possa programar compras de perfis e vidros antes que ocorra desabastecimento na fábrica.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Alerta de saldo disponível crítico
  Dado que o perfil de alumínio "Perfil Linha Suprema Branco" possui saldo disponível inferior ao estoque mínimo
  Quando o usuário acessa o painel de estoque
  Então o item deve ser destacado com badge de alerta em amarelo
```

---

### User Story 4 (P2) — Homologação Integrada da Release 2 (v2.0.0)

**Como** Equipe de Engenharia e Stakeholders da Alumiportas,
**Quero** validar o fluxo integrado ponta a ponta da Release 2 (Sprints 5 a 8) e assegurar os Quality Gates,
**Para que** a versão v2.0.0 esteja pronta para uso em produção.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Execução dos Quality Gates da Release 2
  Dado que os testes unitários e de integração de produção e estoque são executados
  Quando o SonarQube Quality Gate e os builds de frontend/backend passam com 100% de sucesso
  Então a Release 2 é homologada e o relatório TEA é arquivado
```

---

## 3. Requisitos Funcionais

1. **RF01 - Cálculo de Saldo Disponível**: `disponivel = saldo_fisico - reservado`.
2. **RF02 - Tipos de Movimentação**: `ENTRADA_COMPRA`, `RESERVA_PRODUCAO`, `BAIXA_PRODUCAO`, `PERDA_SUCATA`, `AJUSTE_MANUAL`, `CANCELAMENTO_RESERVA`.
3. **RF03 - Motivos de Perda**: `QUEBRA_MANUSEIO`, `ERRO_MEDIDA_CORTE`, `DEFEITO_FABRICA_MATERIAL`, `AVARIA_TRANSPORTE`, `OUTROS`.
4. **RF04 - Aviso Flexível de Saldo**: Saldo insuficiente emite alerta visual sem bloquear a esteira de fabricação.
5. **RF05 - Histórico Kardex Auditável**: Registro imutável de todas as movimentações de estoque com data/hora, operador e referência documental.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Momento da Baixa)**: Reserva imediata na liberação da produção e baixa definitiva ao concluir a etapa de corte da OP.
- **Q2 (Estoque Insuficiente)**: Emissão de alerta visual amarelo sem bloqueio da esteira de fabricação.
- **Q3 (Perdas e Sucata)**: Registro de perda com baixa de estoque no histórico de sucata, sem interferência automática no fluxo da OP.