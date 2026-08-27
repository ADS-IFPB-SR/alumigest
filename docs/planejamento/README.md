# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações de negócio, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e release do projeto **AlumiGest**.

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.

---

## 🗺️ Mapa Geral de Sprints (100% Planejado)

| Release | Sprint | Módulo / Escopo Principal | Documentação | Total de Issues | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Release 1 (v1.0.0)** | **Sprint 4** | Descontos Comerciais, Condições de Pagamento, Emissão de PDF em 2 Vias (Comercial/Oficina) e Homologação R1 | [Acessar Sprint 04](sprint-04/spec.md) | **64 Issues** | ✅ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 5** | Aprovação de Orçamentos e Conversão em Pedidos de Venda (Lock de Preços) | [Acessar Sprint 05](sprint-05/spec.md) | **43 Issues** | ✅ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 6** | Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code | [Acessar Sprint 06](sprint-06/spec.md) | **36 Issues** | ✅ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 7** | Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina - sem nesting) | [Acessar Sprint 07](sprint-07/spec.md) | **19 Issues** | ✅ Planejada |
| **Release 2 (v2.0.0)** | **Sprint 8** | Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2 | [Acessar Sprint 08](sprint-08/spec.md) | **36 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 9** | Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola) | [Acessar Sprint 09](sprint-09/spec.md) | **27 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 10** | Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento | [Acessar Sprint 10](sprint-10/spec.md) | **25 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 11** | Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa | [Acessar Sprint 11](sprint-11/spec.md) | **21 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 12** | Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes | [Acessar Sprint 12](sprint-12/spec.md) | **27 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 13** | Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas | [Acessar Sprint 13](sprint-13/spec.md) | **21 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 14** | Modo PWA/Offline para Instaladores e Ajustes de Performance | [Acessar Sprint 14](sprint-14/spec.md) | **21 Issues** | ✅ Planejada |
| **Release 3 (v3.0.0)** | **Sprint 15** | Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3 | [Acessar Sprint 15](sprint-15/spec.md) | **24 Issues** | ✅ Planejada |
| **Reserva / Sustentação** | **Sprint 16** | Estabilização pós-implantação, Contingência, Auditoria e Documentação Final | [Acessar Sprint 16](sprint-16/spec.md) | **23 Issues** | ✅ Planejada |

---

### 📊 Resumo Consolidado do Projeto AlumiGest

- **Total de Sprints Planejadas**: **13 Sprints (Sprints 4 a 16)**
- **Total Geral de Issues Geradas**: **387 Issues individuais** com checklists executáveis!
- **Total de Migrations Flyway Especificadas**: V8 a V17
- **Estrutura 100% Homologada na Constituição do Projeto** (Clean Architecture, Package-by-Feature, Records Java, BDD/Gherkin).

---

## 📂 Estrutura de Cada Sprint

Cada pasta de sprint contém o pacote completo de engenharia gerado via **Spec Kit**:
- `spec.md`: Especificação funcional, histórias de usuário e cenários de aceitação (Gherkin/BDD).
- `plan.md`: Plano de implementação técnica e Constitution Check.
- `research.md`: Decisões técnicas e justificativas arquiteturais.
- `data-model.md`: Entidades, campos, enums, relacionamentos e máquina de estados.
- `quickstart.md`: Guia de validação ponta a ponta com comandos e cenários de teste.
- `contracts/`: Especificação detalhada dos contratos de API REST.
- `issues/`: Issues detalhadas organizadas por tarefas individuais com checklists.