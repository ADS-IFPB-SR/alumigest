# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 08 PLANNING)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 26 de Outubro de 2026 (Segunda-feira) | **Horário:** 20:30 às 21:30  
**Local:** Reunião Virtual (Google Meet) / Sala de Projetos  
**Redator:** João Guylherme
**Governança:** Docs-as-Code — Oficial de Governança (`docs-as-code`)  

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Maylson da Silva Rodrigues** — *Scrum Master*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Abertura do ciclo de desenvolvimento da **Sprint 08** (Período Oficial: **27/10/2026 a 09/11/2026**), dando continuidade à **Release 2 (Gestão Fabril & Expansão Comercial)**.
2. Definição, estimativa e aprovação do Backlog da Sprint 08 no GitHub Projects contemplando:
   - **`US-46 #171`**: Módulo de Venda Avulsa de Partes e Insumos (Vidro por m², Alumínio por metro linear, Ferragens e Películas) sem obrigatoriedade de esquadria completa.
   - **`US-47 #496`**: Central 360° do Cliente com Gestão Unificada de Propostas, Ordens de Serviço, Fichas Técnicas e Ações Rápidas de Impressão.
3. Decomposição das histórias estritamente em **Fatias Verticais (*Thin Vertical Slices*)** autônomas, eliminando dependências em cascata horizontais (cada subtarefa contempla banco, backend, frontend e testes).
4. Definição das decisões técnicas fundamentais:
   - **Venda sem bloqueio de estoque**: Utilização direta do catálogo de insumos (`tb_materials`) para venda de partes sem bloquear a US-46 pelo módulo de estoque (US-21).
   - **Ficha Técnica Paramétrica**: Utilização dos templates paramétricos e tabelas de catálogo existentes para apuração de comprimentos e folgas de corte.
5. Definição do Sprint Goal oficial e distribuição de responsáveis técnicos.

---

## 3. 📋 Detalhamento do Backlog Homologado (Sprint Backlog)

### 3.1 Visão Geral por Histórias de Usuário (PBL)

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Subtarefas / Fatias Verticais | Responsáveis Principais |
|---|---|:---:|:---:|:---:|---|
| **`US-46 #477`** | Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas) | 13 pts | 48h | Fatias US-46.1 a US-46.4 (Fullstack) | Italo Jefferson, Guilherme Kauã, Gabriel de Souza |
| **`US-47 #496`** | Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas | 13 pts | 44h | Fatias US-47.1 a US-47.4 (Fullstack) | Joseph Nichollas, Júlio Kennedy, Herbert Carvalho |
| **Total Planejado** | **Sprint Backlog Oficial** | **26 pts** | **92h** | **8 Fatias Verticais Autônomas** | **Equipe Completa** |

---

### 3.2 Fatias Verticais Decompostas (*Thin Vertical Slices*)

| Subtarefa | Issue GitHub | Descrição Técnica da Fatia Vertical | Tipo / Escopo | Horas | Responsável Principal |
|:---:|:---:|---|---|:---:|---|
| **`US-46.1`** | [#527](https://github.com/ADS-IFPB-SR/alumigest/issues/527) | **Venda Avulsa de Ferragens por Unidade (Fullstack)**: Migration `tb_part_sales`, `tb_part_sale_items` com FK em `tb_materials`, cálculo unitário, UI de cotação `/vendas/partes/nova` com badge "Ferragem (un)" e testes MockMvc/Vitest | Fullstack | 14h | Italo Jefferson |
| **`US-46.2`** | [#528](https://github.com/ADS-IFPB-SR/alumigest/issues/528) | **Venda de Perfis de Alumínio em Metro Linear (Fullstack)**: Cálculo linear com perdas, inputs dinâmicos de comprimento (mm), badge "Metro Linear (m)", consulta reativa de preço e testes unitários/UI | Fullstack | 10h | Guilherme Kauã |
| **`US-46.3`** | [#529](https://github.com/ADS-IFPB-SR/alumigest/issues/529) | **Venda de Vidros e Películas em m² (Fullstack)**: Cálculo de área ($L \times A$), área mínima ($0,25\text{ m}^2$), perdas de película, validações físicas no `onBlur` e testes de limites | Fullstack | 12h | Gabriel de Souza |
| **`US-46.4`** | [#530](https://github.com/ADS-IFPB-SR/alumigest/issues/530) | **Geração e Exportação do Orçamento em PDF A4 (Fullstack)**: Serviço OpenPDF agrupado pelas 4 seções temáticas, botão de download blob na interface e testes binários | Fullstack | 12h | Italo Jefferson |
| **`US-47.1`** | [#531](https://github.com/ADS-IFPB-SR/alumigest/issues/531) | **Hub 360° Base, KPIs e Aba de Orçamentos (Fullstack)**: Endpoints CQRS (`/dashboard`, `/budgets`), layout mestre-detalhe lateral, tabela de orçamentos com atalhos e testes MockMvc/Vitest | Fullstack | 14h | Joseph Nichollas |
| **`US-47.2`** | [#532](https://github.com/ADS-IFPB-SR/alumigest/issues/532) | **Gestão de Ordens de Serviço (O.S.) e Esquadrias (Fullstack)**: Endpoint `/orders` com medidas nominais ($L \times A$ mm), aba de O.S. sem sobreposição flexbox, gaveta de peças e testes | Fullstack | 10h | Júlio Kennedy |
| **`US-47.3`** | [#533](https://github.com/ADS-IFPB-SR/alumigest/issues/533) | **Emissão da Ficha Técnica A4 de Produção com Lista de Corte (Fullstack)**: Serviço OpenPDF com cortes ($45^\circ/90^\circ$) e folgas paramétricas, modal interativo na Central 360° e testes | Fullstack | 12h | Herbert Carvalho |
| **`US-47.4`** | [#534](https://github.com/ADS-IFPB-SR/alumigest/issues/534) | **Impressão de Etiquetas Térmicas (100x60mm) no Hub (Fullstack / UI)**: Conexão direta com `ThermalLabelModal` (US-17), repasse do ID da ordem e disparo Elgin L42 e testes de integração | Fullstack / UI | 8h | Maylson Rodrigues |

---

## 4. 🛡️ Acordos de Trabalho e Quality Gates da Sprint 08

1. **Padrão de Branch e PRs**: Branches individuais no padrão `feat/us-XX.Y-slug-resumido`, originadas de `origin/develop` e com PR apontando obrigatoriamente para `develop`.
2. **Desacoplamento e Proibição de Fatias Horizontais**: Nenhuma subtarefa deve ser construída em silo técnico (apenas backend ou apenas frontend). Cada sub-tarefa deve entregar valor de negócio com testes automatizados no seu próprio DoD.
3. **Venda sem Bloqueio de Estoque**: A US-46 opera comercialmente utilizando o catálogo de materiais (`tb_materials`). O sistema não bloqueia vendas por falta de estoque enquanto o módulo de estoque (US-21) não estiver construído.
4. **Cálculo Paramétrico da Ficha Técnica**: A US-47.3 utiliza as regras paramétricas e templates de esquadrias do catálogo para determinar as dimensões e deduções da lista de corte no PDF.
5. **Qualidade SonarQube & Coverage**: Manter Quality Gate verde (cobertura $\ge 80\%$, zero *code smells* críticos e complexidade cognitiva $\le 15$).
6. **Convenção de Commits**: Conventional Commits em português do Brasil (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`).

---

## 5. ✍️ Assinatura e Homologação da Ata

*Ata oficial registrada e homologada na cerimônia de Sprint Planning.*

* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Maylson da Silva Rodrigues** — *Scrum Master*
* **Equipe de Desenvolvimento AlumiGest**
