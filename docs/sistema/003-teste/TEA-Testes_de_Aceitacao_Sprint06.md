# 🧪 TEA — Testes de Aceitação — Sprint 06

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 06 — Conversão de Orçamento em Pedido de Venda, Snapshot Imutável e Gestão de Status (US-13 a US-16) |
| **Data da Homologação** | 17/10/2026 |
| **Versão** | 1.0 (Baseline B-ALG-v0.6.0-S06) |
| **QA Responsável** | Equipe de QA AlumiGest |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 06

Validar os critérios de aceitação e a conformidade técnica das entregas do módulo de **Ordens de Serviço e Pedidos de Venda** (Sprint 06):
1. **Conversão de Orçamento em Pedido de Venda (`US-13 #137`):** Transformação formal com invariante 1:1, canal de aprovação e prazo de entrega.
2. **Snapshot Imutável e Lock de Preços (`US-14 #138`):** Deep copy em 3 níveis, congelamento de medidas, acabamentos e tabela de preços, blindando a fábrica contra reajustes futuros do catálogo.
3. **Imutabilidade Cadastral e Estrutural das Esquadrias do Pedido (`US-14.2 #431`):** Suíte automatizada E2E no Cypress comprovando o modo somente leitura, bloqueio de mutações diretas e fluxo exclusivo de renegociação via cancelamento.
4. **Gestão de Status e Cancelamento com Justificativa (`US-15 #139`):** Máquina de estados finitos (`CREATED` ➔ `WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED` / `CANCELLED`) com auditoria.
5. **Emissão de Comprovante de Pedido em PDF (`US-16 #140`):** Layout timbrado A4 para entrega formal ao cliente.

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

## 3. 🛡️ Resumo da Qualidade e Aprovação Final

| Métrica de Qualidade | Meta | Resultado Obtido | Status |
|---|:---:|:---:|:---:|
| **Suíte Cypress US-14.2** | 100% de sucesso (7/7 cenários) | 7 aprovados (0 falhas) em 16s | ✅ Aprovado |
| **Console DevTools (Erros invisíveis)** | 0 erros de runtime / console | 0 erros, 0 exceções não tratadas | ✅ Aprovado |
| **Regressão de Testes Unitários Vitest** | 100% aprovados | 88 arquivos / 723 testes aprovados | ✅ Aprovado |
| **Linter Oxlint** | 0 erros bloqueantes | 0 erros | ✅ Aprovado |
| **Build de Produção (Vite / TypeScript)** | Sucesso | Bundle gerado com sucesso sem erros de tipo | ✅ Aprovado |
