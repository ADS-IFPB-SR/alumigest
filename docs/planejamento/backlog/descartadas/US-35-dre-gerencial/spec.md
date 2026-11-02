# Especificação Funcional: US-35 — Apurar DRE Gerencial (Competência e Caixa)

**Identificador**: `US-35`  
**Issue GitHub**: [#160](https://github.com/ADS-IFPB-SR/alumigest/issues/160)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como diretor financeiro ou gestor geral da Alumiportas, desejo apurar o Demonstrativo do Resultado do Exercício (DRE Gerencial) mensal com alternância entre Regime de Competência e Regime de Caixa, discriminando receitas brutas, descontos concedidos, custos de insumos (perfis de alumínio, vidros e acessórios), margem de contribuição e resultado operacional líquido, viabilizando a análise precisa da lucratividade da vidraçaria/serralheria.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Apuração do DRE no Regime de Competência**
  - **Dado que** o diretor acessa a página `DrePage` (`/gestao/dre`),
  - **Quando** seleciona o mês/ano e o regime `regime = ACCRUAL`,
  - **Então** o sistema estrutura o demonstrativo considerando todos os pedidos faturados no período,
  - **E** exibe hierarquicamente:
    - **(+) Receita Bruta de Vendas** (`grossRevenue`)
    - **(-) Descontos Concedidos** (`discounts`)
    - **(=) Receita Líquida** (`netRevenue`)
    - **(-) Custo dos Produtos Vendidos (CPV)** (`costOfGoodsSold`)
    - **(=) Margem de Contribuição** (`contributionMargin` em R$ e % sobre a receita líquida)
    - **(=) Lucro / Resultado Operacional** (`operatingProfit`).

- [ ] **Cenário 2: Alternância Dinâmica para Regime de Caixa**
  - **Dado que** o gestor deseja visualizar a liquidez financeira real do mês,
  - **Quando** aciona o toggle para `regime = CASH`,
  - **Então** o componente `DreReportTable` recarrega os dados computando estritamente os recebimentos liquidados (`paidAmount`) contra despesas/custos quitados no período,
  - **E** exibe a conciliação entre o lucro contábil e a sobra de caixa efetiva.

- [ ] **Cenário 3: Detalhamento Analítico do Custo dos Produtos Vendidos (CPV)**
  - **Dado que** o gestor clica na linha do Custo dos Produtos Vendidos (CPV),
  - **Quando** a linha analítica é expandida,
  - **Então** o sistema discrimina os custos por categoria de insumo:
    - Perfis de Alumínio (barras cortadas e perda de retalhos)
    - Vidros Temperados/Laminados (área em $m^2$)
    - Componentes e Acessórios (roldanas, fechaduras, escovas, silicones).

- [ ] **Cenário 4: Indicadores de Margem e Rentabilidade Percentual**
  - **Dado que** os cálculos contábeis foram consolidados pelo `DreCalculationService`,
  - **Quando** o relatório é renderizado,
  - **Então** exibe badges de destaque com o percentual de Margem de Contribuição e Margem Operacional Líquida,
  - **E** sinaliza em verde se a margem for superior à meta cadastrada (ex: $\ge 35\%$) ou em âmbar se estiver abaixo.

- [ ] **Cenário 5: Controle Estrito de Permissão e Acesso Administrativo**
  - **Dado que** um usuário com perfil `OPERATOR`, `SELLER` ou `INSTALLER` tenta acessar `/gestao/dre` ou o endpoint `/api/v1/analytics/dre`,
  - **Quando** a requisição é interceptada pelo Spring Security,
  - **Então** o acesso é bloqueado retornando HTTP 403 Forbidden, garantindo o sigilo de margens e lucratividade.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Segregação de Regimes Contábeis):** O Regime de Competência (`ACCRUAL`) utiliza a data de fechamento do pedido (`Order.approvedAt`). O Regime de Caixa (`CASH`) utiliza a data de liquidação da parcela (`AccountReceivable.paymentDate`).
- **RN-02 (Precisão Matemática):** Todos os valores monetários e percentuais devem ser processados utilizando `BigDecimal` com arredondamento `HALF_UP`.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e serviços em inglês: `DreReportResponse`, `grossRevenue`, `discounts`, `netRevenue`, `costOfGoodsSold`, `contributionMargin`, `operatingProfit`, `accountingRegime` (`ACCRUAL`, `CASH`).

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/analytics/dre?month=10&year=2026&regime=ACCRUAL` (exige `hasRole('ADMIN')`)
- **DTO:** `DreReportResponse` (record Java 21)
- **Serviço:** `DreCalculationService.java`

### Frontend (React 19 / TanStack Query / Tailwind)
- **Páginas & Componentes:**
  - `DrePage.tsx` (`/gestao/dre`)
  - `DreReportTable.tsx` (tabela hierárquica expansível com linhas pai/filho)
  - `DreRegimeToggle.tsx` (seletor Competência vs Caixa)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `DreCalculationServiceTest` validando equações contábeis com massa de dados de teste (Receita Líquida = Bruta - Descontos; Margem = Líquida - CPV).
- [ ] Teste de segurança Spring Security validando bloqueio com HTTP 403 para usuários não-ADMIN.
- [ ] Validação visual e expansão dos itens de custo na interface.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (5 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-35.1](issues/US-35.1-implementar-servico-drecalculationservice-cal/issue.md) | Implementar serviço `DreCalculationService.calcularDre(int month, int year, String regime)` em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/DreCalculationService.java` | 🔲 No Backlog |
| [US-35.2](issues/US-35.2-criar-endpoint-get-api-analytics-dre-no-analy/issue.md) | Criar endpoint GET `/api/v1/analytics/dre` no `AnalyticsDashboardController` com validação de permissão administrativa | 🔲 No Backlog |
| [US-35.3](issues/US-35.3-criar-testes-unitarios-do-drecalculationservi/issue.md) | Criar testes unitários do `DreCalculationServiceTest` | 🔲 No Backlog |
| [US-35.4](issues/US-35.4-criar-componente-drereporttable-com-toggle-co/issue.md) | Criar componente `DreReportTable` com toggle Competência/Caixa no frontend | 🔲 No Backlog |
| [US-35.5](issues/US-35.5-criar-pagina-drepage-e-registrar-rota-gestao-/issue.md) | Criar página `DrePage` e registrar rota `/gestao/dre` no React Router | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-35-dre-gerencial`
