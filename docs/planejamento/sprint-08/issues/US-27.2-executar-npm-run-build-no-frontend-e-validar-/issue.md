# [US-27.2] Executar `npm run build` no frontend e validar tipagem estrita

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-27.2`
- **US Pai**: `US-27: Homologação Integrada e Validação da Release 2 (v2.0.0)`
- **Sprint**: Sprint 08 — Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 5: User Story 4 - Homologação Integrada da Release 2 (Priority: P2)`
- **User Story**: [US4]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `Conforme especificação da tarefa`
- **Labels Sugeridas**: `sprint-08`, `release-2`, `stock`, `frontend`, `typescript`, `react`, `user-story-4`, `homologation`

---

## 🎯 Objetivo & Descrição

Executar `npm run build` no frontend e validar tipagem estrita.

### Contexto da Fase / Épico
**Objetivo da User Story**: Validar o ciclo completo da Release 2: Pedido Lock → OPs e QR Code → Romaneio de Corte → Baixa de Estoque e Perdas.

Esta issue faz parte da entrega da **Sprint 8 (Fechamento da Release 2)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `stock`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-08/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-08/data-model.md`) ou contratos (`docs/planejamento/sprint-08/contracts/api-stock.md`)
- [ ] Implementar a alteração necessária em `Conforme especificação da tarefa`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T031` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Executar `mvn clean verify` e `npm run build` com SonarQube Quality Gate aprovado.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-stock.md](../contracts/api-stock.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
