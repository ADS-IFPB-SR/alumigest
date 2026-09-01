# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações de negócio, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e release do projeto **AlumiGest**.

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.

---

## 🗺️ Mapa Geral de Sprints (Sprints 1 a 16)

| Release | Sprint | Módulo / Escopo Principal | Documentação | Total de Issues | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Release 1 (v1.0.0)** | **Sprint 1** | Iniciação, Governança, Docker Compose (Postgres 16/PgAdmin), Scaffold Spring Boot 3.4 e CI/CD | [Acessar Sprint 01](sprint-01/spec.md) | **4 Issues** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | **Sprint 2** | Catálogo de Materiais Genérico (Vidros, Perfis, Películas, Ferragens), Produtos e PWA | [Acessar Sprint 02](sprint-02/spec.md) | **8 Issues** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | **Sprint 3** | Cadastro Clientes, Motor de Orçamentos (Strategy/Factory), Listagem PWA, SonarQube e Cypress | [Acessar Sprint 03](sprint-03/spec.md) | **12 Issues** | 🟢 Concluída |
| **Release 1 (v1.0.0)** | **Sprint 4** | Descontos Comerciais, Condições de Pagamento, Emissão de PDF em 2 Vias (Comercial/Oficina) e Homologação R1 | *Em Abertura* | **64 Issues** | 🟣 A Iniciar |
| **Release 2 (v2.0.0)** | **Sprint 5** | Aprovação de Orçamentos e Conversão em Pedidos de Venda (Lock de Preços) | *Backlog* | **43 Issues** | ⚪ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 6** | Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code | *Backlog* | **36 Issues** | ⚪ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 7** | Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina - sem nesting) | *Backlog* | **19 Issues** | ⚪ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 8** | Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2 | *Backlog* | **36 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 9** | Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola) | *Backlog* | **27 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 10** | Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento | *Backlog* | **25 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 11** | Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa | *Backlog* | **21 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 12** | Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes | *Backlog* | **27 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 13** | Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas | *Backlog* | **21 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 14** | Modo PWA/Offline para Instaladores e Ajustes de Performance | *Backlog* | **21 Issues** | ⚪ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 15** | Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3 | *Backlog* | **24 Issues** | ⚪ Planejada |
| **Reserva / Sustentação** | **Sprint 16** | Estabilização pós-implantação, Contingência, Auditoria e Documentação Final | *Backlog* | **23 Issues** | ⚪ Planejada |

---

### 📊 Resumo Consolidado do Projeto AlumiGest

- **Ciclo Completo**: **16 Sprints (Sprints 1 a 16)**
- **Sprints Concluídas e Versionadas**: **Sprints 1, 2 e 3** (100% homologadas com baselines registradas)
- **Sprints Planejadas**: **Sprints 4 a 16**
- **Total Geral de Issues Mapeadas**: **411 Issues individuais** com checklists executáveis!
- **Total de Migrations Flyway Especificadas**: V1 a V17
- **Estrutura 100% Homologada na Constituição do Projeto** (Clean Architecture, Package-by-Feature, Records Java, BDD/Gherkin).

---

## 📂 Estrutura Padrão de Cada Sprint

Cada pasta de sprint contém o pacote completo de engenharia:
- `spec.md`: Especificação funcional, histórias de usuário e cenários de aceitação (Gherkin/BDD).
- `plan.md`: Plano de implementação técnica e Constitution Check.
- `data-model.md`: Entidades, campos, enums, relacionamentos e máquina de estados.
- `quickstart.md`: Guia de validação ponta a ponta com comandos e cenários de teste.
- `tasks.md`: Lista consolidada de tarefas da sprint.
- `issues/`: Issues individuais detalhadas por pastas com `issue.md` e checklists operacionais.