# 📋 Changelog — AlumiGest

Todas as alterações notáveis, adições e correções deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e este projeto adere ao [Versionamento Semântico (SemVer)](https://semver.org/lang/pt-BR/).

---

## [Unreleased] — Sprint 02 (Em Andamento)

### 📚 Documentação & Arquitetura (Docs)
- **Pacote Completo de Documentação (Elaborado por Ítalo Jefferson):** Integração de 28 arquivos técnicos e diagramas elaborados por **Ítalo Jefferson** em `/docs`, cobrindo Requisitos (`REQ`, `UCS`, `RN`, `PBL`), Análise & Arquitetura (`API`, `ARQ`, `DCC`, `MER`, `DER`), Implementação (`GIT`, `PAD`), Testes de Aceitação (`TEA-Sprint01`, `TEA-Sprint02`), Gestão de Riscos (`DRI`, `PPJ`, `PIT`), Atas e Diagramas SVG (Deploy OCI, CI/CD Actions e Fluxos BPMN).
- **Desacoplamento de Produto Final e Alinhamento de Sprints:** Atualização do `PBL`, `PIT-Sprint02` e `RN-Regras_de_Calculo` formalizando os **Templates de Produtos Finais (Portas e Esquadrias Compostas)** como escopo da Sprint 3, e mantendo a Sprint 2 com foco total no Catálogo de Materiais e Clientes.
- **Ata de Planejamento da Sprint 2:** Criação dos arquivos `ATA-Sprint_02_Planning.md` e `ATA-Sprint_02_Planning.docx` (Redação: Guilherme Kauã / Revisão: Nichollas Cavalcante) com os alinhamentos operacionais da Alumiportas, decomposição da User Story `#4` e distribuição da equipe.
- **Modelagem DER do Catálogo:** Criação do documento `DER-Catalogo_Materiais.md` detalhando o padrão *Type-Object Pattern* (`tb_material_groups` e `tb_materials`), dicionário de dados, extensibilidade para marcenaria e script DDL.

### 🚀 Planejado / Em Desenvolvimento
- Modelagem das tabelas do banco de dados relacional PostgreSQL (Migration Flyway V1).
- Estrutura base do Catálogo de Insumos e Materiais (Vidros por m², Perfis de Alumínio por metro/barra e Ferragens).
- Setup da arquitetura modular Backend (Spring Boot 3) e Frontend (TypeScript + PWA).
- Configuração do pipeline de integração contínua (CI) no GitHub Actions.

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
