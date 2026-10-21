# [US-14.3] Testes E2E — Blindagem contra Reajuste Futuro de Preços no Catálogo

**Issue GitHub**: [#430](https://github.com/ADS-IFPB-SR/alumigest/issues/430)  
**Parent US**: `US-14: Snapshot Imutável e Lock de Preços do Pedido` ([#138](https://github.com/ADS-IFPB-SR/alumigest/issues/138))  
**Sprint**: Sprint 06 | **Duração Estimada**: ~3h | **Tipo**: Testes de Sistema / E2E  
**Branch**: `feat/us-14.3-blindagem-reajuste-precos-catalogo-430`

---

## 🎯 Objetivo de Negócio

Validar via testes automatizados de ponta a ponta (E2E no Cypress) a **blindagem financeira e a imutabilidade do snapshot de pedidos de venda**, assegurando que reajustes normais na tabela de preços do catálogo (perfis de alumínio, componentes, acessórios e chapas de vidro) não retroajam e não alterem o montante contratado dos pedidos já formalizados.

O valor de negócio está em garantir segurança jurídica, previsibilidade de fluxo de caixa e proteção contra flutuações de custos de insumos após o fechamento comercial com o cliente.

---

## 🏗️ Escopo Técnico

- **Suíte Cypress E2E**: `frontend/cypress/e2e/orders/us14_3_blindagem_reajuste_catalogo.cy.ts`.
- **Componentes Enriquecidos com `data-testid`**:
  - `OrderFinancialSummaryCard.tsx`: atributos `financial-summary-gross` e `financial-summary-net`.
  - `OrderItemList.tsx`: atributos `item-dimensions`, `item-specs`, `item-quantity`, `item-unit-price` e `item-total-price`.
- **Configuração de Scripts**:
  - `package.json`: script rápido `npm run test:e2e:us14.3`.
  - `cypress.config.ts`: execução leve (`video: false`, `screenshotOnRunFailure: false`).
- **Cenários BDD Cobertos**:
  1. Carregamento de pedido contratado de R$ 3.500,00 e conferência do snapshot dos itens.
  2. Aplicação de reajuste de +20% no catálogo e validação da imutabilidade na tela de detalhes da O.S.
  3. Validação de consistência do valor de R$ 3.500,00 na listagem geral de ordens de serviço (`/ordens-servico`).
  4. Validação da integridade documental no download do Comprovante de Pedido de Venda em PDF.

---

## ✅ Checklist de Implementação (Definition of Done)

- [x] Criar suíte E2E no Cypress direcionada à blindagem e imutabilidade financeira de pedidos (`us14_3_blindagem_reajuste_catalogo.cy.ts`).
- [x] **Cenário 1**: Criar/navegar para pedido de venda com itens e valores específicos (valor total de R$ 3.500,00).
- [x] **Cenário 2**: Acessar/simular módulo de catálogo com reajuste de preços (+20% em perfis e vidros) e confirmar que o pedido permanece em R$ 3.500,00.
- [x] **Cenário 3**: Acessar listagem de ordens de serviço (`/ordens-servico`) e validar que o total exibido permanece rigorosamente inalterado.
- [x] **Cenário 4**: Validar disparo de download do Comprovante do Pedido em PDF mantendo os dados contratuais congelados.
- [x] **Cenário 5**: Validar mutação legítima de ciclo de vida (avanço para `IN_PRODUCTION`) garantindo preservação do lock financeiro e zero disparos de alteração de preços.
- [x] Adicionar seletores semânticos `data-testid` em `OrderFinancialSummaryCard.tsx` e `OrderItemList.tsx`.
- [x] Adicionar script `test:e2e:us14.3` no `package.json`.
- [x] Documentar resultados dos testes de aceitação com as evidências do Cypress e gravação de sessão.
- [x] Verificar a execução e estabilidade via `npx cypress run` (5/5 passing, 0 falhas).

---

## 🧪 Evidências de Execução

```text
  US-14.3 / #430: Testes E2E — Blindagem contra Reajuste Futuro de Preços no Catálogo
    √ Cenário 1: Navegação para a ordem de serviço e validação do snapshot financeiro inicial (R$ 3.500,00) (2995ms)
    √ Cenário 2: Reajuste futuro de +20% no catálogo e blindagem estrita dos valores unitários e totais do pedido (1079ms)
    √ Cenário 3: Integridade do valor congelado na listagem geral de ordens de serviço (/ordens-servico) (1062ms)
    √ Cenário 4: Blindagem e consistência no download do comprovante oficial em PDF (1140ms)
    √ Cenário 5: Mutação de ciclo de vida e garantia de preservação do lock financeiro (1326ms)

  5 passing (8s)
```
