# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações de negócio, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e release do projeto **AlumiGest**.

> **Padrão de Governança**: User Stories sequenciais no projeto inteiro (`US-01` a `US-46`) com Sub-tarefas decimais (`US-XX.Y`), integrando Backend, Frontend e QA sob cada história funcional.

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.
- [Tabela De-Para de User Stories](de-para-user-stories.md) — Mapeamento oficial entre a numeração antiga (PO / branches) e a numeração atualizada.

---

## 🗺️ Mapa Geral de Sprints & User Stories (Sprints 01 a 16)

| Release | Sprint | Módulo / Escopo Principal | User Stories (Pais) | Total Issues | Status |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Release 1 (v1.0.0)** | [Sprint 01](sprint-01/spec.md) | Iniciação, Governança e Infraestrutura Base | `US-01` | **4** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 02](sprint-02/spec.md) | Catálogo de Materiais e Fichas Técnicas | `US-02`, `US-03` | **8** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 03](sprint-03/spec.md) | Clientes, Motor de Orçamentos e Templates | `US-04`, `US-05`, `US-06`, `US-07`, `US-08` | **12** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | [Sprint 04](sprint-04/spec.md) | Descontos Comerciais, PDF em 2 Vias e Homologação R1 | `US-09`, `US-10`, `US-11`, `US-12` | **64** | 🔵 Planejada |
| **Release 2 (v2.0.0)** | [Sprint 05](sprint-05/spec.md) | Pedidos de Venda e Lock de Preços | `US-13`, `US-14`, `US-15`, `US-16` | **43** | 🔵 Planejada |
| **Release 2 (v2.0.0)** | [Sprint 06](sprint-06/spec.md) | Etiquetas de Identificação de Peças e Kanban de Produção | `US-17`, `US-18` | **11** | 🔵 Planejada |
| **Release 2 (v2.0.0)** | [Sprint 07](sprint-07/spec.md) | Lista de Corte e Ficha Técnica de Montagem | `US-19`, `US-20` | **12** | 🔵 Planejada |
| **Release 2 (v2.0.0)** | [Sprint 08](sprint-08/spec.md) | Controle de Estoque, Kardex e Homologação R2 | `US-21`, `US-22`, `US-23` | **28** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 09](sprint-09/spec.md) | Integração de Pagamento PIX e Webhooks | `US-24`, `US-25`, `US-26` | **27** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 10](sprint-10/spec.md) | Contas a Receber, Parcelamento e Inadimplência | `US-27`, `US-28`, `US-29` | **25** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 11](sprint-11/spec.md) | Fluxo de Caixa Mensal | `US-30` | **10** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 12](sprint-12/spec.md) | Gestão de Instalações, Ordens de Serviço (OS) e Agenda | `US-31`, `US-32`, `US-33`, `US-34` | **27** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 13](sprint-13/spec.md) | Dashboard Executivo, KPIs e DRE Gerencial | `US-35`, `US-36`, `US-37` | **21** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 14](sprint-14/spec.md) | Modo PWA/Offline para Instaladores e Performance | `US-38`, `US-39`, `US-40` | **21** | 🔵 Planejada |
| **Release 3 (v3.0.0)** | [Sprint 15](sprint-15/spec.md) | Treinamento dos Usuários, Carga Real e Homologação R3 | `US-41`, `US-42`, `US-43` | **24** | 🔵 Planejada |
| **Sustentação** | [Sprint 16](sprint-16/spec.md) | Estabilização pós-implantação, Backup e Auditoria | `US-44`, `US-45`, `US-46` | **23** | 🔵 Planejada |

---

### 📊 Resumo Consolidado do Projeto AlumiGest

- **Total de Sprints**: **16 Sprints (Sprints 01 a 16)**
- **Total de User Stories (Pais)**: **46 User Stories Sequenciais (`US-01` a `US-46`)**
- **Total Geral de Sub-Tarefas / Issues Ativas**: **360 Issues individuais** com checklists executáveis
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