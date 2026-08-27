# Implementation Plan: Sprint 4 — Descontos, PDF e Homologação R1

**Branch**: `001-orcamento-descontos-pdf` | **Date**: 2026-08-27 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-orcamento-descontos-pdf/spec.md`

## Summary

Implementar o módulo completo de descontos comerciais (percentual e valor fixo), condições de pagamento pré-configuradas, geração de PDFs em duas vias (Comercial com valores e Técnica/Oficina sem valores), botão de cópia para WhatsApp, e validação de homologação da Release 1 (v1.0.0) do AlumiGest. O backend utiliza OpenPDF para geração server-side dos PDFs e BigDecimal com arredondamento bancário para precisão monetária.

## Technical Context

**Language/Version**: Java 21 LTS (backend) + TypeScript 6.x (frontend)

**Primary Dependencies**:
- Backend: Spring Boot 3.4.2, Spring Data JPA, Hibernate, MapStruct 1.6.3, Lombok, OpenPDF (novo), Jakarta Bean Validation
- Frontend: React 19, Vite 8, React Router 7, TanStack React Query 5, React Hook Form 7, Zod, Axios, Tailwind CSS 3, Lucide React

**Storage**: PostgreSQL 16+ com Flyway Migrations (V8 será criada)

**Testing**: JUnit 5 + Mockito + AssertJ (backend), H2 in-memory (integração)

**Target Platform**: Web application (PWA) — monorepo com backend REST + frontend SPA

**Project Type**: Web application (monorepo: backend Spring Boot + frontend React)

**Performance Goals**: Geração de PDF em < 2 segundos para orçamentos de até 20 itens

**Constraints**: Precisão monetária com BigDecimal escala 2 e RoundingMode.HALF_EVEN

**Scale/Scope**: Usuários internos da Alumiportas (< 20 usuários simultâneos)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Status | Evidência |
| :--- | :--- | :--- |
| I. Arquitetura Package-by-Feature | ✅ PASS | Módulo `budgets` segue `controller/service/repository/domain/dto/mapper` |
| I. DTOs obrigatórios (nunca expor Entity) | ✅ PASS | Records Java para Request/Response, MapStruct para mapeamento |
| II. Test-First & Quality Gates | ✅ PASS | Testes unitários + integração + SonarQube Quality Gate planejados |
| III. Validação Dupla | ✅ PASS | Bean Validation nos DTOs + regras de negócio no Service |
| III. @Transactional explícito | ✅ PASS | `readOnly=true` na classe, `@Transactional` nos métodos de mutação |
| III. Soft Delete | ✅ PASS | Campo `ativo` na entidade Budget |
| IV. Commits em PT-BR | ✅ PASS | Mensagens de commit seguirão Conventional Commits em português |
| V. Git Flow & PR obrigatório | ✅ PASS | Branch `feat/sprint4-descontos-pdf` com PR para `develop` |

## Project Structure

### Documentation (this feature)

```text
specs/001-orcamento-descontos-pdf/
├── spec.md              # Especificação (concluída)
├── plan.md              # Este arquivo
├── research.md          # Pesquisa e decisões técnicas
├── data-model.md        # Modelo de dados (entidades e relacionamentos)
├── quickstart.md        # Guia de validação e testes
├── contracts/
│   └── api-budgets.md   # Contrato dos endpoints REST
└── tasks.md             # Tarefas (a ser gerado via /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── src/main/java/br/edu/ifpb/alumigest/
│   ├── budgets/
│   │   ├── controller/
│   │   │   └── BudgetController.java           # REST endpoints
│   │   ├── service/
│   │   │   ├── BudgetService.java              # Lógica de negócio e cálculos
│   │   │   ├── BudgetPdfService.java           # Geração de PDFs (OpenPDF)
│   │   │   └── BudgetCodeGenerator.java        # Gerador de código sequencial
│   │   ├── repository/
│   │   │   ├── BudgetRepository.java           # JPA Repository
│   │   │   └── BudgetItemRepository.java       # JPA Repository
│   │   ├── domain/
│   │   │   ├── Budget.java                     # @Entity principal
│   │   │   ├── BudgetItem.java                 # @Entity item
│   │   │   ├── BudgetStatus.java               # Enum de status
│   │   │   ├── DiscountType.java               # Enum tipo de desconto
│   │   │   └── PaymentCondition.java           # Enum condições de pagamento
│   │   ├── dto/
│   │   │   ├── BudgetCreateRequest.java        # Record de criação
│   │   │   ├── BudgetResponse.java             # Record de resposta completa
│   │   │   ├── BudgetSummaryResponse.java      # Record resumido (listagem)
│   │   │   ├── BudgetItemCreateRequest.java    # Record de item
│   │   │   ├── BudgetItemResponse.java         # Record resposta item
│   │   │   ├── DiscountRequest.java            # Record de desconto
│   │   │   └── StatusChangeRequest.java        # Record de transição
│   │   └── mapper/
│   │       └── BudgetMapper.java               # MapStruct mapper
│   └── common/exception/
│       └── (reutilizado: GlobalExceptionHandler, BusinessException, ResourceNotFoundException)
├── src/main/resources/
│   ├── db/migration/
│   │   └── V8__create_budgets_schema.sql       # Migration Flyway
│   └── static/
│       └── logo-alumiportas.png                # Logotipo para PDF
└── src/test/java/br/edu/ifpb/alumigest/budgets/
    ├── service/
    │   ├── BudgetServiceTest.java              # Testes unitários de negócio
    │   └── BudgetPdfServiceTest.java           # Teste de geração de PDF
    └── controller/
        └── BudgetControllerIntegrationTest.java # Testes de integração REST

frontend/
├── src/features/budgets/
│   ├── components/
│   │   ├── BudgetForm.tsx                      # Formulário de criação
│   │   ├── BudgetItemForm.tsx                  # Formulário de item
│   │   ├── BudgetItemsTable.tsx                # Tabela de itens
│   │   ├── DiscountPanel.tsx                   # Painel de descontos e condições
│   │   ├── BudgetSummaryCard.tsx               # Card de resumo com totais
│   │   └── BudgetStatusBadge.tsx               # Badge visual de status
│   ├── hooks/
│   │   └── useBudgets.ts                       # Custom hooks (React Query)
│   ├── services/
│   │   └── budgetApi.ts                        # Chamadas Axios para API
│   ├── types/
│   │   └── budget.ts                           # Interfaces TypeScript
│   └── schemas/
│       └── budgetSchema.ts                     # Validação Zod
├── src/pages/
│   ├── BudgetCreatePage.tsx                    # Página de criação de orçamento
│   ├── BudgetDetailPage.tsx                    # Página de detalhes com PDFs
│   └── BudgetListPage.tsx                      # Listagem de orçamentos
└── src/lib/
    └── (reutilizado: api.ts com interceptors Axios)
```

**Structure Decision**: Extensão do monorepo existente seguindo exatamente os padrões `catalog` (backend) e `features/catalog` (frontend). Sem novos projetos ou módulos — apenas novos packages/features.

## Complexity Tracking

Nenhuma violação de complexidade detectada. O plano segue estritamente os padrões já estabelecidos no projeto.