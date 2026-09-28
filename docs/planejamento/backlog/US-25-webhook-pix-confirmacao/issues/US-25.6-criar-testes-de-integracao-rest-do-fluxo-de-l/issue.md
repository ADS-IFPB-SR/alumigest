# [US-25.6] Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-25.6`
- **US Pai**: `US-25: Confirmar Pagamento PIX via Webhook com Liberação Automática`
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 3: User Story 2 - Confirmação Automática de Pagamento e Liberação (Priority: P1) 🎯 MVP`
- **User Story**: [US2]
- **Sub-área**: `Geral`
- **Execução Paralela**: ✅ Sim (Pode ser executada em paralelo com outras tasks [P])
- **Arquivo / Alvo Principal**: `PixPaymentControllerIntegrationTest`
- **Labels Sugeridas**: `release-3`, `pix`, `finance`, `backend`, `java`, `testing`, `mvp`, `user-story-2`

---

## 🎯 Objetivo & Descrição

Criar testes de integração REST do fluxo de liquidação PIX no `PixPaymentControllerIntegrationTest`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Liquidar cobrança PIX via webhook/simulação, atualizar o status do pedido para SINAL_PAGO e exibir confirmação no frontend.

Esta issue faz parte da entrega da **Sprint 9 (Início da Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `financeDTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-09/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-09/data-model.md`) ou contratos (`docs/planejamento/sprint-09/contracts/api-pix.md`)
- [ ] Implementar a alteração necessária em `PixPaymentControllerIntegrationTest`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T020` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Simular liquidação da cobrança e constatar atualização em tempo real no frontend via polling.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-pix.md](../contracts/api-pix.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
