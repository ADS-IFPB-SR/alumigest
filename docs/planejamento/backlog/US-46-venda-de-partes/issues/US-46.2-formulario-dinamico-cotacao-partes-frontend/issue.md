# [US-46.2] Formulário Dinâmico de Cotação de Partes no AlumiGest UI (Frontend)

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.2`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m² e Alumínio em Metro Linear)`
- **Release**: Backlog Comercial & Estoque
- **Sub-área**: `Frontend`
- **Execução Paralela**: ⚠️ Sim (Pode ser iniciada utilizando contratos de API mockados a partir de `US-46.1`)
- **Arquivo / Alvo Principal**: `frontend/src/modules/part-sales/` (`PartSaleFormPage.tsx`, `PartSaleItemGrid.tsx`, `PartSaleSummaryCard.tsx`)
- **Labels Sugeridas**: `frontend`, `react`, `typescript`, `tailwind`, `tanstack-query`, `ui`, `design-system`

---

## 🎯 Objetivo & Descrição

Desenvolver uma interface responsiva, dinâmica e reativa integrada ao Design System AlumiGest (React 19 / Tailwind CSS), que permita aos consultores comerciais adicionar e configurar itens de vidro (sob medida em m²) e perfis de alumínio (metro linear) dinamicamente, consumindo o backend para precificação em tempo real sem duplicar lógica de negócio na camada de apresentação.

Esta issue faz parte da **US-46** do AlumiGest. Deve seguir estritamente o princípio arquitetural que proíbe o acoplamento de regras de precificação contábil ou cálculo de perda no frontend: toda a determinação de metragens faturáveis e valores é obtida via chamadas assíncronas ao backend (`POST /api/v1/part-sales/calculate-item`).

---

## 🛠️ Checklist de Implementação

- [ ] Criar tipos TypeScript estritos em `frontend/src/modules/part-sales/types/partSale.types.ts` espelhando os contratos de DTOs do backend.
- [ ] Criar serviço de API com Axios e React Query (`usePartSalesApi.ts` / `partSalesApi.ts`) para os endpoints de pré-cálculo e submissão.
- [ ] Criar hook customizado `usePartCalculation` com debounce (ex.: 300ms) para consultar a API conforme o usuário altera dimensões e quantidades.
- [ ] Desenvolver o componente `PartSaleItemGrid.tsx`:
  - Seletor de tipo de insumo (Vidro ou Alumínio).
  - Campos dimensionais compactos com divisores verticais (`Largura (mm) | Altura/Comprimento (mm) | Quantidade`).
  - Badges visuais estilizados conforme Design System:
    - Vidro: `bg-cyan-500/10 text-cyan-400 border-cyan-500/20`
    - Alumínio: `bg-amber-500/10 text-amber-400 border-amber-500/20` com indicação de Metro Linear (m).
- [ ] Desenvolver o componente `PartSaleSummaryCard.tsx`:
  - Card flutuante fixado à direita com layout `bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg`.
  - Exibição de subtotal, descontos, total faturável e botões de ação ("Salvar Rascunho", "Aprovar Venda").
- [ ] Implementar validação de formulário com feedback instantâneo:
  - Borda `border-red-500` e mensagem explicativa abaixo do campo no evento `onBlur` caso dimensões ou quantidades sejam $\le 0$.
  - Desabilitação de botões de aprovação caso haja campos inválidos ou pendentes de cálculo.
- [ ] Configurar rota `/vendas/partes/nova` e atalho de navegação no menu lateral do sistema.

---

## ✅ Critérios de Aceitação

1. A seleção de insumo de vidro e preenchimento de dimensões deve atualizar a metragem calculada e o subtotal via API em tempo real.
2. A seleção de perfis de alumínio deve exibir o badge correspondente e a metragem total calculada.
3. Toda e qualquer regra de arredondamento, fração mínima e fator de perda deve ser delegada ao backend, mantendo o frontend estritamente desacoplado de regras contábeis.
4. Campos com valores incorretos devem exibir indicação visual de erro imediata no evento `onBlur`.
5. A tela deve passar na verificação de tipagem do TypeScript (`npm run build`) sem erros.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🎨 **Componentes & UI**: `frontend/src/components/`
