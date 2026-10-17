# [US-14.2] Testes E2E — Imutabilidade Cadastral e Estrutural das Esquadrias do Pedido

**Issue GitHub**: [#431](https://github.com/ADS-IFPB-SR/alumigest/issues/431)  
**Módulo**: Orders (Pedidos de Venda)  
**Tipo**: Testes de Sistema / E2E (Cypress)  
**Prioridade**: P1  
**Sprint**: 06  

---

## 🎯 Objetivo & Valor de Negócio

Validar via testes E2E (Cypress) que um pedido de venda aprovado se torna estrutural e cadastralmente imutável em relação aos seus itens.

O valor de negócio está em garantir a conformidade, a segurança e a integridade dos contratos (pedidos). Isso evita modificações indevidas, acidentais ou maliciosas (como troca de medidas ou adição/remoção de esquadrias) após o fechamento com o cliente. Garante-se assim que o sistema force a regra de negócio correta: qualquer alteração contratual exige o cancelamento formal e a renegociação por meio de um novo orçamento.

---

## 📝 Escopo Técnico

* **Suíte E2E Cypress**: Implementação do arquivo `frontend/cypress/e2e/orders/us14_2_imutabilidade_esquadrias_pedido.cy.ts`.
* **Cenários BDD**:
  1. **Navegação & Ausência de Componentes de Edição**: Verificação de que os botões de ação ("Adicionar Item", "Excluir Item", "Editar Item") não existem na interface.
  2. **Modo Somente Leitura**: Validação de que dimensões (`larguraMm × alturaMm`), especificações (vidros, perfis, aberturas, ferragens) e valores financeiros não possuem campos editáveis (`input`, `select`, `textarea`, `contenteditable`).
  3. **Ação Exclusiva de Renegociação (Fluxo Completo)**: Validação de que a única ação de modificação contratual disponível é o botão de cancelamento (`btn-cancel-order`), acionando o `CancelOrderModal`, testando validação de fronteira (<10 caracteres) e executando o cancelamento formal bem-sucedido via `PATCH /orders/{id}/cancel` com transição imediata para `CANCELLED` e persistência documental das esquadrias.
  4. **Blindagem Progressiva em Produção (`IN_PRODUCTION`)**: Validação de que em produção o cancelamento é bloqueado (`btn-cancel-order-restricted` desabilitado com tooltip).
  5. **Integridade em Status Terminais (`COMPLETED` e `CANCELLED`)**: Validação de que os itens preservam a fidelidade documental sem possibilidade de mutação.
* **Contrato de Testabilidade**:
  - `data-testid="btn-cancel-order"` e `data-testid="btn-cancel-order-restricted"` em `OrderDetailHeader.tsx`.
  - `data-testid="order-item-dimensions"`, `order-item-specs"`, `order-item-quantity"`, `order-item-unit-price"` e `order-item-total-price"` em `OrderItemList.tsx`.
* **Script npm**: Comando `npm run test:e2e:us14` no `frontend/package.json`.

---

## 🛠️ Checklist de Implementação

- [x] Criar suíte E2E no Cypress direcionada ao bloqueio de edições em pedidos gerados e aprovados (`frontend/cypress/e2e/orders/us14_2_imutabilidade_esquadrias_pedido.cy.ts`).
- [x] Cenário: Navegar para a tela de detalhes de um pedido que já possui status de gerado/aprovado.
- [x] Cenário: Validar que a interface não exibe ou mantém desabilitados os botões de "Adicionar Item" e "Excluir Item".
- [x] Cenário: Validar que todos os campos de medidas (largura, altura) e especificações (vidros, cores, opções) estão em modo de "somente leitura" (readonly/disabled).
- [x] Cenário: Verificar que a única ação de alteração de estado disponível para o documento é o "Cancelamento" (para posterior renegociação).
- [x] Cenário Adicional: Validar blindagem progressiva no status `IN_PRODUCTION` e persistência documental em `COMPLETED` e `CANCELLED`.
- [x] Adicionar `data-testid`s semânticos nos componentes `OrderDetailHeader.tsx` e `OrderItemList.tsx`.
- [x] Configurar script `"test:e2e:us14"` no `frontend/package.json`.
- [x] Documentar resultados dos testes de aceitação com as evidências do Cypress.
- [x] Verificar a execução e estabilidade (flakiness) via `npm run test:e2e:us14`.

---

## ✅ Definition of Done (DoD)

1. [x] **Suíte E2E Cypress**: 5 cenários BDD implementados e aprovados com 100% de sucesso.
2. [x] **Zero Regressão**: Testes unitários do frontend (`npm test`) continuam passando sem falhas.
3. [x] **Qualidade Estática**: 0 erros no linter (`npm run lint`).
4. [x] **Compilação**: Build do frontend (`npm run build`) executado com sucesso.
5. [x] **Rastreabilidade**: Documento da issue registrado e vinculado à Issue GitHub #431 e ao Cenário 3 da US-14 na Sprint 06.
