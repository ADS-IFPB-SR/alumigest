# PIT — Plano de Iteração — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos/Condições (US-09) e Quality SonarQube |
| **Período** | 01/09/2026 a 14/09/2026 (14 dias) |
| **Gerente da Sprint (LP)** | Italo Jefferson Lima dos Santos — Tech Lead & Engenharia |
| **Versão** | 2.0 (Alinhado com o GitHub Projects / ZenHub Oficial) |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 04

Executar a refatoração e consolidação estrutural dos módulos centrais do AlumiGest:
1. **Refatoração de Templates Paramétricos (`US-05` — Issue #126):** Decomposição e modularização da renderização SVG, suporte canônico aos 10 modelos paramétricos de esquadrias e desacoplamento de requisitos de insumos.
2. **Refatoração da Arquitetura de Orçamentos (`US-46` — Issue #172):** Arquitetura Budget V2, saneamento de contratos e tipagens fortes.
3. **Descontos e Condições Comerciais (`US-09` — Issue #133):** Implementação de regras de desconto percentual e monetário fixo, prazos de validade e condições de pagamento (À Vista, Cartão, Boleto Faturado).
4. **Resolução de Débitos Técnicos e Qualidade (`quality` — Issue #245):** Conformidade rigorosa com SonarQube e SonarLint, eliminação de vulnerabilidades SAST e adequação de testes unitários.
5. **Decisão de Escopo da Release (`US-12` — Issue #136):** A homologação integrada da Release 1 foi replanejada para não gerar gargalos, sendo **diluída entre as histórias US-09 e US-10 da Sprint 05**.

---

## 2. 📋 Backlog da Sprint 04 (Quadro Oficial GitHub Projects)

| Issue / Demanda | Descrição da Entrega | Story Points | Horas Estimadas | Subtarefas | Status Real da Sprint 04 |
|---|---|:---:|:---:|:---:|:---:|
| **quality #245** | Resolução de débitos técnicos e conformidade com SonarQube | 5 pts | 9.0h | 5 / 5 | 🟢 **100% Concluído** |
| **US-05 #126** | Refatorar Produtos com Templates Paramétricos de Esquadrias | 5 pts | 17.0h | 9 / 9 | 🟢 **100% Concluído** |
| **US-46 #172** | Refatoração do Módulo de Orçamentos (Budget V2) | 6 pts | 18.5h | 6 / 6 | 🟢 **100% Concluído** |
| **US-09 #133** | Aplicar Descontos e Condições Comerciais no Orçamento | 32 pts | 31.0h | 41 / 41 | 🟡 **Parcialmente Concluído** *(Integrações e fechamento migrados para a Sprint 5)* |
| **US-12 #136** | Homologação Integrada e Validação da Release 1 (v1.0.0) | 2 pts | 5.0h | 0 / 2 | ⏸️ **Não Realizada na S04** *(Diluída entre US-09 e US-10 na Sprint 05)* |
| **Total Planejado** | **5 Demandas Principais** | **50 pts** | **80.5h** | **61 / 63** | 🟢 **Progresso Geral: ~90% Entregue** |

---

## 3. 🔄 Replanejamento e Migração para a Sprint 05

* **US-09 (Fechamento):** As etapas remanescentes de validação ponta a ponta e integração com emissão de propostas comerciais foram transferidas para a Sprint 05 junto à US-10.
* **Diluição da US-12 (Homologação da Release 1):** Em vez de uma etapa isolada de validação, os critérios de homologação e testes de aceite da US-12 foram incorporados diretamente nos critérios de aceite (DoD) da US-09 (Comercial) e da US-10 (Geração de PDFs e WhatsApp) na Sprint 05, garantindo entrega contínua sem filas de espera.

---

## 4. 🛡️ Riscos e Mitigações Registrados na Sprint 04

* **Risco R11 (Vazamento de Dados Comerciais na Oficina):** Mapeado para implementação conjunta com a US-10 (via técnica sem cifras) na Sprint 05.
* **Risco R12 (Subdimensionamento Físico de Vãos):** Implementado no validador com alerta visual para vãos $< 400\text{ mm}$.
* **Risco R13 (Bloqueio de CI/CD pelo SonarQube):** Mitigado integralmente na issue `quality #245` através de regras de exclusão de DTOs e elevação da cobertura nos services.

---

*Plano de Iteração atualizado e homologado com os dados reais do quadro de acompanhamento da Sprint 04 — Versão 2.0 — 24/09/2026*
