# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 09 PLANNING)

**Projeto:** AlumiGest — Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 10 de Novembro de 2026 (Terça-feira) | **Horário:** 20:00 às 21:00  
**Local:** Reunião Virtual (Google Meet) / Sala de Projetos  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Quórum

* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Júlio Kennedy dos Santos Silva** — *Scrum Master & Desenvolvedor*
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Desenvolvedor*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Abertura da **Sprint 09** (Período Oficial: **10/11/2026 a 23/11/2026**), dando continuidade à **Release 2** com o módulo de **Controle de Estoque e Almoxarifado**.
2. Alinhamento da premissa operacional **Make-to-Order da Serralheria** com o Product Owner:
   - Aprovação de Ordem de Serviço (`OS-YYYY-NNNN`) ou emissão de Venda Avulsa (`US-46`) **nunca é bloqueada** por saldo físico insuficiente.
   - Reservas em déficit geram saldo disponível negativo (`available_quantity < 0`) para sinalizar **Necessidade de Compra** no Catálogo & Almoxarifado e no Kanban Fabril.
   - Bloqueio HTTP `422` restrito exclusivamente a movimentações físicas manuais (`SCRAP_LOSS` / `MANUAL_ADJUSTMENT`) que resultariam em `physical_quantity < 0`.
3. Homologação do protótipo unificado `docs/planejamento/prototipos/catalogo-materiais-estoque-kardex.html` (4 abas do catálogo integradas com saldos, gaveta lateral `KardexDrawer`, documento livre sem chave SEFAZ e fluxo "2 em 1" de entrada inicial).
4. Decomposição da Sprint 09 em **12 tarefas atômicas** ($\le 3.5\text{h}$ na US-21 e fatias verticais fullstack na US-22), totalizando **13 Story Points** e **42.5 horas estimadas**.

---

## 3. 📋 Detalhamento do Backlog Homologado (Sprint Backlog)

### 3.1 Visão Geral por Histórias de Usuário

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Tarefas |
|---|---|:---:|:---:|:---:|
| **`US-21 #146`** | Reservar e Baixar Matéria-Prima no Estoque Automaticamente (Make-to-Order) | 8 pts | 24.0h | `US-21.1` a `US-21.8` (8 tarefas atômicas) |
| **`US-22 #147`** | Consultar Posição de Estoque e Kardex de Movimentações | 5 pts | 18.5h | `US-22.1` a `US-22.4` (4 fatias verticais fullstack) |
| **Total Planejado** | **Sprint Backlog Oficial** | **13 pts** | **42.5h** | **12 Tarefas** |

### 3.2 Tarefas Decompostas (`docs/planejamento/sprint-09/README.md`)

| Subtarefa | Issue GitHub | Título | Pontos | Horas |
|:---:|:---:|---|:---:|:---:|
| `US-21.1` | [#571](https://github.com/ADS-IFPB-SR/alumigest/issues/571) | Setup & Estrutura Base do Módulo de Estoque | 1 pt | 2.5h |
| `US-21.2` | [#572](https://github.com/ADS-IFPB-SR/alumigest/issues/572) | Migração Flyway (`V26` após `release/v0.8.0`) e Entidades JPA com `@Lock(PESSIMISTIC_WRITE)` | 1 pt | 3.0h |
| `US-21.3` | [#573](https://github.com/ADS-IFPB-SR/alumigest/issues/573) | Motor de Reserva Automática Make-to-Order (`reserveMaterials`) | 2 pts | 3.5h |
| `US-21.4` | [#574](https://github.com/ADS-IFPB-SR/alumigest/issues/574) | Indicador Visual Make-to-Order no Card do Kanban Fabril | 1 pt | 2.5h |
| `US-21.5` | [#575](https://github.com/ADS-IFPB-SR/alumigest/issues/575) | Baixa Física Definitiva na Conclusão da Produção (`COMPLETED`) | 1 pt | 3.0h |
| `US-21.6` | [#576](https://github.com/ADS-IFPB-SR/alumigest/issues/576) | Estorno Automático de Reservas em Cancelamento de Pedidos | 1 pt | 2.5h |
| `US-21.7` | [#577](https://github.com/ADS-IFPB-SR/alumigest/issues/577) | Endpoint de Movimentações Manuais & Modal de Perdas/Sucata | 1 pt | 3.5h |
| `US-21.8` | [#578](https://github.com/ADS-IFPB-SR/alumigest/issues/578) | Testes de Concorrência Multi-Thread, E2E e OpenAPI | 1 pt | 3.5h |
| `US-22.1` | [#587](https://github.com/ADS-IFPB-SR/alumigest/issues/587) | Visualização de Saldos e Badges de Estoque nas 4 Abas do Catálogo (Fullstack) | 2 pts | 6.0h |
| `US-22.2` | [#589](https://github.com/ADS-IFPB-SR/alumigest/issues/589) | Gaveta Lateral de Extrato Kardex (`KardexDrawer.tsx`) e Linha do Tempo (Fullstack) | 1 pt | 4.5h |
| `US-22.3` | [#590](https://github.com/ADS-IFPB-SR/alumigest/issues/590) | Modal de Entrada de Compras com Documento Livre e Auto-Provisionamento (Fullstack) | 1 pt | 4.5h |
| `US-22.4` | [#591](https://github.com/ADS-IFPB-SR/alumigest/issues/591) | Rota `/catalogo`, Menu Lateral e Guia Visual de Avisos no Kanban | 1 pt | 3.5h |

---

## 4. 🛡️ Acordos Técnicos da Sprint 09

1. **Invariante e Lock Pessimista:** Todas as mutações de saldo utilizam `@Lock(LockModeType.PESSIMISTIC_WRITE)` mantendo `available_quantity = physical_quantity - reserved_quantity`.
2. **Auditoria Kardex Append-Only:** Registros em `tb_stock_movements` são imutáveis após inserção, guardando saldos anteriores e posteriores (`previous_*` e `new_*`).
3. **Documento Livre e Custo Unitário:** Entradas aceitam `reference_document` em texto livre (sem chave SEFAZ obrigatória) e registram `unit_cost`.
4. **Sequência Flyway:** Coordenar numeração única para a migration de estoque evitando colisão com a `V25` da `release/v0.8.0` (adotar `V26` na integração final).

---

*Ata oficial registrada em conformidade com Docs-as-Code — 10/11/2026.*
