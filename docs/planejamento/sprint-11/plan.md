# Implementation Plan: Sprint 11 — Fluxo de Caixa Mensal

## Objetivo
Implementar a infraestrutura de dados e a interface visual para acompanhamento consolidado do Fluxo de Caixa Mensal do AlumiGest.

## User Stories Envolvidas
- **US-30**: Acompanhar Fluxo de Caixa Mensal

## Arquitetura e Decisões Técnicas
1. **Modelagem JPA**: Tabela `cash_flows` armazena lançamentos com data, tipo, valor e categoria.
2. **Agregação em Repositório**: Queries nativas/JPQL para agrupamento por mês e ano.
3. **Interface Visual**: Dashboard com cards (Entradas, Saídas, Saldo) e gráfico comparativo anual.
