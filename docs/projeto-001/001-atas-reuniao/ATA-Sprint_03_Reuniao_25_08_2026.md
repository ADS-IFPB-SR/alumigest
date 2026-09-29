# 📝 ATA DE REUNIÃO DE ALINHAMENTO TÉCNICO E REORGANIZAÇÃO DE BACKLOG (SPRINT 03)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 25 de Agosto de 2026 (Terça-feira) | **Horário:** 19:36 às 21:00  
**Modalidade:** Reunião Virtual (Google Meet)  
**Redator:** Italo Jefferson / Equipe AlumiGest  

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Italo Jefferson Lima dos Santos** — *Scrum Master devOps& Backend*
* **José Guylherme dos Santos Melo** — *Product Owner (PO)*
* **Joseph Nichollas Abreu Cavalcante** — *Desenvolvedor Backend*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Frontend*
* **Herbert Carvalho dos Santos** — *QA & Testes*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor Backend*
* **Gabriel de Souza Nascimento** — *Desenvolvedor Frontend*

---

## 2. 🎯 Pauta da Reunião

1. Reestruturação do backlog da Sprint 3 e preparação da divisão de tarefas para as próximas releases.
2. Status dos trabalhos em andamento (Clientes, Wizard de Orçamentos, Catálogo e testes).
3. Definição de templates SVG vetoriais para 8 a 9 modelos de esquadrias e puxadores.
4. Disponibilização de ambiente de validação em nuvem (`develop.italuhub.cloud`).
5. Processo de Code Review e ajuste no fluxo de Pull Requests.
6. Análise de métricas de qualidade do SonarQube e pipeline CI/CD.
7. Decisão sobre precificação estática no Orçamento vs. Custos detalhados de estoque.

---

## 3. 💬 Principais Deliberações e Decisões Técnicas

### 3.1 Reestruturação do Backlog e Organização por Releases
* **Decisão:** A equipe concluiu que o backlog precisava de decomposição mais granular para dar visibilidade às entregas semanais. As tarefas foram subdivididas em blocos menores com estimativas refinadas, permitindo code reviews mais ágeis.

### 3.2 Ambiente de Homologação em Nuvem
* **Decisão:** Italo Jefferson subiu uma instância de desenvolvimento no endereço `develop.italuhub.cloud` para que a equipe possa testar as integrações REST reais entre Frontend e Backend em ambiente compartilhado.

### 3.3 Templates Vetoriais SVG (8 a 9 Modelos)
* **Decisão:** Serão consolidados 8 a 9 desenhos vetoriais em SVG representando os modelos reais de portas e janelas produzidos pela Alumiportas. José Guylherme ficou responsável por validar os detalhes visuais com a fábrica, enquanto Italo Jefferson incorporará os vetores na tela de configuração de produtos.

### 3.4 Processo de Pull Request e Code Review
* **Decisão:** Como a automação de movimentação de tarefas no board apresentava inconsistências, os desenvolvedores devem mover manualmente os cards para a coluna *Code Review* após abrir a PR e notificar o time no grupo.

### 3.5 Qualidade de Código (SonarQube e CI/CD)
* **Decisão:** Os apontamentos do SonarQube foram revisados e classificados como débitos de legibilidade/manutenibilidade (sem falhas de segurança críticas). Serão refinados continuamente durante as revisões de PR.

### 3.6 Congelamento de Preço no Orçamento vs. Custos de Estoque
* **Decisão Arquitetural:** 
  - O orçamento deve **armazenar e congelar o valor específico dos insumos** no momento da cotação, garantindo que alterações futuras no catálogo não desatualizem propostas comerciais em andamento.
  - A lógica detalhada de custo de reposição de estoque (PEPS/UEPS/Média ponderada) foi oficialmente postergada para o módulo de Estoque da Release 2 (Sprint 8), mantendo o cálculo atual do orçamento focado na margem de venda direta.

---

## 4. 📋 Encaminhamentos e Tarefas Atribuídas

| Responsável | Ação Definida | Prazo |
|---|---|---|
| **Italo Jefferson** | Subir instância `develop.italuhub.cloud` e refatorar a tela de produtos com os novos SVGs | 26/08 |
| **José Guylherme** | Abrir PR da funcionalidade de Clientes e enviar arquivos compactados dos SVGs | 26/08 |
| **Maylson Rodrigues** | Subir PR de Venda de Partes/Avulsos e dar andamento ao Service de Orçamentos | 26/08 |
| **Nichollas Cavalcante** | Finalizar implementação do motor de cálculo de vidro e perfis | 27/08 |
| **Guilherme Kauã** | Finalizar Wizard de criação de Orçamentos e abrir PR para revisão | 26/08 |
| **Herbert Carvalho** | Estruturar os testes de ponta a ponta e unitários do produto | 27/08 |

---

*Ata elaborada e aprovada pela equipe em 25 de Agosto de 2026.*
