# 📝 ATA DE REUNIÃO DE PLANEJAMENTO (SPRINT 03 PLANNING)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Cliente / Parceiro Social:** Alumiportas  
**Data:** 21 de Agosto de 2026 (Sexta-feira) | **Horário:** 20:11 às 22:30  
**Local:** Reunião Virtual (Google Meet) — [Gravação no Google Drive](https://drive.google.com/file/d/1s6Xx54oPs4PNM5D7zrDYwQS4WlmIv8pR/view?usp=drive_web)  
**Redator:** Italo Jefferson Lima dos Santos

---

## 1. 👥 Participantes e Quórum

### Presentes:
* **Italo Jefferson Lima dos Santos** — *Scrum Master & Desenvolvedor Backend*
* **José Guylherme dos Santos Melo** — *Product Owner (PO) & Representante da Alumiportas*
* **Joseph Nichollas Abreu Cavalcante** — 
*Desenvolvedor Backend*
* **Guilherme Kauã Matos da Silva** — *Desenvolvedor Frontend*
* **Maylson da Silva Rodrigues** — *Desenvolvedor Backend*
* **Júlio Kennedy dos Santos Silva** — *Desenvolvedor Backend*
* **Herbert Carvalho dos Santos** — *QA & Testes Automatizados*
* **Gabriel de Souza Nascimento** — *Desenvolvedor Frontend*

---

## 2. 🎯 Pauta da Reunião

1. Avaliação e fechamento do escopo da Sprint 3 (Período: 18/08/2026 a 01/09/2026).
2. Estratégia de divisão de tarefas por demandas menores e independentes (Full Stack slices).
3. Definição do CRUD de Clientes (PF/PJ) como pré-requisito para o módulo comercial.
4. Refatoração da entidade e tela de Produtos para suporte a Templates Paramétricos SVG de Esquadrias.
5. Arquitetura do Motor de Cálculo de Orçamentos (Serviço isolado no Backend).
6. Ajustes de Usabilidade: Indicador de Subtotal dinâmico em tempo real na tela de Orçamento.
7. Definição de recursos postergados (Impressão de Etiquetas térmicas, Relatório Comercial detalhado e Exportação em PDF).
8. Estratégia de Qualidade e Testes (Unitários, Integração e E2E manuais).
9. Pacote de correções do Catálogo e Padronização visual em Caixa Alta (Hotfix v0.2.3).

---

## 3. 💬 Principais Deliberações e Decisões Técnicas

### 3.1 Subdivisão de Demandas e Organização do Trabalho
* **Decisão:** Para evitar sobrecarga e bloqueios entre membros, a equipe optou por subdividir as tarefas em fatias menores e autônomas (conectando backend e frontend), em vez de concentrar módulos inteiros em desenvolvedores isolados.
* **Documentação Base:** Italo Jefferson submeteu o pacote de especificações técnicas, padrões e endpoints REST diretamente em Pull Request para validação contínua da equipe.

### 3.2 Gestão de Usuários vs. Dados de Clientes
* **Decisão:** A criação de perfis avançados de usuários foi postergada para depois da consolidação do login/cadastro.
* **Dados Institucionais:** Ficou alinhado que os dados da Alumiportas (CNPJ, nome fantasia, endereço e contato) permanecerão em cabeçalho fixo nos relatórios e telas, separando a figura do "Operador/Usuário" do "Cliente" cadastrado. No futuro, serão criados perfis de Administrador para registro de auditoria.

### 3.3 Módulo de Clientes (CRUD Completo)
* **Decisão:** O módulo de Clientes é prioritário, pois a emissão do orçamento depende diretamente do vínculo com o cliente (Nome, CPF/CNPJ, Telefone/WhatsApp, Endereço).
* **Responsável:** José Guylherme assumiu o desenvolvimento dessa frente.

### 3.4 Templates Paramétricos de Produtos em SVG
* **Decisão:** A entidade de Produtos e a interface serão refatoradas para suportar modelos de esquadrias com desenhos vetoriais SVG (portas de correr 2F/4F, pivotante, box de banheiro, janelas).
* **Apoio de Design:** Italo Jefferson gerou miniaturas e templates vetoriais e disponibilizou os arquivos JSX/SVG compactados para a equipe.
* **Dados Reais:** José Guylherme se comprometeu a levantar a relação de fotos e medidas dos materiais reais na fábrica da Alumiportas.

### 3.5 Motor de Cálculo de Orçamentos (Backend)
* **Decisão:** O cálculo de orçamentos será implementado como um serviço desacoplado (`BudgetCalculationService`) no backend para garantir precisão monetária e matemática:
  - Vidro cobrado por $m^2$ com área mínima de faturamento ($0,25 m^2$ conforme `RN-V03`).
  - Perfis de alumínio cobrados por metro linear ($m$) com base no perímetro e montantes.
  - Ferragens calculadas por kit (`UN`, `PAR` ou `METRO`).
  - Películas somadas proporcionalmente à área de aplicação.
* **Responsável:** Nichollas Cavalcante liderará a implementação do motor matemático.

### 3.6 Indicador de Subtotal em Tempo Real no Wizard
* **Decisão:** Aprovada a proposta de incluir um indicador de subtotal em tempo real destacado na interface do modal de orçamento. À medida que o vendedor altera acabamentos, medidas ou ferragens, o valor é recalculado dinamicamente, permitindo simulações rápidas com o cliente.

### 3.7 Recursos Postergados para a Sprint 4
* Ficaram oficialmente movidos para a Sprint 4 (ou fases posteriores):
  1. Geração e impressão térmica de Etiquetas para produção.
  2. Relatórios comerciais avançados e Romaneio detalhado.
  3. Exportação e download de Proposta Comercial em PDF (com e sem valores).

### 3.8 Qualidade, Testes e Hotfix de Padronização
* **Estratégia de QA:** Cobertura de testes unitários para as fórmulas matemáticas do motor de cálculo e testes manuais/E2E dos fluxos completos.
* **Hotfix v0.2.3:** Nichollas Cavalcante assumiu a resolução das pendências apontadas pelo professor/QA no catálogo (tratamento de erros pontuais por campo, paginação e padronização de textos em CAIXA ALTA).

---

## 4. 📋 Plano de Ação e Responsabilidades da Sprint 3

| Responsável | Atribuição Principal |
|---|---|
| **José Guylherme (PO)** | Implementação do CRUD de Clientes e levantamento de fotos/dados na fábrica |
| **Italo Jefferson** | refatoração do Backend de Produtos, e suporte DevOps/CI |
| **Nichollas Cavalcante** | Desenvolvimento do Motor de Cálculo de Orçamentos e Hotfix de padronização |
| **Guilherme Kauã** | Wizard/Interface de criação de Orçamentos no Frontend |
| **Maylson Rodrigues** | Vendas de partes/avulsas e Service/DTOs de Orçamento |
| **Júlio Kennedy** | Página de listagem de Orçamentos e paginação |
| **Herbert Carvalho** | Elaboração dos cenários de teste manuais e testes E2E com Cypress |
| **Gabriel Nascimento** | Apoio no desenvolvimento Frontend da tela de produtos |

---

## 5. 📅 Calendário de Cerimônias da Sprint 3

| Cerimônia | Data | Horário | Modalidade |
|---|---|---|---|
| **Sprint Planning** | 21/08/2026 (sex) | 20:11 | Síncrona (Google Meet) |
| **Reunião de Alinhamento** | 25/08/2026 (ter) | 19:36 | Síncrona (Google Meet) |
| **Daily Standup** | Seg, Qua, Sex | 20:00 | Assíncrona (Grupo WhatsApp) |
| **Sprint Review** | 01/09/2026 (ter) | 19:00 | Síncrona (Google Meet) |
| **Sprint Retrospective** | 01/09/2026 (ter) | 20:00 | Síncrona (Google Meet) |

---

*Ata aprovada pela Equipe AlumiGest em 21 de Agosto de 2026.*
