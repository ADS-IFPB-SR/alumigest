# 📝 ATA DE REUNIÃO DE SPRINT REVIEW (SPRINT 02)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 18 de Agosto de 2026 (Segunda-feira) | **Horário:** 19:00 às 20:00  
**Local:** Reunião Virtual (Google Meet)  
**Redator:** Nichollas Cavalcante / Equipe AlumiGest  

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Nichollas Cavalcante** — *Scrum Master & DevOps*
* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor Frontend & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Backend*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor Backend*
* **Hérbert Carvalho** — *Desenvolvedor Backend*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*
* **Professor Orientador da Disciplina** — *Avaliador Acadêmico*

---

## 2. 🎯 Pauta da Reunião

1. Demonstração prática do incremento de software desenvolvido na Sprint 2 (Catálogo de Materiais e Fichas Técnicas de Produtos).
2. Validação da interface PWA em abas com filtros por tipo de material.
3. Apresentação das métricas de entrega da sprint (45 story points entregues).
4. Coleta de feedback do Product Owner e do Orientador Acadêmico.
5. Homologação formal do Definition of Done (DoD) e encerramento da Sprint 2.

---

## 3. 🖥️ Demonstração do Produto (Incremento de Software)

### 3.1 Módulo de Materiais (Backend & Frontend)
- **Aba Vidros:** Demonstração do cadastro de vidros 2mm e 4mm com cálculo de m² e validações de preço positivo.
- **Aba Perfis de Alumínio:** Demonstração do cadastro de barras de 3m e 6m (Linhas Rometal e Alternativa) com controle de referência comercial única.
- **Aba Películas & Ferragens:** Demonstração do fluxo ágil de cadastro de insumos por m², unidade, par ou metro.

### 3.2 Fichas Técnicas e Categorias de Produtos
- Demonstração do cadastro de Categorias (`ProductCategory`) e de Produtos (`Product`) associando múltiplos materiais (`ProductItem`) para compor a receita de portas/esquadrias.

---

## 4. 💬 Feedbacks e Parecer dos Stakeholders

### 4.1 Parecer do Orientador Acadêmico
* **Aprovação Arquitetural:** O modelo de dados desacoplado via *Type-Object Pattern* foi validado como excelente prática de engenharia.
* **Recomendação para Sprint 3:** Na criação do motor de cálculo de orçamentos, garantir que a alteração futura de um insumo no catálogo mestre não afete o valor de orçamentos e pedidos já fechados (congelamento de preços/snapshot).

### 4.2 Parecer do Product Owner (José Guilherme)
* **Validação Operacional:** A interface do PWA atendeu plenamente as necessidades levantadas junto ao parceiro social (Thiago/Alumiportas).
* **Aprovação do Escopo:** 100% dos itens da Sprint 2 foram aprovados para compor a baseline.
* **Direcionamento da Sprint 3:** Priorizar imediatamente o cadastro de clientes e o motor de orçamentos.

---

## 5. 🏁 Decisões e Conclusão

* A Sprint 2 foi considerada **100% CONCLUÍDA e HOMOLOGADA** (45/45 Story Points).
* O incremento foi mergeado com sucesso na branch `develop`.
* A baseline da sprint foi autorizada para registro.

---

*Ata aprovada pelos participantes em 18 de Agosto de 2026.*
