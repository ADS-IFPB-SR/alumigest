# 📋 Planejamento de Sprints & Releases — AlumiGest

Este diretório centraliza a documentação de planejamento, especificações de negócio, decisões arquiteturais, modelos de dados e contratos de API organizados por sprint e release do projeto **AlumiGest**.

---

## 🏛️ Governança e Princípios
- [Constituição do Projeto](constitution.md) — Princípios fundamentais de arquitetura, qualidade e regras invioláveis de engenharia.

---

## 🗺️ Mapa de Sprints

| Release | Sprint | Módulo / Escopo Principal | Documentação |
| :--- | :--- | :--- | :--- |
| **Release 1 (v1.0.0)** | **Sprint 4** | Descontos Comerciais, Condições de Pagamento, Emissão de PDF em 2 Vias (Comercial/Oficina) e Homologação R1 | [Acessar Sprint 04](sprint-04/spec.md) |
| **Release 2 (v2.0.0)** | **Sprint 5** | Aprovação de Orçamentos e Conversão em Pedidos de Venda (Lock de Preços) | *A planejar* |
| **Release 2 (v2.0.0)** | **Sprint 6** | Ordens de Produção (OP), Rastreamento de Status e Etiquetas QR Code | *A planejar* |
| **Release 2 (v2.0.0)** | **Sprint 7** | Lista de Corte & Ficha Técnica de Montagem (Romaneio de Oficina) | *A planejar* |
| **Release 2 (v2.0.0)** | **Sprint 8** | Controle de Estoque (Baixas/Reservas Automáticas, Perdas) e Homologação R2 | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 9** | Módulo de Pagamento e Cobrança via PIX (QR Code Dinâmico + Copia e Cola) | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 10** | Contas a Receber, Gestão de Sinais/Entradas (50%) e Parcelamento | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 11** | Baixa de Pagamentos, Conciliação Financeira e Fluxo de Caixa | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 12** | Módulo de Instalações, Ordens de Serviço (OS) e Agenda de Equipes | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 13** | Relatórios Gerenciais, DRE Simplificado e Dashboard de Vendas | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 14** | Modo PWA/Offline para Instaladores e Ajustes de Performance | *A planejar* |
| **Release 3 (v3.0.0)** | **Sprint 15** | Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3 | *A planejar* |
| **Reserva** | **Sprint 16** | Estabilização pós-implantação, Contingência e Documentação Final | *A planejar* |

---

## 📂 Estrutura de Cada Sprint

Cada pasta de sprint contém o pacote completo de engenharia gerado via **Spec Kit**:
- `spec.md`: Especificação funcional, histórias de usuário e cenários de aceitação (Gherkin/BDD).
- `plan.md`: Plano de implementação técnica e Constitution Check.
- `research.md`: Decisões técnicas e justificativas arquiteturais.
- `data-model.md`: Entidades, campos, enums, relacionamentos e máquina de estados.
- `quickstart.md`: Guia de validação ponta a ponta com comandos e cenários de teste.
- `contracts/`: Especificação detalhada dos contratos de API REST.