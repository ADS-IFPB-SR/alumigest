# [US-17.1] Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-17.1`
- **US Pai**: `US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Geral`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- **Labels Sugeridas**: `release-2`, `production`, `backend`, `java`, `pdf`, `labels`

---

## 🎯 Objetivo & Descrição

Criar serviço LabelPdfService usando OpenPDF gerando páginas de 100x50mm para identificação física de cada esquadria a partir dos itens do pedido (OrderItem).

Esta issue faz parte da entrega da **Release 2** do AlumiGest. Deve seguir rigorosamente as diretrizes arquiteturais da Constituição do Projeto (Clean Architecture, Records Java, Bean Validation e commits em PT-BR).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/sprint-06/spec.md`)
- [ ] Verificar os modelos e tipos no modelo de dados (`docs/planejamento/sprint-06/data-model.md`)
- [ ] Implementar a alteração necessária em `backend/src/main/java/br/edu/ifpb/alumigest/production/service/LabelPdfService.java`
- [ ] Garantir que o código compila e segue as diretrizes do Checkstyle/Oxlint
- [ ] Executar validação local conforme o cenário relevante do `quickstart.md`

---

## ✅ Critérios de Aceitação

1. O serviço deve receber um Order e gerar um documento PDF contendo uma página por unidade de peça com todas as especificações nominais legíveis.
2. Nenhum erro de compilação ou regressão deve ser introduzido no projeto.
3. Se for backend, deve compilar com `mvn clean compile` sem warnings bloqueantes.
4. Se for frontend, deve validar com `npm run build` com tipagem estrita do TypeScript.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
