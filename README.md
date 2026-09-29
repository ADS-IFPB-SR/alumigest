# 🏭 AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias

[![Licença](https://img.shields.io/badge/license-Academic-blue.svg)](#)
[![Java](https://img.shields.io/badge/Java-21_LTS-orange.svg)](#)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-green.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue.svg)](#)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)](#)

O **AlumiGest** é uma solução de software integrada desenvolvida para modernizar, automatizar e integrar as operações da empresa **Alumiportas**, abrangendo desde o cálculo de orçamentos técnicos de vidraçaria e esquadrias de alumínio até o controle de estoque, ordens de corte/produção e acompanhamento financeiro.

---

## 🏛️ Contexto Acadêmico & Extensão Universitária

- **Instituição:** Instituto Federal de Educação, Ciência e Tecnologia da Paraíba (**IFPB**) - Campus Santa Rita
- **Curso:** Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas (**CST em ADS**)
- **Componente Curricular:** Projeto Integrador I (**Projeto I**)
- **Parceiro Social / Beneficiário:** **Alumiportas** (Fábrica e Comércio de Vidraçaria e Esquadrias de Alumínio)
- **Patrocinador:** Thiago Thasso de Melo
- **Marco Legal:** Curricularização da Extensão Universitária (*Resolução CNE/CES nº 7/2018* e *Resolução CONSUPER/IFPB nº 34/2022*)

---

## 👥 Equipe AlumiGest

| Integrante | Papel Principal |
| :--- | :--- |
| **José Guilherme** | Product Owner (PO - Papel Fixo) |
| **Italo Santos** | Equipe Técnica / Gerente de Projeto (S01) /  DEV |
| **Nichollas** | Equipe Técnica /  DEV |
| **Hebert** | Equipe Técnica / DEV |
| **Gabriel** | Equipe Técnica / DEV |
| **Guilherme Kauã** | Equipe Técnica / DEV |
| **Júlio Kennedy** | Equipe Técnica / DEV  |
| **Maylson** | Equipe Técnica / DEV  |

*Metodologia de trabalho: **IMPROS (Scrum Adaptado) com Sprints quinzenais de 15 dias e rotação dos papéis de Gerente de Projeto (Scrum Master), Testador (QA) e Desenvolvedor (DEV)**.*

---

## 📁 Estrutura do Repositório (Monorepo)

O repositório adota a estrutura padronizada no **Plano de Gerência de Configuração (PGC)**:

```text
alumigest/
├── .github/                       # Templates de PR, Issues e Workflows de CI/CD
├── docs/                          # Documentação oficial do projeto
│   ├── sistema/                   # Documentação compartilhada de sistema
│   │   ├── 000-requisitos/        # Requisitos, User Stories e Casos de Uso
│   │   ├── 001-analise-projeto/   # Arquitetura, diagramas UML e APIs
│   │   ├── 002-implementacao/     # Padrões técnicos e convenções
│   │   ├── 003-teste/             # Cenários de teste de aceitação (TEA)
│   │   └── 004-gerencia-configuracao/ # PGC (Plano de Gerência de Configuração)
│   └── projeto-001/               # Acompanhamento do primeiro ciclo de projeto
│       ├── 000-gerencia-projeto/  # PPJ (Plano de Projeto e Apresentações)
│       ├── 001-atas-reuniao/      # Atas de reuniões (ATA) e alinhamentos
│       ├── 002-acompanhamento/    # Planos de sprint (PIT), Burndown (BRD) e RAP
│       └── 003-teste/             # Relatórios de testes por sprint
├── backend/                       # Código-fonte Java 21 LTS + Spring Boot 3
├── frontend/                      # Código-fonte TypeScript 5 + PWA
├── .gitignore                     # Filtros de arquivos para o Git
└── README.md                      # Apresentação principal do repositório
```

---

## 🌿 Estratégia de Branches (Git Flow Adaptado)

- **`main`**: Branch de produção e releases homologadas. Protegida contra commits diretos.
- **`develop`**: Branch de integração ativa da sprint. Merges feitos exclusivamente via Pull Request aprovado.
- **`feat/*`**: Novas funcionalidades (ex: `feat/calculo-orcamento-vidro`).
- **`fix/*`**: Correções de bugs na sprint (ex: `fix/desconto-perfil-aluminio`).
- **`release/*`**: Preparação e testes finais para entrega de versão (ex: `release/v1.0.0`).
- **`hotfix/*`**: Correções críticas emergenciais em produção.
- **`docs/*`**: Alterações exclusivas de documentação.

---

## 🏷️ Padrões de Baseline e Versionamento

- **Versionamento Semântico:** `v<MAJOR>.<MINOR>.<PATCH>` (ex: `v1.0.0`).
- **Baselines de Sprint:** `B-ALG-v<MAJOR>.<MINOR>.<PATCH>-S<SPRINT>-<SEQ>` (ex: `B-ALG-v1.0.0-S01-01`).
- **Releases Homologadas:** `R-ALG-v<MAJOR>.<MINOR>.<PATCH>` (ex: `R-ALG-v1.0.0`).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Java JDK 21 LTS**
- **Node.js 20 LTS**
- **Docker e Docker Compose**
- **Git**

```bash
# 1. Clonar o repositório
git clone https://github.com/ADS-IFPB-SR/alumigest.git

# 2. Acessar o diretório
cd alumigest

# 3. Subir banco de dados local com Docker
docker compose up -d

# 4. Executar o Backend (Spring Boot)
cd backend
./mvnw spring-boot:run

# 5. Executar o Frontend (TypeScript PWA)
cd ../frontend
npm install
npm run dev
```

---
*Documentação gerada conforme as diretrizes do PGC e do Plano de Projeto AlumiGest.*
