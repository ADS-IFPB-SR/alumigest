# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 06 PLANNING)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 29 de Setembro de 2026 (Terça-feira) | **Horário:** 19:30 às 21:45  
**Local:** Reunião Virtual (Google Meet)  
**Redator:** Guilherme Kauã Matos da Silva — Tech Lead  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor & Engenheiro de Software*
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor & DevOps*
* **Guilherme Kauã Matos da Silva** — *Tech Lead & Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Abertura do ciclo de desenvolvimento da **Sprint 06** (Período: **29/09/2026 a 12/10/2026** — 14 dias), marcando o início da **Release 2 (Gestão de Produção & Fábrica)**.
2. Definição do Backlog da Sprint 06 no GitHub Projects, totalizando **31 Story Points** e **38.0 horas estimadas** estruturadas em **12 Fatias Verticais (*Thin Vertical Slices*)** com duração máxima de $\le 4\text{h}$ por tarefa.
3. Implementação do fluxo de aprovação de orçamentos e conversão atômica 1-para-1 em Pedidos de Venda vinculantes com código sequencial anual `PED-YYYY-NNNN` (`US-13 #137`).
4. Arquitetura de Snapshot Imutável e Lock de Preços via clonagem profunda (*deep copy*) em 3 níveis, blindando pedidos contra reajustes futuros do catálogo de materiais (`US-14 #138`).
5. Gerenciamento do ciclo de vida do pedido (`CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO` / `CANCELADO`), cancelamento com justificativa obrigatória e reabertura de orçamentos cancelados (`US-15 #139`).
6. Emissão do Comprovante Oficial do Pedido de Venda em PDF timbrado institucional via OpenPDF e navegação no menu principal (`US-16 #140`).
7. Estratégia de testes de integração REST com `MockMvc` + H2 e testes de sistema E2E cobrindo o ciclo completo ponta a ponta.

---

## 3. 📋 Detalhamento do Backlog Selecionado (Sprint Backlog)

### 3.1 Visão Consolidada por Histórias de Usuário (PBL)

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Subtarefas / Fatias | Responsáveis Principais |
|---|---|:---:|:---:|:---:|---|
| **`US-13 #137`** | Aprovar Orçamento e Converter em Pedido de Venda | 13 pts | 15.0h | 5 fatias (#355 a #359) | Italo Jefferson, Guilherme Kauã, Júlio Kennedy, Maylson Rodrigues, Joseph Nichollas |
| **`US-14 #138`** | Snapshot Imutável e Lock de Preços do Pedido | 3 pts | 4.0h | 1 fatia (#360) | Italo Jefferson, Equipe Backend |
| **`US-15 #139`** | Gestão de Status, Prazos e Cancelamento de Pedidos | 5 pts | 6.0h | 2 fatias (#361 e #362) | Gabriel de Souza, Júlio Kennedy |
| **`US-16 #140`** | Comprovante Oficial em PDF, Navegação e Homologação | 10 pts | 13.0h | 4 fatias (#363 a #366) | Guilherme Kauã, Maylson Rodrigues, Herbert Carvalho |
| **Total Planejado** | **Sprint Backlog Oficial** | **31 pts** | **38.0h** | **12 Fatias Verticais** | **Equipe Completa** |

---

### 3.2 Detalhamento Técnico das 12 Fatias Verticais (Sprint Issues)

| Issue | Subtarefa / Fatia Vertical | Tipo / Escopo | SP | Horas | Responsável Principal |
|:---:|---|---|:---:|:---:|---|
| **`#355`** | **[US-13.1]** Scaffolding e Infraestrutura do Módulo de Pedidos (Migration Flyway `V19__create_orders_schema.sql`, entidades `Order`/`OrderItem`, enums e repositórios) | Scaffolding / DB | 1 pt | 1.0h | Italo Jefferson |
| **`#356`** | **[US-13.2]** Conversão de Orçamento em Pedido de Venda - Backend Core (`OrderCodeGenerator`, método atômico `@Transactional`, DTOs e endpoint `POST /api/orders/from-budget/{id}`) | Backend Core | 3 pts | 4.0h | Guilherme Kauã |
| **`#357`** | **[US-13.3]** Modal de Aprovação e Ação de Conversão - Frontend (`OrderApprovalModal.tsx`, formulário Zod, sugestão automática de prazo $+15$ dias e integração na `BudgetDetailPage`) | Frontend UI | 3 pts | 3.0h | Júlio Kennedy |
| **`#358`** | **[US-13.4]** Listagem Paginada de Pedidos de Venda - Full-Stack (`GET /api/orders` com paginação/filtros, página `OrderListPage.tsx` e `OrderStatusBadge.tsx`) | Full-Stack | 3 pts | 4.0h | Maylson Rodrigues |
| **`#359`** | **[US-13.5]** Visualização Detalhada do Pedido de Venda - Full-Stack (`GET /api/orders/{id}`, tela `OrderDetailPage.tsx`, resumo financeiro e vínculo ao orçamento de origem) | Full-Stack | 3 pts | 3.0h | Joseph Nichollas |
| **`#360`** | **[US-14.1]** Snapshot Imutável, Lock de Preços e Tabela de Itens Congelados (Deep copy em 3 níveis de `BudgetItem` para `OrderItem`, proteção contra reajustes e `OrderItemsTable.tsx`) | Full-Stack | 3 pts | 4.0h | Italo Jefferson |
| **`#361`** | **[US-15.1]** Máquina de Estados e Cancelamento de Pedidos com Justificativa (Transições de status, endpoint `PATCH /api/orders/{id}/cancel`, `OrderCancelModal.tsx` e bloqueio em produção) | Full-Stack | 3 pts | 4.0h | Gabriel de Souza |
| **`#362`** | **[US-15.2]** Reabertura de Orçamento após Cancelamento de Pedido (Ajuste na máquina do `BudgetService` para retorno `APPROVED` ➔ `DRAFT` e botão de reabertura) | Full-Stack | 2 pts | 2.0h | Júlio Kennedy |
| **`#363`** | **[US-16.1]** Comprovante Oficial do Pedido em PDF via OpenPDF (`OrderPdfService`, layout institucional A4 timbrado, endpoint `GET /pdf/comprovante` e download na UI) | Full-Stack / PDF | 3 pts | 4.0h | Guilherme Kauã |
| **`#364`** | **[US-16.2]** Navegação no Sidebar, Documentação OpenAPI/Swagger e Contratos (Atalho "Pedidos de Venda" no menu lateral e anotações completas de Swagger no `OrderController`) | Frontend & Docs | 2 pts | 2.0h | Maylson Rodrigues, Gabriel de Souza |
| **`#365`** | **[US-16.3]** Bateria de Testes de Integração do Backend - MockMvc + H2 (`OrderControllerIntegrationTest` cobrindo cenários felizes, validações 400, conflito 409 e autorização) | QA / Backend | 3 pts | 3.0h | Herbert Carvalho |
| **`#366`** | **[US-16.4]** Testes de Sistema E2E, Validação BDD e Homologação do Quickstart (Suíte E2E cobrindo fluxo ponta a ponta e execução integral do roteiro de validação `quickstart.md`) | QA / E2E | 3 pts | 4.0h | Herbert Carvalho, Equipe Geral |

---

## 4. 💬 Principais Deliberações e Decisões Técnicas

### 4.1 Invariante de Conversão 1-para-1 e Atomicidade (`US-13 #137`)
* **Decisão:** A conversão de um orçamento em pedido de venda ocorrerá sob uma única transação `@Transactional` atômica no `OrderService`.
* **Trava de Conflito (409 Conflict):** Implementação de constraint `UNIQUE (orcamento_id)` na tabela `orders`. Caso o usuário ou requisições concorrentes tentem converter um orçamento já vinculado a um pedido ativo, a API rejeitará a solicitação com status HTTP `409 Conflict`.
* **Identificador Anual:** Adoção do padrão `PED-YYYY-NNNN` (ex: `PED-2026-0001`), gerenciado pelo componente desacoplado `OrderCodeGenerator`.
* **Sugestão Inteligente de Entrega:** O formulário de aprovação pré-calculará automaticamente a previsão de entrega como **$+15$ dias corridos** a partir da data atual, com suporte aos canais `WHATSAPP`, `PRESENCIAL`, `TELEFONE` e `EMAIL`.

### 4.2 Snapshot Imutável e Lock de Preços (`US-14 #138`)
* **Decisão:** No momento da conversão, cada `BudgetItem` será clonado para `OrderItem` através de uma rotina de clonagem profunda (*deep copy*) em 3 níveis (especificações de vão, perfil/vidro/componentes calculados e valores unitários/subtotais).
* **Blindagem Financeira:** Os preços unitários, descontos e taxas aplicados no pedido serão definitivamente congelados. Futuras alterações no módulo de materiais ou tabelas de preços do catálogo não alterarão os pedidos já emitidos.
* **Imutabilidade Contratual:** O pedido aprovado não permite edição direta de dimensões ou remoção de itens na interface; qualquer alteração de projeto exigirá cancelamento formal e renegociação.

### 4.3 Ciclo de Vida, Auditoria de Cancelamento e Reabertura (`US-15 #139`)
* **Decisão:** A máquina de estados do pedido seguirá: `CRIADO` ➔ `AGUARDANDO_PRODUCAO` ➔ `EM_PRODUCAO` ➔ `CONCLUIDO`.
* **Trava de Cancelamento em Produção:** Pedidos com status `EM_PRODUCAO` ou `CONCLUIDO` não podem ser cancelados diretamente pelos operadores de atendimento/vendas, resguardando o desperdício de corte na fábrica.
* **Justificativa Obrigatória:** O cancelamento nos status iniciais exigirá texto formal de justificativa com no mínimo 10 caracteres (`orderCancelSchema`), registrando data e autor para auditoria.
* **Reabertura Condicional:** Ao cancelar um pedido, o orçamento de origem associado poderá ser reaberto pelo vendedor (`APPROVED` ➔ `DRAFT`), permitindo ajustes comerciais sem necessidade de recriar todos os itens do zero.

### 4.4 Comprovante do Pedido em PDF (`US-16 #140`)
* **Decisão:** Utilização do motor OpenPDF consolidado na Sprint 05, encapsulado no `OrderPdfService`.
* **Layout Institucional A4:** Documento timbrado com cabeçalho da Alumiportas, número oficial do pedido, dados cadastrais do cliente, endereço e data de entrega acordada, grade de itens com preços congelados e seções formais para assinatura contratual.
* **SLA de Performance:** O endpoint `GET /api/orders/{id}/pdf/comprovante` deve renderizar e entregar o arquivo `application/pdf` em tempo inferior a 2 segundos.

### 4.5 Padrão de Fatias Verticais e Limite de 4 Horas
* **Decisão:** Todas as 12 tarefas da sprint foram desenhadas como fatias verticais finas (*Thin Vertical Slices*), integrando ponta a ponta banco de dados, backend, frontend e testes.
* **Teto de Estimativa:** Nenhuma tarefa isolada ultrapassa o teto rigoroso de **4.0 horas**, garantindo fluxo contínuo de revisões em Pull Requests pequenos e reduzindo riscos de bloqueios entre desenvolvedores.

---

## 5. 🏁 Definição de Pronto (DoD) e Metas de Qualidade

1. **Testes e Build:** 100% dos testes unitários e de integração executados com sucesso via `./mvnw clean verify` e `npm test`.
2. **Quality Gate SonarQube:** New Code Coverage $\ge 80\%$ nas classes do módulo `orders` com zero vulnerabilidades e zero bugs apontados.
3. **Validação em Camadas Duplas:** Regras de negócio validadas no backend (Bean Validation nos DTOs Records + Services de domínio) e schemas Zod com React Hook Form no frontend.
4. **Persistência e Migrations:** Migração Flyway `V19__create_orders_schema.sql` executada com sucesso em ambiente PostgreSQL.
5. **Documentação e Contratos:** Endpoints de pedidos documentados com anotações OpenAPI/Swagger no `OrderController`.
6. **Revisão de Código:** PRs revisados e aprovados por pelo menos um Engenheiro e com build verde no GitHub Actions antes do merge na branch `develop`.
7. **Homologação E2E:** Fluxo completo ponta a ponta validado via roteiro `quickstart.md` e suíte automatizada de testes E2E.

---

*Ata aprovada pelos participantes e registrada na governança oficial em 29 de Setembro de 2026.*
