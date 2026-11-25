# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 10 PLANNING)

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 25 de Novembro de 2026 | **Período da Sprint 10:** 24/11/2026 a 07/12/2026  
**Local:** Reunião Virtual / Alinhamento Scrum Master & Product Owner  
**Governança:** Docs-as-Code — Pacote Oficial da Sprint 10 (`US-48`, `US-49`, `US-50`)  

---

## 1. 👥 Participantes e Papéis

* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Desenvolvedor*
* **Joseph Nichollas Abreu Cavalcante** — *Scrum Master (Sprint 10) & Desenvolvedor*
* **Ítalo Jefferson Lima dos Santos** — *Tech Lead & Desenvolvedor*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião & Decisões de Escopo com o Product Owner

1. Definição do **Sprint Goal da Sprint 10** voltado ao fechamento e blindagem da **Release 1.0.0** com autenticação web, segurança de conta, parametrização institucional e limpeza de navegação.
2. Registro das **decisões formais de produto validadas junto ao Product Owner**:
   - **Operador Único (1 Perfil):** Não haverá divisão em 3 perfis (`Admin`, `Vendedor`, `Produção`) nem matriz RBAC nesta release; todo acesso autenticado via JWT opera com permissão completa na aplicação.
   - **Sem Sistema de Registro na Interface:** Não haverá auto-cadastro público nem CRUD de criação de usuários na interface; a credencial oficial nasce provisionada via migration `V27` / variáveis de ambiente.
   - **Alteração de Senha Habilitada (`US-49`):** O operador autenticado poderá alterar sua própria senha informando a senha atual e uma nova senha em `/configuracoes`.
   - **Lockout (`RF-005`) e Log de Auditoria (`RF-006`):** Postergados formalmente para releases futuras.
   - **Logomarca Institucional Fixa (Sem Upload):** Não haverá upload de logo da empresa nem de clientes; mantém-se o ativo oficial `logo-alumiportas.png` combinado aos dados cadastrais dinâmicos de `tb_company_settings` (`US-50`).
   - **Emissão de PDFs Sob Demanda:** Alterações de dados cadastrais da empresa ou de clientes não exigem reprocessamento/reimpressão retroativa de PDFs emitidos anteriormente; refletem automaticamente nas novas emissões.
   - **Ocultação de Funcionalidades Não Concluídas:** Os itens *placeholder* (`Dashboard` e `Financeiro`) e elementos estáticos sem ação na `Sidebar` e `Topbar` serão ocultados para entrega enxuta da `v1.0.0`.
   - **Homologação da Release 1.0 no DoD:** Seguindo o padrão histórico do projeto (`US-12`, `US-23` e `US-41`), a homologação integrada permanece incorporada como **Definition of Done (DoD)** contínuo da Sprint 10.

---

## 3. 📋 Backlog Homologado da Sprint 10

### 3.1 Visão Consolidada por User Story

| ID | Issue GitHub | História de Usuário | Story Points | Horas Estimadas | Fatias Atômicas |
|:---:|:---:|---|:---:|:---:|:---:|
| **`US-48`** | [#610](https://github.com/ADS-IFPB-SR/alumigest/issues/610) | Autenticar Operador Único com JWT, Proteger Rotas Privadas e Encerrar Sessão | **5 pts** | 8.5h | `US-48.1` a `US-48.3` (3 tarefas) |
| **`US-49`** | [#611](https://github.com/ADS-IFPB-SR/alumigest/issues/611) | Alterar Senha de Acesso da Conta Autenticada | **3 pts** | 5.5h | `US-49.1` e `US-49.2` (2 tarefas) |
| **`US-50`** | [#612](https://github.com/ADS-IFPB-SR/alumigest/issues/612) | Configurar Dados Institucionais da Empresa, Atualizar Cabeçalhos PDF e Higienizar UI da Release 1.0 | **5 pts** | 11.0h | `US-50.1` a `US-50.4` (4 tarefas) |
| **Total** | **3 USs + 9 Sub-Issues** | **Sprint Backlog Oficial da Sprint 10 (+ Homologação Release 1.0 via DoD)** | **13 pts** | **25.0h** | **9 Tarefas Atômicas** |

### 3.2 Tarefas Atômicas Decompostas (`docs/planejamento/sprint-10/README.md`)

| Subtarefa | Issue GitHub | História | Título da Tarefa Atômica | Pontos | Horas |
|:---:|:---:|:---:|---|:---:|:---:|
| `US-48.1` | [#613](https://github.com/ADS-IFPB-SR/alumigest/issues/613) | `US-48` ([#610](https://github.com/ADS-IFPB-SR/alumigest/issues/610)) | Migration `V27`, Entidade `User` (Operador Único) e `JwtService` | 1 pt | 2.5h |
| `US-48.2` | [#614](https://github.com/ADS-IFPB-SR/alumigest/issues/614) | `US-48` ([#610](https://github.com/ADS-IFPB-SR/alumigest/issues/610)) | Spring Security 6 Stateless, Endpoints `/api/v1/auth` e Compatibilidade de Testes | 2 pts | 3.0h |
| `US-48.3` | [#615](https://github.com/ADS-IFPB-SR/alumigest/issues/615) | `US-48` ([#610](https://github.com/ADS-IFPB-SR/alumigest/issues/610)) | Tela `/login`, `ProtectedRoute`, Sessão Axios e Logout Real | 2 pts | 3.0h |
| `US-49.1` | [#616](https://github.com/ADS-IFPB-SR/alumigest/issues/616) | `US-49` ([#611](https://github.com/ADS-IFPB-SR/alumigest/issues/611)) | Endpoint Autenticado de Troca de Senha (`PUT /api/v1/auth/password`) | 1 pt | 2.5h |
| `US-49.2` | [#617](https://github.com/ADS-IFPB-SR/alumigest/issues/617) | `US-49` ([#611](https://github.com/ADS-IFPB-SR/alumigest/issues/611)) | Formulário "Segurança da Conta / Alterar Senha" em `/configuracoes` | 2 pts | 3.0h |
| `US-50.1` | [#618](https://github.com/ADS-IFPB-SR/alumigest/issues/618) | `US-50` ([#612](https://github.com/ADS-IFPB-SR/alumigest/issues/612)) | Migration `V28`, Entidade `CompanySettings` e API `/api/v1/settings/company` | 1 pt | 2.5h |
| `US-50.2` | [#619](https://github.com/ADS-IFPB-SR/alumigest/issues/619) | `US-50` ([#612](https://github.com/ADS-IFPB-SR/alumigest/issues/612)) | Tela `/configuracoes` — Dados da Empresa com Máscaras e Preview de Cabeçalho | 2 pts | 3.0h |
| `US-50.3` | [#620](https://github.com/ADS-IFPB-SR/alumigest/issues/620) | `US-50` ([#612](https://github.com/ADS-IFPB-SR/alumigest/issues/612)) | Cabeçalho Institucional Dinâmico nos Geradores PDF e Etiquetas | 1 pt | 3.0h |
| `US-50.4` | [#621](https://github.com/ADS-IFPB-SR/alumigest/issues/621) | `US-50` ([#612](https://github.com/ADS-IFPB-SR/alumigest/issues/612)) + DoD | Higienização da Sidebar/Topbar e Suíte E2E Autenticada (DoD Release 1.0) | 1 pt | 2.5h |

---

## 4. 📢 Encaminhamentos

1. Priorizar a entrega imediata de `US-48.1` e `US-48.2` (fundação JWT + `@WithMockUser`) e `US-50.1` (API de configurações) para destravar o desenvolvimento paralelo no frontend e nos PDFs sem conflitos de merge.
2. Executar a bateria integrada E2E (`cy.login()`) e o *Smoke Test* via Docker como porta de saída obrigatória do **DoD da Release 1.0.0**.
