# PGC — Plano de Gerência de Configuração

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.2 (Atualizado com a Baseline B-ALG-v0.3.0-S03-01 da Sprint 3) |
| **Data/Hora** | 31/08/2026 - 16:00 |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 03/08/2026 | 1.0 | Versão inicial do Plano de Gerência de Configuração | Nichollas / Italo Santos |
| 18/08/2026 | 1.1 | Registro das Baselines de Sprint 1 e Sprint 2 | Equipe AlumiGest |
| 31/08/2026 | 1.2 | Registro da Baseline da Sprint 3 (B-ALG-v0.3.0-S03-01), SonarQube e Cypress | Equipe AlumiGest (Scrum Master: Italo Santos) |

---

## Sumário

1. [Introdução](#1-introdução)
2. [Papéis e Responsabilidades](#2-papéis-e-responsabilidades)
3. [Plano de Configuração](#3-plano-de-configuração)
4. [Métodos de Identificação](#4-métodos-de-identificação)
5. [Ambiente, Ferramentas e Infraestrutura](#5-ambiente-ferramentas-e-infraestrutura)
6. [Estrutura de Branches do Projeto](#6-estrutura-de-branches-do-projeto)

---

## 1. Introdução

Este documento descreve o Plano de Gerência de Configuração para o projeto de desenvolvimento do sistema **AlumiGest** — Sistema de Gestão para Vidraçaria e Esquadrias, destinado à empresa Alumiportas.

### 1.1 Objetivos

Apresentar a organização, nomenclatura, controle de branches, baselines e regras de versionamento para a gerência de configuração do projeto AlumiGest, em conformidade com as diretrizes acadêmicas do IFPB e o processo EPF.

---

## 2. Papéis e Responsabilidades

| Papel | Responsabilidade |
|---|---|
| **Product Owner (PO)** | Papel exercido por José Guilherme. Priorização do Backlog, aceite de User Stories e validação de entregas com a Alumiportas. |
| **Scrum Master / Gerente de Configuração** | Condução das cerimônias, monitoramento do Burndown (BRD) e geração/registro formal das Baselines de software e documentação. |
| **Quality Assurance (QA)** | Elaboração e execução de testes automatizados (JUnit 5, Mockito, Cypress E2E), validação de Quality Gates no SonarQube e preenchimento dos relatórios TEA/RET. |
| **Desenvolvedor (DEV)** | Implementação técnica em backend (Java 21/Spring Boot 3.4) e frontend (React 18/Vite/TypeScript), submetendo Pull Requests protegidos. |

---

## 3. Plano de Configuração

### 3.1 Controle de Configuração
O controle de configuração é realizado na plataforma **GitHub** (organização `ADS-IFPB-SR/alumigest`), operado em estrutura de **Monorepo**.

### 3.2 Estrutura de Diretórios de Documentação

```
alumigest/
├── docs/
│   ├── sistema/                      # Artefatos do Produto / Sistema
│   │   ├── 000-requisitos/           # PBL, REQ, UCS, RN
│   │   ├── 001-analise-projeto/      # ARQ, MER, DER, DCC, API, ESQ
│   │   ├── 002-especificacoes/       # SPEC-SonarQube-CI-Pipeline
│   │   ├── 002-implementacao/        # PAD, GIT
│   │   ├── 003-teste/                # TEA por sprint
│   │   └── 004-gerencia-configuracao/# PGC
│   └── projeto-001/                  # Artefatos do Projeto / Processo
│       ├── 000-gerencia-projeto/     # PPJ, DRI
│       ├── 001-atas-reuniao/         # ATAs de Planning, Dailies, Review, Retro
│       ├── 002-acompanhamento/       # PIT, BRD, RAP por sprint
│       └── 003-teste/                # PLT e RET por sprint
├── backend/                          # Código Java 21 LTS + Spring Boot 3.4
└── frontend/                         # Código React 18 + Vite + TypeScript
```

---

## 4. Métodos de Identificação e Versionamento

### 4.1 Identificadores de Artefatos

| ID | Nome do Artefato |
|---|---|
| **PPJ** | Plano de Projeto |
| **REQ** | Documento de Requisitos |
| **UCS** | Documento de Casos de Uso |
| **PBL** | Product Backlog |
| **TEA** | Testes de Aceitação |
| **PGC** | Plano de Gerência de Configuração |
| **PIT** | Plano de Iteração |
| **DRI** | Documento de Riscos |
| **ATA** | Ata de Reunião |
| **RAP** | Relatório de Acompanhamento do Projeto |
| **BRD** | Burndown |
| **ARQ** | Documento de Arquitetura |
| **MER** | Modelo de Dados |
| **DER** | Diagrama Entidade-Relacionamento |
| **API** | Especificação de API REST |
| **DCC** | Diagrama de Classes |
| **PAD** | Padrões de Código |
| **GIT** | Guia de Commits e Branches |
| **RN**  | Regras de Negócio e Cálculo |
| **PLT** | Plano Geral de Testes |
| **RET** | Relatório de Execução de Testes |

---

### 4.2 Formato de Baselines e Histórico Registrado

```
B-ALG-v<MAJOR>.<MINOR>.<PATCH>-S<SPRINT>-<SEQ>
```

| Baseline | Data | Sprint | Escopo Consolidado | Status |
|---|---|---|---|---|
| `B-ALG-v0.1.0-S01-01` | 03/08/2026 | Sprint 01 | Iniciação, Governança, PGC, PPJ e setup monorepo | ✅ Aprovada |
| `B-ALG-v0.2.0-S02-01` | 18/08/2026 | Sprint 02 | Catálogo Universal de Materiais, Fichas Técnicas e PWA | ✅ Aprovada |
| `B-ALG-v0.3.0-S03-01` | 31/08/2026 | Sprint 03 | Motor de Orçamentos, CRUD Clientes Backend, Templates de Esquadrias, SonarQube e Cypress E2E | ✅ Aprovada |

---

## 5. Ambiente, Ferramentas e Infraestrutura

| Software / Ferramenta | Propósito | Ambiente | Versão / Hospedagem |
|---|---|---|---|
| **Git** | Sistema de controle de versão distribuído | Todos | 2.40+ |
| **GitHub** | Hospedagem de monorepo, PRs, Rulesets e Actions | Cloud | GitHub Enterprise / Free |
| **Java JDK** | Plataforma de execução e compilação backend | Backend | 21 LTS (Eclipse Temurin) |
| **Spring Boot** | Framework de API REST, Injeção e Data JPA | Backend | 3.4.2 |
| **Node.js & npm** | Runtime e gerenciador de pacotes frontend | Frontend | 20 LTS |
| **React & Vite** | Framework SPA e bundler PWA | Frontend | React 18 / Vite 6 |
| **PostgreSQL** | SGBD Relacional (UUIDs, JSONB) | Banco | 16+ |
| **Flyway** | Versionamento e migrações de banco | Banco | 10.x (Migrations V1-V10) |
| **SonarQube** | Análise estática SAST, Bugs e Cobertura JaCoCo | CI/CD | Community Edition (`sonar.italohub.cloud`) |
| **Cypress** | Suíte de testes automatizados End-to-End (E2E) | Frontend | 13.x |
| **Coolify / Docker** | Orquestração e Staging de deploy contínuo | Staging | `develop.italuhub.cloud` |

---

## 6. Estrutura de Branches (Git Flow Adaptado)

```
main ─────────────────────────────────────────────→ (Produção / Release v1.0.0)
  │                                        ↑
  └─→ develop ────────────────────────────→ (Integração Contínua / Staging)
        │           ↑         ↑
        └─→ feat/* ─┘         │
        └─→ fix/* ────────────┘
```

### 6.1 Políticas de Proteção
* **Merge Protegido:** Pull Requests obrigatórios para `main` e `develop`.
* **Quality Gate Obrigatório:** Validação de build, 141 testes JUnit 5, Checkstyle e Quality Gate SonarQube antes de qualquer merge.
* **Proibição de Direct Push:** `main` e `develop` não aceitam commits diretos.

---

*Plano de Gerência de Configuração homologado — Versão 1.2 — 31/08/2026*
