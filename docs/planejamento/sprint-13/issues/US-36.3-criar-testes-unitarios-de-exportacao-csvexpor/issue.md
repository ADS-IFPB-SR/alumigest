# [US-36.3] Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-36.3`
- **US Pai**: `US-36: Exportar Relatórios Executivos em PDF e Planilhas CSV/Excel`
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 4: User Story 3 - Relatórios Gerenciais e Exportação (PDF e CSV) (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `release-3`, `analytics`, `dre`, `dashboard`, `backend`, `java`, `testing`, `csv`, `export`, `pdf`, `financial-reports`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Criar testes unitários de exportação `CsvExportServiceTest` e `AnalyticsPdfReportServiceTest`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Exportação de dados tabulares em CSV para Excel e relatório DRE em PDF via OpenPDF.

Esta issue faz parte da entrega da **Release 3** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `analyticsDTOs em Records Java, otimização de consultas e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-13/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-13/data-model.md`) ou contratos (`docs/planejamento/sprint-13/contracts/api-analytics.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T017` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Baixar CSV e validar abertura sem erros de codificação no Excel.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-analytics.md](../contracts/api-analytics.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
