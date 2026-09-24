# 📝 ATA DE REUNIÃO DE SPRINT RETROSPECTIVE (SPRINT 02)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 18 de Agosto de 2026 (Segunda-feira) | **Horário:** 20:00 às 20:45  
**Local:** Reunião Virtual (Google Meet)  
**Facilitador:** Nichollas Cavalcante (Scrum Master)  

---

## 1. 👥 Participantes

* **Nichollas Cavalcante** — *Scrum Master & DevOps*
* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor Frontend & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Backend*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor Backend*
* **Hérbert Carvalho** — *Desenvolvedor Backend*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*

---

## 2. 🎯 Objetivo da Retrospectiva

Analisar a dinâmica de trabalho da equipe durante a Sprint 2, identificando pontos fortes, dificuldades técnicas e processuais, e traçar planos de ação concretos para a Sprint 3.

---

## 3. 💬 Dinâmica dos Três Pilares

### 3.1 O que funcionou muito bem? (Pontos Fortes) 🚀
1. **Organização em Squads:** A divisão entre Auth, Backend e Frontend permitiu paralelismo real sem bloqueios severos.
2. **Qualidade do Frontend:** O layout PWA e a componentização facilitaram a aprovação com o PO.
3. **Comunicação Ativa:** O alinhamento nas dailies e no grupo permitiu resolver o problema de tipagem do PostgreSQL rapidamente.
4. **Cumprimento do DoD:** Todos os 45 pontos foram entregues com testes e sem regressões na `develop`.

### 3.2 O que tivemos de dificuldade? (Pontos de Atenção) ⚠️
1. **Divergências iniciais de modelagem:** Tivemos que ajustar a modelagem no início da sprint para separar materiais de produtos.
2. **Processo de Code Review:** Pull Requests acumularam muitos comentários e precisavam de revalidação frequente após novos commits.
3. **Definição de DTOs antes das telas:** Em alguns momentos o backend iniciou antes do contrato de tela estar consolidado.

---

## 4. 🎯 Plano de Ação para a Sprint 3 (Continuous Improvement)

| # | Ação | Responsável | Como Medir Sucesso |
|---|---|---|---|
| 1 | **Alinhamento Prévio de Contratos REST:** Fechar os DTOs de Request/Response entre Front e Back no início da Sprint 3. | Ítalo + Squad Backend | Zero divergência de tipos durante a integração. |
| 2 | **PRs Mais Curtos:** Quebrar histórias grandes em Pull Requests menores (ex: max 300 linhas de diff). | Todos os Desenvolvedores | Tempo médio de aprovação de PR < 24h. |
| 3 | **Foco em Casos de Teste de Cálculo:** Escrever testes unitários para a matriz de cálculo de orçamentos (vidro m², perfis lineares, folgas). | Squad Backend / QA | 100% de cenários de cálculo cobertos por testes unitários. |

---

*Ata elaborada e aprovada pela equipe em 18 de Agosto de 2026.*
