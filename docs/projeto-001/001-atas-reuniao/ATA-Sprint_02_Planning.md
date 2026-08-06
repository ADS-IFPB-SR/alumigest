# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 02 PLANNING)
**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 05 de Agosto de 2026 | **Horário:** 20:00 às 22:00  
**Local:** Reunião Virtual (Google Meet)  
**Redatores:** Guilherme Kauã Matos da Silva / Nichollas Cavalcante  

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Nichollas Cavalcante** — *Scrum Master & DevOps*
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Italo Jefferson** — *Desenvolvedor Frontend & DevOps*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Backend / Secretário da Ata*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*

### Ausências Justificadas (Atividades Profissionais / Acesso Pendente ao GitHub):
* **Júlio Kennedy** — *Desenvolvedor Backend* (Acesso ao repositório em configuração)
* **Hebert** — *Desenvolvedor Backend* (Compromisso profissional)
* **Gabriel** — *Desenvolvedor Backend* (Compromisso profissional)

---

## 2. 🎯 Pauta da Reunião
1. Avaliação do escopo da Sprint 2 e ajuste das metas para o período de 15 dias (04/08/2026 a 17/08/2026).
2. Definição da modelagem arquitetural do banco de dados para o módulo de Materiais e Insumos.
3. Alinhamento das regras de negócio operacionais da fábrica da Alumiportas com o PO.
4. Desacoplamento entre materiais básicos e templates de produtos finais (Portas/Esquadrias).
5. Decomposição da User Story `#4` em Sub-issues técnicas no GitHub.
6. Distribuição oficial de responsabilidades e atribuição de tarefas.
7. Definição do fluxo Git Flow, governança de commits, changelog e metas de cobertura de testes.

---

## 3. 💬 Principais Deliberações e Decisões Técnicas

### 3.1 Escopo da Sprint 2 e Foco em Cadastros
* Foi consensuado que tentar cobrir o motor de cálculo completo, montagem de orçamentos e exportação de PDF na Sprint 2 tornaria a entrega inviável em 15 dias.
* **Decisão:** A Sprint 2 terá foco total e absoluto no **Catálogo de Materiais/Insumos (CRUD completo, navegação em abas, busca e flexibilidade de preços)** e no **Cadastro de Clientes**.

### 3.2 Modelagem de Dados Genérica e Extensível (*Type-Object Pattern*)
* Discutiu-se a necessidade de evitar o acoplamento rígido de tabelas para que o sistema possa, no futuro, atender outros setores produtivos como **Marcenaria** e **Serralheria**.
* **Decisão:** Foi aprovada a criação de duas tabelas centrais:
  1. `tb_material_groups`: Define o grupo e a estratégia de cálculo (`SQUARE_METER`, `LINEAR_METER`, `UNIT`, `PAIR`). Os 4 grupos iniciais da Alumiportas (`VIDRO`, `ALUMINIO`, `PELICULA`, `FERRAGEM`) receberão a flag `is_system_default = true` para proteção contra exclusão.
  2. `tb_materials`: Entidade base universal contendo preço de custo, preço de venda, espessura, comprimento padrão, referência comercial e metadados JSONB.

### 3.3 Regras de Negócio Específicas da Alumiportas
* **Vidros:** A fábrica utiliza predominantemente vidros finos para móveis (**2mm e 4mm**). O sistema deve suportar essas espessuras e permitir alteração flexível do valor do $m^2$.
* **Perfis de Alumínio:** Trabalho com as linhas **Rometal** e **Alternativa**. Controle de barras em **3 metros (comércio local)** e **6 metros (indústria)**. Puxadores são perfis de alumínio. Obrigatoriedade de código de referência comercial (ex: `SU-001`, `S83`, `SPR-060`) e campo opcional para código fiscal NCM.
* **Películas:** Precificação de aplicação por $m^2$ (Fumê G5/G20, Jateada, Leitosa, Espelhada).
* **Ferragens:** Comercialização por Unidade (`UN`), Par (`PAR` - dobradiças e rodízios) ou Metro (`METRO` - trilhos e escovas).
* **Flexibilidade de Preço no Orçamento:** Ajustes pontuais feitos pelo vendedor para um cliente alteram a instância do item no orçamento, sem corromper o cadastro mestre do catálogo.

### 3.4 Insumos vs. Produto Final (Templates de Esquadrias)
* Ficou estabelecido que uma **porta ou esquadria não é uma categoria de material**, mas sim um **Produto Final Composto (Template/Receita)** que agrega perfis, vidros, películas e ferragens. Essa funcionalidade de templates será o foco central da Sprint 3.

### 3.5 Governança, Qualidade e Integração Contínua (CI)
* **Branching Model:** `main` (produção blindada), `develop` (desenvolvimento da sprint). Features devem nascer de `develop` seguindo o padrão `feat/<nome-da-feature>` ou `docs/<nome>`.
* **Pull Requests (PR):** Nenhum merge direto em `develop`. Todos os PRs devem conter a descrição das mudanças, referência à issue (`Ref #14`), preenchimento do checklist de Definition of Done (DoD) e aprovação de ao menos um revisor.
* **Cobertura de Testes:** Implantação de GitHub Actions com meta de pelo menos **70% de cobertura de testes unitários** e verificação estática de código (Linter).
* **Changelog:** Atualização mandatória do `CHANGELOG.md` na seção `[Unreleased]` a cada entrega relevante.

---

## 4. 📋 Matriz de Distribuição de Responsabilidades (Sprint 2)

| Issue | Tipo | Descrição da Tarefa | Responsável(is) | Estimativa |
| :---: | :---: | :--- | :--- | :---: |
| **#11** | `feat` | Backend: Migration Flyway V1 e Entidades Base do Catálogo Genérico | **Nichollas** | `5 pts` |
| **#12** | `feat` | Backend: CRUD e Precificação de Vidros (2mm e 4mm) por m² | **Júlio / Hebert / Gabriel** | `5 pts` |
| **#13** | `feat` | Backend: CRUD de Perfis de Alumínio (Rometal/Alternativa, Barras 3m/6m) | **Júlio / Hebert / Gabriel** | `5 pts` |
| **#14** | `feat` | Backend: CRUD de Películas e Acabamentos por m² | **Guilherme Kauã** | `3 pts` |
| **#15** | `feat` | Backend: CRUD de Ferragens e Acessórios (UN, PAR, METRO) | **Maylson** | `3 pts` |
| **#16** | `feat` | Frontend: Telas de Gestão do Catálogo em Abas no PWA | **Italo / José Guylherme / Guilherme Kauã** | `8 pts` |
| **#17** | `test` | QA: Cenários e Relatório de Teste de Aceitação (TEA) | **QA / Equipe** | `3 pts` |

---

## 5. 🗓️ Prazos, Marcos e Próximos Passos

1. **Marco Intermediário (Terça-feira, 11/08/2026):**
   * Apresentação de evidências de progresso ao Orientador (Professor Clayton): protótipos de tela validados com o PO, DER aprovado, branches ativas no GitHub e repositório organizado.
2. **Dailies e Comunicação:**
   * Alinhamentos rápidos diários via Discord/WhatsApp com registro de atividades e resolução de bloqueios.
3. **Fechamento da Sprint 2 (17/08/2026):**
   * Módulo de Catálogo de Materiais 100% integrado (Frontend + Backend + PostgreSQL) e testado em ambiente de produção/homologação.

---
*Ata lavrada por Guilherme Kauã Matos da Silva e revisada por Nichollas Cavalcante (Scrum Master).*
