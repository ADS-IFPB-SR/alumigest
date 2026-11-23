# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações funcionais, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e no [Backlog Centralizado](backlog/README.md) do projeto **AlumiGest**.

> **Padrão de Governança**: User Stories sequenciais no projeto inteiro (`US-01` a `US-47`) com Sub-tarefas decimais (`US-XX.Y`), integrando Backend, Frontend e QA sob cada história funcional.
> **Modelo Ágil de Sprints**: As sprints são estruturadas sob demanda. Conforme as histórias são alinhadas na Sprint Planning, as pastas das sprints são criadas contendo os artefatos de execução das histórias selecionadas a partir do [Backlog](backlog/).

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.
- [Tabela De-Para de User Stories](de-para-user-stories.md) — Mapeamento oficial entre a numeração antiga (PO / branches) e a numeração atualizada.
- [Matriz Mestre de Estimativas (Story Points)](estimativa-backlog-geral.md) — Estimativas sugeridas em Fibonacci (1, 2, 3, 5, 8, 13) e campos para consenso da equipe.
- [Guia Geral de Estimativa de Horas](guia-estimativa-horas.md) — Padrão oficial de dimensionamento e estimativa de esforço em horas para tarefas do projeto.
- [Backlog Centralizado de User Stories](backlog/README.md) — Catálogo de todas as User Stories futuras (`US-17` a `US-47`, com registro das USs descartadas).

---

## 🗺️ Mapa de Sprints do Projeto AlumiGest

### 🟢 Sprints Concluídas

| Sprint | Período / Marco | Módulo / Escopo Principal | User Stories | Total Issues | Status |
| :--- | :---: | :--- | :--- | :---: | :---: |
| [Sprint 01](sprint-01/spec.md) | 01/08 a 15/08/2026 | Iniciação, Governança e Infraestrutura Base | `US-01` | **4** | 🟢 Concluída |
| [Sprint 02](sprint-02/spec.md) | 16/08 a 30/08/2026 | Catálogo de Materiais e Fichas Técnicas | `US-02`, `US-03` | **8** | 🟢 Concluída |
| [Sprint 03](sprint-03/spec.md) | 31/08 a 14/09/2026 | Clientes, Motor de Orçamentos e Templates | `US-04`, `US-05`, `US-06`, `US-07`, `US-08` | **12** | 🟢 Concluída |
| [Sprint 04](sprint-04/spec.md) | 01/09 a 14/09/2026 | Templates SVG, Descontos Base e Quality SonarQube | `quality #245`, `US-05`, `US-46`, `US-09 (P1)` | **41** | 🟢 Concluída |
| [Sprint 05](sprint-05/spec.md) | 15/09 a 28/09/2026 | Conclusão de Descontos, PDFs em 2 Vias e Homologação R1 via DoD | `US-09 (P2)`, `US-10`, `US-11` (DoD R1) | **24** | 🟢 Concluída |
| [Sprint 06](sprint-06/README.md) | 29/09 a 12/10/2026 | Pedidos de Venda, Lock de Preços e Comprovante Oficial | `US-13`, `US-14`, `US-15`, `US-16` | **43** | 🟢 Concluída |
| [Sprint 07](sprint-07/README.md) | 13/10 a 27/10/2026 | Gestão Fabril: Etiquetas Térmicas & Painel Kanban de Produção | `US-17`, `US-18` | **11** | 🟢 Concluída |
| [Sprint 08](sprint-08/README.md) | 27/10 a 09/11/2026 | Venda Avulsa de Partes & Central 360° do Cliente (`v0.8.0`) | `US-46`, `US-47` | **12** | 🟢 Concluída |

---

### 🔄 Sprints da Release 2 (Chão de Fábrica & Estoque)

| Sprint | Período Oficial | Módulo / Escopo Principal | User Stories | Total Tarefas | Status |
| :--- | :---: | :--- | :--- | :---: | :---: |
| [Sprint 09](sprint-09/README.md) | **10/11/2026 a 23/11/2026** | **Reserva/Baixa Automática Make-to-Order & Kardex** | **`US-21`, `US-22`** | **12 (13 pts)** | 🟢 **Concluída / Em Homologação** |
| [Sprint 10](sprint-10/README.md) | **24/11/2026 a 07/12/2026** | **Autenticação RBAC, Configurações Institucionais & Calibração Real (1ª Entrega)** | **4 Pilares Estratégicos** | **11 (14 pts)** | 🟢 **Planejada** |

---

### 📦 Backlog Futuro (Planejamento Sob Demanda)

Todas as histórias subsequentes da **Release 2**, **Release 3** e **Sustentação** estão organizadas no [Backlog Centralizado](backlog/README.md). Conforme a equipe realizar cada Sprint Planning, novas pastas de sprint serão criadas selecionando histórias deste backlog:

- **Fábrica & Expansão Comercial (Release 2)**:
  - [`US-17`](sprint-07/spec.md) — Etiquetas de Identificação de Peças (100×60mm PDF/BPLB) *(Concluída na Sprint 07)*
  - [`US-18`](sprint-07/spec.md) — Painel Kanban de Produção *(Concluída na Sprint 07)*
  - [`US-46`](sprint-08/spec.md) — Venda Avulsa de Partes *(Concluída na Sprint 08)*
  - [`US-47`](sprint-08/spec.md) — Central 360° do Cliente e Ficha Técnica A4 *(Concluída na Sprint 08)*
  - [`US-21`](sprint-09/spec.md) — Reserva e Baixa Automática de Estoque Make-to-Order *(🔄 Em Andamento — Sprint 09)*
  - [`US-22`](sprint-09/spec.md) — Posição de Estoque e Kardex *(🔄 Em Andamento — Sprint 09)*
  - [`US-19`](backlog/US-19-lista-corte-pedido/spec.md) — Lista Consolidada de Corte (Romaneio)
  - [`US-20`](backlog/US-20-ficha-tecnica-montagem/spec.md) — Ficha Técnica de Montagem por Item *(Base atendida na US-47.3; refinamentos no backlog)*
  - [`US-23`](backlog/US-23-homologacao-release-2/spec.md) — Homologação Integrada da Release 2 (v2.0.0)

- **Financeiro & Campo (Release 3)**:
  - [`US-24`](backlog/US-24-cobranca-pix-dinamico/spec.md), [`US-25`](backlog/US-25-webhook-pix-confirmacao/spec.md), [`US-26`](backlog/US-26-modal-pix-historico/spec.md) — Cobrança PIX Dinâmico com QR Code, Webhook e Modal Interativo
  - [`US-30`](backlog/US-30-fluxo-caixa-mensal/spec.md) — Fluxo de Caixa Mensal e Gestão de Despesas Operacionais *(Substitui e absorve o escopo financeiro das US-27 a US-29 e US-34 a US-36)*
  - [`US-33`](backlog/US-33-emissao-os-pdf/spec.md) — Emissão de Ordem de Serviço (OS) em PDF Padronizado
  - [`US-37`](backlog/US-37-pwa-offline-indexeddb/spec.md) — Instalação PWA Desktop/Mobile e Rascunhos de Orçamentos Offline (IndexedDB)
  - [`US-40`](backlog/US-40-carga-inicial-importador-csv/spec.md), [`US-41`](backlog/US-41-homologacao-release-3/spec.md) — Carga Inicial CSV e Homologação R3
  - *Descartadas*: `US-27` a `US-29` (Parcelamento/Contas/Recibos), `US-31` e `US-32` (Execução em Campo/Calendário), `US-34` a `US-36` (Dashboards/DRE), `US-38` e `US-39` (Fila de Fotos e Compressão de Imagens), `US-42` (Guias de Treinamento) — ver [descartadas](backlog/descartadas/)

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