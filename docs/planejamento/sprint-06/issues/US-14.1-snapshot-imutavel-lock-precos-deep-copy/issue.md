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
- **Frontend (Listagem Limpa de Itens de Produção)**:
  - `frontend/src/features/orders/components/OrderItemList.tsx`: Exibição limpa e discreta das esquadrias contratadas com dimensões, acabamento e valores unitários/totais já congelados pelo backend, sem ruído visual ou selos desnecessários de snapshot na UI (decisão refinada via `/grill-me`).
  - Integração limpa do `OrderItemList` na `OrderDetailPage.tsx`.

---

## 🛠️ Checklist de Implementação

- [x] Mapear entidade JPA `OrderItemOption` e colunas JSONB na `OrderItem`
- [x] Implementar algoritmo de deep copy em 3 níveis no método `convertBudgetToOrder`
- [x] Extração resiliente de acabamentos (cor alumínio, vidro, abertura, ferragens) em `OrderItemSnapshotResolver`
- [x] Garantir que todos os valores monetários usam `BigDecimal` com escala 2 e `HALF_EVEN`
- [x] Escrever teste unitário de blindagem contra reajuste futuro do catálogo no backend (`OrderSnapshotLockTest`)
- [x] Escrever testes formais com técnicas de BVA e EP em `OrderItemSnapshotResolverTest`
- [x] Integrar `OrderItemList.tsx` limpo na tela de detalhes `OrderDetailPage.tsx`
- [x] Validar que 100% dos testes unitários e de componentes do frontend (`OrderItemList.test.tsx` e `OrderDetailPage.test.tsx`) passam com sucesso

---

## ✅ Definition of Done (DoD)

1. [x] **Compilação**: Código compila sem erros (`mvn clean compile` e `npm run build`).
2. [x] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test` e `npx vitest run`).
3. [x] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle / Oxlint.
4. [x] **Valor Funcional**: Funcionalidade testável de ponta a ponta no navegador (ou verificação de schema/serviço).
5. [x] **Documentação Inline**: Javadoc / TSDoc nos métodos públicos e classes relevantes.
6. [x] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos e verificados.
7. [x] **Commits Padronizados**: Commits seguindo o padrão Conventional Commits em português do Brasil (pt-BR).

---

## 🐞 Bugs Identificados e Corrigidos no Ciclo de QA

Durante os testes formais e auditoria de regressão da US-14.1, foram identificados e corrigidos 4 bugs de snapshot e interface, catalogados no [RBD — Registro de Bugs e Defeitos](../../../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md):

| Bug ID | Issue | Descrição do Defeito | Commit |
|:---:|:---:|---|:---:|
| **[BUG-024](../../../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md#bug-024)** | #424 | Classificação indevida de película (`FILM`) como vidro sobrescrevendo `tipoVidro` | `c871c5e` |
| **[BUG-025](../../../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md#bug-025)** | #422 | Extrator de puxador falha silenciosamente por divergência de chave (`model` vs `handleType`) | `ccc44e5` |
| **[BUG-026](../../../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md#bug-026)** | #433 | Inversão de precedência no snapshot (catálogo sobrepondo `templateConfig`) e omissão de `slidingMode` | `4e4788c` |
| **[BUG-027](../../../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md#bug-027)** | #421 | Duplicação de índice ordinal `# 1` para as duas primeiras linhas na `OrderItemList` | `c3b47e0` |

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 📋 **Lista de Tarefas**: [tasks.md](../../tasks.md)
- 📐 **Modelo de Dados**: [data-model.md](../../data-model.md)
- 🔌 **Contrato de API**: [contracts/api-orders.md](../../contracts/api-orders.md)
- 🐞 **Registro de Bugs (RBD)**: [RBD-Registro_de_Bugs_e_Defeitos.md](../../../../projeto-001/003-teste/RBD-Registro_de_Bugs_e_Defeitos.md)
- ⏱️ **Guia de Estimativa de Horas**: [guia-estimativa-horas.md](../../../guia-estimativa-horas.md)
- 🚀 **Guia de Validação Rápida**: [quickstart.md](../../quickstart.md)
- 📜 **Constituição do Projeto**: [constitution.md](../../../constitution.md)
