<!-- Sync Impact Report:
- Version change: initial -> 1.0.0
- List of modified principles: None (inicialização formal da constituição baseada na análise do repositório)
- Added sections: Core Principles (5 princípios fundamentais), Padrões Tecnológicos & Restrições de Arquitetura, Fluxo de Desenvolvimento & Quality Gates, Governança
- Removed sections: Nenhum
- Follow-up TODOs: Nenhum
-->

# AlumiGest Constitution

## Core Principles

### I. Arquitetura Modular & Package-by-Feature
- O backend MUST ser organizado estritamente no formato *Package-by-Feature* (`com.alumigest.<feature>`), separando responsabilidades nas camadas `controller`, `service`, `repository`, `domain` e `dto`.
- Entidades JPA (`@Entity`) NEVER MUST ser expostas diretamente nos endpoints REST; o uso de DTOs (Records Java imutáveis) para requisição e resposta é mandatório.
- O frontend MUST ser estruturado modularmente por componentes funcionais, páginas e serviços de API fortemente tipados com TypeScript.

### II. Test-First & Garantia de Qualidade (Quality Gates)
- Testes unitários (JUnit 5 + Mockito / AssertJ) e testes de integração com banco de dados em container são obrigatórios para novas regras de negócio e endpoints.
- Todo código produzido MUST passar pelo pipeline de CI/CD com SonarQube ("Clean as You Code"), respeitando os Quality Gates para backend e frontend sem introduzir novas vulnerabilidades, bugs ou débito técnico descontrolado.
- Cenários de Testes de Aceitação (TEA) MUST ser documentados e validados para cada história de usuário antes da entrega da sprint.

### III. Integridade de Dados, Validação Dupla & Soft Delete
- O sistema MUST aplicar validação dupla: Bean Validation (Jakarta Validation) na camada de entrada (DTOs) e validação de regras de negócio na camada de serviço (Service).
- Transações com o banco de dados MUST ser declaradas explicitamente com `@Transactional(readOnly = true)` no nível de classe dos serviços e `@Transactional` apenas nos métodos de mutação.
- Entidades fundamentais (produtos, vidros, perfis, clientes) MUST adotar *soft delete* (`ativo = false`) para garantir a integridade referencial dos orçamentos históricos e auditoria.

### IV. Padronização de Idioma & Conventional Commits
- Todas as mensagens de commit (`git commit`) MUST ser redigidas em Português do Brasil seguindo o padrão Conventional Commits (ex: `feat(backend): ...`, `fix(frontend): ...`).
- Mensagens de validação, payloads de erro da API REST e documentação técnica MUST estar em Português do Brasil.
- Commits e pushes para o repositório remoto só devem ser executados após solicitação ou workflows homologados.

### V. Gestão de Configuração & Git Flow Rigoroso
- O fluxo de trabalho adota o Git Flow: branch `main` protegida para releases homologadas, `develop` como branch de integração contínua da sprint, e branches de trabalho padronizadas (`feat/*`, `fix/*`, `release/*`, `hotfix/*`, `docs/*`).
- Merges em `develop` e `main` MUST ser realizados exclusivamente via Pull Requests com revisão de código aprovada.
- Versionamento Semântico (`v<MAJOR>.<MINOR>.<PATCH>`) e baselines formais de sprint (`B-ALG-vX.Y.Z-S<XX>-<SEQ>`) são obrigatórios conforme o Plano de Gerência de Configuração (PGC).

## Padrões Tecnológicos & Restrições de Arquitetura

- **Backend:** Java 21 LTS, Spring Boot 3.x, Spring Data JPA, Hibernate, PostgreSQL 16+, Flyway Migrations, Lombok, Jakarta Bean Validation, Maven.
- **Frontend:** TypeScript 5.x, React 19, Vite, PWA, Lucide Icons, Vanilla CSS / Tailwind (quando aplicável).
- **Banco de Dados:** PostgreSQL com migrações gerenciadas estritamente via Flyway (`db/migration/Vxxx__*.sql`). Modificações manuais em schema são proibidas.
- **Infraestrutura & Containers:** Docker e Docker Compose para execução e paridade de ambientes locais e remotos; SonarQube para análise contínua de qualidade.

## Fluxo de Desenvolvimento & Quality Gates

- **Metodologia:** Metodologia IMPROS (Scrum Adaptado com sprints quinzenais de 15 dias) com rotação periódica de papéis (Gerente de Projeto, Desenvolvedor, QA/Testador) e PO fixo.
- **Critérios de Aceitação de PR (Definition of Done):**
  1. Build de backend (`mvn clean test`) e frontend (`npm run build`) sem erros.
  2. Testes automatizados cobrindo os novos cenários e sem quebrar os existentes.
  3. Quality Gate do SonarQube aprovado no GitHub Actions.
  4. Revisão e aprovação por pelo menos um membro da equipe técnica.
  5. Atualização da documentação correspondente em `docs/`.

## Governança

- A presente Constituição estabelece os princípios invioláveis e as diretrizes arquiteturais para todo o ciclo de vida do AlumiGest.
- Qualquer alteração nos princípios estabelecidos nesta constituição requer:
  1. Proposta formal de emenda documentada em PR específico.
  2. Aprovação unânime ou alinhamento com a liderança técnica e Product Owner.
  3. Plano de migração e atualização dos artefatos de governança e documentação.
- Todos os agentes de IA, desenvolvedores e revisores devem auditar a conformidade do código gerado com base nesta Constituição.

**Version**: 1.0.0 | **Ratified**: 2026-08-05 | **Last Amended**: 2026-08-27