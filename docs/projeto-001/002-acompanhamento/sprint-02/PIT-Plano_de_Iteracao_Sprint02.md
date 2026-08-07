# PIT — Plano de Iteração — Sprint 02

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Sprint** | 02 — Cadastro de Materiais e Orçamentos |
| **Período** | 04/08/2026 a 18/08/2026 (15 dias) |
| **Gerente da Sprint (LP)** | (A definir no Planning) |
| **Versão** | 1.0 |

---

## 1. Objetivo da Sprint

Implementar o **módulo completo de Cadastro de Materiais** (Vidros, Perfis de Alumínio, Ferragens, Películas) e o **módulo de Orçamentos** (criação, adição de itens com cálculo automático, descontos). Inclui backend (API REST) e frontend (telas de cadastro e listagem).

---

## 2. Backlog da Sprint

### 2.1 Autenticação e Segurança (Pré-requisito)

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-004 | Cadastrar usuários do sistema | DEV 1 + DEV 2 | 3 | 🔴 Must |
| US-005 | Login com e-mail e senha (JWT) | DEV 1 + DEV 2 | 3 | 🔴 Must |
| US-006 | Perfis de acesso (ADMIN, VENDEDOR, PRODUCAO) | DEV 1 | 5 | 🟡 Should |

### 2.2 Cadastro de Clientes

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-007 | Cadastrar clientes (nome, CPF/CNPJ, telefone, endereço) | DEV 3 + DEV 4 | 3 | 🔴 Must |
| US-008 | Pesquisar clientes por nome/CPF/telefone | DEV 3 | 2 | 🔴 Must |
| US-009 | Editar e inativar clientes | DEV 4 | 2 | 🔴 Must |

### 2.3 Cadastro de Fornecedores

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-011 | Cadastrar fornecedores | DEV 5 | 3 | 🟡 Should |

### 2.4 Catálogo de Materiais

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-013 | Cadastrar tipos de vidro (nome, espessura, preço/m²) | DEV 5 + DEV 6 | 3 | 🔴 Must |
| US-014 | Dimensões máximas por tipo de vidro | DEV 5 | 2 | 🔴 Must |
| US-015 | Ativar/inativar vidros | DEV 6 | 1 | 🟡 Should |
| US-016 | Cadastrar perfis de alumínio (código, linha, preço/m) | DEV 6 + DEV 7 | 3 | 🔴 Must |
| US-017 | Comprimento padrão das barras | DEV 7 | 2 | 🔴 Must |
| US-018 | Ativar/inativar perfis | DEV 7 | 1 | 🟡 Should |
| US-019 | Cadastrar ferragens | DEV 7 + DEV 8 | 3 | 🔴 Must |
| US-020 | Quantidade padrão por tipo de produto | DEV 8 | 3 | 🔴 Must |
| US-021 | Cadastrar películas | DEV 8 | 2 | 🟡 Should |

### 2.5 Módulo de Orçamentos (Início)

| ID | User Story | Responsável | Pontos | Prioridade |
|---|---|---|---|---|
| US-022 | Criar orçamento vinculado a cliente | DEV 3 + DEV 4 | 3 | 🔴 Must |
| US-023 | Adicionar itens selecionando tipo de produto | DEV 3 + DEV 4 | 5 | 🔴 Must |
| US-024 | Informar medidas (largura × altura) | DEV 4 | 5 | 🔴 Must |

---

## 3. Capacidade e Planejamento

| Métrica | Valor |
|---|---|
| Tamanho da equipe | 8 membros |
| Membros ativos como DEV | 8 (trabalhando em duplas) |
| QA da sprint | DEV 3 + DEV 7 (acumulam papel QA) |
| Duração da sprint | 15 dias |
| Story Points planejados | **54 pts** |
| Velocidade Sprint anterior | 28 pts (sprint de planejamento) |

> **Nota:** A Sprint 2 tem mais pontos que a Sprint 1 pois é a primeira sprint de desenvolvimento efetivo, com a equipe completa atuando.

---

## 4. Divisão de Trabalho por Dupla

| Dupla | Foco | User Stories |
|---|---|---|
| **Dupla 1** (DEV 1 + DEV 2) | Autenticação e Segurança | US-004, US-005, US-006 |
| **Dupla 2** (DEV 3 + DEV 4) | Clientes e Orçamentos | US-007, US-008, US-009, US-022, US-023, US-024 |
| **Dupla 3** (DEV 5 + DEV 6) | Vidros e Fornecedores | US-011, US-013, US-014, US-015, US-016 |
| **Dupla 4** (DEV 7 + DEV 8) | Alumínio, Ferragens, Películas | US-017, US-018, US-019, US-020, US-021 |

---

## 5. Ordem de Implementação (Dependências)

```
Semana 1 (04-10/08):
├── [Dupla 1] Autenticação (US-004, US-005) → Pré-requisito para tudo
├── [Dupla 3] Migrações Flyway (V001-V008) → Base de dados
├── [Dupla 3] Backend Vidros (US-013, US-014, US-015)
└── [Dupla 4] Backend Alumínio e Ferragens (US-016 a US-020)

Semana 2 (11-18/08):
├── [Dupla 1] Perfis de acesso (US-006) → Após auth funcional
├── [Dupla 2] Clientes (US-007, US-008, US-009) → Após auth
├── [Dupla 2] Orçamentos (US-022, US-023, US-024) → Após materiais
├── [Dupla 3+4] Frontend Materiais → Após APIs prontas
└── [QA] Testes de aceitação (TEA-S02)
```

---

## 6. Cerimônias Planejadas

| Cerimônia | Data | Horário | Duração |
|---|---|---|---|
| Sprint Planning | 04/08/2026 (seg) | 19h | 2h |
| Daily Standup | Seg/Qua/Sex | 20h (assíncrono) | 15min |
| Three Amigos (validação com Thiago) | 08/08/2026 (sex) | 14h | 1h |
| Sprint Review | 18/08/2026 (seg) | 19h | 1h |
| Sprint Retrospective | 18/08/2026 (seg) | 20h | 30min |

---

## 7. Definition of Done (Sprint 2)

- [ ] Backend: API REST implementada e funcional
- [ ] Frontend: Tela de cadastro/listagem funcional
- [ ] Testes unitários nos Services (≥ 70% cobertura)
- [ ] Code Review via PR com pelo menos 1 aprovação
- [ ] Código integrado na `develop` sem conflitos
- [ ] Migration Flyway criada e executada
- [ ] TEA executados e aceitos pelo QA
- [ ] Demonstrado na Sprint Review

---

## 8. Riscos da Sprint

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Atraso na autenticação bloqueia outras features | Média | Alto | Dupla 1 prioriza auth nas primeiras 3 dias; mock de auth para não bloquear |
| Complexidade do motor de cálculo subestimada | Média | Alto | Limitar Sprint 2 a criar item + cálculo de vidro; perfis e ferragens automáticas na Sprint 3 |
| Fórmulas de cálculo incorretas | Alta | Alto | Three Amigos com Thiago para validar fórmulas na semana 1 |
| Membros sem experiência com Spring Boot / JPA | Média | Médio | Pair programming obrigatório; sesão de coding dojo no dia 1 |

---

*Plano elaborado pela Equipe AlumiGest — Sprint 02 — Agosto/2026*
