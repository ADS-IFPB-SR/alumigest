# [US-24.13] Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-24.13`
- **US Pai**: `US-24: Gerar Cobrança PIX com QR Code Dinâmico e Copia e Cola`
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 2: User Story 1 - Geração de Cobrança PIX com QR Code (Priority: P1) 🎯 MVP`
- **User Story**: [US1]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `PixPaymentController`
- **Labels Sugeridas**: `release-3`, `pix`, `finance`, `backend`, `java`, `mvp`, `user-story-1`

---

## 🎯 Objetivo & Descrição

Criar endpoint POST /api/payments/pix/generate-for-order/{orderId} no `PixPaymentController` em `backend/src/main/java/br/edu/ifpb/alumigest/finance/controller/PixPaymentController.java`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Gerar cobrança PIX com QR Code dinâmico e código Copia e Cola associados a um pedido.

Esta issue faz parte da entrega da **Sprint 9 (Início da Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `financeDTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-09/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-09/data-model.md`) ou contratos (`docs/planejamento/sprint-09/contracts/api-pix.md`)
- [ ] Implementar a alteração necessária em `PixPaymentController`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T013` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Gerar cobrança de R$ 1.000,00 para o pedido 1 e validar formato do payload EMV e imagem do QR Code.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-pix.md](../contracts/api-pix.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
