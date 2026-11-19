# 📜 PGC — Plano de Gerência de Configuração e Governança (AlumiGest)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.4 (Homologado com Baselines v0.4.0 a v0.8.0, Tríade Centralizada e Release 2) |
| **Data/Hora** | 18/11/2026 - 22:50 |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 03/08/2026 | 1.0 | Versão inicial do Plano de Gerência de Configuração | Nichollas / Italo Santos |
| 18/08/2026 | 1.1 | Registro das Baselines de Sprint 1 e Sprint 2 | Equipe AlumiGest |
| 31/08/2026 | 1.2 | Registro da Baseline da Sprint 3 (B-ALG-v0.3.0-S03-01), SonarQube e Cypress | Equipe AlumiGest (Scrum Master: Italo Santos) |
| 24/09/2026 | 1.3 | Registro das Baselines v0.2.1, v0.2.2 e v0.3.0, inclusão do diretório `docs/planejamento/`, workflow CI `run-tests-on-all-prs` e formalização do princípio Docs-as-Code | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |
| 18/11/2026 | 1.4 | Registro das Baselines `v0.5.0` a `v0.8.0` (Sprints 05–08), centralização da tríade de testes em `docs/projeto-001/003-teste/`, atualização da stack (React 19, TS 6, Vite 8, Flyway V1–V25) e novos módulos (`orders`, `partsale`, `stock`) | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |

---

## 1. Introdução

Este documento estabelece as diretrizes de Gerência de Configuração de Software (GCS) e Governança do projeto **AlumiGest**, sistema de gestão comercial e de engenharia para esquadrias de alumínio e vidraçaria desenvolvido para o parceiro social Alumiportas.

### 1.1 Objetivos
* Padronizar a nomenclatura de artefatos, commits e branches.
* Estabelecer as regras de versionamento semântico (`SemVer`) e baselines formais.
* Garantir a integridade, rastreabilidade e sincronização contínua entre código-fonte e documentação (**Docs-as-Code**).
* Definir os Quality Gates de integração contínua (CI) e deploy contínuo (CD).

---

## 2. Papéis e Responsabilidades

| Papel | Responsável | Atribuições |
|---|---|---|
| **Product Owner (PO)** | José Guilherme | Priorização do Backlog do Produto (PBL), refinamento de User Stories e validação de regras de negócio com a Alumiportas. |
| **Scrum Master / Gerente de Configuração** | Italo Santos / Nichollas | Condução das cerimônias ágeis, monitoramento do Burndown (BRD), aprovação de baselines de sprint e compliance do repositório. |
| **Tech Lead / Guardião Docs-as-Code** | Ítalo Jefferson | Arquitetura técnica, revisão rigorosa de Pull Requests, governança da sincronização Docs-as-Code (`alumigest-doc-governor`) e Quality Gate SonarQube. |
| **Quality Assurance (QA)** | Equipe de QA (Joseph / Matheus) | Automação e execução de testes (JUnit 5, Mockito, JaCoCo, Vitest, Cypress), emissão de relatórios RET/TEA e registro de defeitos no RBD. |
| **Desenvolvedor (DEV)** | Time de Engenharia | Desenvolvimento orientado a testes (TDD), respeito estrito às 10 regras de ouro do SonarLint e entrega de código com documentação acoplada. |

---

## 3. Plano de Configuração e Estrutura de Monorepo

O controle de versão é operado no **GitHub** sob o repositório centralizado `ADS-IFPB-SR/alumigest`:

```
alumigest/
├── docs/
│   ├── planejamento/                 # Planejamento Estratégico, Backlog e Sprints
│   │   ├── constitution.md           # Princípios inegociáveis do projeto
│   │   ├── backlog/                  # User Stories futuras e descartadas
│   │   └── sprint-01/ a sprint-09/   # Plans, specs, protótipos e issues por sprint
│   ├── sistema/                      # Artefatos do Produto / Sistema
│   │   ├── 000-requisitos/           # PBL, REQ, UCS, RN
│   │   ├── 001-analise-projeto/      # ARQ, MER, DER, DCC, API, ESQ
│   │   ├── 002-especificacoes/       # SPEC-SonarQube-CI-Pipeline
│   │   ├── 002-implementacao/        # PAD, GIT
│   │   └── 004-gerencia-configuracao/# PGC
│   ├── projeto-001/                  # Artefatos de Processo, Governança e Qualidade
│   │   ├── 000-gerencia-projeto/     # PPJ, DRI
│   │   ├── 001-atas-reuniao/         # ATAs de Planning, Dailies, Review e Retro
│   │   ├── 002-acompanhamento/       # PIT, BRD, RAP por sprint
│   │   └── 003-teste/                # PLT, RBD e Tríade Canônica (TEA, RTM, RET) em sprint-XX/
│   ├── diagramas/                    # Diagramas SVG (Arquitetura, Pipeline, Fluxos)
│   ├── sprint-04/                    # Template histórico de issues QA
│   └── qualidade/                    # Casos de teste e relatórios de cobertura
├── backend/                          # Código Java 21 LTS + Spring Boot 3.4.2
└── frontend/                         # Código React 19 + Vite 8 + TypeScript 6
```

---

## 4. O Princípio Arquitetural Docs-as-Code (Obrigatório)

O AlumiGest opera sob o princípio **Docs-as-Code orientado a Pull Requests**:
1. **Sincronização Atômica:** Nenhuma alteração de arquitetura, migração de banco (Flyway), endpoint REST ou regra física de cálculo pode ser mergeada na branch `develop` ou `main` sem que a documentação oficial correspondente seja atualizada no mesmo PR.
2. **Matriz de Impacto Obrigatória:**
   * Alterou Migração Flyway (`V*.sql`) ➔ Atualizar `MER-Modelo_de_Dados.md` e `DER-Catalogo_Materiais.md`.
   * Alterou Controller ou DTO (`*Controller.java`, `*Request.java`, `*Response.java`) ➔ Atualizar `API-Especificacao_API_REST.md`.
   * Alterou Calculadora ou Regra Física (`*Calculator.java`, `calculations.ts`) ➔ Atualizar `RN-Regras_de_Calculo.md`.
   * Concluiu Sprint ➔ Gerar `CHANGELOG.md`, Tríade de Testes (`TEA`/`RTM`/`RET` em `docs/projeto-001/003-teste/sprint-XX/`), `PIT`/`RAP`/`BRD` e `ATA-Review`.

---

## 5. Baselines Oficiais Homologadas

O identificador canônico de baseline segue o formato: `B-ALG-v<MAJOR>.<MINOR>.<PATCH>-S<SPRINT>-<SEQ>`:

| Baseline | Data | Sprint | Escopo Consolidado | Status |
|---|---|---|---|---|
| `B-ALG-v0.1.0-S01-01` | 03/08/2026 | Sprint 01 | Iniciação, Governança, PGC, PPJ e setup monorepo Docker/Spring Boot | ✅ Aprovada |
| `B-ALG-v0.2.0-S02-01` | 18/08/2026 | Sprint 02 | Catálogo Universal de Materiais (Vidros, Perfis, Ferragens, Películas) e PWA | ✅ Aprovada |
| `B-ALG-v0.2.1-S02-02` | 19/08/2026 | Sprint 02 | Refinamento de busca, exportação de dados e responsividade mobile | ✅ Aprovada |
| `B-ALG-v0.2.2-S02-03` | 25/08/2026 | Sprint 02 | Pipeline de integração do SonarQube com relatórios separados | ✅ Aprovada |
| `B-ALG-v0.3.0-S03-01` | 31/08/2026 | Sprint 03 | Motor Strategy de Orçamentos, CRUD Clientes, Templates Paramétricos e Cypress E2E | ✅ Aprovada |
| `B-ALG-v0.4.0-S04-01` | 14/09/2026 | Sprint 04 | Templates SVG, Studio CAD e Descontos Base (`US-09` P1) | ✅ Aprovada |
| `B-ALG-v0.5.0-S05-01` | 28/09/2026 | Sprint 05 | Proposta Comercial PDF/WhatsApp (`US-10`), Via Técnica (`US-11`) e Homologação Release 1 | ✅ Aprovada |
| `B-ALG-v0.6.0-S06-02` | 17/10/2026 | Sprint 06 | Pedidos de Venda (`US-13`), Snapshot Imutável (`US-14`), Cancelamento (`US-15`) e Comprovante PDF (`US-16`) | ✅ Aprovada |
| `B-ALG-v0.7.0-S07-01` | 26/10/2026 | Sprint 07 | Etiquetas Térmicas 100×60mm PDF/BPLB (`US-17`) e Painel Kanban de Produção (`US-18`) | ✅ Aprovada |
| `B-ALG-v0.8.0-S08-01` | 15/11/2026 | Sprint 08 | Venda Avulsa de Partes (`US-46`), Central 360° do Cliente (`US-47`) e Ficha Técnica A4 | ✅ Aprovada |
| `B-ALG-v0.9.0-S09-WIP` | Em andamento | Sprint 09 | Estoque Make-to-Order e Trilha Kardex (`US-21`, `US-22`) | 🔄 Em Desenvolvimento |

---

## 6. Ferramentas, Ambientes e Infraestrutura

| Ferramenta | Propósito | Ambiente | Versão / Hospedagem |
|---|---|---|---|
| **Git** | Controle de versão distribuído | Local / CI | 2.40+ |
| **GitHub** | Monorepo, Pull Requests, Actions e Rulesets | Cloud | `ADS-IFPB-SR/alumigest` |
| **Java JDK** | Plataforma de compilação backend | Backend | 21 LTS (Eclipse Temurin) |
| **Spring Boot** | Framework REST API, Injeção e Data JPA | Backend | 3.4.2 |
| **React, Vite & TS** | SPA e empacotamento | Frontend | React 19.2 / Vite 8.2 / TypeScript 6.0 |
| **TanStack Query** | Gerenciamento de estado de servidor e cache | Frontend | v5 |
| **Zod** | Validação estrita de schemas em runtime | Frontend | 3.x |
| **OpenPDF** | Motor de geração de PDFs de alta performance | Backend | 2.0.3 |
| **PostgreSQL** | SGBD Relacional (UUIDs, JSONB) | Banco | 16+ |
| **Flyway** | Versionamento e migrações de banco | Banco | Migrations V1–V25 (V26 em S09) |
| **SonarQube** | SAST, Cobertura JaCoCo e Quality Gate | CI/CD | `sonar.italohub.cloud` |
| **Coolify / Docker** | Deploy contínuo e staging | Staging | `develop.italuhub.cloud` |

---

## 7. Estrutura de Branches (Git Flow Adaptado)

```
main ─────────────────────────────────────────────→ (Produção / Releases v0.x.x)
  │                                        ↑
  ├─→ develop ────────────────────────────→ (Integração Contínua / Staging Coolify)
  │     │           ↑         ↑
  │     ├─→ feat/* ─┘         │
  │     ├─→ fix/* ────────────┘
  │     └─→ QA/* ─────────────┘ (Suítes de Testes e Cobertura)
  │
  └─→ planejamento ───────────────────────→ (Governança Docs-as-Code e Sprints 01-16)
```

### 7.1 Políticas de Proteção e Quality Gates
1. **Pull Requests Obrigatórios:** Proibido push direto em `main`, `develop` e `planejamento`.
2. **Workflow `run-tests-on-all-prs`:** Todo PR aberto dispara compilação do backend, execução de todos os testes unitários/integração com JaCoCo e testes Vitest do frontend.
3. **Thresholds Inegociáveis do Quality Gate SonarQube:**
   * Cobertura em Novo Código: **$\ge 80\%$**.
   * Bugs / Vulnerabilidades: **0**.
   * Débito Técnico: Classificação **A** (zero code smells bloqueantes).
4. **Alinhamento SonarLint Pré-PR:** O desenvolvedor deve validar localmente com SonarLint e Checkstyle antes de abrir o PR.

---
*Plano de Gerência de Configuração homologado pelo Oficial de Governança Técnica (`alumigest-doc-governor`) em 24/09/2026.*
