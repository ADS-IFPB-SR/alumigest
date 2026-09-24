# 📝 ATA DE REUNIÃO DE SPRINT REVIEW & RETROSPECTIVA (SPRINT 04)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 14 de Setembro de 2026 (Segunda-feira) | **Horário:** 19:30 às 21:30  
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
* **Professor Orientador da Disciplina** — *Avaliador Acadêmico*

---

## 2. 🎯 Pauta da Reunião

1. Demonstração prática do incremento de software desenvolvido na **Sprint 04** (01/09/2026 a 14/09/2026).
2. Validação dos 10 modelos paramétricos em SVG no Studio CAD (`US-05 #126`).
3. Demonstração da arquitetura de orçamentos Budget V2 com múltiplos itens em transação atômica (`US-46 #172`).
4. Demonstração do motor de cálculo de descontos em %/R$ e condições comerciais no backend (`US-09 #133`).
5. Apresentação das métricas de qualidade do SonarQube e cobertura de testes (`quality #245`).
6. Análise das metas de entrega: **44 Story Points entregues (88%)** de 50 planejados.
7. Deliberação sobre o replanejamento da demanda `US-12 #136` (Homologação R1).
8. Retrospectiva da equipe (pontos positivos, impedimentos e planos de ação para a Sprint 05).

---

## 3. 🖥️ Demonstração do Produto (Incremento de Software)

### 3.1 Studio CAD e Templates Paramétricos (`US-05 #126` — 100% Concluído)
- Demonstração da renderização fluida em SVG proporcional dos 10 modelos canônicos de esquadrias (janelas 2F/4F, portas de correr, pivotantes, basculantes e maxim-ar).
- Validação do alerta visual de vão físico quando medidas $< 400\text{ mm}$ foram informadas.
- Demonstração do seletor `CategoryRequirementsSelector` filtrando automaticamente os insumos adequados.

### 3.2 Arquitetura Budget V2 (`US-46 #172` — 100% Concluído)
- Demonstração da chamada REST `POST /api/budgets` criando o cabeçalho e salvando 4 itens aninhados em transação `@Transactional` atômica.
- Comprovação da correção definitiva do descarte silencioso de itens (resolução do BUG-022 / Issue #300).

### 3.3 Motor de Descontos e Condições Comerciais (`US-09 #133` — Parcialmente Concluído)
- Demonstração do cálculo exato de descontos percentuais e em valor monetário fixo via `PricingCalculator`.
- Validação das regras de trava impedindo descontos abusivos $> 100\%$.
- Demonstração do recálculo determinístico somando taxas de frete e instalação com precisão `BigDecimal`.

### 3.4 Saneamento de Qualidade SonarQube (`quality #245` — 100% Concluído)
- Apresentação do painel do SonarQube Cloud: New Code Coverage atingindo $> 85\%$ nas classes de serviço, 0 vulnerabilidades e 0 bugs novos.
- Comprovação de que a exclusão de DTOs e Mappers no JaCoCo normalizou as métricas com precisão.

---

## 4. 💬 Deliberações e Decisões Estratégicas

### 4.1 Diluição da Homologação da Release 1 (`US-12 #136`)
* **Contexto:** A demanda `US-12 #136` previa uma fase estanque de homologação da Release 1. No entanto, o motor de orçamentos e as saídas em PDF ainda necessitavam da integração de fechamento comercial prevista para a Sprint 05.
* **Decisão Unânime (PO, Tech Lead e QA):** Em vez de paralisar a esteira com uma validação fechada na Sprint 04, **a demanda US-12 foi formalmente diluída**, sendo seus critérios de aceitação e testes de ponta a ponta incorporados como **Definition of Done (DoD) incremental das histórias US-09 e US-10 da Sprint 05**.
* **Benefício:** Eliminação de filas de espera e garantia de que os testes E2E e a homologação oficial validem o fluxo completo já com os PDFs e a cópia para WhatsApp.

### 4.2 Saldo de Story Points para a Sprint 05
* **Saldo:** 6 Story Points (4 pts de fechamento de UI da US-09 + 2 pts da US-12 diluída) foram transferidos para compor o backlog da **Sprint 05**.

---

## 5. 🔍 Retrospectiva da Sprint 04

| O que funcionou bem? | O que pode ser melhorado? | Ações para a Sprint 05 |
|---|---|---|
| A refatoração do Budget V2 eliminou problemas crônicos de persistência de itens. | A divisão de fatias de UI e Backend da US-09 gerou dependência para os PDFs. | Integrar diretamente as telas de orçamento com a emissão do PDF Comercial (US-10). |
| A pipeline de CI e o SonarQube ficaram estáveis e confiáveis após a exclusão de DTOs. | Grande volume de demandas paralelas em 14 dias sobrecarregou a fase final. | Focar na conclusão das saídas documentais e iniciar a transição para Pedidos de Venda. |
| O Studio CAD com renderização SVG agradou muito os requisitos da Alumiportas. | Necessidade de templates padronizados para issues no GitHub. | Atualizar o template padrão de issues no Git com o checklist de DoD integrado. |

---

## 6. 🏁 Encerramento e Parecer dos Stakeholders

* **Parecer do Product Owner (José Guylherme):** O avanço arquitetural da Sprint 04 foi fundamental para destravar a confiabilidade dos cálculos e orçamentos. A diluição da US-12 foi aprovada e faz todo sentido prático.
* **Status Final da Sprint 04:** **44 de 50 Story Points CONCLUÍDOS E APROVADOS (88%)**.
* **Próximos Passos:** Abertura imediata do ciclo da **Sprint 05** focado em Emissão de PDFs (US-10 e US-11), fechamento de descontos e transição para Pedidos de Venda (US-13 a US-16).

---

*Ata aprovada pelos participantes e registrada na governança oficial em 14 de Setembro de 2026.*
