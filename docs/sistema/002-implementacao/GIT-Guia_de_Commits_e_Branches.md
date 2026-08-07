# GIT — Guia de Commits e Branches

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |

---

## 1. Fluxo de Trabalho (Git Flow Adaptado)

```
main ─────────────────────────────────────────────→ (produção)
  │                                        ↑
  └─→ develop ────────────────────────────→ merge via release/*
        │           ↑         ↑
        └─→ feat/US-013 ─────┘         ↑
        └─→ feat/US-016 ──────────────┘
        └─→ fix/corrigir-calculo ──────┘
```

### 1.1 Criando uma Branch de Feature

```bash
# 1. Atualize a develop
git checkout develop
git pull origin develop

# 2. Crie a branch da feature
git checkout -b feat/US-013-cadastrar-vidros

# 3. Desenvolva e commite
git add .
git commit -m "feat(material): implementar cadastro de tipos de vidro

- Criar entidade Vidro com JPA
- Implementar VidroRepository, VidroService, VidroController
- Adicionar validações de Bean Validation
- Criar migration V004__create_vidros.sql

Refs: US-013"

# 4. Push e crie o PR
git push origin feat/US-013-cadastrar-vidros
```

### 1.2 Criando um Pull Request

1. Acesse o GitHub e crie o PR de `feat/US-013-cadastrar-vidros` → `develop`
2. Preencha o template do PR:
   - **Descrição:** O que foi feito e por quê
   - **User Story:** Referência à US do backlog
   - **Checklist:** Testes, documentação, code review
3. Solicite **pelo menos 1 revisor**
4. Após aprovação, faça o **merge** (Squash and Merge recomendado)

---

## 2. Commits Convencionais

### 2.1 Formato

```
<tipo>(<escopo>): <descrição curta>

<corpo opcional>

<rodapé opcional>
```

### 2.2 Tipos de Commit

| Tipo | Quando usar | Exemplo |
|---|---|---|
| `feat` | Nova funcionalidade | `feat(orcamento): implementar cálculo de vidro por m²` |
| `fix` | Correção de bug | `fix(material): corrigir validação de preço negativo` |
| `docs` | Documentação | `docs: adicionar documento de requisitos REQ` |
| `refactor` | Refatoração sem mudança funcional | `refactor(cliente): extrair validação de CPF para util` |
| `test` | Adição ou alteração de testes | `test(vidro): adicionar testes unitários do VidroService` |
| `chore` | Build, config, CI/CD | `chore: configurar Docker Compose com PostgreSQL 16` |
| `style` | Formatação (sem mudança de lógica) | `style: aplicar formatação Checkstyle` |
| `perf` | Melhoria de performance | `perf(orcamento): otimizar query de listagem com índice` |

### 2.3 Escopos Válidos

| Escopo | Módulo |
|---|---|
| `auth` | Autenticação e segurança |
| `cliente` | Cadastro de clientes |
| `material` | Catálogo de materiais (vidro, alumínio, ferragem, película) |
| `orcamento` | Motor de orçamentos |
| `pedido` | Pedidos e PCP |
| `estoque` | Controle de estoque |
| `financeiro` | Módulo financeiro |
| `shared` | Código compartilhado |
| `infra` | Infraestrutura, CI/CD, Docker |
| `db` | Migrações Flyway |

### 2.4 Exemplos Bons vs. Ruins

| ❌ Ruim | ✅ Bom |
|---|---|
| `fix: bug` | `fix(orcamento): corrigir cálculo de desconto acima de 100%` |
| `update` | `feat(material): adicionar campo espessura ao cadastro de vidro` |
| `wip` | `feat(cliente): implementar pesquisa por nome parcial` |
| `ajustes` | `refactor(auth): extrair geração de JWT para JwtService` |

---

## 3. Nomenclatura de Branches

```
<tipo>/<descrição-kebab-case>
```

| Padrão | Uso | Exemplo |
|---|---|---|
| `feat/US-NNN-descricao` | Nova feature | `feat/US-013-cadastrar-vidros` |
| `fix/descricao` | Correção de bug | `fix/calculo-area-minima-vidro` |
| `docs/descricao` | Documentação | `docs/documento-requisitos` |
| `refactor/descricao` | Refatoração | `refactor/extrair-calculo-service` |
| `test/descricao` | Testes | `test/testes-orcamento-service` |
| `chore/descricao` | Manutenção | `chore/configurar-swagger` |
| `release/vX.Y.Z` | Preparação de release | `release/v1.0.0` |
| `hotfix/descricao` | Correção urgente | `hotfix/login-bloqueado` |

---

## 4. Regras de Proteção de Branches

| Branch | Proteção |
|---|---|
| `main` | PR obrigatório + 1 aprovação + CI passando |
| `develop` | PR obrigatório + 1 aprovação |
| `release/*` | PR obrigatório para merge em main |

**Proibido:** Commits diretos em `main` e `develop`.

---

## 5. Template de Pull Request

```markdown
## Descrição
<!-- O que foi feito e por quê -->

## User Story
<!-- Referência: US-XXX -->

## Tipo de Mudança
- [ ] Nova funcionalidade (feat)
- [ ] Correção de bug (fix)
- [ ] Refatoração (refactor)
- [ ] Documentação (docs)
- [ ] Testes (test)

## Checklist
- [ ] Código segue os padrões do PAD
- [ ] Testes unitários escritos e passando
- [ ] Migration Flyway criada (se alterou banco)
- [ ] Documentação atualizada (se necessário)
- [ ] Testado localmente
- [ ] Sem conflitos com develop
```

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
