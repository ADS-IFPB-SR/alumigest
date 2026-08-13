# 📝 ATA DE REUNIÃO TÉCNICA E ALINHAMENTO (SPRINT 02)

**Projeto:** AlumiGest - Sistema de Gestão e Precificação de Esquadrias e Vidraçaria  
**Data:** 11 de Agosto de 2026 (Terça-feira)  
**Assunto:** Modelagem, Entrega de Materiais e Infraestrutura de Hospedagem  
**Modalidade:** Reunião Síncrona 

---

## 1. 📋 Resumo Executivo
Reunião focada na modelagem de dados do sistema, alinhamento sobre as entregas da Sprint e implantação do produto. 
* **Entrega:** Cadastro de materiais e produtos (Ficha Técnica) previstos para a próxima semana.
* **Status do Backend:** O backend de materiais está majoritariamente concluído.
* **Status do Frontend:** Protótipos mockados finalizados por Italo e José Guilherme.
* **Modelagem:** Decidido o uso de tabelas dinâmicas no banco de dados para evitar a limitação de ENUMs *hardcoded* (especialmente em categorias de cobrança e cálculo).
* **Qualidade e DevOps:** Pipeline de testes (GitHub Actions) planejado para configuração nesta semana.
* **Infraestrutura:** Hospedagem da aplicação prevista para ocorrer na infraestrutura Oracle Cloud (OCI). Conta será configurada pela equipe.

---

## 2. 🎯 Tarefas Atribuídas (Action Items)

| Responsável | Tarefa |
|---|---|
| **Gabriel de Souza** | Preparar a apresentação mostrando as telas do projeto para a sessão de demonstração. |
| **Nichollas Cavalcante** | Fazer *clean/compile* no repositório afetado e validar localmente a execução após as correções de PR. |
| **Herbert Carvalho** | Verificar os *controllers GET* e aplicar a anotação de parâmetro (`@PageableDefault`/Pageable) necessária para corrigir a entrega de dados paginados do backend. |
| **Cleyton Souza** | Solicitar a inclusão do usuário Ednaldo no repositório do projeto no GitHub. |
| **José Guylherme** | Continuar a implementação do frontend junto com Italo para a tabela de gestão de catálogo de materiais. |
| **Italo Jefferson** | Completar o frontend do cadastro de materiais conforme o protótipo mockado. |
| **Herbert Carvalho** | Terminar os testes unitários da parte de vidros. |
| **Gabriel de Souza** | Realizar os testes com o Swagger (testes de integração manuais da API). |
| **Nichollas Cavalcante** | Atualizar as migrations (Flyway) para criar tabelas de domínios (calculation type, unit measures e categorias) em vez de enums simples. |
| **Equipe Dev** | Revisar a modelagem da tabela de materiais e propor alternativa normalizada (tabelas por tipo ou herança/composição) para reduzir colunas vazias. |
| **Equipe Dev** | Definir formato e apresentação no frontend para o campo JSON de atributos específicos, garantindo usabilidade (Flutter/PWA). |
| **Italo Jefferson** | Implementar a pipeline de testes automatizados (CI) no GitHub Actions e configurar monitoramento dos testes unitários esta semana. |
| **Cleyton Souza** | Preencher a planilha de notas/avaliação do desenvolvimento na próxima apresentação e realizar os testes do "usuário malvado" para quebrar o sistema. |
| **Equipe Dev** | Planejar a troca de papéis para a próxima Sprint, conforme orientação docente. |
| **Nichollas Cavalcante** | Enviar o relatório/transcrição da reunião para a IA gerar a ata, e repassar o resultado ao time. |
| **Equipe Dev** | Planejar e documentar a integração entre Front e Back antes de iniciar a próxima Sprint (Motor de Cálculo). |
| **José Guylherme** | Não iniciar novas histórias da Sprint atual caso já tenha tarefas alocadas focadas somente em telas, respeitando os papéis estabelecidos. |
| **Italo Jefferson** | Organizar a arquitetura do frontend, dividindo os componentes para separar o domínio da infraestrutura da aplicação. |
| **Italo Jefferson** | Configurar o GitHub Actions para rodar testes e bloquear Pull Requests sem cobertura adequada e sem checagem do SonarQube. |
| **Equipe Dev** | Preparar o cadastro do catálogo de materiais e do produto (templates) para entrega definitiva na próxima semana. |
| **Nichollas Cavalcante** | Finalizar a base para permitir o cadastro e edição de produtos no sistema (CRUD de produto com itens de composição). |
| **Guilherme Kauã** | Criar a conta na Nuvem Oracle e validar o cartão de crédito para liberar avaliação e infraestrutura. |
| **Italo Jefferson** | Enviar o template de front-end do produto (gerado via Gemini) para que Nichollas faça a integração com os componentes do catálogo. |
| **Nichollas Cavalcante** | Integrar o template enviado ao frontend de materiais. |
| **José Guylherme** | Configurar a conta Oracle Cloud (OCI) e validar a hospedagem até sexta-feira (com auxílio de Italo). |

---

## 3. 💬 Principais Pontos de Discussão

### A. Comunicação, Logística e Rotina
A reunião começou abordando problemas logísticos (falhas de comunicação, uso do SWAP/Power BI, prazos para o domingo) e algumas tensões envolvendo deslocamento para campo. Discutiu-se também assuntos triviais e descontração (assuntos de trânsito) antes da retomada do foco técnico. 
O professor orientador (Cleyton) reforçou que a disciplina visa simular um ambiente profissional rigoroso e o sistema será testado na ótica de um "usuário malvado" para validar resiliência.

### B. Integração, Compilação e Páginação
Foram mapeados problemas onde a aplicação rodava localmente para alguns desenvolvedores, mas falhava para outros. O erro estava atrelado a falta de comandos como `mvn clean compile` e ausência da anotação de Paginação nos métodos `GET` dos Controllers (necessária para conversão correta de JSON -> Page do Spring).

### C. Backend: Arquitetura e Modelagem do Domínio (Materiais vs Produtos)
* **Atributos JSON vs Composição/Herança:** Foi amplamente debatido que a tabela principal de materiais (se mantida unificada) acumulará colunas com valores nulos (ex: vidro não tem perfil, perfil não tem espessura de vidro). O uso de um campo `JSON` para atributos específicos foi defendido, mas sugeriu-se repensar o design para uso de composição ou herança (visando as consultas do JPA e validações).
* **Enum x Tabelas:** O Orientador sugeriu transformar ENUMS fechados (como Tipos de Cálculo, Categorias, Unidades de Medida) em Tabelas para permitir inserção dinâmica diretamente no banco. A equipe concordou em migrar essas entidades, evitando *hardcoding* e dependência de deploy para novos tipos.
* **System Default:** Debate sobre o uso da flag `isSystemDefault` em grupos de material, útil para evitar deleção de categorias padrão do núcleo do sistema e otimizar integrações de consultas fixas do frontend.

### D. Frontend e Protótipos (Catálogo e Ficha Técnica)
* Foram exibidos mockups de telas de Catálogo e Produtos. A equipe aprovou a responsividade Mobile da solução e a UI limpa.
* A dinâmica de Produtos Finais foi definida: Produtos (como portas ou janelas) agirão como **Templates**. Um produto final terá um "Nome" e uma lista prévia de Insumos (*Bill of Materials*), simplificando a vida do Vendedor na hora de realizar orçamentos repetitivos sem ter que bipar material por material toda vez.
* Necessidade forte de isolar responsabilidades no front e separar Domínio vs Infraestrutura.

### E. Qualidade e Hospedagem (DevOps)
* A necessidade de um CI/CD via GitHub Actions e SonarQube foi fortemente exigida para prevenir regressões (código quebra após Merge no PR).
* Debates de hospedagem apontaram para a adoção da **Oracle Cloud (OCI)** usando o *Always Free Tier*. A equipe discutiu custos, free-tiers de provedores, e definiu que a Oracle seria a melhor alternativa para subir banco + API (Docker) e Frontend em produção antes da entrega.

---
**Status da Sprint:** Rumo à fase de testes integrados e deploy, visando encerrar os Cadastros Bases para iniciar a Sprint 3 (Motor de Cálculo).
