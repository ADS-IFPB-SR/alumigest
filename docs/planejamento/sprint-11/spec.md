# Feature Specification: Sprint 11 — Fluxo de Caixa Mensal

**Feature**: `008-fluxo-caixa-mensal`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Ajustado para Foco Exclusivo em Fluxo Mensal — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Após a emissão dos títulos a receber (Sprint 10) e do módulo PIX (Sprint 9), a Sprint 11 é dedicada à gestão estratégica e consolidação financeira da vidraçaria/serralheria:
1. **Estrutura Imutável de Movimentações de Caixa**: Tabela e entidade `CashFlow` para registrar entradas e saídas financeiras decorrentes das vendas e operações.
2. **Visão Consolidada Mensal**: Acompanhamento de Entradas Realizadas x Previstas ao longo do mês, permitindo avaliar a saúde operacional do negócio.
3. **Evolução do Exercício**: Comparativo mês a mês do saldo e volume financeiro gerado para suporte a tomada de decisões da gerência da Alumiportas.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-30: Acompanhar Fluxo de Caixa Mensal

#### 🎯 Objetivo de Negócio
> **Como** diretor e gestor financeiro da Alumiportas,  
> **Desejo** visualizar a consolidação mensal de receitas, saídas e saldo operacional do caixa, com seletores de período (mês/ano) e gráfico comparativo da evolução do exercício,  
> **Para que** eu possa avaliar a saúde e liquidez da empresa em tempo real, monitorar a sazonalidade das vendas de esquadrias e planejar os investimentos com segurança.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Consulta do Resumo Consolidado de Fluxo de Caixa Mensal**
  - **Dado que** existem movimentações financeiras de entradas e saídas registradas para setembro de 2026
  - **Quando** o usuário requisita os dados via `GET /api/finance/cash-flow/monthly?ano=2026&mes=9`
  - **Então** o backend responde com status HTTP `200 OK`
  - **E** o payload contém:
    1. `ano`: 2026 e `mes`: 9
    2. `totalEntradas`: somatório de todos os recebimentos do mês
    3. `totalSaidas`: somatório de todos os pagamentos e custos do mês
    4. `saldoMensal`: resultado líquido calculado (`totalEntradas - totalSaidas`)
    5. Lista comparativa dos 12 meses do ano (`comparativoAnual`).

- [ ] **Cenário 2: Exibição no Frontend com Cards de Indicadores (KPIs)**
  - **Dado que** o gestor acessa a página `/financeiro/fluxo-mensal`
  - **Quando** a tela é renderizada com os dados do mês atual
  - **Então** exibe 3 cards de topo com tipografia e cores padronizadas:
    - **Total de Entradas**: valor formatado em Real com badge verde
    - **Total de Saídas**: valor formatado com badge vermelho/âmbar
    - **Resultado do Mês**: valor com cor verde (se positivo) ou vermelha (se negativo).

- [ ] **Cenário 3: Gráfico de Barras com Evolução dos 12 Meses do Exercício**
  - **Dado que** o gestor está visualizando a tela de fluxo de caixa mensal
  - **Quando** ele observa o painel gráfico `MonthlyCashFlowCards`
  - **Então** o sistema apresenta gráfico de barras/colunas contendo o histórico de janeiro a dezembro do ano selecionado
  - **E** cada mês destaca em colunas paralelas as receitas e despesas com legenda informativa.

- [ ] **Cenário 4: Navegação entre Períodos e Seleção Livre de Mês/Ano**
  - **Dado que** o usuário está consultando o mês de setembro de 2026
  - **Quando** ele clica no botão "Mês Anterior" (`<`) ou escolhe outro mês/ano no menu dropdown
  - **Então** a interface dispara a requisição correspondente sem recarregar a página
  - **E** atualiza instantaneamente os cards de valores e o gráfico com os dados do período solicitado.

- [ ] **Cenário 5: Consulta de Mês sem Movimentações Financeiras**
  - **Dado que** para um determinado mês futuro não há nenhuma entrada ou saída cadastrada
  - **Quando** o relatório desse mês for requisitado
  - **Então** o sistema retorna `200 OK` com `totalEntradas = 0.00`, `totalSaidas = 0.00` e `saldoMensal = 0.00`
  - **E** a interface exibe os valores zerados de forma amigável sem apresentar erros na tela.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Fórmula Matemática de Apuração)**: O saldo mensal apurado é resultado estrito de `saldo_mensal = total_entradas - total_saidas`.
- **RN-02 (Alimentação Automatizada de Entradas)**: Cada liquidação de PIX (Sprint 9) ou baixa de título a receber (Sprint 10) deve gerar compulsoriamente um registro correspondente em `cash_flows` com tipo `ENTRADA`.
- **RN-03 (Imutabilidade Histórica)**: Registros de caixa consolidados de meses encerrados não sofrem recálculo destrutivo; alterações são registradas como ajustes do período corrente.
- **RN-04 (Precisão Monetária)**: Valores monetários utilizam `BigDecimal` de duas casas decimais com arredondamento contábil.

#### 🔌 Especificação Técnica
- **Backend**:
  - `CashFlow`: Entidade JPA com colunas `id`, `dataMovimento`, `tipo` (`ENTRADA`/`SAIDA`), `valor`, `descricao`, `categoria`, `referenciaId`.
  - `CashFlowRepository`: Métodos de agregação com JPQL/SQL nativo totalizando valores por mês e ano.
  - `MonthlyCashFlowResponse`: DTO imutável contendo métricas mensais e lista do ano completo.
  - `CashFlowService`: Lógica de consolidação e fechamento.
  - `CashFlowController`: Endpoint `GET /api/finance/cash-flow/monthly`.
  - Testes unitários com JUnit 5 cobrindo múltiplos cenários de conciliação.
- **Frontend**:
  - `MonthlyCashFlowPage.tsx`: Página estruturada com seletores temporais e layout responsivo.
  - `MonthlyCashFlowCards.tsx`: Cards de indicadores de alta densidade visual.
  - Integração com biblioteca de visualização de gráficos ou barras em SVG/Tailwind.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-30.1**: Criar migration Flyway `backend/src/main/resources/db/migration/V14__create_cash_flows_schema.sql` com tabela `cash_flows`
- **US-30.2**: Criar entidade JPA `CashFlow` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/domain/CashFlow.java`
- **US-30.3**: Criar repositório `CashFlowRepository` com queries de agregação mensal por período em `backend/src/main/java/br/edu/ifpb/alumigest/finance/repository/CashFlowRepository.java`
- **US-30.4**: Criar record `MonthlyCashFlowResponse` (ano, mes, totalEntradas, totalSaidas, saldoMensal, comparativoAnual) em `backend/src/main/java/br/edu/ifpb/alumigest/finance/dto/MonthlyCashFlowResponse.java`
- **US-30.5**: Implementar serviço `CashFlowService.obterResumoMensal(int ano, int mes)` agregando movimentações em `backend/src/main/java/br/edu/ifpb/alumigest/finance/service/CashFlowService.java`
- **US-30.6**: Criar endpoint `GET /api/finance/cash-flow/monthly` no `CashFlowController`
- **US-30.7**: Criar componentes `MonthlyCashFlowCards` e gráfico comparativo mensal em `frontend/src/features/finance/components/`
- **US-30.8**: Criar página `MonthlyCashFlowPage` e registrar rota `/financeiro/fluxo-mensal` no React Router
- **US-30.9**: Criar testes unitários no `CashFlowServiceTest` validando consolidação mensal
- **US-30.10**: Documentar endpoints no OpenAPI/Swagger e adicionar atalho 'Fluxo Mensal' no menu do frontend

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Fluxo de Caixa Mensal | **US-30** | US-30.1 a US-30.6 | US-30.7, US-30.8, US-30.10 | US-30.9 (`CashFlowServiceTest`) |
