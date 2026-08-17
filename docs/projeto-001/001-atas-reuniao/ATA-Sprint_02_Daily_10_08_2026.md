# 📝 ATA DE DAILY SCRUM (SPRINT 02)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 10 de Agosto de 2026 (Segunda-feira)  
**Modalidade:** Reunião Híbrida 

---

## 1. 👥 Participantes e Status de Presença

### Presentes (Reunião Síncrona):
* **Nichollas Cavalcante** — *Scrum Master & DevOps*
* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Italo Jefferson** — *Desenvolvedor & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor*
* **Júlio Kennedy** — *Desenvolvedor*
* **Maylson da Silva Rodrigues** — *Desenvolvedor* 
* **Gabriel de Souza** — *Desenvolvedor* 
* **Herbert Carvalho dos Santos** — *Desenvolvedor*

### Check-in Assíncrono (Formulário/Chat):
*(Nenhum)*

### Ausências (Sem justificativa):
*(Nenhum)*

---

## 2. 💬 Relatório de Progresso (Stand-up)

### 🧑‍💻 Italo Jefferson
**🎯 Foco:** Frontend (Telas de Gestão do Catálogo)
* **1️⃣ O que fez desde a última daily?**
  * Criação dos protótipos de tela para Orçamentos, Cadastro de Materiais e Catálogo de Materiais, em conjunto com o José Guylherme (PO).
* **2️⃣ O que vai fazer até a próxima daily?**
  * Dar continuidade à construção das telas para finalizar e entregar o protótipo completo até amanhã.
* **3️⃣ Impedimentos?** 
  * Necessita que os endpoints do backend e seus respectivos *responses* estejam consolidados para saber exatamente quais dados devem ser exibidos nas telas.

### 💼 José Guylherme dos Santos Melo (PO)
**🎯 Foco:** Regras de Negócio e Homologação UI
* **1️⃣ O que fez desde a última daily?**
  * Criaçao das telas de clientes, cadastro de materiais, configuração de orçamentos, visualização do orçamento para exportar pdf, em conjunto com Italo Jefferson.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Buscar finalizar as telas do sistema com responsividade para a entrega amanhã.
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Nichollas Cavalcante
**🎯 Foco:** Scrum Master, DevOps e Backend (Gestão de Produtos)
* **1️⃣ O que fez desde a última daily?**
  * Criou a User Story de Produtos no backlog e fez o detalhamento técnico, quebrando-a nas sub-issues #30, #31 e #32.
  * Concluiu a modelagem do schema de banco e as entidades de Produtos e Itens (Issue #30), abrindo o PR #33.
  * Consolidou a Ata da Daily da Sprint 2 com a equipe, abrindo o PR #34.
  * Realizou Code Reviews da equipe: 
    - **PR do Maylson (Películas):** Apontou ajustes de concorrência e uso do *calculation type*.
    - **PR #25 do Guilherme (Ferragens):** Orientou a transição para a entidade genérica.
    - **PR #35 do Júlio (Alumínio):** Ajustou a versão do Flyway (V3) para evitar conflitos no merge.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Continuar gerindo e instruindo a equipe no Git Flow para garantir que todos atualizem suas branches a partir da `develop` e usem a entidade base sem conflitos.
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Maylson da Silva Rodrigues
**🎯 Foco:** Backend (Películas e Ferragens)
* **1️⃣ O que fez desde a última daily?**
  * Ajuste no Pom.xml pois estava dando conflito no lombok.
* **2️⃣ O que vai fazer até a próxima daily?**
  * CRUD de produtos.
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Júlio Kennedy
**🎯 Foco:** Backend (Perfis de Alumínio)
* **1️⃣ O que fez desde a última daily?**
  * CRUD de perfis de alumínio no backend.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Revisar o que foi feito e pegar uma nova task.
* **3️⃣ Impedimentos?** 
  * Nenhum.
  
### 🧑‍💻 Guilherme Kauã
**🎯 Foco:** Backend (Ferragens e Componentes)
* **1️⃣ O que fez desde a última daily?**
  * Refatorei o módulo de Ferragens (Hardware), integrando-o ao catálogo genérico `Material` (grupo nativo FERRAGEM), removi os artefatos legados próprios (Hardware, HardwareRepository, UnitType, CalculationType) em favor dos enums oficiais do domínio, restringi as unidades comerciais a UN/PAR/METRO com validação no controller, tratei `DataIntegrityViolationException` como `BusinessException` para evitar erro 500 em conflito de SKU, e reescrevi/criei os testes de Service e Controller. Suíte completa com 43/43 testes passando (BUILD SUCCESS). PR aberto fechando #15 e referenciando #4 — já aprovado.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Aguardar a próxima issue.
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Herbert Carvalho dos Santos
**🎯 Foco:** Backend (Testes no CRUD de Vidros)
* **1️⃣ O que fez desde a última daily?**
  * Início do desenvolvimento dos testes e padronização das respostas do controller.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Finalizar o que foi citado anteriormente.
* **3️⃣ Impedimentos?** 
  * Nenhum.

### 🧑‍💻 Gabriel de Souza
**🎯 Foco:** QA (Testes no CRUD de Materiais)
* **1️⃣ O que fez desde a última daily?**
  * Iniciei a testar as funcionalidades de acordo com os critérios do github.
* **2️⃣ O que vai fazer até a próxima daily?**
  * Pretendo finalizar os testes.
* **3️⃣ Impedimentos?** 
  * Nenhum.  
