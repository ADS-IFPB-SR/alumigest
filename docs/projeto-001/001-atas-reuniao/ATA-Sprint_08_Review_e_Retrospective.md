# 📝 ATA DE SPRINT REVIEW & RETROSPECTIVA — SPRINT 08

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Período avaliado:** 27 de outubro a 09 de novembro de 2026 (Baseline `B-ALG-v0.8.0-S08-01`)  
**Modalidade:** Híbrida / Alinhamento de Consolidação da Sprint  
**Registro:** Compilação da Sprint Review e Retrospectiva da Equipe  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Papéis

* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Maylson da Silva Rodrigues** — *Scrum Master & Desenvolvedor*
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Desenvolvedor*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Objetivo da Sprint e Status de Entrega

* **Meta da Sprint 08:** Entregar o módulo comercial de **Venda Avulsa de Partes (`US-46 #477`)** e a **Central 360° do Cliente (`US-47 #496`)** com emissão da Ficha Técnica de Produção A4 e impressão térmica no Hub, além de corrigir os apontamentos herdados da Sprint 07 (`#524`, `#525`).
* **Pontos Planejados:** 26 pts (13 pts US-46 + 13 pts US-47)
* **Pontos Concluídos (DoD atendido):** 26 pts (**100% de conclusão**)
* **Taxa de Conclusão:** 100% (12 fatias verticais entregues: `US-46.1` a `US-46.6` e `US-47.1` a `US-47.6`)

### 2.1 Entregas Homologadas na Review (Demonstração ao PO)

| User Story / Sub-Task | Escopo Entregue & PRs | Status de Aceite PO |
|---|---|:---:|
| **US-46 (#477) — Venda Avulsa de Partes** (`US-46.1` a `US-46.6`) | Schema `tb_part_sales`/`tb_part_sale_items` (`V23`), seed `Cliente Balcão` (`V24`), `PartCalculatorFactory` com 4 calculadoras (`Hardware`, `AluminumProfile`, `Glass`, `Film`), `MaterialAutocomplete` (`GET /api/v1/materials?category=`), PDF A4 agrupado (`PartSalePdfService`), rotas `/vendas/avulsa` e suíte Cypress (`PR #538`, `#542`, `#543`, `#549`, `#557`, `#561`, `#564`, `#565`) | ✅ Aprovado |
| **US-47 (#496) — Central 360° do Cliente** (`US-47.1` a `US-47.6`) | `ClientHubController` (`/dashboard`, `/budgets`, `/orders`), `CustomerHubPage` com Hero Card e 3 KPIs, abas de Orçamentos e O.S. com medidas nominais em mm, Ficha Técnica A4 (`ProductionSheetService`, `SupremaSlidingWindowCalculator`, `DefaultFrameCalculator` — `PR #553`), modal de etiquetas térmicas (`PR #560`), modal de edição cadastral (`EditCustomerModal` — `PR #559`) e suíte E2E `us47_hub_360_cliente.cy.ts` (`PR #563`, `#567`) | ✅ Aprovado |
| **Sustentação & Fixes Pós-Sprint 07** | Correção de duplicidade no menu Kanban (`#524` / `PR #544`), scroll vertical no Kanban (`#525` / `PR #540`), contagem de peças (`#500` / `PR #539`), numeração de etiquetas (`PR #541`), ciclo de vida/reabertura de orçamentos (`PR #537`, `#547`), contraste visual em modo escuro (`PR #597`) e pipeline E2E em containers no GitHub Actions (`PR #568`) | ✅ Aprovado |

---

## 3. 📊 Métricas de Qualidade e Testes Apuradas

* **Testes Backend (escopo Sprint 08):** 40 testes em 5 classes (`MaterialControllerTest`, `MaterialRepositoryTest`, `PartSaleControllerTest`, `PartSaleServiceImplTest`, `ClientHubControllerIntegrationTest`), além de testes específicos para `ProductionSheetServiceTest`, `ProductionSheetPdfServiceTest`, `SupremaSlidingWindowCalculatorTest` e `DefaultFrameCalculatorTest`.
* **Testes Frontend (Vitest):** **1.025 testes** aprovados em **122 suítes** (`0` falhas).
* **Testes E2E (Cypress):** 2 suítes principais da sprint homologadas (`us46_venda_avulsa_visual.cy.ts` com 4 cenários e `us47_hub_360_cliente.cy.ts` com 12 cenários = **16 cenários E2E**, além de `us46_venda_avulsa_partes.cy.ts` e `us46_lista_vendas_avulsas.cy.ts`).
* **Quality Gate SonarQube & CI:** 0 erros de TypeScript (`tsc -b`), 0 erros de Oxlint e 0 bugs bloqueantes/vulnerabilidades no diff dos PRs.

---

## 4. 🔄 Retrospectiva da Equipe

### 👍 O que funcionou bem?
* **Fatias Verticais e Baixo Acoplamento:** A adoção de `PartCalculatorFactory` e subcomponentes especializados no frontend evitou conflitos de merge entre os desenvolvedores trabalhando em paralelo na `US-46` e `US-47`.
* **Qualidade e Automação E2E no CI:** A introdução de testes E2E com Cypress em service containers nativos no workflow `.github/workflows/ci.yml` (`PR #568`) elevou a confiabilidade das entregas.
* **Agilidade no Tratamento de Apontamentos do PO:** Os itens `#524` e `#525` da Review da Sprint 07 foram resolvidos logo nos primeiros dias da Sprint 08.

### ⚠️ O que pode ser melhorado?
* **Sincronização Documental (`Docs-as-Code`):** A documentação oficial de sistema (`MER`, `API-Especificacao_API_REST`, `RN-Regras_de_Calculo`, `CHANGELOG.md`) e os artefatos de fechamento de sprint ficaram defasados em relação às entregas integradas em `develop` e `release/v0.8.0`.
* **Controle de Versionamento Flyway em Branches Paralelas:** A colisão da migration `V22` em `release/v0.8.0` (que exigiu renomeação para `V25__set_default_order_status_created.sql`) reforçou a necessidade de coordenar o próximo número sequencial disponível antes de abrir novas migrations (`V26` para Estoque).

### 🚀 Plano de Ação para a Sprint 09
1. **Coordenação de Migrations Flyway:** Reservar explicitamente a versão `V26__create_stock_schema.sql` para o módulo de estoque, evitando colisão com `V25` da `release/v0.8.0` *(Responsável: Tech Lead / Devs US-21)*.
2. **Fatiamento Atômico ($\le 3.5\text{h}$) e Prototipação Prévia:** Iniciar a Sprint 09 (`US-21` e `US-22`) com protótipo HTML unificado homologado (`catalogo-materiais-estoque-kardex.html`) e tarefas atômicas em `docs/planejamento/sprint-09/` *(Responsável: Scrum Master Júlio Kennedy & Equipe)*.
3. **Atualização Contínua da Tríade e Contratos:** Garantir atualização síncrona de `MER`, `API`, `RN` e tríade `TEA`/`RTM`/`RET` *(Responsável: Equipe de Engenharia & QA)*.

---

## 5. 📌 Próximos Passos
* Fechamento e validação da branch `release/v0.8.0` (`v0.8.0`).
* Início da **Sprint 09** (`10/11/2026 a 23/11/2026`) sob liderança de Scrum Master **Júlio Kennedy** com foco em **Estoque Make-to-Order (`US-21`)** e **Posição/Kardex (`US-22`)**.
