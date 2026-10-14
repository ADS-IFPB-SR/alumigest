# Especificação Funcional: US-36 — Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel

**Identificador**: `US-36`  
**Issue GitHub**: [#161](https://github.com/ADS-IFPB-SR/alumigest/issues/161)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como gestor financeiro ou proprietário da Alumiportas, desejo exportar relatórios executivos de vendas e demonstrativos de resultados (DRE) em formato PDF A4 institucional e planilhas CSV compatíveis com Microsoft Excel e Google Sheets (com BOM UTF-8 e delimitador `;`), viabilizando auditorias contábeis externas, conciliações tributárias e apresentações para sócios.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Exportação de Planilha CSV de Vendas com Codificação UTF-8 e BOM**
  - **Dado que** o gestor clica em "Exportar CSV" na tela de relatórios ou vendas,
  - **Quando** o endpoint `GET /api/v1/analytics/reports/sales-csv` responde com stream de texto,
  - **Então** o arquivo gerado contém o marcador Byte Order Mark (`\uFEFF`), delimitador ponto e vírgula (`;`),
  - **E** formata valores monetários com vírgula decimal, abrindo perfeitamente no Excel sem caracteres especiais corrompidos (mojibake).

- [ ] **Cenário 2: Exportação do Demonstrativo DRE em PDF A4 Institucional**
  - **Dado que** o gestor visualiza o DRE Gerencial do mês,
  - **Quando** aciona o botão "Exportar PDF Oficial",
  - **Então** o serviço `AnalyticsPdfReportService` compila o demonstrativo com cabeçalho da Alumiportas, numeração de páginas, tabela zebrada de receitas/custos e resumo executivo de rentabilidade,
  - **E** o navegador inicia o download do arquivo `DRE-YYYY-MM.pdf`.

- [ ] **Cenário 3: Filtragem Prévia Aplicada aos Arquivos Exportados**
  - **Dado que** o usuário aplicou filtros por período (`startDate` e `endDate`) ou cliente na tela,
  - **Quando** solicita a exportação em qualquer formato (PDF ou CSV),
  - **Então** os arquivos gerados contêm estritamente os dados filtrados, exibindo no topo do documento os critérios de filtro utilizados.

- [ ] **Cenário 4: Download Assíncrono com Feedback de Progresso**
  - **Dado que** o volume de registros para exportação é volumoso (ex: consolidação anual),
  - **Quando** o usuário clica em exportar,
  - **Então** o botão entra em estado de carregamento com spinner ("Gerando relatório..."),
  - **E** desabilita cliques repetidos até o término do download.

- [ ] **Cenário 5: Tratamento de Exportação em Período sem Dados**
  - **Dado que** o período selecionado não possui lançamentos,
  - **Quando** o usuário tenta exportar,
  - **Então** o sistema emite um Toast informativo ("Nenhum dado encontrado para o período selecionado") e não gera arquivo vazio.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Padrão de CSV para Excel em pt-BR):** Obrigatoriedade de inclusão de BOM UTF-8 e separador de colunas `;`. Cabeçalhos das colunas em português para consumo do usuário final.
- **RN-02 (Imutabilidade e Rastreabilidade):** Documentos PDF exportados devem estampar data, hora de emissão e nome/login do operador solicitante no rodapé para fins de auditoria.
- **RN-03 (Diretriz de Idioma em Variáveis):** Serviços, DTOs e endpoints em inglês: `CsvExportService`, `AnalyticsPdfReportService`, `SalesReportItemDto`, `DreExportDto`, `startDate`, `endDate`, `exportedAt`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / OpenPDF / Apache Commons CSV)
- **Endpoints:**
  - `GET /api/v1/analytics/reports/sales-csv?startDate=...&endDate=...` (stream CSV com header `Content-Type: text/csv; charset=UTF-8`)
  - `GET /api/v1/analytics/reports/dre-pdf?month=10&year=2026&regime=ACCRUAL` (stream PDF com header `Content-Type: application/pdf`)

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `ReportExportButtons.tsx` (grupo de botões com dropdown "Exportar como PDF" e "Exportar como CSV")
  - `ReportsPage.tsx` (`/gestao/relatorios`)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `CsvExportServiceTest` validando presença do byte BOM UTF-8 e escaping de strings contendo ponto e vírgula ou aspas.
- [ ] Teste unitário de `AnalyticsPdfReportServiceTest` validando geração idônea do PDF sem vazamento de memória.
- [ ] Validação do arquivo CSV baixado aberto no Excel e LibreOffice Calc.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-36.1](issues/US-36.1-implementar-servico-analyticspdfreportservice/issue.md) | Implementar serviço `AnalyticsPdfReportService` gerando PDF A4 do DRE em `backend/src/main/java/br/edu/ifpb/alumigest/analytics/service/AnalyticsPdfReportService.java` | 🔲 No Backlog |
| [US-36.2](issues/US-36.2-criar-endpoint-get-api-analytics-reports-sale/issue.md) | Criar endpoint GET `/api/v1/analytics/reports/sales-csv` e GET `/api/v1/analytics/reports/dre-pdf` no `AnalyticsReportController` | 🔲 No Backlog |
| [US-36.3](issues/US-36.3-criar-testes-unitarios-de-exportacao-csvexpor/issue.md) | Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest` | 🔲 No Backlog |
| [US-36.4](issues/US-36.4-adicionar-botoes-de-exportar-csv-e-exportar-p/issue.md) | Adicionar botões de "Exportar CSV" e "Exportar PDF" nas telas de relatórios do frontend | 🔲 No Backlog |
| [US-36.5](issues/US-36.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US-36.6](issues/US-36.6-adicionar-menu-gestao-relatorios-no-frontend/issue.md) | Adicionar menu "Gestão & Relatórios" no frontend | 🔲 No Backlog |
| [US-36.7](issues/US-36.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste da release | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-36-exportacao-relatorios-executivos`
