# ☕ AlumiGest - Backend

Serviço de backend do sistema **AlumiGest**, construído com arquitetura modular orientada a funcionalidades (*package-by-feature*).

## 🛠️ Tecnologias
- **Linguagem:** Java 21 LTS
- **Framework:** Spring Boot 3.x
- **Persistência:** Spring Data JPA / Hibernate
- **Migrações:** Flyway 10.x
- **Banco de Dados:** PostgreSQL 16+
- **Segurança:** Spring Security + JWT
- **Build Tool:** Maven / Gradle

## 📂 Estrutura de Pacotes (Package-by-Feature)
```text
src/main/java/br/edu/ifpb/alumigest/
├── auth/            # Autenticação, usuários e controle de acesso
├── clients/         # Gestão de clientes e fornecedores
├── catalog/         # Materiais (vidro, perfis de alumínio, ferragens, películas)
├── budgets/         # Motor de cálculo de orçamentos e geração de PDF
├── orders/          # Pedidos congelados, ordens de produção e listas de corte
├── inventory/       # Controle de estoque, reservas e perdas
├── finance/         # Contas a receber, pagamentos e fluxo de caixa
└── common/          # Configurações globais, handlers de exceção e utilitários
```
