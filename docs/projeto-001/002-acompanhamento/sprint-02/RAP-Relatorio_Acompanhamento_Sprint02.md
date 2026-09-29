# RAP — Relatório de Acompanhamento — Sprint 02

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 02 — Catálogo de Materiais, Fichas Técnicas e PWA |
| **Período** | 04/08/2026 a 18/08/2026 (15 dias) |
| **Gerente da Sprint (LP)** | Nichollas Cavalcante |
| **Versão** | 2.0 |

---

## 1. Resumo Executivo

A Sprint 2 foi concluída com êxito, entregando **100% dos story points planejados (45/45 pts)**. A equipe estabeleceu a fundação arquitetural de dados do sistema baseada no *Type-Object Pattern* (`tb_material_groups` e `tb_materials`), desacoplando materiais básicos de produtos finais compostos (`tb_products` e `tb_product_items`), além de disponibilizar a primeira versão da interface PWA em abas para gerenciamento completo do catálogo.

---

## 2. Entregáveis Realizados

| ID | User Story / Tarefa | Responsável | Pontos | Status |
|---|---|---|---|---|
| US-004 | Cadastrar usuários do sistema | Squad Auth | 3 | ✅ Entregue |
| US-005 | Login com e-mail e senha (JWT) | Squad Auth | 3 | ✅ Entregue |
| US-006 | Perfis de acesso (ADMIN, VENDEDOR, PRODUCAO) | Squad Auth | 5 | ✅ Entregue |
| US-013 | Entidade Genérica de Material e MaterialGroup (Flyway V1/V3) | Squad Backend | 5 | ✅ Entregue |
| US-014 | API CRUD para Perfis de Alumínio (Linhas Rometal/Alternativa) | DEV 7 | 3 | ✅ Entregue |
| US-015 | API CRUD para Ferragens (UN, PAR, METRO) | DEV 8 | 3 | ✅ Entregue |
| US-016 | API CRUD para Películas e Acabamentos por m² | DEV 6 | 3 | ✅ Entregue |
| US-017 | API CRUD para Vidros (2mm, 4mm, 6mm+) | Herbert / Backend | 5 | ✅ Entregue |
| US-018 | Validação de restrição única (Referência Comercial) | Backend | 2 | ✅ Entregue |
| US-019 | Domínio e API de Categorias de Produto (`ProductCategory`) | Backend | 3 | ✅ Entregue |
| US-020 | Refatoração da Entidade de Produto (`Product`) e API | Backend | 5 | ✅ Entregue |
| US-021 | Vínculo entre Produto e Insumos (`ProductItem`) | Backend | 3 | ✅ Entregue |
| US-022 | Implementação do System Design e Layout Base (Tailwind/PWA) | Ítalo | 5 | ✅ Entregue |
| US-023 | Desenvolvimento das Telas do Catálogo de Materiais em Abas | Ítalo | 5 | ✅ Entregue |

---

## 3. Indicadores de Desempenho

| Indicador | Planejado | Realizado | Desvio |
|---|---|---|---|
| **Story Points** | 45 pts | 45 pts | 0% |
| **Itens do Backlog Entregues** | 14 itens | 14 itens | 0% |
| **Taxa de Aceitação (QA)** | 100% | 100% (14/14 cenários TEA) | 0% |
| **Riscos Materializados** | 0 | 0 (mitigações efetivas) | — |
| **Impedimentos Críticos** | 0 | 0 | — |

---

## 4. Sprint Review — Feedbacks Levantados

### 4.1 Feedback do Orientador Acadêmico
- Elogiou a decisão arquitetural de usar o *Type-Object Pattern* para os materiais, garantindo que o software possa ser estendido para outros setores (marcenaria/serralheria).
- Recomendou especial atenção na modelagem da Sprint 3 para que o cálculo de orçamentos preserve os preços históricos no momento do congelamento do pedido.

### 4.2 Feedback do PO (José Guilherme / Thiago Alumiportas)
- A navegação em abas no catálogo ficou intuitiva e atende diretamente a rotina rápida do balcão da Alumiportas.
- Validou que as espessuras de 2mm e 4mm e as linhas Rometal/Alternativa cobrem 90% da demanda diária.
- Aprovou o avanço para a Sprint 3 com foco em **Cadastro de Clientes** e **Motor de Orçamentos**.

---

## 5. Sprint Retrospective

### 5.1 O que funcionou bem? ✅
- A divisão em squads (Auth, Backend e Frontend) acelerou a entrega sem gerar gargalos.
- As revisões de PR (Pull Requests) garantiram alta qualidade de código e conformidade com o Git Flow.
- O desacoplamento do Catálogo evitou retrabalho para a elaboração de orçamentos.

### 5.2 O que pode melhorar? ⚠️
- Alinhamento de tipos entre PostgreSQL e JPA (resolvido durante a sprint no PR de tipagem).
- Frequência dos commits no backend pode ser mais granular para facilitar o code review.

### 5.3 Ações de Melhoria para a Sprint 3 🎯

| Ação | Responsável | Prazo |
|---|---|---|
| Definir contratos de DTOs antes da implementação dos endpoints | Backend + Frontend | Início Sprint 3 |
| Implementar testes unitários de regras de cálculo isoladas | Squad Backend | Durante Sprint 3 |
| Integrar o feedback de clientes e orçamento no frontend em fluxo contínuo | Ítalo | Sprint 3 |

---

## 6. Planejamento da Sprint 3

| Item | Descrição |
|---|---|
| **Objetivo** | Implementar Cadastro de Clientes e o Motor de Cálculo de Orçamentos Técnicos |
| **Módulos Principais** | `clients`, `budgets`, DTOs de cálculo e Interface de Orçamento |
| **Story Points Estimados** | ~50 pts |
| **Período Previsto** | 19/08/2026 a 02/09/2026 |

---

*Relatório elaborado por Nichollas Cavalcante (LP Sprint 02) — Equipe AlumiGest — 18/08/2026*
