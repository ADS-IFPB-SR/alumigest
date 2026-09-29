# ⚠️ DRI — Documento de Riscos do Projeto (AlumiGest)

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Versão** | 3.0 (Homologado com Mitigações de Sigilo de Produção, Subdimensionamento e Quality Gate) |
| **Data** | 24/09/2026 |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial da matriz de riscos (R01 a R06) | Ítalo Jefferson |
| 12/08/2026 | 1.1 | Adição dos riscos R07 e R08 na Sprint 2 | Equipe AlumiGest |
| 31/08/2026 | 2.0 | Revisão pós-Sprint 3 com adição dos riscos R09 e R10 e mitigação de fórmulas | Equipe AlumiGest (Scrum Master: Italo Santos) |
| 24/09/2026 | 3.0 | Atualização de mitigação de R10 e adição de R11 (Sigilo Comercial de Oficina), R12 (Subdimensionamento Físico) e R13 (Quality Gate SonarQube) | Equipe AlumiGest (Tech Lead: Ítalo Jefferson) |

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
| **Ações Executadas** | 1. Implementado o padrão Factory/Strategy no backend (`ProfileQuantityCalculator`, `GlassQuantityCalculator`, `HardwareQuantityCalculator`). 2. Arredondamentos estritos em `BigDecimal` (`RoundingMode.CEILING` para corte e `RoundingMode.HALF_EVEN` para financeiro). 3. Validação formal no documento `RN-Regras_de_Calculo.md` (v4.0). |
| **Responsável** | Nichollas Cavalcante / Backend |
| **Status** | 🟢 Materializado e Mitigado |

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
| **Ações** | 1. Subdivisão das demandas em sub-issues menores. 2. Disponibilização de templates JSX/SVG de referência no grupo. 3. Adoção do TanStack Query v5 e schemas Zod para isolar o estado de servidor e validações. |
| **Responsável** | Scrum Master / Equipe Frontend |
| **Status** | 🟢 Mitigado / Sob Controle |

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
| **Ações** | 1. Matriz de backup no PPJ. 2. Documentação contínua de código e arquitetura Docs-as-Code para mitigar o bus factor. |
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
| **Ações Executadas** | 1. Governança rígida de numeração de migrations Flyway. 2. Pipeline de CI no GitHub Actions executando testes e build do Vite em todo PR (`run-tests-on-all-prs`). 3. Ambiente de homologação em nuvem `develop.italuhub.cloud` via Coolify. |
| **Responsável** | Italo Jefferson (DevOps) / Todos os DEVs |
| **Status** | 🟢 Mitigado / Sob Monitoramento Ativo |

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
| **Ações Executadas** | 1. Dockerfile e Docker Compose padronizados. 2. Resolução definitiva do mapeamento de tipos UUID nativo no Hibernate e Flyway. |
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
| **Status** | 🟢 Materializado e Mitigado |

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
| **Ações** | 1. Priorização rígida de itens *Must Have*. 2. Replanejamento transparente de itens não críticos (ex: postergação de relatórios complexos). 3. Acompanhamento por relatórios de auditoria e RAP a cada sprint. |
| **Responsável** | Scrum Master + PO |
| **Status** | 🟡 Sob Monitoramento Ativo |

---

### R09 — Desalinhamento entre Abordagens Frontend-First e Backend-First

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Médio |
| **Classificação** | 🟡 Moderado |
| **Descrição** | O desenvolvimento de telas no frontend utilizando mocks ou DTOs presumidos antes da finalização dos endpoints REST gera fricção de integração e retrabalho de code review. |
| **Causa** | Desenvolvimento paralelo com contratos de API não homologados previamente no Swagger. |
| **Consequência** | Dificuldade no teste end-to-end e acúmulo de apontamentos em PRs de frontend. |
| **Estratégia** | Mitigar |
| **Ações Executadas** | 1. Adoção obrigatória de *API-First*: endpoints e DTOs documentados no Swagger e `API-Especificacao_API_REST.md`. 2. Utilização de instâncias integradas locais e de staging para testes de ponta a ponta. |
| **Responsável** | Todos os Desenvolvedores (Backend & Frontend) |
| **Status** | 🟢 Mitigado / Sob Controle |

---

### R10 — Sobrecarga no Escopo da Sprint 4 (Acúmulo de Entregas)

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Alto |
| **Classificação** | 🔴 Crítico |
| **Descrição** | A Sprint 4 precisaria absorver as demandas postergadas da Sprint 3 (Relatório Comercial, Romaneio e PDF), o débito técnico da US-04 e os novos requisitos de Descontos Comerciais. |
| **Causa** | Acúmulo de entregas não finalizadas nas sprints anteriores. |
| **Consequência** | Risco de sobrecarga e atraso da Release 1. |
| **Estratégia** | Mitigar |
| **Ações Executadas** | 1. Desmembramento estruturado em sub-issues independentes (US-09 para Descontos, US-10 para PDF Comercial e US-11 para Ficha Técnica da Oficina). 2. Execução paralela em ondas por pares de desenvolvedores com testes automatizados dedicados. |
| **Responsável** | Scrum Master / Tech Lead / PO |
| **Status** | 🟢 Materializado e Mitigado (US-09, US-10 e US-11) |

---

### 🆕 R11 — Vazamento de Dados Financeiros e Quebra de Sigilo Comercial na Oficina

| Campo | Valor |
|---|---|
| **Probabilidade** | Média |
| **Impacto** | Alto |
| **Classificação** | 🟠 Significativo |
| **Descrição** | A impressão ou compartilhamento de orçamentos contendo margens de lucro, preços de compra de insumos, valores de mão de obra e totais financeiros dentro do chão de fábrica pode gerar quebra de sigilo comercial e conflitos operacionais. |
| **Causa** | Documento único de proposta comercial misturando a visão do cliente com a ordem de corte de produção. |
| **Consequência** | Exposição indevida da estratégia de precificação da empresa perante serralheiros e fornecedores. |
| **Estratégia** | Prevenir / Mitigar |
| **Ações Executadas** | 1. Segregação rigorosa de canais no `BudgetPdfService`: geração isolada do PDF Comercial (`gerarPdfComercial`) e da Ficha Técnica de Oficina (`gerarPdfTecnico`). 2. Omissão absoluta de cifras financeiras (R$) na via técnica (`TechnicalPdfPageEvent`), exibindo apenas medidas em mm, perfis em metros lineares, vidros em m² e ferragens. 3. Testes unitários com extração de texto assegurando que nenhum cifrão ("R$") está presente na via técnica. |
| **Responsável** | Tech Lead / Backend (US-11) |
| **Status** | 🟢 Materializado e Mitigado (US-11) |

---

### 🆕 R12 — Subdimensionamento Físico de Corte por Entrada Manual

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Alto |
| **Classificação** | 🔴 Crítico |
| **Descrição** | O vendedor ou operador inserir manualmente no orçamento uma quantidade de vidro ($m^2$) ou metragem de perfis inferior à área física ou perímetro real do vão da esquadria. |
| **Causa** | Erro de digitação ou desconhecimento do operador de vendas. |
| **Consequência** | Corte de perfis de alumínio ou chapas de vidro insuficientes para montagem, gerando sucateamento de matéria-prima, retrabalho e prejuízo financeiro. |
| **Estratégia** | Mitigar |
| **Ações Executadas** | 1. Implementação do serviço `BudgetQuantityService.previewCalculation`. 2. Algoritmo de validação física `isBelowMinimum`: caso a metragem informada seja inferior à área nominal ou consumo físico da esquadria, o sistema emite alerta visual imediato e bloqueio de inconsistência no frontend e backend. |
| **Responsável** | Equipe de Backend & Frontend (US-09 / US-10) |
| **Status** | 🟢 Materializado e Mitigado |

---

### 🆕 R13 — Bloqueio de CI/CD por Reprovação no SonarQube Quality Gate

| Campo | Valor |
|---|---|
| **Probabilidade** | Alta |
| **Impacto** | Médio |
| **Classificação** | 🟠 Significativo |
| **Descrição** | Pull Requests serem bloqueados no GitHub Actions devido à queda de cobertura de testes no New Code (<80%) ou introdução de bugs/code smells bloqueantes do SonarQube. |
| **Causa** | Rigor dos parâmetros de qualidade exigidos pelo projeto associado à velocidade de desenvolvimento. |
| **Consequência** | Atraso nas integrações da branch `develop` e retrabalho de refatoração tardia. |
| **Estratégia** | Prevenir / Mitigar |
| **Ações Executadas** | 1. Instituição do protocolo SonarLint Pré-PR (`.agents/rules/qualidade-sonarlint.md`). 2. Workflow `run-tests-on-all-prs` que gera feedback instantâneo no PR. 3. Atribuição de suítes de testes dedicadas (ex: US-10.12 com 269 testes automatizados no frontend e >97% de cobertura em serviços no backend). |
| **Responsável** | Tech Lead & Equipe de QA |
| **Status** | 🟢 Mitigado / Sob Monitoramento Ativo |

---

## 3. Resumo da Matriz de Riscos (Versão 3.0)

| Classificação | Quantidade | IDs |
|---|:---:|---|
| 🔴 **Crítico** | **2** | R02, R12 |
| 🟠 **Significativo** | **5** | R01, R03, R05, R08, R11 |
| 🟡 **Moderado** | **6** | R04, R06, R07, R09, R10, R13 |
| 🟢 **Baixo** | **0** | — |
| **Total de Riscos Mapeados** | **13** | (9 mitigados com sucesso, 4 sob monitoramento contínuo) |

---
*Documento homologado pelo Oficial de Governança Técnica (`alumigest-doc-governor`) em 24/09/2026.*
