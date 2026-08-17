# 📝 ATA DE DAILY SCRUM E ALINHAMENTO GERAL (SPRINT 02)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 14 de Agosto de 2026 (Sexta-feira)  
**Modalidade:** Reunião Híbrida 

---

## 1. 👥 Participantes e Status de Presença

### Presentes (Reunião Síncrona):
* **Nichollas Cavalcante** — *Scrum Master & DevOps*
* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Italo Jefferson Lima dos Santos** — *Desenvolvedor & DevOps*
* **Guilherme Kauã** — *Desenvolvedor*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor*
* **Hérbert Carvalho** — *Desenvolvedor*

---

## 2. 💬 Relatório de Progresso e Alinhamentos

### 🧑‍💻 José Guylherme dos Santos Melo (PO)
**🎯 Foco:** Clientes, Pedidos e Apresentação
* **1️⃣ O que fez desde a última daily / Discussões?**
  * Desenvolveu a história de cadastrar cliente.
  * Discutiu o relacionamento entre clientes, orçamentos e pedidos. Definiu-se que o pedido exige um orçamento.
  * Sugeriu a criação de um "Cliente Padrão" (default) para agilizar orçamentos rápidos, como os realizados a domicílio.
  * Questionou as mudanças na proposta visual das telas em relação à primeira (desenhada em sala). Foi alinhado que a prioridade visual será na tela de orçamentos, por ser a de uso mais frequente, enquanto as demais são mais cadastrais.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Verificar a questão do cartão de crédito (necessário para a criação da conta e hospedagem do deploy do sistema) durante o fim de semana e comunicar o resultado à equipe.

### 🧑‍💻 Nichollas Cavalcante
**🎯 Foco:** Telas de Materiais, Revisão de PRs e Planejamento
* **1️⃣ O que fez desde a última daily / Discussões?**
  * Revisou o Pull Request do Catálogo com a equipe (resolução de conflitos).
  * Apresentou melhorias no Frontend (tela de materiais): centralização do Dark Mode, status, máscaras de inputs, busca aprimorada e usabilidade no mobile.
  * Apresentou o conceito de *templates reutilizáveis* de produtos, para agilizar a criação de orçamentos (ex: portas e janelas que já carregam materiais e mão de obra como base).
  * Demonstrou o fluxo e as barreiras inseridas no cadastro de insumos (anti-overflow).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Consultar Ednaldo ou Cleiton sobre o critério de validação dos testes e da cobertura de código.
  * Resolver os conflitos e finalizar o pull request do catálogo.
  * Ajustar a tela de produtos e montar templates durante o fim de semana.

### 🧑‍💻 Italo Jefferson Lima dos Santos
**🎯 Foco:** Frontend e Deploy
* **1️⃣ O que fez desde a última daily / Discussões?**
  * Questionou os critérios de priorização entre Frontend, Backend e Documentação da API. Ficou acordado que as telas devem ser construídas primeiro, aprovadas e, só então, o backend moldado aos detalhes e endpoints das telas.
  * Discutiu a estratégia de testes no Frontend, alertando para a cobertura desigual entre as telas, sugerindo alinhar com os professores (SonarCube x Testes E2E).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Criar a conta necessária para viabilizar o deploy em produção.
  * Executar o deploy para que o sistema fique disponível para apresentação ao usuário final.
  * Apoiar na construção de telas do Frontend.

### 🧑‍💻 Guilherme Kauã
**🎯 Foco:** Implementação e Front-end
* **1️⃣ O que fez desde a última daily / Discussões?**
  * Relatou bloqueio inicial sobre o padrão de implementação. O grupo definiu que a base de referência está na branch `develop`.
  * Apontou os problemas no fluxo de aprovação dos Pull Requests (aprovações sendo solicitadas repetidas vezes após commits na PR).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Desenvolver as telas de produtos/clientes planejadas para o sistema utilizando o padrão da `develop`.
  * Investigar/resolver a questão da repetição do workflow de aprovação das PRs.

### 🧑‍💻 Júlio Kennedy dos Santos Silva
**🎯 Foco:** Backend / Integração
* **1️⃣ O que fez desde a última daily / Discussões?**
  * Relatou dificuldade para avançar no seu card sem uma referência de implementação base. Após o alinhamento, seguirá o padrão de cadastro da branch `develop`.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Evoluir no card puxado seguindo o padrão discutido.

### 🧑‍💻 Hérbert Carvalho
**🎯 Foco:** Backend e Pipeline CI/CD
* **1️⃣ O que fez desde a última daily / Discussões?**
  * Realizou correções na pipeline do GitHub (Actions/Testes). 
  * Declarou que está aguardando a aprovação do seu Pull Request (Vidros).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Procurar e assumir uma nova tarefa de Frontend/Backend para a próxima sprint.

---

## 3. 🎯 Decisões e Próximos Passos (Geral)

1. **Priorização e Pipeline Frontend-First:** A equipe decidiu adotar a validação das telas primeiro (com o cliente final/PO) e somente então amarrar os DTOs e Backends para encaixar na necessidade real do usuário.
2. **Orçamento como Eixo Central:** O cadastro rápido de orçamentos se provou a tela principal. Foi decidido focar nela e em funcionalidades como o "Cliente Padrão" e a seleção ágil de "Templates Reutilizáveis" de produtos para gerar orçamentos de forma ágil e evitar cadastros burocráticos constantes.
3. **Deploy Antecipado e Exportação:** Planejamento de deploy no final de semana (Italo) para possibilitar que a apresentação a Cleiton e ao Cliente Final (pai do Zé Guylherme) seja feita em ambiente "produtivo". 
4. **Dashboards e BI:** Foi validado o desenvolvimento de exportação `.csv` visando integrações futuras (Painéis e Dashboards no Power BI) para a área financeira.

---
**Documento gerado como registro das deliberações e planejamento para o fim de semana.**
