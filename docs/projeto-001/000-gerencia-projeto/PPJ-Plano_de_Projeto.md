# PPJ — Plano de Projeto AlumiGest

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.0 |
| **Data** | 03/08/2026 |
| **Empresa Beneficiária** | Alumiportas |
| **Patrocinador** | Thiago Thasso de Melo (Proprietário) |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 03/08/2026 | 1.0 | Versão inicial do Plano de Projeto | Ítalo Jefferson / Equipe AlumiGest |

---

## Sumário

1. [Introdução](#1-introdução)
2. [Objetivos do Projeto](#2-objetivos-do-projeto)
3. [Parceiro Social e Contexto Extensionista](#3-parceiro-social-e-contexto-extensionista)
4. [Justificativa da Proposta](#4-justificativa-da-proposta)
5. [Resumo e Abrangência da Proposta](#5-resumo-e-abrangência-da-proposta)
6. [Equipe, Papéis e Matriz de Backups](#6-equipe-papéis-e-matriz-de-backups)
7. [Stakeholders do Projeto](#7-stakeholders-do-projeto)
8. [Estrutura Analítica do Projeto (EAP/WBS)](#8-estrutura-analítica-do-projeto-eapwbs)
9. [Escopo e Cronograma de Releases](#9-escopo-e-cronograma-de-releases)
10. [Premissas do Projeto](#10-premissas-do-projeto)
11. [Restrições do Projeto](#11-restrições-do-projeto)
12. [Matriz de Riscos e Planos de Mitigação](#12-matriz-de-riscos-e-planos-de-mitigação)
13. [Próximos Passos](#13-próximos-passos)

---

## 1. Introdução

Este documento apresenta o Plano de Projeto (PPJ) do sistema **AlumiGest** — Sistema de Gestão para Vidraçaria e Esquadrias, desenvolvido para a empresa **Alumiportas**, localizada em Santa Rita - PB.

O projeto é realizado no contexto da disciplina de **Projeto I** do CST em Análise e Desenvolvimento de Sistemas do **IFPB**, seguindo as diretrizes de extensão universitária conforme a Resolução CNE/CES nº 7/2018.

A metodologia adotada é o processo **IMPROS** (Scrum adaptado), com sprints quinzenais de 15 dias e cerimônias de Planning, Review e Retrospective.

---

## 2. Objetivos do Projeto

### 2.1 Objetivo Geral

Desenvolver e implantar um sistema web integrado para a Alumiportas que centralize e automatize a gestão comercial, operacional, controle de estoque, ordens de produção e fluxo financeiro da vidraçaria.

### 2.2 Objetivos Específicos

| # | Objetivo |
|---|---|
| OE-01 | Cadastrar clientes, fornecedores, perfis de alumínio, tipos de vidro, ferragens e serviços |
| OE-02 | Elaborar orçamentos técnicos e comerciais com cálculo automático de áreas, perímetros e insumos |
| OE-03 | Calcular consumo exato de vidro (m²), perfis de alumínio (metro linear), películas e ferragens |
| OE-04 | Aplicar descontos comerciais e gerar propostas profissionais em PDF (com e sem valores) |
| OE-05 | Gerar pedidos aprovados com dados congelados, ordens de produção, etiquetas e listas de corte |
| OE-06 | Controlar estoque com movimentações em tempo real, reservas automáticas e registro de perdas |
| OE-07 | Registrar contas a receber, histórico de pagamentos, fluxo de caixa e indicadores de desempenho |
| OE-08 | Acompanhar o ciclo de vida do pedido: Orçamento → Produção → Instalação / Retirada |

---

## 3. Parceiro Social e Contexto Extensionista

### 3.1 Empresa Beneficiária

| Campo | Detalhe |
|---|---|
| **Empresa** | Alumiportas |
| **Segmento** | Fábrica e comércio de esquadrias de alumínio e vidraçaria |
| **Atuação** | Produção sob medida e instalação de portas, box para banheiro, espelhos |
| **Localização** | Santa Rita - PB |
| **Proprietário** | Thiago Thasso de Melo |

### 3.2 Relevância Social e Extensionista

Conforme a Resolução CNE/CES nº 7/2018:

- **Impacto econômico direto** em micro/pequena empresa local da comunidade
- **Aplicação prática** de conhecimentos do CST em ADS em demandas de mercado reais
- **Apoio à modernização produtiva**, redução de desperdícios de materiais e melhoria no atendimento aos clientes da região

---

## 4. Justificativa da Proposta

### 4.1 Problemas Identificados na Operação Atual

| Problema | Descrição | Impacto |
|---|---|---|
| **Cálculos Manuais e Demorados** | Orçamentos de vidro (m²), perfis de alumínio (metro linear) e ferragens calculados manualmente ou em planilhas isoladas | Lentidão no atendimento e margem de erro financeiro |
| **Desperdício de Insumos e Sobras** | Falta de controle sistemático sobre retalhos de vidro e sobras de barras de alumínio de 3 ou 6 metros | Perda de material e aumento de custos operacionais |
| **Descompasso Comercial vs. Produção** | Orçamentos aprovados não geram ordens de produção ou listas de corte automáticas, dependendo de anotações físicas | Suscetibilidade a perdas de informação e retrabalho |
| **Controle Financeiro Fragmentado** | Dificuldade na gestão de parcelamentos, entradas, contas a receber e histórico de pagamentos de clientes | Falta de visibilidade financeira e inadimplência |

---

## 5. Resumo e Abrangência da Proposta

### 5.1 Resumo

Sistema Web PWA integrado para gestão de orçamentos técnicos, pedidos, controle de estoque de vidraçaria/esquadrias, ordens de corte/produção e controle financeiro.

### 5.2 Escopo — Dentro da Abrangência

| Módulo | Funcionalidades |
|---|---|
| **Cadastros** | Clientes, fornecedores, tipos de vidro, perfis de alumínio, películas e ferragens |
| **Orçamentos** | Motor automático de cálculo por medidas (m² / metro linear / unidade) e geração de PDF |
| **Pedidos** | Aprovação de orçamento com congelamento, geração de OP e Listas de Corte |
| **Estoque** | Controle de estoque, reservas automáticas, registro de perdas e acompanhamento de status |
| **Financeiro** | Contas a receber, parcelamentos, controle de caixa e relatórios |

### 5.3 Fora da Abrangência (Não-Escopo Inicial)

- Emissão fiscal direta de NF-e/NFS-e (integração SEFAZ)
- TEF ou maquininha de cartão integrada diretamente ao software
- Aplicativo nativo para lojas (Play Store / App Store) — substituído com eficiência por PWA

---

## 6. Equipe, Papéis e Matriz de Backups

### 6.1 Composição da Equipe

| Papel (Processo IMPROS) | Membro Titular | Membro de Backup | Responsabilidade Principal |
|---|---|---|---|
| Product Owner (Fixo) | José Guilherme | Italo Santos | Priorização de backlog e validação com parceiro social |
| Gerente de Projeto (Rotativo) | Rotativo por Sprint | José Guilherme | Gestão do cronograma, reuniões e facilitação ágil |
| Desenvolvimento (DEV) | Equipe (8 membros) | Membros da Sprint | Implementação Spring Boot 3 e TypeScript PWA |
| Qualidade & Testes (QA) | Rotativo por Sprint | Maylson / Gabriel | Testes de aceitação (TEA), unitários e Three Amigos |

### 6.2 Membros da Equipe de Desenvolvimento

1. José Guilherme (PO)
2. Italo Santos
3. Guilherme Kauã
4. Gabriel
5. Hebert
6. Júlio Kennedy
7. Maylson
8. Nichollas

### 6.3 Papéis Rotativos por Sprint

- Líder técnico / responsável pela arquitetura
- Responsável pelo desenvolvimento
- Responsável pela qualidade e testes
- Responsável pela documentação
- Responsável por DevOps, integração e entrega

---

## 7. Stakeholders do Projeto

| Stakeholder | Papel no Projeto | Responsabilidade / Interesses | Canal de Comunicação |
|---|---|---|---|
| Thiago Thasso de Melo | Proprietário Alumiportas | Patrocinador; validação de regras de cálculo, processos e homologação | Reuniões quinzenais presenciais/online |
| José Guilherme | Product Owner (PO) | Intermediar requisitos, priorizar backlog e alinhar expectativas | Dailies, Planning e Three Amigos |
| Equipe de Desenvolvimento | Time Técnico (8 alunos) | Construção, testes, documentação e entrega contínua do sistema | GitHub, Discord e reuniões de Sprint |
| Usuários Operacionais | Operadores e Vendedores | Operação diária (orçamentos, corte, produção e estoque) | Sessões de teste e feedback prático |
| Clientes da Alumiportas | Beneficiários Indiretos | Receber propostas claras em PDF, agilidade e precisão nos pedidos | Orçamentos e documentos emitidos |
| Prof. Orientador (Ednaldo) | Orientador Acadêmico | Avaliação pedagógica, metodologia IMPROS e acompanhamento | Apresentações de Sprint Review |

---

## 8. Estrutura Analítica do Projeto (EAP/WBS)

### 8.1 Decomposição Hierárquica

```
AlumiGest (ALG)
├── 1. Iniciação & Gestão
│   ├── 1.1 Plano de Projeto (PPJ)
│   ├── 1.2 Plano de Gerência de Configuração (PGC)
│   ├── 1.3 Product Backlog (PBL)
│   └── 1.4 Atas de Reunião (ATA)
├── 2. Cadastros & Catálogo
│   ├── 2.1 Cadastro de Clientes
│   ├── 2.2 Cadastro de Fornecedores
│   ├── 2.3 Catálogo de Vidros
│   ├── 2.4 Catálogo de Perfis de Alumínio
│   ├── 2.5 Catálogo de Ferragens
│   └── 2.6 Catálogo de Películas
├── 3. Motor de Orçamentos
│   ├── 3.1 Cálculo de vidro por m²
│   ├── 3.2 Cálculo de alumínio por metro linear
│   ├── 3.3 Cálculo de ferragens por unidade
│   ├── 3.4 Aplicação de descontos
│   └── 3.5 Geração de PDF (com/sem valores)
├── 4. Pedidos & PCP
│   ├── 4.1 Conversão de orçamento em pedido
│   ├── 4.2 Congelamento de dados aprovados
│   ├── 4.3 Ordens de Produção (OP)
│   └── 4.4 Listas de Corte
├── 5. Estoque & Insumos
│   ├── 5.1 Entrada de materiais
│   ├── 5.2 Reservas por pedido
│   ├── 5.3 Baixas de consumo
│   └── 5.4 Registro de perdas
├── 6. Módulo Financeiro
│   ├── 6.1 Contas a receber
│   ├── 6.2 Parcelamentos
│   ├── 6.3 Controle de pagamentos
│   ├── 6.4 Fluxo de caixa
│   └── 6.5 Relatórios gerenciais
├── 7. Instalação & OS
│   ├── 7.1 Agenda de instalações/entregas
│   ├── 7.2 Ordens de serviço
│   └── 7.3 Encerramento de atendimentos
└── 8. DevOps & Qualidade
    ├── 8.1 Monorepo GitHub
    ├── 8.2 CI/CD GitHub Actions
    ├── 8.3 Docker
    ├── 8.4 Testes Automatizados
    └── 8.5 Baselines
```

---

## 9. Escopo e Cronograma de Releases

### 9.1 Cronograma Geral

| Release / Fase | Sprints | Período | Entregáveis |
|---|---|---|---|
| **Release 1** — Fundação & Orçamentos (v1.0.0) | Sprints 1 a 4 | Meses 1 e 2 (Ago-Set/2026) | Setup do Monorepo, CI/CD e Docker; Autenticação, perfis e usuários; Cadastro de clientes e catálogo de materiais; Motor de cálculo de orçamentos (vidro m², alumínio linear, ferragens); Aplicação de descontos e emissão de PDF (com/sem valores) |
| **Release 2** — Pedidos, Estoque e Produção (v2.0.0) | Sprints 5 a 8 | Meses 3 e 4 (Out-Nov/2026) | Aprovação de orçamento e congelamento de pedidos; Geração de OPs e etiquetas; Listas de corte de perfis e chapas de vidro; Controle de estoque, reservas automáticas e registro de perdas; Rastreamento de status de produção |
| **Release 3** — Financeiro & Conclusão (v3.0.0) | Sprints 9 a 12 | Meses 5 e 6 (Dez/2026-Jan/2027) | Contas a receber, entradas e parcelamentos; Baixa de pagamentos e fluxo de caixa; Agenda de instalações e ordens de serviço; Relatórios gerenciais e indicadores de desempenho; Homologação completa com o parceiro social |
| **Reserva** — Imprevistos & Estabilização | Sprints 13 a 16 | Meses 7 e 8 (Fev-Mar/2027) | Ajustes finos de regras de cálculo e usabilidade; Correções de homologação e estabilização de bugs; Treinamento dos usuários da Alumiportas e implantação final; Documentação final de encerramento do projeto |

### 9.2 Detalhamento da Release 1

| Sprint | Período | Entregáveis |
|---|---|---|
| Sprint 1 | Semanas 1-2 | Planejamento: PPJ, PGC, setup do repositório |
| Sprint 2 | Semanas 3-4 | Módulo de Cadastro de Materiais e Motor de Orçamentos |
| Sprint 3 | Semanas 5-6 | Cálculos de vidro, alumínio e ferragens; descontos |
| Sprint 4 | Semanas 7-8 | Geração de PDF, testes integrados, Release 1 |

---

## 10. Premissas do Projeto

| # | Premissa |
|---|---|
| P-01 | O Product Owner (José Guilherme) manterá o backlog priorizado e os critérios de aceitação refinados continuamente |
| P-02 | A equipe de 8 membros manterá dedicação compatível com ciclos quinzenais (Sprints de 15 dias) |
| P-03 | O proprietário Thiago estará disponível para reuniões de validação e Three Amigos |
| P-04 | O backend Java/Spring Boot adotará estrutura modular orientada a funcionalidades (package-by-feature) |
| P-05 | O frontend TypeScript atenderá tanto a telas desktop do escritório quanto tablets/celulares na oficina (PWA) |
| P-06 | As tabelas de preços e fórmulas de corte de vidro/alumínio serão fornecidas pelo cliente |
| P-07 | A reserva dos meses 7 e 8 será utilizada para absorver imprevistos técnicos e homologação |

---

## 11. Restrições do Projeto

| # | Restrição | Detalhamento |
|---|---|---|
| R-01 | **Prazo Rígido** | Desenvolvimento principal em até 6 meses (12 sprints) + 2 meses de buffer de estabilização |
| R-02 | **Duração de Sprint** | Ciclos fixos e inegociáveis de 2 semanas (15 dias), com cerimônias de Planning, Review e Retrospective |
| R-03 | **Stack Tecnológica Definida** | Backend obrigatório em Java 21 LTS + Spring Boot 3; Frontend em TypeScript + PWA; Banco PostgreSQL 16 |
| R-04 | **Padrão Arquitetural** | Backend estruturado exclusivamente no padrão package-by-feature |
| R-05 | **Aderência ao Processo Operacional** | O sistema não deve descaracterizar a rotina real de corte e produção da Alumiportas |
| R-06 | **Versionamento e Governança** | Monorepo GitHub com convenções estritas de Git Flow adaptado, PRs com aprovação obrigatória e SemVer |
| R-07 | **Sem Escopo Fiscal na Fase 1** | Não haverá emissão direta de notas fiscais eletrônicas (NF-e/NFS-e) no escopo inicial |

---

## 12. Matriz de Riscos e Planos de Mitigação

| # | Risco Identificado | Probabilidade | Impacto | Ação de Mitigação / Prevenção | Responsável |
|---|---|---|---|---|---|
| RI-01 | Complexidade nas regras de cálculo de esquadrias e vidro | Alta | Alto | Realizar sessões de Three Amigos com o patrocinador Thiago e validar com planilhas de teste na Sprint 1 | PO / DEV |
| RI-02 | Indisponibilidade do patrocinador para validações | Média | Alto | Agendar reuniões quinzenais fixas e utilizar protótipos rápidos no Google Stitch para validação assíncrona | PO / GP |
| RI-03 | Dificuldade na rotação de papéis por sprint | Média | Médio | Definição de matriz de backups técnicos e documentação detalhada de cada papel no PGC | Líder de Projeto |
| RI-04 | Mudanças de requisitos e aumento descontrolado de escopo | Média | Alto | Gestão rígida de backlog pelo PO, com controle de baselines e inclusão apenas em releases futuras | PO / GP |
| RI-05 | Inconsistência nos cadastros iniciais de materiais e preços | Alta | Médio | Criar templates padrão em Excel para a Alumiportas preencher antes da implementação do catálogo | PO |
| RI-06 | Atrasos no cronograma de desenvolvimento | Baixa | Alto | Monitoramento contínuo via Burndown (BRD) e utilização dos 2 meses de buffer (Meses 7 e 8) | GP |

---

## 13. Próximos Passos

### 13.1 Sprint 1 — Planejamento (Concluída ✅)

- [x] Apresentação formal do Plano de Projeto (PPJ) na disciplina
- [x] Elaboração do Plano de Gerência de Configuração (PGC)
- [x] Definição da estrutura do repositório monorepo
- [x] Geração da baseline inicial `B-ALG-v0.1.0-S01-01`

### 13.2 Sprint 2 — Cadastro de Materiais e Orçamentos (Em Planejamento)

- [ ] Refinamento Three Amigos: PO + Líder Técnico + QA para detalhar TEA da Sprint 2
- [ ] Documentação de requisitos e regras de cálculo
- [ ] Implementação do módulo de Cadastro de Materiais (vidros, alumínio, ferragens, películas)
- [ ] Implementação do motor de Orçamentos
- [ ] Setup da infraestrutura: Monorepo GitHub (ALG), CI/CD, Docker Compose

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
