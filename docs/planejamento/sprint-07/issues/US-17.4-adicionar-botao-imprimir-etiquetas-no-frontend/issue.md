# [US-17.4] Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx`) com download via blob

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-17.4`
- **US Pai**: `US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Frontend UI / Ações`
- **Arquivo / Alvo Principal**: `frontend/src/features/orders/pages/OrderDetailPage.tsx`
- **Labels Sugeridas**: `release-2`, `orders`, `frontend`, `react`, `typescript`, `tailwind`

---

## 🎯 Objetivo & Descrição

Adicionar na barra de ações superiores da página de detalhes do pedido (`OrderDetailPage.tsx`) o botão de ação rápida **"Imprimir Etiquetas"** (com ícone de impressora/tag). Ao ser acionado, dispara a requisição binária ao endpoint `GET /api/orders/{id}/labels-pdf`, converte a resposta em um Blob URL e inicia o download ou visualização automática do arquivo com o nome `etiquetas-PED-YYYY-NNNN.pdf`.

---

## 🛠️ Checklist de Implementação

- [ ] Adicionar método `downloadLabelsPdf(orderId: string, orderCode: string): Promise<void>` no serviço `orderApi.ts`
- [ ] Implementar a criação de Blob URL (`window.URL.createObjectURL(new Blob([response.data]))`) e gatilho de download via tag `<a>` temporária
- [ ] Adicionar o botão "Imprimir Etiquetas" no cabeçalho de ações da `OrderDetailPage.tsx`
- [ ] Incluir ícone contextual (`Tag` ou `Printer` da biblioteca `lucide-react`)
- [ ] Gerenciar estado de loading: desabilitar o botão e exibir spinner enquanto o download é preparado
- [ ] Adicionar notificação toast de sucesso via Sonner / Toast hook
- [ ] Tratar cenários de erro da API com toast informando a falha no download

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Frontend passa no build sem erros (`npm run build`).
2. [ ] **Lint & Tipagem**: Zero erros de TypeScript e sem warnings no linter.
3. [ ] **Qualidade de UI/UX**: Botão responsivo, alinhado com o design system Tailwind e com feedback imediato ao clique.
4. [ ] **Valor Funcional**: Clique no botão inicia o download do arquivo de etiquetas térmicas com o nome correto.
5. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos.
6. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em pt-BR.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../../plan.md)
- 🔌 **Contrato de API**: [contracts/api-production.md](../../contracts/api-production.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)
