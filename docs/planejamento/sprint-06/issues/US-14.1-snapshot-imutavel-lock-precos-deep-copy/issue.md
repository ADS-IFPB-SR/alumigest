# [US-14.1] Snapshot Imutável, Lock de Preços e Tabela de Itens Congelados (Full-Stack)

## 🎯 Objetivo & Valor de Negócio

Blindar financeiramente a fábrica executando clonagem profunda (deep copy) em 3 níveis no momento da conversão, congelando dimensões, opções, tabelas JSONB de perfis/vidros e preços unitários, e exibindo os itens contratados com selo visual de imutabilidade.

---

## 📝 Escopo Técnico

- **Backend (Deep Copy & Snapshots)**:
  - Entidade `OrderItemOption.java` mapeando opções/componentes de cada esquadria.
  - Campos JSONB em `OrderItem.java`: `perfis_snapshot`, `vidros_snapshot`, `componentes_snapshot`.
  - Refatoração da lógica de conversão no `OrderService.converterOrcamentoEmPedido`:
    - Clonagem profunda dos itens: `BudgetItem` ➔ `OrderItem` com replicação de `largura_mm`, `altura_mm`, modelo, cores, vidro, ferragens, `valor_unitario` e `valor_total`.
    - Clonagem das opções: `BudgetItemOption` ➔ `OrderItemOption`.
    - Cálculos estritamente realizados com `BigDecimal` e arredondamento `RoundingMode.HALF_EVEN`.
- **Frontend (Tabela de Itens)**:
  - `frontend/src/features/orders/components/OrderItemsTable.tsx`: Tabela rica de esquadrias contratadas com dimensões, acabamento, quantidade, valores unitários e subtotais, com badge 'Lock de Preço Ativo'.
  - Integração da `OrderItemsTable` na `OrderDetailPage.tsx`.

---

## 🛠️ Checklist de Implementação

- [ ] Mapear entidade JPA `OrderItemOption` e colunas JSONB na `OrderItem`
- [ ] Implementar algoritmo de deep copy em 3 níveis no método `converterOrcamentoEmPedido`
- [ ] Garantir que todos os valores monetários usam `BigDecimal` com escala 2 e `HALF_EVEN`
- [ ] Escrever teste unitário de blindagem contra reajuste futuro do catálogo no backend
- [ ] Criar componente `OrderItemsTable.tsx` no frontend com layout moderno e colunas detalhadas
- [ ] Incluir indicativo visual (badge ou tooltip) de 'Snapshot Imutável' nos preços dos itens
- [ ] Embarcar a `OrderItemsTable` na tela de detalhes `OrderDetailPage.tsx`
- [ ] Escrever testes de componente Vitest para a tabela de itens

---

## ✅ Definition of Done (DoD)

1. [ ] **Compilação**: Código compila sem erros (`mvn clean compile` e `npm run build`).
2. [ ] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test` e `npx vitest run`).
3. [ ] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle / Oxlint.
4. [ ] **Valor Funcional**: Funcionalidade testável de ponta a ponta no navegador (ou verificação de schema/serviço).
5. [ ] **Documentação Inline**: Javadoc / TSDoc nos métodos públicos e classes relevantes.
6. [ ] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos e verificados.
7. [ ] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em português do Brasil (pt-BR).

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 📋 **Lista de Tarefas**: [tasks.md](../../tasks.md)
- 📐 **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../../contracts/api-orders.md)
- ⏱️ **Guia de Estimativa de Horas**: [guia-estimativa-horas.md](../../../guia-estimativa-horas.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 📜 **Constituição do Projeto**: [constitution.md](../../../constitution.md)
