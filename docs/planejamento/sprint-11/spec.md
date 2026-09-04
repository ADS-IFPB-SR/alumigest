# Feature Specification: Sprint 11 — Fluxo de Caixa Mensal

**Feature**: `008-fluxo-caixa-mensal`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-04  
**Status**: APPROVED (Ajustado para Foco Exclusivo em Fluxo Mensal)  

---

## 1. Visão Geral & Contexto de Negócio

Após a emissão dos títulos a receber (Sprint 10) e do módulo PIX (Sprint 9), a Sprint 11 é dedicada à gestão estratégica e consolidação financeira da vidraçaria/serralheria:
1. **Estrutura Imutável de Movimentações de Caixa**: Tabela e entidade `CashFlow` para registrar entradas e saídas financeiras.
2. **Visão Consolidada Mensal**: Acompanhamento de Entradas Realizadas x Previstas ao longo do mês, permitindo avaliar a saúde operacional do negócio.
3. **Evolução do Exercício**: Comparativo mês a mês do saldo e volume financeiro gerado para suporte a tomada de decisões da gerência.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-30: Acompanhar Fluxo de Caixa Mensal

> Permitir à diretoria e gestão financeira visualizar a consolidação mensal de receitas, saídas e saldo operacional, com seletor de período (mês/ano) e gráfico comparativo mensal.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-30.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`
- **US-30.2**: Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- **US-30.3**: Criar repositório `CashFlowRepository` com queries de agregação mensal por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- **US-30.4**: Criar record `MonthlyCashFlowResponse` (ano, mes, totalEntradas, totalSaidas, saldoMensal, comparativoAnual) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/MonthlyCashFlowResponse.java`
- **US-30.5**: Implementar serviço `CashFlowService.obterResumoMensal(int ano, int mes)` agregando movimentações em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`
- **US-30.6**: Criar endpoint GET `/api/finance/cash-flow/monthly` no `CashFlowController`
- **US-30.7**: Criar componentes `MonthlyCashFlowCards` e gráfico comparativo mensal em `frontend/src/features/finance/components/`
- **US-30.8**: Criar página `MonthlyCashFlowPage` e registrar rota `/financeiro/fluxo-mensal` no React Router
- **US-30.9**: Criar testes unitários no `CashFlowServiceTest` validando consolidação mensal
- **US-30.10**: Documentar endpoints no OpenAPI/Swagger e adicionar atalho 'Fluxo Mensal' no menu do frontend

---

## 3. Requisitos Funcionais

1. **RF01 - Agregação Mensal**: Totalização mensal de todas as entradas financeiras (pagamentos recebidos, liquidações e PIX).
2. **RF02 - Saldo Operacional Mensal**: Apuração de `saldo_mensal = receitas_mes - despesas_mes`.
3. **RF03 - Seletor Temporal**: Filtro por Ano e Mês de referência com carregamento reativo via React Query.
4. **RF04 - Comparativo do Exercício**: Gráfico de colunas exibindo o desempenho dos 12 meses do ano selecionado.

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Escopo Exclusivo Mensal**: Remoção de fechamentos diários e liquidações manuais avulsas para foco total na apuração mensal consolidada.
- **Base de Dados Unificada**: A entidade `CashFlow` é alimentada pelas baixas dos pedidos/PIX e serve de fonte para apuração mensal.
