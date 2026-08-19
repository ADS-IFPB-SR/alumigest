# DRI — Documento de Riscos

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |

---

## 1. Matriz de Probabilidade × Impacto

|  | **Baixo** | **Médio** | **Alto** | **Crítico** |
|---|---|---|---|---|
| **Alta** | 🟡 Moderado | 🟠 Significativo | 🔴 Crítico | 🔴 Crítico |
| **Média** | 🟢 Baixo | 🟡 Moderado | 🟠 Significativo | 🔴 Crítico |
| **Baixa** | 🟢 Baixo | 🟢 Baixo | 🟡 Moderado | 🟠 Significativo |

---

## 2. Registro de Riscos

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
| **Ações** | 1. Agendar reuniões com antecedência mínima de 1 semana. 2. PO (José Guylherme) mantém canal direto via WhatsApp. 3. Registrar decisões em ata para evitar re-validações. 4. Preparar questionário escrito como fallback se reunião presencial não for possível. |
| **Responsável** | José Guylherme (PO) |
| **Status** | ⚪ Não materializado |

---

### R02 — Fórmulas de Cálculo Incorretas ou Incompletas

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Alto |
| **Classificação** | 🔴 Crítico |
| **Descrição** | As fórmulas de cálculo de vidro (m²), alumínio (metro linear) e composição de ferragens podem não refletir a realidade operacional da Alumiportas, gerando orçamentos incorretos. |
| **Causa** | Complexidade do cálculo específico de esquadrias, variações por tipo de produto, conhecimento tácito do proprietário. |
| **Consequência** | Orçamentos com valores errados → perda de confiança no sistema → abandono da ferramenta. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Sessão de Three Amigos com Thiago na Sprint 2. 2. Validar fórmulas com orçamentos reais (pegar 3-5 orçamentos manuais e comparar). 3. Tornar composições e fórmulas configuráveis (admin pode ajustar). 4. Criar testes unitários com valores conhecidos. |
| **Responsável** | Equipe de desenvolvimento |
| **Status** | ⚪ Não materializado |

---

### R03 — Complexidade Técnica Subestimada

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Alto |
| **Classificação** | 🟠 Significativo |
| **Descrição** | A equipe é formada por alunos com experiência variada em Java/Spring Boot, JPA, TypeScript e Docker. Tarefas podem levar mais tempo que o estimado. |
| **Causa** | Curva de aprendizado, primeira experiência com stack completa, complexidade de integração. |
| **Consequência** | Atraso na entrega de sprints, acúmulo de débito técnico, frustração da equipe. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Pair programming obrigatório em duplas. 2. Coding dojo na primeira semana. 3. Buffer de 20% nos story points estimados. 4. LP monitora burndown diariamente e escala impedimentos. |
| **Responsável** | LP da sprint (rotativo) |
| **Status** | ⚪ Não materializado |

---

### R04 — Evasão de Membros da Equipe

| Campo | Valor |
|---|---|
| **Probabilidade** | Baixa |
| **Impacto** | Alto |
| **Classificação** | 🟡 Moderado |
| **Descrição** | Membros da equipe podem trancar a disciplina, desistir do curso ou ter problemas pessoais que os impeçam de continuar. |
| **Causa** | Natureza acadêmica do projeto, compromissos pessoais, dificuldade com a disciplina. |
| **Consequência** | Redução da capacidade da equipe, necessidade de redistribuir tarefas, possível corte de escopo. |
| **Estratégia** | Aceitar + Contingência |
| **Ações** | 1. Matriz de backup no PPJ (cada papel tem substituto). 2. Documentar conhecimento para reduzir bus factor. 3. Se ocorrer, LP redistribui tarefas e negocia escopo com PO. |
| **Responsável** | LP + PO |
| **Status** | ⚪ Não materializado |

---

### R05 — Conflitos de Merge e Integração

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Médio |
| **Classificação** | 🟠 Significativo |
| **Descrição** | Com 8 desenvolvedores trabalhando em paralelo no mesmo monorepo, conflitos de merge são prováveis, especialmente em arquivos compartilhados (migrations, configs). |
| **Causa** | Múltiplos PRs em paralelo, edição de arquivos compartilhados, falta de comunicação. |
| **Consequência** | Tempo perdido resolvendo conflitos, possibilidade de perda de código, atraso na integração. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Branches curtas (máximo 3 dias). 2. Merges frequentes da develop para a branch de trabalho. 3. Cada dupla trabalha em módulo isolado (package-by-feature reduz conflitos). 4. Workshop de resolução de conflitos Git. |
| **Responsável** | Todos os DEVs |
| **Status** | ⚪ Não materializado |

---

### R06 — Problemas de Infraestrutura (Docker/PostgreSQL)

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Médio |
| **Classificação** | 🟡 Moderado |
| **Descrição** | Problemas de compatibilidade na infraestrutura (ex: conflito de tipagem UUID/Bytea no PostgreSQL) ou configuração local de Docker. |
| **Causa** | Diferentes SOs (Windows/Mac/Linux), versões do driver JDBC incompatíveis com o schema do Postgres. |
| **Consequência** | Erros de execução (HTTP 500) que bloqueiam o Frontend. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Docker Compose padroniza o ambiente. 2. Code Review focado (O erro de tipagem `bytea` foi resolvido no PR #38 via anotações JPA). |
| **Responsável** | Italo / Joseph |
| **Status** | 🟢 Materializado e Mitigado |

---

### R07 — Mudança de Requisitos pelo Parceiro

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Médio |
| **Classificação** | 🟡 Moderado |
| **Descrição** | Thiago pode solicitar mudanças significativas nos requisitos após o início do desenvolvimento, especialmente nas fórmulas de cálculo ou tipos de produto. |
| **Causa** | Entendimento progressivo do sistema, novas necessidades identificadas no uso. |
| **Consequência** | Retrabalho, atraso na entrega. |
| **Estratégia** | Aceitar |
| **Ações** | 1. A arquitetura package-by-feature facilita mudanças localizadas. 2. Composições e fórmulas são configuráveis (não hardcoded). 3. Mudanças são priorizadas pelo PO e adicionadas ao backlog. 4. Metodologia IMPROS (ágil) já prevê adaptação. |
| **Responsável** | PO (José Guylherme) |
| **Status** | ⚪ Não materializado |

---

### R08 — Não Cumprimento do Cronograma Acadêmico

| Campo | Valor |
|---|---|
| **Probabilidade** | Baixa |
| **Impacto** | Crítico |
| **Classificação** | 🟠 Significativo |
| **Descrição** | O projeto tem prazo fixo vinculado ao calendário acadêmico. Se as 3 releases não forem entregues a tempo, o projeto extensionista pode ser comprometido. |
| **Causa** | Atrasos acumulados, escopo excessivo, problemas técnicos graves. |
| **Consequência** | Entrega incompleta, nota prejudicada, comprometimento do projeto extensionista. |
| **Estratégia** | Mitigar |
| **Ações** | 1. Priorização rígida (Must Have primeiro). 2. Cortar features "Could Have" se necessário. 3. RAP a cada sprint com avaliação de prazo. 4. Release 1 deve ser funcional mesmo sem R2 e R3. |
| **Responsável** | LP + PO + Orientador |
| **Status** | ⚪ Não materializado |

---

## 3. Resumo da Matriz de Riscos

| Classificação | Quantidade | IDs |
|---|---|---|
| 🔴 Crítico | 1 | R02 |
| 🟠 Significativo | 4 | R01, R03, R05, R08 |
| 🟡 Moderado | 3 | R04, R06, R07 |
| 🟢 Baixo | 0 | — |
| **Total** | **8** | |

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
