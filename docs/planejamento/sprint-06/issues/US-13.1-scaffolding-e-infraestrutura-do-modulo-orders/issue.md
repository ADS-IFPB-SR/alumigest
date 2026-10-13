# [US-13.1] Scaffolding e Infraestrutura do Módulo de Pedidos de Venda

## 🎯 Objetivo & Valor de Negócio

Criar toda a base estrutural de banco de dados, pacotes no backend e diretórios no frontend para permitir a implementação do módulo de Pedidos de Venda (`orders`), garantindo tabelas, constraints de unicidade e tipagens iniciais prontas.

---

## 📝 Escopo Técnico

- **Banco de Dados (Flyway)**: `backend/src/main/resources/db/migration/V19__create_orders_schema.sql` (tabelas `tb_orders`, `tb_order_items`, `tb_order_item_options`, constraint UNIQUE `orcamento_id`, índices de busca).
- **Backend (Domain/Repository)**:
  - Enums: `OrderStatus.java` (`CRIADO`, `AGUARDANDO_PRODUCAO`, `EM_PRODUCAO`, `CONCLUIDO`, `CANCELADO`) e `ApprovalChannel.java` (`WHATSAPP`, `PRESENCIAL`, `TELEFONE`, `EMAIL`).
  - Entidades JPA: `Order.java` e `OrderItem.java` com mapeamentos relacionais e soft delete.
  - Repositórios: `OrderRepository.java` e `OrderItemRepository.java` estendendo `JpaRepository`.
- **Frontend (Estrutura)**:
  - Criação da pasta de feature `frontend/src/features/orders/` com subpastas `components/`, `hooks/`, `services/`, `types/` e `schemas/`.

---

## 🛠️ Checklist de Implementação

- [x] Criar a migration Flyway `V19__create_orders_schema.sql` com tabelas `tb_orders`, `tb_order_items`, `tb_order_item_options`, constraint UNIQUE em `orcamento_id` e chaves estrangeiras
- [x] Criar pacotes `br.edu.ifpb.alumigest.orders.{domain, repository, service, controller, dto, mapper}` no backend
- [x] Criar enums `OrderStatus` e `ApprovalChannel` com métodos auxiliares e labels em pt-BR
- [x] Criar entidade JPA `Order` mapeando campos cadastrais, financeiros (BigDecimal), cliente, dataPrevisaoEntrega e soft delete (`ativo`)
- [x] Criar entidade JPA `OrderItem` com vínculo `@ManyToOne` para `Order` e colunas de dimensões/valores
- [x] Criar interfaces de repositório `OrderRepository` e `OrderItemRepository`
- [x] Criar estrutura de diretórios em `frontend/src/features/orders/{components,hooks,services,types,schemas}`
- [x] Verificar compilação do backend com `mvn clean compile -DskipTests`

---

## ✅ Definition of Done (DoD)

1. [x] **Compilação**: Código compila sem erros (`mvn clean compile` e `npm run build`).
2. [x] **Testes Unitários**: Testes unitários passam com sucesso (`mvn test` e `npx vitest run`).
3. [x] **Qualidade de Código**: Zero warnings bloqueantes e conformidade com Checkstyle / Oxlint.
4. [x] **Valor Funcional**: Funcionalidade testável de ponta a ponta no navegador (ou verificação de schema/serviço).
5. [x] **Documentação Inline**: Javadoc / TSDoc nos métodos públicos e classes relevantes.
6. [x] **Checklist Concluído**: Todos os itens do checklist da issue devidamente atendidos e verificados.
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
