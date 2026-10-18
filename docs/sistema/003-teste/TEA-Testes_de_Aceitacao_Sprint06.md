# 🧪 TEA — Testes de Aceitação — Sprint 06

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 06 — Pedidos de Venda, Lock de Preços e Comprovante Oficial (US-13, US-14, US-15 e US-16) |
| **Período** | 29/09/2026 a 12/10/2026 (14 dias) |
| **Versão** | 2.0 (Baseline B-ALG-v0.6.0-S06-01) |
| **QA Responsável** | Equipe de QA AlumiGest / Herbert Carvalho / Júlio Kennedy |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 06

Validar os critérios de aceitação e a conformidade técnica das entregas de Pedidos de Venda da Sprint 06:
1. **Conversão de Orçamento em Pedido de Venda (`US-13 #137`):** Transformação formal de propostas comerciais em pedidos vinculantes com geração de código sequencial auditável e vinculação relacional.
2. **Snapshot Imutável e Lock de Preços do Pedido (`US-14 #138`):** Clonagem profunda (*deep copy*) em três níveis, tabela de itens de produção congelada e blindagem contra reajustes futuros do catálogo de materiais.
3. **Gestão de Status e Cancelamento Formal (`US-15 #139`):** Máquina de estados (`CREATED` ➔ `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED` / `CANCELLED`) com justificativa obrigatória e bloqueio estrito em produção.
4. **Comprovante do Pedido de Venda em PDF (`US-16 #140`):** Emissão institucional timbrada em PDF A4 com dados contratuais congelados.

---

## 2. 📋 Cenários de Teste e Evidências de Execução (BDD / Gherkin)

### TEA-S06-02: Blindagem contra Reajuste Futuro de Preços no Catálogo (`US-14.3 #430`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Snapshot Financeiro Inicial do Pedido | Ordem de serviço criada com itens totalizando R$ 3.500,00 | Usuário acessa `/ordens-servico/:id` | O card "Resumo Financeiro Congelado" exibe valor bruto e líquido de R$ 3.500,00 e tabela com preços unitários e subtotais corretos | `us14_3_blindagem_reajuste_catalogo.cy.ts` ✅ Aprovado |
| 2 | Blindagem pós-reajuste inflacionário (+20%) no catálogo | Insumos de perfis de alumínio e vidros sofrem aumento de +20% no catálogo | A ordem de serviço é recarregada ou consultada | O valor contratado permanece rigorosamente em R$ 3.500,00 sem sofrer alteração | `us14_3_blindagem_reajuste_catalogo.cy.ts` ✅ Aprovado |
| 3 | Integridade do valor congelado na listagem de pedidos | Reajustes de preços aplicados globalmente no catálogo | Usuário navega para a rota `/ordens-servico` | A linha/card da O.S. exibe o montante contratado inalterado de R$ 3.500,00 | `us14_3_blindagem_reajuste_catalogo.cy.ts` ✅ Aprovado |
| 4 | Consistência documental no download do Comprovante PDF | Usuário visualiza a ordem de serviço blindada | Clica em "Baixar Comprovante PDF" | A requisição `GET /api/orders/{id}/pdf/comprovante` é disparada com sucesso e preserva os valores originais | `us14_3_blindagem_reajuste_catalogo.cy.ts` ✅ Aprovado |

---

## 3. 🛡️ Resumo da Qualidade e Aprovação Final

- **Cypress E2E**: 4/4 cenários passando (100% de sucesso em 6s).
- **Testes Unitários (Vitest)**: 11/11 arquivos e 93 testes passando na camada de pedidos.
- **Linter (Oxlint)**: 0 erros.
- **Build de Produção (Vite / TypeScript)**: Sucesso sem advertências de tipagem.
- **SonarQube Quality Gate**: Em conformidade.
