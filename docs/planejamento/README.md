# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações de negócio, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e release do projeto **AlumiGest**.

> **Padrão de Governança**: User Stories sequenciais no projeto inteiro (`US-01` a `US-45`) com Sub-tarefas decimais (`US-XX.Y`), integrando Backend, Frontend e QA sob cada história funcional.

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.
- [Tabela De-Para de User Stories](de-para-user-stories.md) — Mapeamento oficial entre a numeração antiga (PO / branches) e a numeração atualizada.
- [Matriz Mestre de Estimativas (Story Points)](estimativa-backlog-geral.md) — Estimativas sugeridas em Fibonacci (1, 2, 3, 5, 8, 13) e campos para consenso da equipe.
- [Guia Geral de Estimativa de Horas](guia-estimativa-horas.md) — Padrão oficial de dimensionamento e estimativa de esforço em horas para tarefas do projeto.

---

## 🗺️ Mapa Geral de Sprints & User Stories (Sprints 01 a 16)

| Release | Sprint | Módulo / Escopo Principal | User Stories (Pais) | Total Issues | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Release 1 (v1.0.0)** | [Sprint 01](sprint-01/spec.md) | Iniciação, Governança e Infraestrutura Base | `US-01` | **4** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 02](sprint-02/spec.md) | Catálogo de Materiais e Fichas Técnicas | `US-02`, `US-03` | **8** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 03](sprint-03/spec.md) | Clientes, Motor de Orçamentos e Templates | `US-04`, `US-05`, `US-06`, `US-07`, `US-08` | **12** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 04](sprint-04/spec.md) | Templates SVG, Budget V2, Descontos Base e Quality SonarQube | `quality #245`, `US-05`, `US-46`, `US-09 (P1)` | **41** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 05](sprint-05/spec.md) | Conclusão de Descontos, PDFs em 2 Vias e Homologação R1 via DoD | `US-09 (P2)`, `US-10`, `US-11` (DoD R1) | **36** | 🟢 Concluída / Em Homologação |
| **Release 2 (v2.0.0)** | [Sprint 06](sprint-06/spec.md) | Pedidos de Venda, Lock de Preços e Transição Fabril | `US-13`, `US-14`, `US-15`, `US-16` | **43** | 🔵 Planejada |
| **Release 2 (v2.0.0)** | [Sprint 07](sprint-07/spec.md) | Etiquetas de Identificação de Peças e Kanban | `US-17`, `US-18` | **11** | 🔵 Planejada |
| **Release 2 (v2.0.0)** | [Sprint 08](sprint-08/spec.md) | Lista de Corte, Ficha de Montagem e Kardex | `US-19`, `US-20`, `US-21`, `US-22` (DoD R2) | **40** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 09](sprint-09/spec.md) | Integração de Pagamento PIX e Webhooks | `US-24`, `US-25`, `US-26` | **27** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 10](sprint-10/spec.md) | Contas a Receber, Parcelamento e Inadimplência | `US-27`, `US-28`, `US-29` | **25** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 11](sprint-11/spec.md) | Fluxo de Caixa Mensal | `US-30` | **10** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 12](sprint-12/spec.md) | Gestão de Instalações, Execução em Campo (OS) e Agenda | `US-31`, `US-32`, `US-33` | **24** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 13](sprint-13/spec.md) | Dashboard Executivo, KPIs e DRE Gerencial | `US-34`, `US-35`, `US-36` | **21** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 14](sprint-14/spec.md) | Modo PWA/Offline para Instaladores e Performance | `US-37`, `US-38`, `US-39` | **21** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 15](sprint-15/spec.md) | Treinamento dos Usuários, Carga Real e Manuais | `US-40`, `US-42` (DoD R3) | **24** | 🔵 Planejada |
| **Sustentação** | [Sprint 16](sprint-16/spec.md) | Estabilização pós-implantação, Backup e Auditoria | `US-43`, `US-44`, `US-45` | **23** | 🔵 Planejada |

---

### 📊 Resumo Consolidado do Projeto AlumiGest

- **Total de Sprints**: **16 Sprints (Sprints 01 a 16)**
- **Total de User Stories (Pais)**: **42 User Stories Funcionais (`US-01` a `US-45`, com homologações de R1, R2 e R3 integradas no DoD contínuo)**
- **Total Geral de Sub-Tarefas / Issues Ativas**: **347 Issues individuais** de features com checklists executáveis
- **Padrão de Sub-tarefas**: **Decimal (`US-XX.Y`)**
- **Arquitetura & Qualidade**: Clean Architecture, Package-by-Feature, Records Java, Spring Boot 3.4, React PWA, BDD/Gherkin e SonarQube Quality Gate.

---

## 📂 Estrutura de Cada Sprint

Cada pasta de sprint contém o pacote completo de engenharia gerado via **Spec Kit**:
- `spec.md`: Especificação funcional com User Stories (`US-XX`) e cenários BDD/Gherkin.
- `plan.md`: Plano de implementação técnica e Constitution Check.
- `tasks.md`: Lista detalhada de sub-tarefas no padrão decimal (`US-XX.Y`).
- `data-model.md`: Entidades, campos, enums, relacionamentos e máquina de estados.
- `quickstart.md`: Guia de validação ponta a ponta com comandos e cenários de teste.
- `contracts/`: Especificação detalhada dos contratos de API REST.
- `issues/`: Issues individuais organizadas por sub-tarefas (`US-XX.Y-[slug]`) com metadados e critérios de aceitação.