# 📋 Lista de Tarefas (Tasks) — Sprint 04 — Emissão de Orçamentos, Condições Comerciais e Descontos

> **Padrão**: User Stories sequenciais no projeto com Sub-tarefas decimais (`US-XX.Y`).

## 📦 US-09: Emissão de Orçamentos, Condições Comerciais e Descontos

> **Descrição**: Extensão do motor de orçamentos para incorporar aplicação de descontos, condições de pagamento padronizadas, inserção de itens avulsos e geração do documento final em PDF.

| ID | Issue | Tarefa | Responsável | Status |
|---|---|---|---|:---:|
| **US-09.1** | #179 | Adicionar dependência com.github.librepdf:openpdf:2.0.3 no backend/pom.xml | Italo Jefferson | ✅ Concluído |
| **US-09.2** | #221 | Adicionar logotipo da Alumiportas como recurso estático para emissão de PDFs | José Guylherme | ✅ Concluído |
| **US-09.3** | #201 | Criar migration Flyway V11__add_commercial_conditions_to_budgets.sql | Herbert Carvalho | ✅ Concluído |
| **US-09.4** | #214 | Alinhar enum BudgetStatus com estados da US-09 e labels em português | Herbert Carvalho | ✅ Concluído |
| **US-09.5** | #216 | Criar enum DiscountType (PERCENTUAL, VALOR_FIXO) | Herbert Carvalho | ✅ Concluído |
| **US-09.6** | #217 | Criar enum PaymentCondition com opções comerciais padronizadas | Herbert Carvalho | ✅ Concluído |
| **US-09.7** | #218 | Estender entidade JPA Budget com condição de pagamento e notas comerciais | Italo Jefferson | ✅ Concluído |
| **US-09.8** | #219 | Verificar e alinhar entidade JPA BudgetItem com campos da US-09 | Júlio Kennedy | ✅ Concluído |
| **US-09.9** | #220 | Estender BudgetRepository com consultas por código e filtros de status | Júlio Kennedy | ✅ Concluído |
| **US-09.10** | #180 | Verificar e alinhar repositório BudgetItemRepository | | ⏳ Pendente |
| **US-09.11** | #181 | Extrair ou refinar gerador de código sequencial BudgetCodeGenerator | Maylson Rodrigues | ✅ Concluído |
| **US-09.12** | #182 | Alinhar record BudgetCreateRequest com validações Jakarta | Herbert Carvalho | ✅ Concluído |
| **US-09.13** | #183 | Criar record BudgetItemCreateRequest para inserção de itens avulsos | Guilherme Kauã | ✅ Concluído |
| **US-09.14** | #184 | Criar record DiscountRequest para aplicação de descontos e condições | Guilherme Kauã | ✅ Concluído |
| **US-09.15** | #185 | Alinhar record StatusChangeRequest com transições de status | Guilherme Kauã | ✅ Concluído |
| **US-09.16** | #186 | Estender record BudgetResponse com totais detalhados e condição comercial | Herbert Carvalho | ✅ Concluído |
| **US-09.17** | #187 | Alinhar record BudgetSummaryResponseDTO para exibição na listagem | Italo Jefferson | ✅ Concluído |
| **US-09.18** | #188 | Alinhar record BudgetItemResponse com dados técnicos da esquadria | José Guylherme | ✅ Concluído |
| **US-09.19** | #189 | Estender mapper MapStruct BudgetMapper com novos campos e labels | Maylson Rodrigues | ✅ Concluído |
| **US-09.20** | #190 | Estender BudgetService.create() com validade padrão e condições iniciais | Guilherme Kauã | ✅ Concluído |
| **US-09.21** | #191 | Implementar método adicionarItem() incremental no BudgetService | | ⏳ Pendente |
| **US-09.22** | #192 | Implementar método aplicarDesconto() com cálculo bidirecional e limites | Italo Jefferson | ✅ Concluído |
| **US-09.23** | #193 | Alinhar máquina de estados e validações no alterarStatus() do BudgetService | Maylson Rodrigues | ✅ Concluído |
| **US-09.24** | #194 | Alinhar listagem paginada no BudgetService com filtros e ordenação | Herbert Carvalho | ✅ Concluído |
| **US-09.25** | #195 | Estender BudgetController com endpoints de desconto e adição de itens avulsos | | ⏳ Pendente |
| **US-09.27** | #197 | Criar testes de integração dos novos endpoints do BudgetController | | ⏳ Pendente |
| **US-09.28** | #198 | Estender tipos TypeScript com modelos de desconto e pagamento | Italo Jefferson | ✅ Concluído |
| **US-09.28** | #199 | Criar interfaces TypeScript (Budget, BudgetItem, BudgetCreateRequest, DiscountRequest, etc.) | Joseph Nichollas | ✅ Concluído |
| **US-09.29** | #200 | Criar schemas Zod para validação do formulário de descontos | Italo Jefferson | ✅ Concluído |
| **US-09.30** | #202 | Estender serviço de API Axios com funções de desconto e itens avulsos | Joseph Nichollas | ✅ Concluído |
| **US-09.31** | #203 | Estender custom hook useBudgets com mutação de aplicação de desconto | | ⏳ Pendente |
| **US-09.32** | #204 | Estender StatusBadge com suporte ao estado EXPIRADO | Herbert Carvalho | ✅ Concluído |
| **US-09.33** | #207 | Alinhar formulário de dados do orçamento com seleção de cliente | Joseph Nichollas | ✅ Concluído |
| **US-09.34** | #208 | Alinhar modal e formulário de adição de esquadrias ao orçamento | Joseph Nichollas | ✅ Concluído |
| **US-09.35** | #209 | Verificar exibição de itens e subtotais na BudgetItemsTable | Joseph Nichollas | ✅ Concluído |
| **US-09.36** | #210 | Criar ou refinar painel de descontos e condições comerciais com recálculo em tempo real | | ⏳ Pendente |
| **US-09.37** | #211 | Integrar card de totais financeiros com reflexo imediato do desconto | | ⏳ Pendente |
| **US-09.38** | #212 | Integrar painéis de desconto e totais na página de criação BudgetNewPage | | ⏳ Pendente |
| **US-09.39** | #213 | Alinhar página de listagem BudgetsPage com badges de status e filtros | José Guylherme | ✅ Concluído |
| **US-09.40** | #215 | Verificar e garantir integridade das rotas de orçamentos no App.tsx | Guilherme Kauã | ✅ Concluído |
