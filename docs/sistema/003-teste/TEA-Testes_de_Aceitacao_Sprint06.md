# 🧪 TEA — Testes de Aceitação — Sprint 06

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 06 — Conversão de Orçamento em Pedido de Venda, Snapshot Imutável, Gestão de Status e Comprovante (US-13 a US-16) |
| **Período** | 29/09/2026 a 17/10/2026 |
| **Versão** | 2.0 (Baseline B-ALG-v0.6.0-S06-02) |
| **QA Responsável** | Equipe de QA AlumiGest / Herbert Carvalho / Júlio Kennedy |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 06

Validar os critérios de aceitação e a conformidade técnica das entregas do módulo de **Ordens de Serviço e Pedidos de Venda** (Sprint 06):
1. **Conversão de Orçamento em Pedido de Venda (`US-13 #137`):** Transformação formal com invariante 1:1, canal de aprovação e prazo de entrega.
2. **Snapshot Imutável e Lock de Preços (`US-14 #138`):** Deep copy em 3 níveis, congelamento de medidas, acabamentos e tabela de preços, blindando a fábrica contra reajustes futuros do catálogo.
3. **Imutabilidade Cadastral e Estrutural das Esquadrias do Pedido (`US-14.2 #431`):** Suíte automatizada E2E no Cypress comprovando o modo somente leitura, bloqueio de mutações diretas e fluxo exclusivo de renegociação via cancelamento.
4. **Blindagem contra Reajuste Futuro de Preços no Catálogo (`US-14.3 #430`):** Suíte automatizada E2E no Cypress validando persistência do snapshot financeiro mesmo após aumento na tabela de insumos e transição de ciclo de produção.
5. **Gestão de Status e Cancelamento com Justificativa (`US-15 #139`):** Máquina de estados finitos (`CREATED` ➔ `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED` / `CANCELLED`) com auditoria.
6. **Emissão de Comprovante de Pedido em PDF (`US-16 #140`):** Layout timbrado A4 para entrega formal ao cliente.

---

## 2. 📋 Cenários de Teste e Evidências de Execução (BDD / Gherkin)

### TEA-S06-01: Imutabilidade Cadastral e Estrutural das Esquadrias (`US-14.2 #431`)
**Suíte Automatizada**: `frontend/cypress/e2e/orders/us14_2_imutabilidade_esquadrias_pedido.cy.ts`  
**Comando de Execução**: `npm run test:e2e:us14`

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Ausência de botões e ações mutáveis na interface | Pedido aprovado com status `WAITING_PRODUCTION` | Usuário acessa o detalhe do pedido (`/ordens-servico/{id}`) | A interface **não exibe** botões de "Adicionar Item", "Excluir Item" ou "Editar Item", e a tabela não possui ações mutáveis | Cypress E2E ✅ Aprovado |
| 2 | Modo somente leitura para dimensões e especificações | Pedido aprovado contendo esquadrias cadastradas | Inspecionada a tabela de itens de produção | Dimensões (L × A mm), acabamentos (alumínio, vidro, ferragens, abertura) e valores monetários são estáticos; zero elementos `<input>`, `<select>`, `<textarea>` | Cypress E2E ✅ Aprovado |
| 3 | Exclusividade de alteração contratual via Cancelamento (Fluxo Completo) | Pedido ativo aguardando fabricação física | Usuário clica em "Cancelar Ordem de Serviço" | Modal exige justificativa $\ge 10$ caracteres (validação Zod); ao submeter motivo válido, efetiva `PATCH /orders/{id}/cancel` e reflete status `CANCELLED` mantendo itens intactos | Cypress E2E ✅ Aprovado |
| 4 | Blindagem progressiva em Chão de Fábrica | Pedido em corte/usinagem com status `IN_PRODUCTION` | Operador visualiza os detalhes | O botão de cancelamento torna-se restrito e desabilitado com tooltip informativo; itens continuam estritamente protegidos | Cypress E2E ✅ Aprovado |
| 5.1 | Preservação da imutabilidade no status terminal COMPLETED | Pedido finalizado com status `COMPLETED` | Consulta ao documento formalizado | Itens preservam medidas e valores originais do contrato para fins fiscais e de auditoria; ações de edição/cancelamento inexistentes | Cypress E2E ✅ Aprovado |
| 5.2 | Preservação da imutabilidade no status terminal CANCELLED | Pedido cancelado com status `CANCELLED` | Consulta ao documento cancelado | Banner auditável exibe justificativa formal; tabela de esquadrias preservada intacta; zero ações mutáveis | Cypress E2E ✅ Aprovado |
| 6 | Resiliência e escalabilidade com dataset dinâmico via Factory | Pedido gerado dinamicamente via Factory Pattern com itens heterogêneos (com e sem sub-opções) | Renderização do contêiner de itens | A tabela processa e valida todos os itens gerados dinamicamente sob demanda, assegurando modo somente leitura e zero acoplamento a fixtures estáticas | Cypress E2E ✅ Aprovado |

---

### TEA-S06-02: Blindagem contra Reajuste Futuro de Preços no Catálogo (`US-14.3 #430`)
**Suíte Automatizada**: `frontend/cypress/e2e/orders/us14_3_blindagem_reajuste_catalogo.cy.ts`  
**Comando de Execução**: `npm run test:e2e:us14.3`

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Snapshot Financeiro Inicial do Pedido | Ordem de serviço criada com itens totalizando R$ 3.500,00 | Usuário acessa `/ordens-servico/:id` | O card "Resumo Financeiro Congelado" exibe valor bruto e líquido de R$ 3.500,00 e tabela com preços unitários e subtotais corretos | Cypress E2E ✅ Aprovado |
| 2 | Blindagem pós-reajuste inflacionário (+20%) no catálogo | Insumos de perfis de alumínio e vidros sofrem aumento de +20% no catálogo | A ordem de serviço é recarregada ou consultada | O valor contratado permanece rigorosamente em R$ 3.500,00 sem sofrer alteração | Cypress E2E ✅ Aprovado |
| 3 | Integridade do valor congelado na listagem de pedidos | Reajustes de preços aplicados globalmente no catálogo | Usuário navega para a rota `/ordens-servico` | A linha/card da O.S. exibe o montante contratado inalterado de R$ 3.500,00 | Cypress E2E ✅ Aprovado |
| 4 | Consistência documental no download do Comprovante PDF | Usuário visualiza a ordem de serviço blindada | Clica em "Baixar Comprovante PDF" | A requisição `GET /api/orders/{id}/pdf/comprovante` é disparada com sucesso e preserva os valores originais | Cypress E2E ✅ Aprovado |
| 5 | Mutação de produção sem recálculo indevido | Ordem de serviço transita para `IN_PRODUCTION` | Operador clica em "Avançar Produção" | O status atualiza para produção sem disparar mutações de alteração de preços (`PUT /orders/**`), preservando o montante contratado | Cypress E2E ✅ Aprovado |

---

## 3. 🛡️ Resumo da Qualidade e Aprovação Final

| Métrica de Qualidade | Meta | Resultado Obtido | Status |
|---|:---:|:---:|:---:|
| **Suíte Cypress US-14.2** | 100% de sucesso (7/7 cenários) | 7 aprovados (0 falhas) em 16s | ✅ Aprovado |
| **Suíte Cypress US-14.3** | 100% de sucesso (5/5 cenários) | 5 aprovados (0 falhas) em 9s | ✅ Aprovado |
| **Console DevTools (Erros invisíveis)** | 0 erros de runtime / console | 0 erros, 0 exceções não tratadas | ✅ Aprovado |
| **Regressão de Testes Unitários Vitest** | 100% aprovados | 90 arquivos / 748 testes aprovados | ✅ Aprovado |
| **Linter Oxlint** | 0 erros bloqueantes | 0 erros | ✅ Aprovado |
| **Build de Produção (Vite / TypeScript)** | Sucesso | Bundle gerado com sucesso sem erros de tipo | ✅ Aprovado |
| **SonarQube Quality Gate** | New Code $\ge$ 80% | 0 bugs, 0 vulnerabilidades, Gate Verde | ✅ Aprovado |
