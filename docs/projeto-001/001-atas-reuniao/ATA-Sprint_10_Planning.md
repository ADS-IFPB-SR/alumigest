# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 10 PLANNING)

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 24 de Novembro de 2026 (Terça-feira) | **Horário:** 19:30 às 20:30  
**Local:** Reunião Virtual (Google Meet) / Sala de Projetos  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Quórum

* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Júlio Kennedy dos Santos Silva** — *Scrum Master & Desenvolvedor*
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Desenvolvedor*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Abertura da **Sprint 10** (Período Oficial: **24/11/2026 a 07/12/2026**), com foco estratégico em **Preparação, Segurança e Calibração para a Primeira Entrega Oficial (Release 2)** do AlumiGest.
2. Definição do escopo da Sprint 10 baseado nos **4 Pilares Estratégicos**:
   - **Pilar 1: Autenticação, Usuários e RBAC**: Implementação do Spring Security 6 stateless com JWT e controle de acesso por perfil (`ADMIN`, `VENDEDOR`, `OPERADOR`), além da tela de Login oficial (`/login`).
   - **Pilar 2: Configurações da Empresa & Cabeçalhos Dinâmicos**: Substituição do placeholder da tela `/configuracoes` por formulário institucional completo e preview interativo ao vivo do cabeçalho oficial que estampará todos os PDFs.
   - **Pilar 3: Matriz de Calibração com Orçamentos Reais**: Confronto e calibração fina de 5 modelos de esquadrias reais produzidos pela Alumiportas (Janelas 2F/4F Suprema, Portas Suprema e Gold, Maxim-ar) para garantir paridade centavo a centavo (divergência R$ 0,00).
   - **Pilar 4: Saneamento Geral de Bugs & Homologação**: Integração e validação do fix de impressão de etiquetas térmicas na Venda Avulsa (Issue [#598](https://github.com/ADS-IFPB-SR/alumigest/issues/598) / PR [#600](https://github.com/ADS-IFPB-SR/alumigest/pull/600)), execução da suíte Cypress E2E e geração do dossiê de aceitação da Release 2.
3. Descarte formal de novas implementações de pagamento/financeiro nesta iteração, priorizando a robustez do core operacional comercial e fabril para a banca.
4. Homologação do protótipo interativo `docs/planejamento/prototipos/autenticacao-configuracoes-homologacao.html` demonstrando a navegação nos 4 pilares em conformidade com o Design System oficial.

---

## 3. 📋 Detalhamento do Backlog Homologado (Sprint Backlog)

### 3.1 Visão Geral por Pilares

| Pilar | Escopo / Módulo | Story Points | Horas Estimadas | Tarefas |
|---|---|:---:|:---:|:---:|
| **Pilar 1** | Autenticação, Usuários e Controle de Acesso (RBAC) | 6 pts | 12.0h | `US-10.1` a `US-10.4` (4 tarefas atômicas) |
| **Pilar 2** | Configurações da Empresa e Cabeçalhos Dinâmicos | 4 pts | 9.0h | `US-10.5` a `US-10.7` (3 tarefas atômicas) |
| **Pilar 3** | Calibração de Orçamentos Reais da Alumiportas | 2 pts | 6.0h | `US-10.8` e `US-10.9` (2 tarefas atômicas) |
| **Pilar 4** | Saneamento de Bugs & Dossiê de Homologação | 2 pts | 6.0h | `US-10.10` e `US-10.11` (2 tarefas atômicas) |
| **Total** | **Sprint Backlog Oficial da Sprint 10** | **14 pts** | **33.0h** | **11 Tarefas Atômicas** |

### 3.2 Tarefas Decompostas (`docs/planejamento/sprint-10/README.md`)

| Subtarefa | Título da Tarefa Atômica | Pontos | Horas |
|:---:|---|:---:|:---:|
| `US-10.1` | Setup de Autenticação, Entidade `User` e Migração Flyway `V27` | 1 pt | 2.5h |
| `US-10.2` | Motor de Autenticação JWT, Spring Security 6 e Endpoints `/api/v1/auth` | 2 pts | 3.5h |
| `US-10.3` | Tela de Login (`/login`) Responsiva e Interceptor no Frontend | 2 pts | 3.5h |
| `US-10.4` | Controle de Acesso RBAC, `ProtectedRoute` e Logout no Frontend | 1 pt | 2.5h |
| `US-10.5` | Entidade `CompanySettings`, Migração `V28` e Endpoints de Configurações | 1 pt | 2.5h |
| `US-10.6` | Tela de Configurações (`/configuracoes`) com Preview de Cabeçalho | 2 pts | 3.5h |
| `US-10.7` | Consumo Dinâmico dos Dados da Empresa em todos os PDFs e Etiquetas | 1 pt | 3.0h |
| `US-10.8` | Matriz de Calibração com 5 Casos Reais de Esquadrias da Alumiportas | 1 pt | 2.5h |
| `US-10.9` | Ajuste Fino dos Motores de Cálculo para Paridade Centavo a Centavo | 1 pt | 3.5h |
| `US-10.10` | Saneamento do Bug de Etiquetas Térmicas na Venda Avulsa (PR #600) | 1 pt | 2.5h |
| `US-10.11` | Bateria E2E Cypress, Quality Gate SonarQube e Dossiê de Homologação | 1 pt | 3.5h |

---

## 4. 📢 Encaminhamentos e Próximos Passos

1. Iniciar o desenvolvimento das fatias atômicas a partir de branches padronizadas baseadas em `develop`.
2. O Tech Lead coordenará o setup do Spring Security 6 (`US-10.1` e `US-10.2`) para desbloquear as telas do frontend (`US-10.3` e `US-10.4`).
3. O Product Owner fornecerá as fichas de medidas reais dos 5 modelos de esquadrias para a calibração da `US-10.8`.
