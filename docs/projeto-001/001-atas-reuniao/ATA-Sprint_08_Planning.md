# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 08 PLANNING)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 26 de Outubro de 2026 (Segunda-feira) | **Horário:** [A preencher na reunião]  
**Local:** Reunião Virtual (Google Meet) / Presencial  
**Redator:** [A preencher na reunião]  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)  

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Guilherme Kauã Matos da Silva** — *Tech Lead & Desenvolvedor*
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor & Engenheiro de Software*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor & DevOps*
* **Maylson da Silva Rodrigues** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Herbert Carvalho dos Santos** — *Desenvolvedor*
* **Gabriel de Souza Nascimento** — *Desenvolvedor*

---

## 2. 🎯 Pauta da Reunião

1. Abertura do ciclo de desenvolvimento da **Sprint 08** (Período: **26/10/2026 a [A definir na reunião]**), dando continuidade à **Release 2 (Gestão Fabril & Expansão Comercial)**.
2. Definição, estimativa e aprovação do Backlog da Sprint 08 no GitHub Projects contemplando:
   - **`US-46 #171`**: Módulo de Venda Avulsa de Partes e Insumos (Vidro por m², Alumínio por metro linear, Ferragens e Películas) sem obrigatoriedade de esquadria completa.
   - **`US-47 #496`**: Central 360° do Cliente com Gestão Unificada de Propostas, Ordens de Serviço, Fichas Técnicas e Ações Rápidas de Impressão.
3. Decomposição das histórias em fatias verticais (*Thin Vertical Slices*) de até 4 horas por tarefa, respeitando a separação estrita de camadas e padrões **SOLID**.
4. Definição do Sprint Goal oficial, capacidade da equipe em horas e distribuição de responsáveis técnicos.

---

## 3. 📋 Detalhamento do Backlog Proposto (Sprint Backlog)

### 3.1 Visão Geral por Histórias de Usuário (PBL)

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Subtarefas / Fatias | Responsáveis Principais |
|---|---|:---:|:---:|:---:|---|
| **`US-46 #171`** | Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas) | [A definir] | [A definir] | Fatias US-46.1 a US-46.4 | [A definir na reunião] |
| **`US-47 #496`** | Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas | [A definir] | [A definir] | Fatias US-47.1 a US-47.4 | [A definir na reunião] |
| **Total Planejado** | **Sprint Backlog Oficial** | **[A definir]** | **[A definir]** | **[A definir]** | **Equipe Completa** |

---

### 3.2 Fatias Verticais em Análise para Decomposição Técnica

| Subtarefa | Descrição Técnica da Fatia | Tipo / Escopo | Horas | Responsável Principal |
|:---:|---|---|:---:|---|
| **`US-46.1`** | Modelagem de dados (`tb_part_sales`, `tb_part_sale_items`), DTOs e engine de cálculo de venda por m², metro linear e unidade | Backend Core / Regras | [A definir] | [A definir] |
| **`US-46.2`** | Formulário dinâmico de cotação de partes e insumos no frontend com seleção contextual de vidros, perfis, ferragens e películas | Frontend UI / Form | [A definir] | [A definir] |
| **`US-46.3`** | Serviço de exportação do orçamento e comprovante de venda de partes em PDF (A4) | Back & Front / PDF | [A definir] | [A definir] |
| **`US-46.4`** | Testes automatizados (JUnit 5, MockMvc e Vitest) e validações de margens de corte de insumos | QA / Testes | [A definir] | [A definir] |
| **`US-47.1`** | Endpoint backend e consultas agregadas de cliente 360° (resumo financeiro, contagem de O.S. e orçamentos vinculados) | Backend REST / API | [A definir] | [A definir] |
| **`US-47.2`** | Layout mestre-detalhe da Central 360° no frontend com busca reativa e alternância de abas sem cortes visuais | Frontend UI / Hub | [A definir] | [A definir] |
| **`US-47.3`** | Integração direta das ações de impressão térmica (100x60mm) e emissão de comprovantes na visualização 360° | Frontend Ações / Modais | [A definir] | [A definir] |
| **`US-47.4`** | Testes de integração e testes de aceitação ponta a ponta (Cypress E2E) para navegação 360° | QA / E2E | [A definir] | [A definir] |

---

## 4. 🛡️ Acordos de Trabalho e Quality Gates da Sprint 08

1. **Padrão de Branch e PRs**: Branches individuais no padrão `feat/us-XX.Y-slug-resumido`, com PR obrigatório apontando para a branch `develop`.
2. **Padrões SOLID e Isolamento**: Nenhuma regra de negócio de precificação ou cálculo de margens de partes deve ser acoplada no frontend; o frontend consome os endpoints oficiais do backend.
3. **Qualidade SonarQube & Coverage**: Manter Quality Gate verde (sem *code smells* críticos e complexidade cognitiva controlada $\le 15$).
4. **Convenção de Commits**: Conventional Commits em português do Brasil (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`).

---

## 5. ✍️ Assinatura e Homologação da Ata

*Ata preliminar registrada para deliberação na cerimônia oficial de Sprint Planning.*


* **José Guylherme dos Santos Melo** — *Product Owner & Scrum Master*
