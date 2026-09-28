# [US-39.1] Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-39.1`
- **US Pai**: `US-39: Comprimir Imagens no Dispositivo e Otimizar Performance Web`
- **Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
- **Fase**: `Phase 4: User Story 3 - Compressão de Imagens no Cliente e Otimizações (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/features/pwa/hooks/useImageCompressor.ts`
- **Labels Sugeridas**: `release-3`, `pwa`, `offline`, `performance`, `frontend`, `typescript`, `pwa`, `image-compression`, `user-story-3`, `optimization`

---

## 🎯 Objetivo & Descrição

Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`.

### Contexto da Fase / Épico
**Objetivo da User Story**: Comprimir fotos no celular antes do envio para ~300KB e otimizar bundle frontend.

Esta issue faz parte da entrega da **Release 3** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (IndexedDB com Dexie, PWA com Vite, compressão no cliente e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-14/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-14/data-model.md`) ou contratos (`docs/planejamento/sprint-14/contracts/api-sync.md`)
- [ ] Implementar a alteração necessária em `frontend/src/features/pwa/hooks/useImageCompressor.ts`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. A funcionalidade descrita em `T016` deve estar completamente implementada no arquivo alvo.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.
5. **Validação Específica**: Fazer upload de foto pesada e constatar redução de tamanho para < 400KB com preservação de nitidez.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-sync.md](../contracts/api-sync.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
