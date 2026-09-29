<!-- Sync Impact Report:
- Version change: 1.0.0 -> 1.1.0
- List of modified principles:
  - Princípio I: Correção do pacote base para br.edu.ifpb.alumigest.<feature>
  - Princípio III: Adição do requisito mandatório de precisão matemática e dimensional com BigDecimal (RoundingMode.CEILING para cortes físicos/barras e RoundingMode.HALF_EVEN para valores monetários, área mínima de 0.25m² e medidas em mm)
- Added sections: Princípio de Precisão Matemática e Engenharia de Corte
- Removed sections: Nenhum
- Follow-up TODOs: Nenhum
-->

# AlumiGest Constitution

## Core Principles

### I. Arquitetura Modular & Package-by-Feature
- O backend MUST ser organizado estritamente no formato *Package-by-Feature* (`br.edu.ifpb.alumigest.<feature>`), separando responsabilidades nas camadas `controller`, `service`, `repository`, `domain` e `dto`.
- Entidades JPA (`@Entity`) NEVER MUST ser expostas diretamente nos endpoints REST; o uso de DTOs (Records Java imutáveis) para requisição e resposta é mandatório.
- O frontend MUST ser estruturado modularmente por componentes funcionais, páginas e serviços de API fortemente tipados com TypeScript e schemas Zod.

### II. Test-First & Garantia de Qualidade (Quality Gates)
- Testes unitários (JUnit 5 + Mockito / AssertJ) e testes de integração com banco de dados em container são obrigatórios para novas regras de negócio e endpoints.
- Todo código produzido MUST passar pelo pipeline de CI/CD com SonarQube ("Clean as You Code"), respeitando os Quality Gates para backend e frontend sem introduzir novas vulnerabilidades, bugs ou débito técnico descontrolado (New Code Coverage $\ge 80\%$, zero bugs/vulnerabilidades).
- Cenários de Testes de Aceitação (TEA) MUST ser documentados e validados para cada história de usuário antes da entrega da sprint.

### III. Integridade de Dados, Validação Dupla & Soft Delete
- O sistema MUST aplicar validação dupla: Bean Validation (Jakarta Validation) na camada de entrada (DTOs) e validação de regras de negócio na camada de serviço (Service).
- Transações com o banco de dados MUST ser declaradas explicitamente com `@Transactional(readOnly = true)` no nível de classe dos serviços e `@Transactional` apenas nos métodos de mutação.
- Entidades fundamentais (produtos, vidros, perfis, clientes) MUST adotar *soft delete* (`isActive = false` ou `ativo = false`) para garantir a integridade referencial dos orçamentos históricos e auditoria.

### IV. Precisão Matemática, Engenharia de Corte & Arredondamento Explícito
- Todos os cálculos de quantitativo físico, consumo de materiais e consolidação financeira MUST utilizar estritamente `BigDecimal` para prevenir erros de ponto flutuante binário (`double`/`float`).
- Cálculos de corte físico de perfis de alumínio e barras inteiras de 6000 mm MUST aplicar explicitamente `RoundingMode.CEILING`, garantindo o suprimento fabril sem subdimensionamento.
- Cálculos monetários e faturamento final MUST aplicar `RoundingMode.HALF_EVEN` com escala de 2 casas decimais.
- A regra de área mínima industrial de $0.2500\text{ m}^2$ por folha de vidro e as fórmulas paramétricas de perfis ($2W + nH$ em milímetros) são mandatórias e invioláveis em qualquer orçamento de esquadrias.

### V. Padronização de Idioma & Conventional Commits
- Todas as mensagens de commit (`git commit`) MUST ser redigidas em Português do Brasil seguindo o padrão Conventional Commits (ex: `feat(backend): ...`, `fix(frontend): ...`).
- Mensagens de validação, payloads de erro da API REST e documentação técnica MUST estar em Português do Brasil.
- Commits e pushes para o repositório remoto só devem ser executados após solicitação ou workflows homologados.

### VI. Gestão de Configuração & Git Flow Rigoroso
- O fluxo de trabalho adota o Git Flow: branch `main` protegida para releases homologadas, `develop` como branch de integração contínua da sprint, e branches de trabalho padronizadas (`feat/*`, `fix/*`, `release/*`, `hotfix/*`, `docs/*`).
- Merges em `develop` e `main` MUST ser realizados exclusivamente via Pull Requests com revisão de código aprovada.
- Versionamento Semântico (`v<MAJOR>.<MINOR>.<PATCH>`) e baselines formais de sprint (`B-ALG-vX.Y.Z-S<XX>-<SEQ>`) são obrigatórios conforme o Plano de Gerência de Configuração (PGC).

## Padrões Tecnológicos & Restrições de Arquitetura

- **Backend:** Java 21 LTS, Spring Boot 3.x, Spring Data JPA, Hibernate, PostgreSQL 16+, Flyway Migrations, Lombok, Jakarta Bean Validation, OpenPDF, Maven.
- **Frontend:** TypeScript 5.x, React 19, Vite, PWA, Lucide Icons, Vanilla CSS / Tailwind (quando aplicável), TanStack Query v5, Zod.
- **Banco de Dados:** PostgreSQL com migrações gerenciadas estritamente via Flyway (`db/migration/Vxxx__*.sql`). Modificações manuais em schema são proibidas.
- **Infraestrutura & Containers:** Docker e Docker Compose para execução e paridade de ambientes locais e remotos; SonarQube self-hosted no Coolify para análise contínua de qualidade.

## Fluxo de Desenvolvimento & Quality Gates

- **Metodologia:** Metodologia IMPROS (Scrum Adaptado com sprints quinzenais de 15 dias) com rotação periódica de papéis (Gerente de Projeto, Desenvolvedor, QA/Testador) e PO fixo.
- **Critérios de Aceitação de PR (Definition of Done):**
  1. Build de backend (`mvn clean test`) e frontend (`npm run build`) sem erros.
  2. Testes automatizados cobrindo os novos cenários e sem quebrar os existentes.
  3. Quality Gate do SonarQube aprovado no GitHub Actions.
  4. Revisão e aprovação por pelo menos um membro da equipe técnica.
  5. Atualização da documentação correspondente em `docs/` (Docs-as-Code).

## Governança

- A presente Constituição estabelece os princípios invioláveis e as diretrizes arquiteturais para todo o ciclo de vida do AlumiGest.
- Qualquer alteração nos princípios estabelecidos nesta constituição requer:
  1. Proposta formal de emenda documentada em PR específico.
  2. Aprovação unânime ou alinhamento com a liderança técnica e Product Owner.
  3. Plano de migração e atualização dos artefatos de governança e documentação.
- Todos os agentes de IA, desenvolvedores e revisores devem auditar a conformidade do código gerado com base nesta Constituição.

**Version**: 1.1.0 | **Ratified**: 2026-08-05 | **Last Amended**: 2026-09-24