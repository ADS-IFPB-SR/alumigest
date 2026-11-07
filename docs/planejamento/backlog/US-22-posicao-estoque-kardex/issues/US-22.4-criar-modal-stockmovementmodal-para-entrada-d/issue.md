# [US-22.4] Criar modal `StockMovementModal` para entrada de materiais em `frontend/src/features/stock/components/StockMovementModal.tsx`

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-22.4`
- **US Pai**: `US-22: Consultar Posição de Estoque e Kardex de Movimentações`
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Fase**: `Phase 4: User Story 3 - Painel de Posição de Estoque no Frontend (Priority: P2)`
- **User Story**: [US3]
- **Sub-área**: `Geral`
- **Execução Paralela**: ❌ Não (Execução sequencial recomendada)
- **Arquivo / Alvo Principal**: `frontend/src/features/stock/components/StockMovementModal.tsx`
- **Labels Sugeridas**: `release-2`, `stock`, `frontend`, `typescript`, `react`, `user-story-3`

---

## 🎯 Objetivo & Descrição

Criar modal `StockMovementModal` para entrada de materiais e compras em `frontend/src/features/stock/components/StockMovementModal.tsx`.

### Contexto da Regra de Negócio Alumiportas
- **Documento Livre de Loja:** O campo de documento/NF (`documentNumber`) aceita qualquer texto livre (pedido de compra da loja, número de recibo, romaneio ou canhoto de entrega), **sem exigir integração ou validação de chave de NF da SEFAZ**.
- **Preço de Compra (Custo de Aquisição):** O campo de custo monetário (`unitCost`) deve possuir label e hint claros: *"Preço de Compra Unitário (Custo Pago)"*, especificando que é o valor que a serralheria pagou ao fornecedor na barra/peça, e **não** o preço de venda final cobrado do cliente.
- Seguir fielmente o protótipo homologado em `docs/planejamento/prototipos/painel-estoque-kardex.html`.

---

## 🛠️ Checklist de Implementação

- [ ] Analisar a especificação funcional atualizada em `docs/planejamento/backlog/US-22-posicao-estoque-kardex/spec.md` (RN-04, RN-05 e RN-06)
- [ ] Implementar `StockMovementModal.tsx` com `react-hook-form` e validação Zod
- [ ] Incluir campos:
  - Seleção do Insumo (`materialId`)
  - Tipo de Movimentação (`movementType`: `PURCHASE_ENTRY` / `MANUAL_ADJUSTMENT`)
  - Documento / Recibo / Pedido da Loja (`documentNumber`, texto livre opcional/sem SEFAZ)
  - Quantidade Recebida (`quantity`, numérica positiva)
  - Preço de Compra Unitário (`unitCost`, monetário com dica explicativa)
  - Observações / Fornecedor (`notes`)
- [ ] Integrar mutação TanStack Query com `POST /api/v1/stock/movements` invalidando queries de `stock` e `orders`
- [ ] Exibir Toast de sucesso e fechar modal automaticamente
- [ ] Garantir acessibilidade (ESC para fechar, foco no primeiro campo) e 100% de conformidade com Oxlint

---

## ✅ Critérios de Aceitação

1. O modal abre a partir do botão superior "Registrar Entrada" e dos botões de linha da tabela de estoque.
2. Não exige nem valida chaves fiscais de NF-e; aceita códigos livres de recibo de loja ou distribuidor.
3. Deixa explícito visualmente que o valor unitário é o custo pago ao fornecedor (preço de compra).
4. Submissão atualiza a tabela de saldos, zera alertas de falta de insumos quando a quantidade supre as O.S. e adiciona a linha correspondente no Kardex.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../spec.md)
- ⚙️ **Plano de Implementação**: [plan.md](../plan.md)
- 🗃️ **Modelo de Dados**: [data-model.md](../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-stock.md](../contracts/api-stock.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../quickstart.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../constitution.md)
