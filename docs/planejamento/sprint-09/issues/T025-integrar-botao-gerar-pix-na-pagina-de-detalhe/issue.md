# [T025] Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO`

## 📌 Metadados da Issue

- **ID da Tarefa**: `T025`
- **Sprint**: Sprint 09 — Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola)
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 4: User Story 3 - Modal PIX Interativo no Frontend (Priority: P1) 🎯 MVP`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `OrderDetailPage.tsx`
- **Labels Sugeridas**: `sprint-09`, `release-3`, `pix`, `finance`, `frontend`, `typescript`, `react`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Integrar botão "Gerar PIX" na página de detalhes do pedido (`OrderDetailPage.tsx`) e destacar o botão "Liberar para Produção" quando o status for `SINAL_PAGO`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Modal com exibição do QR Code, botão de cópia com toast, contador de validade e polling a cada 3 segundos.

Esta issue faz parte da entrega da **Sprint 9 (Início da Release 3)** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture / Package-by-Feature no módulo `finance`, DTOs em Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-09/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-09/data-model.md`) ou contratos (`docs/planejamento/sprint-09/contracts/api-pix.md`)
- [ ] Implementar a alteração necessária em `OrderDetailPage.tsx`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T025` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Abrir modal no frontend, copiar código PIX para a área de transferência e receber notificação visual de pagamento liquidado.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-pix.md](../contracts/api-pix.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
