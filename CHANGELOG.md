# 📋 Changelog — AlumiGest

Todas as alterações notáveis, adições e correções deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [Unreleased] — Sprint 02 (Em Andamento)

### 🐳 Infraestrutura & Setup
- **Dockerização (Issue #20):** Configuração local unificada através do `docker-compose.yml` provendo o `PostgreSQL 16` e interface visual do `Adminer`.
- **Flyway Migrations (Issues #21, #22):** Modelagem e rastreamento completo de banco relacional na pasta `/db/migration` (V1 a V6). Implementadas migrações de estrutura (DDL) e inserções automáticas iniciais de carga de Categorias e constraints exclusivas.

### 📚 Documentação & Arquitetura (Docs)
- **Pacote Completo de Documentação (Elaborado por Ítalo Jefferson):** Integração de 28 arquivos técnicos e diagramas elaborados por **Ítalo Jefferson** em `/docs`, cobrindo Requisitos (`REQ`, `UCS`, `RN`, `PBL`), Análise & Arquitetura (`API`, `ARQ`, `DCC`, `MER`, `DER`), Implementação (`GIT`, `PAD`), Testes de Aceitação (`TEA-Sprint01`, `TEA-Sprint02`), Gestão de Riscos (`DRI`, `PPJ`, `PIT`), Atas e Diagramas SVG (Deploy OCI, CI/CD Actions e Fluxos BPMN).
- **Desacoplamento de Produto Final e Alinhamento de Sprints:** Atualização do `PBL`, `PIT-Sprint02` e `RN-Regras_de_Calculo` formalizando os **Templates de Produtos Finais (Portas e Esquadrias Compostas)** como escopo da Sprint 3, e mantendo a Sprint 2 com foco total no Catálogo de Materiais e Clientes.
- **Ata de Planejamento da Sprint 2:** Criação dos arquivos `ATA-Sprint_02_Planning.md` e `ATA-Sprint_02_Planning.docx` (Redação: Guilherme Kauã / Revisão: Nichollas Cavalcante) com os alinhamentos operacionais da Alumiportas, decomposição da User Story `#4` e distribuição da equipe.
- **Modelagem DER do Catálogo:** Criação do documento `DER-Catalogo_Materiais.md` detalhando o padrão *Type-Object Pattern* (`tb_material_groups` e `tb_materials`), dicionário de dados, extensibilidade para marcenaria e script DDL.

### 💻 Backend (Spring Boot)
- **Catálogo Genérico de Insumos (Issues #11, #12, #13, #14, #15):** Implementação do padrão *Type-Object Pattern* permitindo CRUD completo de Vidros, Perfis de Alumínio, Películas e Ferragens com campos dinâmicos e controle de exclusão lógica (soft delete).
- **Validação e Segurança:** Inclusão de tratamentos globais de exceção (`GlobalExceptionHandler`), padronização de formatação do código NCM (`@Pattern` exigindo exatos 8 dígitos) para todos os materiais e validação contra Fichas Técnicas vazias e preços negativos.
- **Swagger / OpenAPI:** Configuração do pacote `springdoc` e mapeamento de rotas e Responses via anotações dinâmicas `@Tag` e `@Operation`.
- **Padronização de Respostas:** Criação e integração dos objetos genéricos padrão corporativo `ApiResponse<T>` e `PageResponse<T>`.
- **Cadastro de Ficha Técnica de Produtos (BOM) (Issues #30, #31):** Migração do campo `category` para uma nova entidade e tabela dinâmica `ProductCategory` (Migration `V4__create_product_categories.sql`) e implementação do motor de Fichas Técnicas (`ProductItem`) permitindo o agrupamento inteligente de itens iguais e amarração entre produto final e insumo.
- **Suite de Testes (Issue #17):** Escrita e refatoração massiva de testes para *Controllers* e *Services* de materiais e produtos. Resolvidos problemas de incompatibilidade de *Mocks* In-line na JVM do Java 25 através da extração de interfaces limpas (`IGlassService`, `IProductService`). Aprovado com sucesso (`BUILD SUCCESS`) e com alta cobertura.

### 🎨 Frontend (React/TypeScript)
- **Stack Consolidada:** Adoção de `@tanstack/react-query` para o motor de busca HTTP e cache, `react-router-dom` para navegação SPA e `lucide-react` para iconografia sem perda de definição.
- **Telas de Gestão do Catálogo (PWA) (Issue #16):** Desenvolvimento de abas (`Tabs`) modulares (`MaterialsCatalog.tsx`) com interface unificada e responsiva (Tailwind CSS Vanilla) para cadastro e visualização de todos os tipos de materiais utilizando Modais reutilizáveis (`MaterialFormModal.tsx`).
- **Tela de Ficha Técnica (Issue #32):** Implementação da interface completa do construtor de Produtos (`ProductBuilderPage.tsx`, `ProductTechSheet.tsx`, `ProductCostSummary.tsx`) bloqueando o cadastro de itens inválidos ou quantidades além de `99.999`.

### 🚀 Planejado / Em Desenvolvimento
- Módulo de Orçamentos e Clientes (Sprint 2 - Restante).
- Deploy na Oracle Cloud Infrastructure (OCI).

---

## [0.1.0] - 2026-08-04 — Baseline Inicial (B-ALG-v0.1.0-S01-01)

### ✨ Adicionado (Added)
- **Estrutura Monorepo:** Configuração da árvore de diretórios padronizada com pastas para `/docs/sistema`, `/docs/projeto-001`, `/backend` e `/frontend`.
- **Plano de Gerência de Configuração (PGC):** Versão inicial `PGC-Plano_de_Gerencia_de_Configuracao_AlumiGest.docx` com papéis (PO, Gerente de Projeto, QA, DEV), políticas de branch (Git Flow), convenções de nomenclatura e plano de ferramentas (Git, GitHub, IntelliJ, VS Code, Read.ai e Changelog).
- **Plano de Projeto (PPJ):** Versão inicial `PPJ-Plano_de_Projeto_AlumiGest.pptx` contendo EAP, cronograma de releases, estimativas, matriz de riscos e alinhamento com a Resolução CNE/CES nº 7/2018 (Extensão Universitária).
- **Governança no GitHub:** 
  - Templates de Pull Request (`.github/PULL_REQUEST_TEMPLATE.md`) com checklist de Definition of Done (DoD).
  - Templates de Issues para Relato de Bug (`bug_report.md`) e Nova Funcionalidade (`feature_request.md`).
  - Quadro Kanban no GitHub Projects (`AlumiGest - Gestão Ágil`) com campos personalizados de Sprint, Módulo e Tipo.
  - Regras de proteção de branches (*Rulesets*) configuradas para as branches `main` e `develop`.
- **Filtros e Configurações:** Arquivo `.gitignore` unificado para Java 21, Spring Boot, Node.js, TypeScript e IDEs.
- **Documentação de Apresentação:** `README.md` institucional e documentações técnicas em `/backend` e `/frontend`.
