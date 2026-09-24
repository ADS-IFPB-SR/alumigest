# Implementation Plan: Sprint 4 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos/Condições (US-09) e Quality SonarQube

**Período da Sprint**: 01/09/2026 a 14/09/2026 (14 dias)  
**Spec de Referência**: [spec.md](spec.md)  
**Quadro ZenHub / GitHub Projects**: `has:parent-issue sprint:"Sprint 4"` (50 Story Points planejados / 44 entregues)  
**Governança**: Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)

---

## 1. 🎯 Resumo Executivo da Engenharia

O plano de engenharia da Sprint 04 focou na refatoração e no saneamento arquitetural das bases do AlumiGest para viabilizar orçamentos robustos, cálculos matemáticos precisos e conformidade contínua com os padrões de qualidade da organização:

1. **Templates Paramétricos em SVG (`US-05 #126`):** Modularização da renderização gráfica de 10 modelos canônicos de esquadrias no frontend, desacoplamento das regras de catálogo e criação do seletor dinâmico de insumos.
2. **Arquitetura de Orçamentos V2 (`US-46 #172`):** Refatoração da camada de serviços e contratos de API de orçamentos, garantindo atomicidade transacional na criação de propostas com múltiplos itens (`BudgetCreateRequest`).
3. **Fundação e Motor de Descontos Comerciais (`US-09 #133`):** Implementação no backend das regras de cálculo de desconto percentual (%) e monetário fixo (R$), validações de limite e opções de condições de pagamento.
4. **Resolução de Débitos Técnicos e SonarQube (`quality #245`):** Exclusão de classes não-executáveis (DTOs, Records, Mappers) das métricas de cobertura do JaCoCo, conformidade com regras SonarLint e manutenção do Quality Gate com New Code Coverage $\ge 80\%$.
5. **Decisão de Engenharia da Homologação (`US-12 #136`):** Diluição dos critérios de homologação e validação da Release 1 como Definition of Done (DoD) contínuo das histórias US-09 e US-10 na Sprint 05.

---

## 2. 🛠️ Contexto Tecnológico & Dependências

* **Backend:** Java 21 LTS, Spring Boot 3.4.2, Spring Data JPA, Hibernate, PostgreSQL 16+, Flyway Migrations, MapStruct 1.6.3, Lombok, Jakarta Bean Validation (JSR-380).
* **Frontend:** React 19, TypeScript 6.x, Vite 8, React Router 7, TanStack React Query 5, React Hook Form 7, Zod, Tailwind CSS 3, Lucide React.
* **Qualidade e Testes:** JUnit 5, Mockito, AssertJ, H2 (testes integrados backend), Vitest, Testing Library, JaCoCo Maven Plugin, SonarScanner / SonarQube Cloud.
* **Premissa Matemática:** Operações financeiras com `BigDecimal` (escala 2 e `RoundingMode.HALF_EVEN`), dimensões milimétricas inteiras e aproveitamento de barras de alumínio com `RoundingMode.CEILING`.

---

## 3. 🛡️ Constitution Check

| Princípio da Constituição | Status | Evidência na Sprint 04 |
| :--- | :---: | :--- |
| **I. Arquitetura Package-by-Feature** | ✅ PASS | Módulos organizados em pacotes coesos (`budgets`, `catalog`, `customers`) com separação de controllers, services, repositories e DTOs. |
| **I. DTOs Obrigatórios (Zero Entidade Exposta)** | ✅ PASS | Utilização exclusiva de Records Java para requests e responses, com MapStruct para conversão. |
| **II. Test-First & Quality Gates** | ✅ PASS | 242 testes automatizados no backend passando e SonarQube Quality Gate verde (`quality #245`). |
| **III. Validação Dupla (Bean Validation + Service)** | ✅ PASS | Validações JSR-380 nos DTOs combinadas com checagens de alçada comercial e regras físicas nos Services. |
| **III. @Transactional Explícito** | ✅ PASS | `readOnly=true` no topo das classes de serviço e `@Transactional` explícito em métodos de mutação. |
| **III. Soft Delete e Preservação de Dados** | ✅ PASS | Entidades possuem controle de exclusão lógica (`ativo` / `isActive`) sem perda de integridade referencial. |
| **IV. Commits em Português** | ✅ PASS | Histórico padronizado com Conventional Commits em português do Brasil. |
| **V. Git Flow & PR Obrigatório** | ✅ PASS | Trabalho integrado via Pull Requests com revisão obrigatória para a branch `develop`. |

---

## 4. 📁 Estrutura de Código Afetada na Sprint 04

```text
backend/
├── src/main/java/br/edu/ifpb/alumigest/
│   ├── budgets/
│   │   ├── controller/
│   │   │   └── BudgetController.java           # Endpoints REST refatorados (Budget V2)
│   │   ├── service/
│   │   │   ├── BudgetService.java              # Criação atômica com itens e descontos
│   │   │   ├── BudgetItemService.java          # Gestão isolada de itens do orçamento
│   │   │   └── PricingCalculator.java          # Motor de cálculo BigDecimal (US-09)
│   │   ├── domain/
│   │   │   ├── Budget.java                     # Entidade de orçamento com campos comerciais
│   │   │   ├── BudgetItem.java                 # Entidade item do orçamento
│   │   │   ├── DiscountType.java               # Enum PERCENTUAL e VALOR_FIXO
│   │   │   └── PaymentCondition.java           # Enum condições de pagamento
│   │   ├── dto/
│   │   │   ├── BudgetCreateRequest.java        # Record com suporte à lista de itens
│   │   │   ├── BudgetItemCreateRequest.java    # Record de especificação do item
│   │   │   ├── DiscountRequest.java            # Record de aplicação de desconto
│   │   │   └── BudgetResponse.java             # DTO de saída completo
│   │   └── mapper/
│   │       └── BudgetMapper.java               # Mapeador MapStruct
│   ├── catalog/
│   │   └── (apoio à parametrização de esquadrias e insumos)
│   └── common/
│       └── exception/                          # BusinessException e ErrorResponse
├── pom.xml                                     # Exclusão de DTOs e Mappers no JaCoCo (quality #245)
└── src/test/java/br/edu/ifpb/alumigest/
    ├── budgets/
    │   ├── service/BudgetServiceTest.java      # Testes de cálculo de desconto e taxas
    │   └── controller/BudgetIntegrationTest.java # Testes integrados com banco
    └── (testes unitários e de integração de catálogo e clientes)

frontend/
├── src/
│   ├── features/
│   │   ├── products/
│   │   │   ├── components/
│   │   │   │   ├── StudioCAD.tsx               # Renderizador vetorial SVG dos 10 modelos (US-05)
│   │   │   │   ├── CategoryRequirementsSelector.tsx # Seletor dinâmico de insumos
│   │   │   │   └── templates/                  # 10 modelos paramétricos em SVG modular
│   │   │   └── hooks/
│   │   │       └── useTemplateRenderer.ts      # Hook de cálculo de proporções de esquadrias
│   │   └── budgets/
│   │       ├── types/budget.ts                 # Interfaces TypeScript alinhadas ao Budget V2
│   │       ├── services/budgetApi.ts           # Integração Axios com backend V2
│   │       └── components/                     # Estrutura base de visualização e itens
│   └── lib/
│       └── (formatadores monetários e interceptores)
```

---

## 5. 🔄 Plano de Fases e Execução da Sprint 04

### Fase 1: Qualidade e Ajuste de Pipeline (`quality #245`)
- Atualização do `pom.xml` para configurar filtros de exclusão de records DTOs e mappers no JaCoCo.
- Resolução de apontamentos do SonarLint nas classes de domínio e services.
- Execução de `./mvnw clean verify` garantindo New Code Coverage $\ge 80\%$ e pipeline verde no GitHub Actions.

### Fase 2: Templates Paramétricos de Esquadrias (`US-05 #126`)
- Refatoração dos componentes de renderização SVG para suportar os 10 modelos de catálogo.
- Implementação de limites físicos mínimos e máximos para impedir esquadrias impossíveis de fabricar.
- Conexão do seletor de requisitos de insumos com as tipologias de esquadrias.

### Fase 3: Arquitetura de Orçamentos V2 (`US-46 #172`)
- Refatoração do contrato de criação de orçamento para aceitar lista aninhada de itens em transação única.
- Separação de responsabilidades de serviço entre `BudgetService` e `BudgetItemService`.
- Saneamento de integridade referencial com cascata de persistência e exclusão lógica.

### Fase 4: Descontos Comerciais e Condições de Pagamento (`US-09 #133`)
- Implementação dos algoritmos de desconto percentual (%) e valor fixo (R$) no `PricingCalculator`.
- Modelagem das condições de pagamento e validações de alçada comercial.
- Testes unitários com JUnit 5 cobrindo cenários de borda (desconto zero, desconto total, recálculo com frete e instalação).

### Fase 5: Alinhamento de Escopo e Transição da Homologação (`US-12 #136`)
- Deliberação de transição: migração do fechamento de UI da US-09 e diluição dos critérios de homologação da US-12 como DoD das US-09 e US-10 na Sprint 05.

---

## 6. 📊 Gestão de Riscos Registrada na Iteração

* **Risco R1 (Gargalo de Homologação em Lote):** Resolvido pela decisão arquitetural de diluir a homologação da Release 1 no Definition of Done contínuo das histórias de saída na Sprint 05.
* **Risco R2 (Perda de Precisão em Descontos Parciais):** Mitigado pelo uso compulsório de `BigDecimal` com arredondamento `HALF_EVEN` em todos os nós de cálculo.
* **Risco R3 (Inconsistência de Modelos Paramétricos SVG):** Mitigado pelo isolamento em funções puras de desenho vetorial no frontend com validação prévia de dimensões.