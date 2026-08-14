
# 📝 ATA DE DAILY SCRUM (SPRINT 02)
**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 07 de Agosto de 2026 (Sexta-feira)  
**Modalidade:** Reunião Virtual Síncrona + Check-ins Assíncronos  
---
## 1. 👥 Participantes e Status de Presença
### Presentes (Reunião Síncrona):
* **Nichollas Cavalcante** — *Scrum Master & DevOps*
* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Italo Jefferson** — *Desenvolvedor & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Júlio Kennedy** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor* 

### Check-in Assíncrono (Formulário/Chat):
* **Herbert Carvalho dos Santos** — *Desenvolvedor* *(Não participou da reunião, mas preencheu o formulário)*

### Ausências (Sem justificativa):
* **Gabriel** — *Desenvolvedor* *(Não participou da reunião e não realizou nenhuma atividade no projeto até o momento)*
---
## 2. 💬 Relatório de Progresso (Stand-up)
### 🧑‍💻 Italo Jefferson
**🎯 Foco:** Frontend (Telas de Gestão do Catálogo)
* **1️⃣ O que fez desde a última daily?**
  * Retomou os desenhos do frontend e está alinhando os rascunhos de UI (via Gemini) junto com o José Guylherme (PO). Definido o System Design base (azul e branco) e discutido a possibilidade de Dark/Light mode.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Definir o fluxo exato de telas e mapear os campos necessários junto ao PO. Irá produzir os protótipos de interface, enviar prints para aprovação rápida via WhatsApp no fim de semana, e apresentar a versão navegável na Daily de segunda-feira.
* **3️⃣ Impedimentos?** 
  * Necessita que os endpoints do backend e seus respectivos *responses* estejam consolidados para saber exatamente quais dados devem ser exibidos nas telas.
### 💼 José Guylherme dos Santos Melo (PO)
**🎯 Foco:** Regras de Negócio e Homologação UI
* **1️⃣ O que fez desde a última daily?**
  * Trabalhou com o Italo nas ideias de tela e no System Design. Ajudou a alinhar a diferença de complexidade entre Portas (simples) e Janelas (complexas, exigem desconto de vãos). Explicou que no orçamento, a largura dos perfis externos precisa ser subtraída da medida final do vão.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Validar os prints de interface que serão produzidos pelo Italo e garantir que os materiais cadastrados possuam atributos vitais (ex: *Standard Length* de 3 ou 6 metros).
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Nichollas Cavalcante
**🎯 Foco:** DevOps e Gestão do Quadro
* **1️⃣ O que fez desde a última daily?**
  * Finalizou e efetuou merge da infraestrutura base do material genérico. Criou automações de workflow no GitHub Projects (movimentação automática de cards baseado em status de PR e arquivamento em encerramento de sprint).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Continuar gerindo os PRs da equipe, instruindo os desenvolvedores na atualização de suas *branches* a partir da *develop* (Git flow) para que possam usar a entidade base de materiais sem conflitos.
* **3️⃣ Impedimentos?** 
  * Desenvolvedores começaram tarefas dependentes antes do merge da fundação, forçando agora uma re-sincronização de código.  
### 🧑‍💻 Maylson da Silva Rodrigues
**🎯 Foco:** Backend (Películas e Ferragens)
* **1️⃣ O que fez desde a última daily?**
  * Concluiu a implementação do CRUD de películas: listagem paginada, inativação lógica, atualização de preço, mapeamentos com MapStruct e testes unitários. Fez o backend completo de ferragens, mas houve um equívoco ao não utilizar a entidade genérica.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Atualizar o código de ferragens para utilizar a entidade genérica (Material) criada pelo Nichollas. Adicionar validações de negócio e corrigir problemas de concorrência.
* **3️⃣ Impedimentos?** 
  * Dúvidas iniciais sobre a submissão de Pull Requests e fluxo do GitHub, já sanadas pelo Scrum Master com o uso de *AI Code Review*.
### 🧑‍💻 Júlio Kennedy
**🎯 Foco:** Backend (Perfis de Alumínio)
* **1️⃣ O que fez desde a última daily?**
  * Baixou o projeto e analisou o escopo da tarefa, focado na entidade base genérica para a estruturação dos Perfis de Alumínio (linhas Rometal/Alternativa e barras 3-6m).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Iniciar o desenvolvimento da lógica de backend (Service/Controller) para a gestão de perfis de alumínio.

### 🧑‍💻 Guilherme Kauã
**🎯 Foco:** Backend (Ferragens e Componentes)
* **1️⃣ O que fez desde a última daily?**
  * Fez o CRUD completo no backend de ferragens e componentes, suas unidades e seus tipos de cálculo (controllers, repository, mappers, testes e service). Houve um equívoco em relação ao Maylson onde criaram entidades diferentes, sendo que era para ter usado a genérica antes.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Atualizar para a entidade genérica que o Nichollas fez (com seus enums de tipo de cálculo), adicionar algumas validações e arrumar a concorrência.
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Herbert Carvalho dos Santos
**🎯 Foco:** Backend (Cadastro de Materiais)
* **1️⃣ O que fez desde a última daily?**
  * Análise das entidades que serão utilizadas nas tasks; Criação do serviço para vidros; Controller para realizar CRUD completo; Criação de DTOs para maior controle de dados de entrada e saída.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Criação de testes automatizados referentes ao que foi criado anteriormente.
* **3️⃣ Impedimentos?** 
  * Nenhum.