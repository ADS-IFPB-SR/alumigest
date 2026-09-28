# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 04 PLANNING)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 01 de Setembro de 2026 (Segunda-feira) | **Horário:** 19:30 às 21:45  
**Local:** Reunião Virtual (Google Meet)  
**Redator:** Italo Jefferson Lima dos Santos — Tech Lead  
**Governança:** Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Italo Jefferson Lima dos Santos** — *Tech Lead & Engenheiro de Software*
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor Backend & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Frontend*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor Backend*
* **Herbert Carvalho dos Santos** — *QA & Testes Automatizados*
* **Gabriel de Souza Nascimento** — *Desenvolvedor Frontend*

---

## 2. 🎯 Pauta da Reunião

1. Abertura do ciclo de desenvolvimento da **Sprint 04** (Período: **01/09/2026 a 14/09/2026** — 14 dias).
2. Definição do Backlog da Sprint 04 no quadro oficial ZenHub / GitHub Projects totalizando **50 Story Points** e **80.5 horas estimadas**.
3. Priorização imediata da resolução de débitos técnicos e conformidade estrita com o SonarQube Quality Gate (`quality #245`).
4. Reestruturação do catálogo de produtos com renderização em SVG paramétrico e Studio CAD (`US-05 #126`).
5. Refatoração da arquitetura de orçamentos para suporte à criação atômica com itens inclusos — Budget V2 (`US-46 #172`).
6. Implementação das regras de negócio de descontos percentuais e fixos, taxas adicionais e condições de pagamento (`US-09 #133`).
7. Planejamento da estratégia de homologação integrada da Release 1 (`US-12 #136`).

---

## 3. 📋 Detalhamento do Backlog Selecionado (Sprint Backlog)

| Demanda / Issue | Escopo / Módulo | Story Points | Horas Estimadas | Subtarefas | Responsáveis Principais |
|---|---|:---:|:---:|:---:|---|
| **`quality #245`** | Resolução de débitos técnicos e conformidade com SonarQube | 5 pts | 9.0h | 5 tarefas | Italo Jefferson, Herbert Carvalho |
| **`US-05 #126`** | Refatorar Produtos com Templates Paramétricos de Esquadrias | 5 pts | 17.0h | 9 tarefas | Guilherme Kauã, Gabriel Nascimento |
| **`US-46 #172`** | Refatoração do Módulo de Orçamentos (Budget V2) | 6 pts | 18.5h | 6 tarefas | Maylson Rodrigues, Júlio Kennedy |
| **`US-09 #133`** | Aplicar Descontos e Condições Comerciais no Orçamento | 32 pts | 31.0h | 41 tarefas | Joseph Nichollas, José Guylherme |
| **`US-12 #136`** | Homologação Integrada e Validação da Release 1 (v1.0.0) | 2 pts | 5.0h | 2 tarefas | Herbert Carvalho, Equipe Geral |
| **Total Planejado** | **Sprint Backlog Oficial** | **50 pts** | **80.5h** | **63 subtarefas** | **Equipe Completa** |

---

## 4. 💬 Principais Deliberações e Decisões Técnicas

### 4.1 Resolução de Débitos e SonarQube (`quality #245`)
* **Decisão:** A primeira fase da sprint será dedicada a ajustar a pipeline JaCoCo e o SonarScanner no GitHub Actions.
* **Exclusão de DTOs:** Classes record DTOs, mappers MapStruct e entidades JPA serão formalmente excluídas do cálculo de cobertura de linhas do JaCoCo, concentrando a meta de $\ge 80\%$ exclusivamente nos Services e Calculadoras de domínio.
* **SonarLint:** Adoção obrigatória do protocolo pré-PR com o SonarLint no VS Code/IntelliJ.

### 4.2 Templates Paramétricos SVG (`US-05 #126`)
* **Decisão:** As esquadrias serão representadas por 10 modelos canônicos em vetores SVG modulares, permitindo ao usuário alterar largura e altura em tempo real no Studio CAD.
* **Validação de Vão Mínimo:** Implementação de trava visual para impedir dimensões de vão inferiores a $400\text{ mm}$.
* **Seletor de Insumos:** Desacoplamento das tipologias através do componente `CategoryRequirementsSelector`.

### 4.3 Arquitetura Budget V2 (`US-46 #172`)
* **Decisão:** O endpoint `POST /api/budgets` será refatorado para aceitar uma lista de itens aninhada em transação `@Transactional` única, eliminando de forma definitiva o problema de descarte silencioso de itens identificado nos testes.
* **Desacoplamento:** Separação estrita de responsabilidades entre `BudgetService` e `BudgetItemService`.

### 4.4 Motor de Descontos e Condições Comerciais (`US-09 #133`)
* **Decisão:** O vendedor terá autonomia comercial direta para conceder descontos em % ou R$ sem necessidade de alçada gerencial.
* **Precisão Numérica:** Aplicação de `BigDecimal` com escala 2 e `RoundingMode.HALF_EVEN` em todas as operações monetárias.
* **Condições de Pagamento:** Pré-configuração de opções canônicas no enum `PaymentCondition` (À Vista, Entrada + Entrega, Cartão de Crédito).

### 4.5 Estratégia de Homologação da Release 1 (`US-12 #136`)
* **Alinhamento:** A equipe avaliou que uma bateria de testes isolada ao final da sprint poderia gerar atrasos na entrega dos PDFs e na finalização da interface comercial. Ficou acordado monitorar o avanço da US-09 e, se necessário, diluir os critérios da US-12 diretamente nas entregas de saída da Sprint 05.

---

## 5. 🏁 Definição de Pronto (DoD) e Metas de Qualidade

1. 100% dos testes unitários e de integração executados via `./mvnw clean verify` com sucesso.
2. New Code Coverage $\ge 80\%$ nas classes de serviço no SonarQube com zero vulnerabilidades.
3. PRs revisados por pelo menos um Engenheiro e aprovados no CI antes do merge em `develop`.

---

*Ata aprovada pelos participantes e registrada na governança oficial em 01 de Setembro de 2026.*
