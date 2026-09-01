# DRI — Documento de Riscos

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Versão** | 2.0 (Revisado ao final da Sprint 3) |
| **Data** | 31/08/2026 |
| **Autor** | Equipe AlumiGest (Scrum Master: Italo Jefferson Lima dos Santos) |

---

## 1. Matriz de Probabilidade × Impacto

|  | **Baixo** | **Médio** | **Alto** | **Crítico** |
|---|---|---|---|---|
| **Alta** | 🟡 Moderado | 🟠 Significativo | 🔴 Crítico | 🔴 Crítico |
| **Média** | 🟢 Baixo | 🟡 Moderado | 🟠 Significativo | 🔴 Crítico |
| **Baixa** | 🟢 Baixo | 🟢 Baixo | 🟡 Moderado | 🟠 Significativo |

---

## 2. Registro e Acompanhamento de Riscos

### R01 — Indisponibilidade do Parceiro Social

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Alto |
| **Classificação** | 🟠 Significativo |
| **Descrição** | Thiago (Alumiportas) pode ter indisponibilidade de agenda para reuniões de validação, atrasando o entendimento das regras de negócio e fórmulas de cálculo. |
| **Causa** | Proprietário de empresa ativa, horários comerciais conflitantes com horários acadêmicos. |
| **Consequência** | Atraso na validação de requisitos, implementação de regras incorretas, retrabalho. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Agendar reuniões com antecedência mínima de 1 semana. 2. PO (José Guylherme) mantém canal direto via WhatsApp e visitas à fábrica. 3. Registrar decisões em ata para evitar re-validações. 4. Questionário e fotos dos materiais reais levantados pelo PO. |
| **Responsável** | José Guylherme (PO) |
| **Status** | 🟢 Mitigado / Sob Controle |

---

### R02 — Fórmulas de Cálculo Incorretas ou Incompletas

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Alto |
| **Classificação** | 🔴 Crítico |
| **Descrição** | As fórmulas de cálculo de vidro ($m^2$), perfis de alumínio (metro linear com desconto de folga e montantes) e composição de ferragens poderiam não refletir a realidade operacional da Alumiportas. |
| **Causa** | Complexidade do cálculo específico de esquadrias, variações por tipo de produto e conhecimento tácito da fábrica. |
| **Consequência** | Orçamentos com valores errados → prejuízo na precificação → perda de confiança no sistema. |
| **Estratégia** | Mitigar |
| **Ações Executadas** | 1. Implementado o padrão Factory/Strategy no backend (`BudgetQuantityService` e `BudgetPricingService` no PR #117). 2. Cobertura de 141 testes automatizados cobrindo arredondamento de vidro, desconto de perfil ($4W + 6H$) e ferragens. 3. Validação das fórmulas no documento `RN-Regras_de_Calculo.md`. |
| **Responsável** | Nichollas Cavalcante / Backend |
| **Status** | 🟢 Materializado e Mitigado (PR #117) |

---

### R03 — Complexidade Técnica Subestimada no Frontend

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Alto |
| **Classificação** | 🟠 Significativo |
| **Descrição** | A modelagem e renderização dinâmica de interfaces complexas (Wizard de 3 passos, cálculo reativo de subtotal e desenhos paramétricos SVG) podem exigir mais esforço que o previsto. |
| **Causa** | Curva de aprendizado em componentes vetoriais SVG e integração assíncrona com TypeScript/React. |
| **Consequência** | Atraso nas entregas de frontend e sobrecarga no fluxo de desenvolvimento. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Subdivisão das demandas em sub-issues menores. 2. Disponibilização de templates JSX/SVG de referência no grupo. 3. Apoio contínuo e pair programming nas tarefas complexas. |
| **Responsável** | Scrum Master / Equipe Frontend |
| **Status** | ⚪ Não materializado |

---

### R04 — Evasão de Membros da Equipe

| Campo | Valor |
|---|---|
| **Probabilidade** | Baixa |
| **Impacto** | Alto |
| **Classificação** | 🟡 Moderado |
| **Descrição** | Membros da equipe podem trancar a disciplina, desistir do curso ou ter problemas pessoais que os impeçam de continuar. |
| **Causa** | Natureza acadêmica do projeto, compromissos pessoais ou sobrecarga. |
| **Consequência** | Redução da capacidade da equipe, necessidade de redistribuir tarefas, possível corte de escopo. |
| **Estratégia** | Aceitar + Contingência |
| **Ações** | 1. Matriz de backup no PPJ. 2. Documentação contínua de código e arquitetura para mitigar bus factor. |
| **Responsável** | Scrum Master + PO |
| **Status** | ⚪ Não materializado (Equipe completa com 8 membros) |

---

### R05 — Conflitos de Merge e Integração de Branches

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Médio |
| **Classificação** | 🟠 Significativo |
| **Descrição** | Múltiplos desenvolvedores atuando simultaneamente em branches paralelas podem gerar conflitos em arquivos compartilhados (migrations Flyway, rotas do Frontend e schemas Zod). |
| **Causa** | Múltiplos PRs abertos simultaneamente sem merge contínuo da `develop`. |
| **Consequência** | Tempo perdido resolvendo conflitos, possibilidade de perda de código e atraso na integração. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Governança rígida de numeração de migrations. 2. Pipeline de CI no GitHub Actions validando Maven e build do Vite em todo PR. 3. Ambiente de homologação em nuvem `develop.italuhub.cloud` para validações integradas. |
| **Responsável** | Italo Jefferson (DevOps) / Todos os DEVs |
| **Status** | ⚪ Não materializado |

---

### R06 — Inconsistências de Ambiente e Tipagem no Banco

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Médio |
| **Classificação** | 🟡 Moderado |
| **Descrição** | Incompatibilidades de driver JDBC com PostgreSQL (ex: UUID vs `bytea`) e execução de Docker Compose local. |
| **Causa** | Variação de sistemas operacionais e mapeamentos Hibernate. |
| **Consequência** | Erros HTTP 500 no backend que bloqueavam o avanço do frontend. |
| **Estratégia** | Mitigar |
| **Ações Executadas** | 1. Dockerfile e Docker Compose padronizados no PR #55. 2. Resolução definitiva do mapeamento de tipos no PR #38. |
| **Responsável** | Italo Jefferson / Nichollas Cavalcante |
| **Status** | 🟢 Materializado e Mitigado |

---

### R07 — Mudança e Refinamento de Requisitos de Domínio

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Médio |
| **Classificação** | 🟠 Significativo |
| **Descrição** | Necessidade de refatorar modelos de dados ao constatar que a mão de obra (`laborCost`) não pertence ao produto base do catálogo, mas sim a cada item do orçamento sob medida. |
| **Causa** | Amadurecimento do entendimento do modelo de negócios da vidraçaria durante a Sprint 3. |
| **Consequência** | Retrabalho para remover colunas do banco e ajustar DTOs e telas. |
| **Estratégia** | Mitigar |
| **Ações Executadas** | 1. Criação da migration Flyway V10 e refatoração completa no backend e frontend através dos PRs #119 e #120. 2. Desacoplamento da gestão complexa de estoque para manter o motor focado na venda direta. |
| **Responsável** | Italo Jefferson / Nichollas Cavalcante |
| **Status** | 🟢 Materializado e Mitigado (PR #119/#120) |

---

### R08 — Não Cumprimento do Cronograma Acadêmico (Prazos de Release)

| Campo | Valor |
|---|---|
| **Probabilidade** | Baixa |
| **Impacto** | Crítico |
| **Classificação** | 🟠 Significativo |
| **Descrição** | O projeto tem prazo fixo vinculado ao calendário acadêmico do IFPB. Atrasos podem comprometer a entrega da Release 1 homologada. |
| **Causa** | Atrasos acumulados em sprints intermediárias. |
| **Consequência** | Não homologação do sistema com o parceiro social no prazo estipulado. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Priorização rígida de itens *Must Have*. 2. Replanejamento transparente de itens não críticos (ex: postergação de etiquetas e relatórios para a Sprint 4). 3. Acompanhamento por relatórios de auditoria e RAP a cada sprint. |
| **Responsável** | Scrum Master + PO |
| **Status** | 🟡 Sob Monitoramento Ativo |

---

### 🆕 R09 — Desalinhamento entre Abordagens Frontend-First e Backend-First

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Médio |
| **Classificação** | 🟡 Moderado |
| **Descrição** | O desenvolvimento de telas no frontend utilizando mocks ou DTOs presumidos antes da finalização dos endpoints REST gera fricção de integração e retrabalho de code review. |
| **Causa** | Desenvolvimento paralelo com contratos de API não homologados previamente no Swagger. |
| **Consequência** | Dificuldade no teste end-to-end e acúmulo de apontamentos em PRs de frontend (ex: feedback da Daily de 28/08). |
| **Estratégia** | Mitigar |
| **Ações** | 1. Adoção obrigatória de *API-First*: endpoints e DTOs devem ser definidos no documento `API-Especificacao_API_REST.md` antes da codificação das telas. 2. Uso do Swagger/OpenAPI local e do ambiente `develop.italuhub.cloud` como fonte única de verdade. |
| **Responsável** | Todos os Desenvolvedores (Backend & Frontend) |
| **Status** | 🟡 Identificado na Sprint 3 / Ação para Sprint 4 |

---

### 🆕 R10 — Sobrecarga no Escopo da Sprint 4 (Acúmulo de Entregas)

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Alto |
| **Classificação** | 🔴 Crítico |
| **Descrição** | A Sprint 4 precisará absorver as demandas postergadas da Sprint 3 (Relatório Comercial, Romaneio e PDF), o débito técnico da US-04 (Templates SVG de Produtos) e os novos requisitos de Descontos Comerciais e Homologação. |
| **Causa** | Acúmulo de entregas não finalizadas nas sprints anteriores. |
| **Consequência** | Risco de estouro de prazo na entrega da Release 1. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Priorização MoSCoW rígida: Emissão do PDF Comercial e Descontos são *Must Have*; Romaneio e Templates SVG avançados entram como *Should Have*. 2. Foco imediato na aprovação e merge dos PRs #110 e #111 no primeiro dia da Sprint 4. |
| **Responsável** | Scrum Master / PO |
| **Status** | 🟡 Ativo para a Sprint 4 |

---

## 3. Resumo da Matriz de Riscos (Versão 2.0)

| Classificação | Quantidade | IDs |
|---|:---:|---|
| 🔴 **Crítico** | **2** | R02, R10 |
| 🟠 **Significativo** | **4** | R01, R03, R05, R08 |
| 🟡 **Moderado** | **4** | R04, R06, R07, R09 |
| 🟢 **Baixo** | **0** | — |
| **Total de Riscos Mapeados** | **10** | |

---

*Documento revisado e atualizado pela Equipe AlumiGest — Sprint 03 — 31/08/2026*
