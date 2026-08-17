# PIT — Plano de Iteração — Sprint 02

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Sprint** | 02 — Catálogo de Materiais e Produtos |
| **Período** | 04/08/2026 a 18/08/2026 (15 dias) |
| **Gerente da Sprint (LP)** | Nichollas Cavalcante |
| **Versão** | 2.0 |

---

## 1. Objetivo da Sprint

Implementar a base arquitetural sólida do **Catálogo Genérico de Materiais** (Vidros, Perfis de Alumínio, Ferragens, Películas) e a **Ficha Técnica de Produtos (Esquadrias)**. Inclui a construção das APIs no backend (Spring Boot) e a primeira versão do App/PWA (Frontend) integrando as telas de catálogo. *(Nota: Módulos de Clientes e Orçamentos foram re-priorizados para a Sprint 3).*

---

## 2. Backlog da Sprint

### 2.1 Autenticação e Segurança (Pré-requisito)

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-004 | Cadastrar usuários do sistema | DEV 1 + DEV 2 | 3 | 🔴 Must |
| US-005 | Login com e-mail e senha (JWT) | DEV 1 + DEV 2 | 3 | 🔴 Must |
| US-006 | Perfis de acesso (ADMIN, VENDEDOR, PRODUCAO) | DEV 1 | 5 | 🟡 Should |

### 2.2 Catálogo de Materiais (Refatorado)

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-013 | Criar a Entidade Genérica de Material e MaterialGroup | Backend (Nichollas/Equipe) | 5 | 🔴 Must |
| US-014 | Construir API CRUD para Perfis de Alumínio | DEV 7 | 3 | 🔴 Must |
| US-015 | Construir API CRUD para Ferragens | DEV 8 | 3 | 🔴 Must |
| US-016 | Construir API CRUD para Películas | DEV 6 | 3 | 🔴 Must |
| US-017 | Construir API CRUD para Vidros | Herbert | 5 | 🔴 Must |
| US-018 | Validação de restrição única (Referência Comercial) | Backend | 2 | 🔴 Must |

### 2.3 Produtos e Fichas Técnicas (Issue #31)

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-019 | Criar domínio de Categorias de Produto (ProductCategory) | Backend | 3 | 🔴 Must |
| US-020 | Refatorar Entidade de Produto (Product) e API | Backend | 5 | 🔴 Must |
| US-021 | Criar vínculo entre Produto e Material (ProductItem) | Backend | 3 | 🔴 Must |

### 2.4 Frontend (PWA)

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-022 | Implementar o System Design e Layout Base | Ítalo | 5 | 🔴 Must |
| US-023 | Desenvolver telas do Catálogo de Materiais | Ítalo | 5 | 🔴 Must |

---

## 3. Capacidade e Planejamento

| Métrica | Valor |
|---|---|
| Tamanho da equipe | 8 membros + 1 Ítalo (Front) |
| Membros ativos como DEV | 9 (trabalhando em duplas/squads) |
| QA da sprint | Equipe |
| Duração da sprint | 15 dias |
| Story Points planejados | **45 pts** |

> **Nota:** A Sprint 2 foi ajustada para focar estritamente na base de catálogo para que os orçamentos (Sprint 3) não sofram com arquitetura frágil de banco de dados.

---

## 4. Divisão de Trabalho por Foco

| Squad | Foco |
|---|---|
| **Squad Auth** | Autenticação e Segurança (US-004 a US-006) |
| **Squad Backend** | Catálogo Genérico, Produtos, Fichas Técnicas, Rota de Vidros e validações (US-013 a US-021) |
| **Squad Frontend** | System Design e Telas PWA do Catálogo (US-022 e US-023) |

---

## 5. Ordem de Implementação (Dependências)

```text
Semana 1 (04-10/08):
├── [Squad Auth] Autenticação (US-004, US-005) → Pré-requisito
├── [Squad Backend] Refatoração do Banco de Dados (Flyway V1 a V4)
├── [Squad Frontend] Layout e System Design (Figma para PWA)
└── [Squad Backend] CRUDs Base (Alumínio, Ferragens, Películas)

Semana 2 (11-18/08):
├── [Squad Backend] Rota de Vidros (Herbert)
├── [Squad Backend] API de Produtos e Categorias (Issue #31)
├── [Squad Frontend] Integração das Telas do Catálogo (PR #40)
└── [Equipe] Validação Final e Merge (PR #38 tipagem Postgres)
```

---

## 6. Cerimônias Planejadas

| Cerimônia | Data | Horário | Duração |
|---|---|---|---|
| Sprint Planning | 04/08/2026 (seg) | 19h | 2h |
| Daily Standup | Seg/Qua/Sex | 20h (assíncrono) | 15min |
| Three Amigos (validação arquitetural) | 08/08/2026 (sex) | 14h | 1h |
| Sprint Review | 18/08/2026 (seg) | 19h | 1h |
| Sprint Retrospective | 18/08/2026 (seg) | 20h | 30min |

---

## 7. Definition of Done (Sprint 2)

- [ ] Backend: API REST implementada (Materiais e Produtos)
- [ ] Frontend: Telas de catálogo desenvolvidas e mescladas na `develop`
- [ ] Arquitetura refatorada para usar tabela unificada `tb_materials`
- [ ] Code Review via PR com aprovação
- [ ] Código integrado na `develop` sem conflitos
- [ ] Migrations do Flyway aplicadas corretamente

---

## 8. Riscos da Sprint

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Atraso na API de Vidros (Herbert) | Média | Médio | Rotas de Alumínio, Películas e Ferragens avançam independentemente |
| Inconsistência de Tipagem (Bytea no DB) | Alta | Alto | PR #38 submetido pelo JosephCavalcante para resolver `bytea` via JPA |
| Frontend com erro 500/404 em deploy | Média | Alto | Validação de caminhos de arquivos e cache (orientações no PR #40 do Ítalo) |

---

*Plano elaborado e atualizado pela Equipe AlumiGest — Sprint 02 — Agosto/2026*
