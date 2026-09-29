# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações funcionais, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e no [Backlog Centralizado](backlog/README.md) do projeto **AlumiGest**.

> **Padrão de Governança**: User Stories sequenciais no projeto inteiro (`US-01` a `US-45`) com Sub-tarefas decimais (`US-XX.Y`), integrando Backend, Frontend e QA sob cada história funcional.
> **Modelo Ágil de Sprints**: As sprints são estruturadas sob demanda. Conforme as histórias são alinhadas na Sprint Planning, as pastas das sprints são criadas contendo os artefatos de execução das histórias selecionadas a partir do [Backlog](backlog/).

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.
- [Tabela De-Para de User Stories](de-para-user-stories.md) — Mapeamento oficial entre a numeração antiga (PO / branches) e a numeração atualizada.
- [Matriz Mestre de Estimativas (Story Points)](estimativa-backlog-geral.md) — Estimativas sugeridas em Fibonacci (1, 2, 3, 5, 8, 13) e campos para consenso da equipe.
- [Guia Geral de Estimativa de Horas](guia-estimativa-horas.md) — Padrão oficial de dimensionamento e estimativa de esforço em horas para tarefas do projeto.
- [Backlog Centralizado de User Stories](backlog/README.md) — Catálogo de todas as 29 User Stories futuras (`US-17` a `US-45`) e 226 sub-tarefas.

---

## 🗺️ Mapa de Sprints do Projeto AlumiGest

### 🟢 Sprints Concluídas (Release 1 — v1.0.0)

| Sprint | Período / Marco | Módulo / Escopo Principal | User Stories | Total Issues | Status |
| :--- | :---: | :--- | :--- | :---: | :---: |
| [Sprint 01](sprint-01/spec.md) | 01/08 a 15/08/2026 | Iniciação, Governança e Infraestrutura Base | `US-01` | **4** | 🟢 Concluída |
| [Sprint 02](sprint-02/spec.md) | 16/08 a 30/08/2026 | Catálogo de Materiais e Fichas Técnicas | `US-02`, `US-03` | **8** | 🟢 Concluída |
| [Sprint 03](sprint-03/spec.md) | 31/08 a 14/09/2026 | Clientes, Motor de Orçamentos e Templates | `US-04`, `US-05`, `US-06`, `US-07`, `US-08` | **12** | 🟢 Concluída |
| [Sprint 04](sprint-04/spec.md) | 01/09 a 14/09/2026 | Templates SVG, Descontos Base e Quality SonarQube | `quality #245`, `US-05`, `US-46`, `US-09 (P1)` | **41** | 🟢 Concluída |
| [Sprint 05](sprint-05/spec.md) | 15/09 a 28/09/2026 | Conclusão de Descontos, PDFs em 2 Vias e Homologação R1 via DoD | `US-09 (P2)`, `US-10`, `US-11` (DoD R1) | **24** | 🟢 Concluída |

---

### 🔵 Sprint Ativa (Release 2 — Gestão Fabril & Pedidos)

| Sprint | Período Oficial | Módulo / Escopo Principal | User Stories | Total Issues | Status |
| :--- | :---: | :--- | :--- | :---: | :---: |
| **[Sprint 06](sprint-06/README.md)** | **29/09/2026 a 12/10/2026** | **Pedidos de Venda, Lock de Preços e Comprovante Oficial** | **`US-13`, `US-14`, `US-15`, `US-16`** | **43** | 🔵 **Planejada / Ativa** |

---

### 📦 Backlog Futuro (Planejamento Sob Demanda)

Todas as histórias subsequentes da **Release 2**, **Release 3** e **Sustentação** estão organizadas no [Backlog Centralizado](backlog/README.md). Conforme a equipe realizar cada Sprint Planning, novas pastas de sprint serão criadas selecionando histórias deste backlog:

- **Fábrica & Chão de Fábrica (Release 2)**:
  - [`US-17`](backlog/US-17-etiquetas-identificacao/spec.md) — Etiquetas de Identificação de Peças (100x50mm)
  - [`US-18`](backlog/US-18-painel-kanban-producao/spec.md) — Painel Kanban de Produção
  - [`US-19`](backlog/US-19-lista-corte-pedido/spec.md) — Lista Consolidada de Corte (Romaneio)
  - [`US-20`](backlog/US-20-ficha-tecnica-montagem/spec.md) — Ficha Técnica de Montagem de Esquadrias
  - [`US-21`](backlog/US-21-reserva-baixa-estoque/spec.md) — Reserva e Baixa Automática de Estoque
  - [`US-22`](backlog/US-22-posicao-estoque-kardex/spec.md) — Posição de Estoque e Kardex
  - [`US-23`](backlog/US-23-homologacao-release-2/spec.md) — Homologação Integrada da Release 2 (v2.0.0)

- **Financeiro & Campo (Release 3)**:
  - [`US-24`](backlog/US-24-cobranca-pix-dinamico/spec.md), [`US-25`](backlog/US-25-webhook-pix-confirmacao/spec.md), [`US-26`](backlog/US-26-modal-pix-historico/spec.md) — Pagamentos PIX & Webhooks
  - [`US-27`](backlog/US-27-parcelamento-pedidos/spec.md), [`US-28`](backlog/US-28-contas-receber-inadimplencia/spec.md), [`US-29`](backlog/US-29-extrato-financeiro-recibo/spec.md) — Contas a Receber e Parcelamentos
  - [`US-30`](backlog/US-30-fluxo-caixa-mensal/spec.md) — Fluxo de Caixa Mensal
  - [`US-31`](backlog/US-31-execucao-os-campo-pwa/spec.md), [`US-32`](backlog/US-32-calendario-instalacoes/spec.md), [`US-33`](backlog/US-33-emissao-os-pdf/spec.md) — Instalação e Ordens de Serviço (OS PWA)
  - [`US-34`](backlog/US-34-dashboard-kpis-comerciais/spec.md), [`US-35`](backlog/US-35-dre-gerencial/spec.md), [`US-36`](backlog/US-36-exportacao-relatorios-executivos/spec.md) — Dashboards, DRE e Relatórios Executivos
  - [`US-37`](backlog/US-37-pwa-offline-indexeddb/spec.md), [`US-38`](backlog/US-38-sincronizacao-fila-fotos-background/spec.md), [`US-39`](backlog/US-39-compressao-imagens-otimizacao/spec.md) — Modo Offline & PWA Performance
  - [`US-40`](backlog/US-40-carga-inicial-importador-csv/spec.md), [`US-41`](backlog/US-41-homologacao-release-3/spec.md), [`US-42`](backlog/US-42-guias-treinamento-central-ajuda/spec.md) — Carga Inicial, Treinamento e Homologação R3

- **Sustentação & Governança**:
  - [`US-43`](backlog/US-43-backup-disaster-recovery/spec.md) — Backup e Disaster Recovery
  - [`US-44`](backlog/US-44-trilha-auditoria-imutavel/spec.md) — Trilha de Auditoria Imutável
  - [`US-45`](backlog/US-45-monitoramento-actuator-documentacao/spec.md) — Monitoramento Actuator e Swagger OpenAPI

---

## 📂 Estrutura de Cada Sprint Ativa

Cada pasta de sprint ativa contém o pacote completo de engenharia gerado via **Spec Kit**:
- `README.md`: Sumário da sprint e tabela geral de sub-tarefas.
- `spec.md`: Especificação funcional com User Stories (`US-XX`) e cenários BDD/Gherkin.
- `plan.md`: Plano de implementação técnica e Constitution Check.
- `tasks.md`: Lista detalhada de sub-tarefas no padrão decimal (`US-XX.Y`).
- `data-model.md`: Entidades, campos, enums, relacionamentos e máquina de estados.
- `quickstart.md`: Guia de validação ponta a ponta com comandos e cenários de teste.
- `contracts/`: Especificação detalhada dos contratos de API REST.
- `issues/`: Issues individuais organizadas por sub-tarefas (`US-XX.Y-[slug]`) com metadados e critérios de aceitação.