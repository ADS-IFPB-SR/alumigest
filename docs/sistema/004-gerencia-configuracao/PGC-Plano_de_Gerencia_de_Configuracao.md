# PGC — Plano de Gerência de Configuração

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.0 |
| **Data/Hora** | 03/08/2026 - 17:28 |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 03/08/2026 | 1.0 | Versão inicial do Plano de Gerência de Configuração | Nichollas / Italo Santos |

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

O presente documento tem por objetivo apresentar a organização, nomenclatura, controle de branches e regras de versionamento para a gerência de configuração do projeto de desenvolvimento do sistema AlumiGest.

Este plano é destinado a todos os integrantes da equipe de desenvolvimento, ao Product Owner e ao orientador acadêmico do projeto.

### 1.2 Organização do Documento

- **Seção 2:** Descreve os papéis e responsabilidades da gerência de configuração
- **Seção 3:** Apresenta o plano de configuração, com a estrutura do repositório Monorepo no GitHub e controle de acesso
- **Seção 4:** Define os métodos de identificação de documentos, versionamento semântico, baselines e releases
- **Seção 5:** Especifica o ambiente de desenvolvimento, ferramentas e plano de software
- **Seção 6:** Descreve a estratégia de branches (Git Flow adaptado) e políticas de proteção

---

## 2. Papéis e Responsabilidades

| Papel | Responsabilidade |
|---|---|
| **Product Owner (PO)** | Papel exercido de forma fixa por José Guilherme. Responsável por priorizar o Product Backlog, definir critérios de aceitação, intermediar a comunicação com o parceiro social (Thiago/Alumiportas) e validar as releases. |
| **Gerente de Projeto / Scrum Master (LP)** | Papel exercido de forma rotativa a cada sprint. Responsável por planejar e acompanhar a sprint, conduzir as cerimônias ágeis (Planning, Review, Retrospective), monitorar o Burndown (BRD) e apoiar a geração das baselines. |
| **Testador / Quality Assurance (QA)** | Papel exercido de forma rotativa a cada sprint (1 a 2 membros). Responsável por elaborar e executar os testes de aceitação (TEA), participar do Three Amigos e garantir o cumprimento do Definition of Done (DoD). |
| **Desenvolvedor (DEV)** | Papel exercido de forma rotativa pelos demais membros da equipe. Responsável pela implementação de código no backend (Java/Spring Boot) e frontend (TypeScript/PWA), respeitando o Git Flow e submetendo Pull Requests com testes. |

---

## 3. Plano de Configuração

### 3.1 Controle de Configuração

O controle de configuração do projeto AlumiGest será realizado por meio da plataforma **GitHub**, utilizando um repositório monorepo privado identificado pela sigla **ALG**. O acesso ao repositório é concedido exclusivamente aos membros da equipe de desenvolvimento e ao professor orientador, com permissões de merge restritas via Pull Requests protegidos.

### 3.2 Estrutura do Repositório de Gerência de Configuração

```
repositório-alumiportas/
├── docs/
│   ├── sistema/
│   │   ├── 000-requisitos/
│   │   ├── 001-analise-projeto/
│   │   ├── 002-implementacao/
│   │   ├── 003-teste/
│   │   └── 004-gerencia-configuracao/
│   └── projeto-001/
│       ├── 000-gerencia-projeto/
│       ├── 001-atas-reuniao/
│       ├── 002-acompanhamento/
│       └── 003-teste/
├── backend/    (Código-fonte Java 21 LTS + Spring Boot 3)
└── frontend/   (Código-fonte TypeScript 5 + PWA)
```

### 3.3 Descrição dos Diretórios

| Diretório Principal | Subdiretório | Descrição |
|---|---|---|
| **Sistema** | `000-requisitos` | Documentos de requisitos, Casos de Uso, Product Backlog (PBL), User Stories, regras de cálculo e critérios de aceitação |
| | `001-analise-projeto` | Documentos referentes à arquitetura package-by-feature, diagramas UML, modelo de dados relacional e especificações de API REST |
| | `002-implementacao` | Documentação técnica de implementação, padrões de código e convenções de desenvolvimento |
| | `003-teste` | Documentação dos cenários de teste para as User Stories e critérios de testes de aceitação (TEA) |
| | `004-gerencia-configuracao` | Armazenamento do Plano de Gerência de Configuração (PGC) e diretrizes de versionamento |
| **Projeto-001** | `000-gerencia-projeto` | Armazenamento do Plano de Projeto (PPJ), cronogramas, EAP e apresentações |
| | `001-atas-reuniao` | Armazenamento das atas de reuniões (ATA) com o patrocinador Thiago e cerimônias de sprint |
| | `002-acompanhamento` | Subdiretórios por sprint contendo: plano da iteração (PIT), burndown (BRD), relatórios (RAP) e atas de review/retrospective |
| | `003-teste` | Armazenamento dos relatórios de execução de testes por sprint |

---

## 4. Métodos de Identificação

### 4.1 Nomenclatura de Documentos

Todos os documentos disponibilizados no repositório devem ser identificados baseados na seguinte nomenclatura:

```
<ID_ARTEFATO>-<NOME_ARTEFATO>
```

Onde:
- `<ID_ARTEFATO>`: Sigla padronizada do artefato conforme tabela abaixo
- `<NOME_ARTEFATO>`: Nome descritivo do artefato

### 4.2 Tabela de Identificadores de Artefatos

| ID_ARTEFATO | NOME_ARTEFATO |
|---|---|
| PPJ | Plano de Projeto |
| REQ | Documento de Requisitos |
| UCS | Documento de Casos de Uso |
| PBL | Product Backlog |
| TEA | Testes de Aceitação |
| PGC | Plano de Gerência de Configuração |
| PIT | Plano de Iteração |
| DRI | Documento de Riscos |
| ATA | Ata de Reunião |
| RAP | Relatório de Acompanhamento do Projeto |
| BRD | Burndown |
| ARQ | Documento de Arquitetura |
| MER | Modelo de Dados |
| API | Especificação de API REST |
| DCC | Diagrama de Classes |
| PAD | Padrões de Código |
| GIT | Guia de Commits e Branches |
| RN  | Regras de Negócio / Cálculo |

### 4.3 Versionamento

O projeto AlumiGest adota o **versionamento semântico** (Semantic Versioning) no formato `MAJOR.MINOR.PATCH`, onde:

- **MAJOR** indica mudanças incompatíveis ou releases completas (Release 1 = v1.0.0, Release 2 = v2.0.0, Release 3 = v3.0.0)
- **MINOR** indica novas funcionalidades compatíveis
- **PATCH** indica correções de bugs

As versões são registradas como **tags Git** no repositório GitHub. A documentação segue versionamento próprio, onde cada atualização incrementa o número da revisão registrado na tabela de revisões do documento.

### 4.4 Baselines e Releases

Sempre que houver uma versão estável do software para testes ou uma documentação aprovada, deve ser gerada uma **baseline** com o objetivo de recuperar o estado em que ficou o código e a documentação. O projeto utiliza tags Git no GitHub para marcar baselines e releases.

#### Formato de Baseline

```
B-ALG-v<MAJOR>.<MINOR>.<PATCH>-S<SPRINT>-<SEQ>
```

| Campo | Descrição | Exemplo |
|---|---|---|
| `MAJOR.MINOR.PATCH` | Identificador da versão (SemVer) | `1.0.0` |
| `SPRINT` | Número da sprint em que foi gerada | `03` |
| `SEQ` | Número sequencial dentro da sprint | `01` |

**Exemplo completo:** `B-ALG-v1.0.0-S03-01`

#### Formato de Release

```
R-ALG-v<MAJOR>.<MINOR>.<PATCH>
```

**Exemplo:** `R-ALG-v1.0.0` (Release 1 do sistema AlumiGest)

---

## 5. Ambiente, Ferramentas e Infraestrutura

### 5.1 Plano de Software

| Software | Propósito | Ambiente | Release/Versão |
|---|---|---|---|
| Git | Sistema de controle de versão distribuído | Todos | 2.40+ |
| GitHub | Plataforma de hospedagem do repositório, Issues, Projects e CI/CD | Todos | Cloud |
| IntelliJ IDEA | IDE principal para desenvolvimento Java/Spring Boot | Desenvolvimento | 2024.x |
| VS Code | IDE para desenvolvimento frontend TypeScript e documentação | Desenvolvimento | 1.90+ |
| Java JDK | Kit de desenvolvimento para o backend | Desenvolvimento | 21 LTS |
| Spring Boot | Framework para desenvolvimento do backend web e APIs REST | Desenvolvimento | 3.x |
| Node.js | Runtime JavaScript para o frontend TypeScript/PWA | Desenvolvimento | 20 LTS |
| TypeScript | Linguagem para o desenvolvimento do frontend | Desenvolvimento | 5.x |
| PostgreSQL | Sistema gerenciador de banco de dados relacional | Desenvolvimento / Produção | 16+ |
| Flyway | Ferramenta de migrações e versionamento do banco de dados | Desenvolvimento | 10.x |
| Docker | Containerização do ambiente de desenvolvimento e produção | Todos | 24+ |
| MS Office / Google Docs | Elaboração de documentos do projeto | Todos | Atual |
| Google Stitch | Prototipação e design de interfaces | Design | Cloud |

---

## 6. Estrutura de Branches do Projeto

O projeto AlumiGest adota o modelo **Git Flow adaptado**, com as seguintes branches:

### 6.1 Branches Principais

| Branch | Propósito | Proteção |
|---|---|---|
| `main` | Branch de produção. Contém apenas código aprovado e estável. | Merge exclusivamente via PR com aprovação obrigatória |
| `develop` | Branch de integração contínua da sprint. Todo código finalizado é integrado aqui antes de ser promovido para release. | Merge via PR obrigatório |

### 6.2 Branches de Suporte

| Branch | Propósito | Origem | Destino |
|---|---|---|---|
| `release/*` | Preparação de release. Permite ajustes finais e correções. | `develop` | `main` + `develop` |
| `hotfix/*` | Correções urgentes em produção. | `main` | `main` + `develop` |

### 6.3 Branches de Trabalho (Prefixos de Commit)

| Prefixo | Tipo | Descrição | Relação SemVer |
|---|---|---|---|
| `feat/*` | Feature | Novo recurso ou funcionalidade | MINOR |
| `fix/*` | Bug Fix | Correção de problema/bug | PATCH |
| `docs/*` | Documentação | Mudanças na documentação (sem alteração de código) | — |
| `refactor/*` | Refatoração | Mudanças que não alteram funcionalidade (melhoria de performance, code review) | — |
| `test/*` | Testes | Criação, alteração ou exclusão de testes (sem alteração de código) | — |
| `chore/*` | Manutenção | Tarefas de build, configuração, pacotes, .gitignore | — |

### 6.4 Regras de Proteção

- Merges em `main` e `develop` exigem **Pull Request com pelo menos uma aprovação** de revisão
- **Commits diretos** nestas branches **não são permitidos**
- Referência para gestão de branches: [A successful Git branching model](https://nvie.com/posts/a-successful-git-branching-model/)

---

*Documento elaborado por Nichollas e Italo Santos — Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
