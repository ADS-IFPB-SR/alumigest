# Feature Specification: Sprint 15 — Treinamento dos Usuários Alumiportas, Carga Real e Homologação R3

**Feature**: `012-treinamento-carga-homologacao-r3`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão (Fechamento da Release 3)  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Esta sprint consolida o ciclo de desenvolvimento das três releases principais do **AlumiGest**, preparando a fábrica e o escritório da **Alumiportas** para a entrada oficial em produção (Go-Live):
1. **Carga Real de Dados e Saneamento**: Inserção dos dados mestres de perfis de alumínio, vidros, acessórios, tabelas de preços e importador de clientes em CSV.
2. **Capacitação e Guias Práticos por Perfil**: Manuais operacionais em PDF e Central de Ajuda contextual para Vendas, Fábrica, Almoxarifado, Financeiro e Campo.
3. **Roteiro de Homologação Ponta a Ponta (E2E Flow)**: Validação integrada de todo o ciclo: Proposta Comercial → Sinal PIX (50%) → Liberação de Pedido → Etiquetas 100x50mm → Romaneio de Corte → Baixa no Estoque → Agendamento e Execução de OS Offline com Fotos → Baixa do Saldo Final (50%) → Fluxo de Caixa Mensal → DRE.
4. **Fechamento e Certificação da Release 3 (v3.0.0)**: Homologação oficial com critérios de aceitação aprovados pela diretoria.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-40: Executar Carga Inicial de Dados e Importador de Clientes via CSV

#### 🎯 Objetivo de Negócio
> **Como** administrador e operador de implantação da Alumiportas,  
> **Desejo** executar a carga inicial automatizada dos dados mestres de materiais e utilizar um importador em lote de clientes via arquivo CSV,  
> **Para que** o sistema entre em operação com a base completa de perfis, vidros, estoques e contatos comerciais cadastrados sem digitação manual exaustiva.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Aplicação da Migration Flyway de Carga Real de Dados**
  - **Dado que** o backend inicializa sobre uma base zerada ou atualizada
  - **Quando** a migration `V16__seed_initial_production_data.sql` for executada
  - **Então** o sistema popula as tabelas de perfis (Linhas Suprema e Gold), vidros (temperados, laminados), ferragens, insumos e estoque inicial com cláusula `ON CONFLICT DO NOTHING`
  - **E** todas as matérias-primas e preços de referência da Alumiportas ficam prontos para uso em orçamentos.

- [ ] **Cenário 2: Importação em lote de clientes via arquivo CSV**
  - **Dado que** o usuário possui uma planilha de clientes no formato CSV com colunas `Nome`, `CPF/CNPJ`, `Telefone`, `Email`, `Endereco`, `Cidade`, `UF`
  - **Quando** ele faz o upload do arquivo através do modal `CsvClientImportModal` ou via `POST /api/onboarding/import-clients-csv`
  - **Então** o backend valida a estrutura de cada linha, limpa caracteres não numéricos de CPF/CNPJ e valida dígitos verificadores
  - **E** insere os clientes válidos no banco de dados
  - **E** retorna o sumário `ClientImportSummaryResponse` contendo o total de linhas, importados com sucesso, duplicados ignorados e lista de erros com número da linha.

- [ ] **Cenário 3: Tratamento de registros duplicados e dados inválidos**
  - **Dado que** o CSV contém clientes com CPF/CNPJ já existentes na base e linhas com telefones ausentes
  - **Quando** o arquivo é importado
  - **Então** os clientes já cadastrados são ignorados sem interromper o processamento das linhas subsequentes
  - **E** as linhas com CPF/CNPJ com dígitos inválidos são listadas no relatório de inconsistências para conferência manual.

- [ ] **Cenário 4: Experiência interativa no Frontend**
  - **Dado que** o operador está no modal de importação
  - **Quando** o processamento é concluído
  - **Então** o modal exibe um card resumo com badges coloridos (Verde para sucessos, Amarelo para duplicados e Vermelho para erros) e botão para baixar log detalhado em caso de falhas parciais.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Validação de CPF/CNPJ)**: Todo documento cadastrado na importação deve passar por validação algorítmica de dígitos verificadores (módulo 11).
- **RN-02 (Tolerância a Falhas em Lote)**: Erros em registros individuais não devem provocar rollback do lote inteiro, maximizando o aproveitamento dos dados corretos.
- **RN-03 (Encoding Padrão)**: Suporte a arquivos CSV salvos em UTF-8 e ISO-8859-1 (Windows Latin-1) com separador vírgula ou ponto-e-vírgula.

#### 🔌 Especificação Técnica
- **Backend**:
  - Migration Flyway `V16__seed_initial_production_data.sql`.
  - `ClientCsvImportService`: Leitura via OpenCSV ou streaming manual com validação Jakarta Bean Validation.
  - `OnboardingController`: Endpoint `POST /api/onboarding/import-clients-csv`.
  - Testes unitários com JUnit 5 cobrindo planilhas perfeitas, com duplicidades e com linhas corrompidas.
- **Frontend**:
  - `CsvClientImportModal.tsx`: Componente de upload com drag-and-drop e visualização de progresso.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-40.1**: Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding`
- **US-40.2**: Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros, acessórios e estoque inicial com `ON CONFLICT DO NOTHING`
- **US-40.3**: Criar record `ClientImportSummaryResponse` (totalLinhas, importadosComSucesso, duplicadosIgnorados, erros) em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/dto/`
- **US-40.4**: Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` com validação de CPF/CNPJ e transação em lote em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/ClientCsvImportService.java`
- **US-40.5**: Criar endpoint `POST /api/onboarding/import-clients-csv` no `OnboardingController` em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/controller/OnboardingController.java`
- **US-40.6**: Criar testes unitários do `ClientCsvImportServiceTest`
- **US-40.7**: Criar modal `CsvClientImportModal` no frontend para upload de planilha de clientes em `frontend/src/features/onboarding/components/CsvClientImportModal.tsx`

---

### 📌 US-41: Homologação Integrada Ponta a Ponta da Release 3 (v3.0.0)

#### 🎯 Objetivo de Negócio
> **Como** Tech Lead, Product Owner e Diretoria da Alumiportas,  
> **Desejo** validar a execução completa do roteiro integrado ponta a ponta (E2E) de todas as funcionalidades entregues na Release 3 (v3.0.0) em conjunto com as Releases 1 e 2,  
> **Para que** a plataforma seja homologada formalmente com zero falhas impeditivas, assegurando que o sistema atenda integralmente a rotina do negócio antes da liberação em produção.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Sucesso na Pirâmide Completa de Testes Automatizados**
  - **Dado que** o projeto AlumiGest contém suites de testes de backend e frontend
  - **Quando** forem executados `mvn clean verify` no backend e `npm test -- --run` / `npm run build` no frontend
  - **Então** todos os testes unitários, testes de integração e testes de componentes devem passar com 100% de sucesso
  - **E** nenhuma advertência de tipagem TypeScript deve ser apontada pelo compilador.

- [ ] **Cenário 2: Aprovação Estrita no SonarQube Quality Gate**
  - **Dado que** a base de código é submetida ao scanner oficial do SonarQube
  - **Quando** o Quality Gate for processado
  - **Então** deve atingir conformidade verde:
    - Cobertura de testes em New Code $\ge 80\%$
    - Zero Bugs, zero Vulnerabilidades e zero Hotspots de Segurança
    - Classificação de Manutenibilidade A com dívida técnica controlada
    - Duplicação de código inferior a $3\%$.

- [ ] **Cenário 3: Validação do Fluxo End-to-End Unificado da Empresa**
  - **Dado que** o avaliador executa a jornada completa do cliente:
    1. Orçamento e precificação com desconto e PDFs comerciais/técnicos (`US-06` a `US-11`)
    2. Conversão em Pedido com Lock de Preços (`US-13` / `US-14`)
    3. Cobrança do Sinal de 50% via PIX Dinâmico com webhook e liberação (`US-24` a `US-26`)
    4. Emissão de Etiquetas 100x50mm e movimentação no Kanban de Fábrica (`US-17` / `US-18`)
    5. Romaneio de Corte e Ficha Técnica de Montagem (`US-19` / `US-20`)
    6. Baixa de matéria-prima no estoque e extrato no Kardex (`US-21` / `US-22`)
    7. Agendamento e Execução de OS Offline no PWA com fotos e sincronização (`US-31`, `US-32`, `US-37` a `US-39`)
    8. Quitação do saldo de 50% e emissão de recibo de quitação (`US-27` a `US-29`)
    9. Fechamento no Fluxo de Caixa Mensal (`US-30`)
    10. Auditoria de KPIs no Dashboard e DRE Gerencial (`US-34` a `US-36`)
  - **Quando** cada passo é executado sequencialmente
  - **Então** todos os dados fluem sem inconsistências, sem bloqueios indevidos e com integridade total.

- [ ] **Cenário 4: Ratificação e Entrega do Relatório Oficial TEA Release 3**
  - **Dado que** todas as etapas foram comprovadas com sucesso
  - **Quando** a homologação for concluída
  - **Então** o documento `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Release3.md` deve estar assinado e publicado
  - **E** o guia `quickstart.md` deve orientar a execução de ponta a ponta sem atritos.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Critério Inegociável para Go-Live)**: Nenhuma versão v3.0.0 pode ser promovida para ambiente de produção sem a validação do roteiro E2E e aprovação no SonarQube.
- **RN-02 (Rastreabilidade e Governança Docs-as-Code)**: Toda documentação arquitetural e manual deve estar sincronizada com as versões estáveis das APIs e esquemas de banco.

#### 🔌 Especificação Técnica
- **Validação de Linha de Comando**:
  - `mvn clean verify`
  - `npm test -- --run`
  - `npm run build`
  - Análise SonarQube integrada no pipeline de CI/CD.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-41.1**: Executar e validar Passo 1: Criação de Orçamento com Desconto e 2 vias de PDF (R1 - Sprint 4)
- **US-41.2**: Executar e validar Passo 2: Conversão em Pedido com Lock de Preços (R2 - Sprint 5)
- **US-41.3**: Executar e validar Passo 3: Cobrança do Sinal 50% via PIX Dinâmico e Liberação (R3 - Sprint 9)
- **US-41.4**: Executar e validar Passo 4: Emissão de Etiquetas de Identificação 100x50mm (R2 - Sprint 6)
- **US-41.5**: Executar e validar Passo 5: Romaneio de Oficina e Lista de Corte em PDF (R2 - Sprint 7)
- **US-41.6**: Executar e validar Passo 6: Baixa automática de estoque e Kardex (R2 - Sprint 8)
- **US-41.7**: Executar e validar Passo 7: Agendamento da Instalação e Emissão de OS em PDF (R3 - Sprint 12)
- **US-41.8**: Executar e validar Passo 8: Execução de Campo Offline no PWA com fotos e sincronização (R3 - Sprint 14)
- **US-41.9**: Executar e validar Passo 9: Baixa do Saldo Final 50% e Fluxo de Caixa Mensal (R3 - Sprints 10 e 11)
- **US-41.10**: Executar e validar Passo 10: Auditoria dos KPIs no Dashboard e DRE Simplificado (R3 - Sprint 13)

---

### 📌 US-42: Disponibilizar Guias de Treinamento por Perfil e Central de Ajuda

#### 🎯 Objetivo de Negócio
> **Como** colaborador da Alumiportas (vendedor, montador, almoxarife, instalador ou gestor),  
> **Desejo** acessar uma Central de Ajuda integrada no sistema e baixar Manuais Operacionais em PDF específicos para o meu perfil profissional,  
> **Para que** eu possa aprender a operar o sistema com autonomia, tirar dúvidas sobre rotinas diárias e reduzir o tempo de adaptação na empresa.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Emissão de Manuais Operacionais em PDF por Papel de Usuário**
  - **Dado que** o usuário solicita o manual do seu perfil via `GET /api/onboarding/manuals/{role}/pdf`
  - **Quando** o serviço `OperationalManualPdfService` processa o pedido para os papéis `VENDEDOR`, `PRODUCAO`, `ESTOQUE`, `FINANCEIRO` ou `INSTALADOR`
  - **Então** o sistema gera um PDF A4 institucional ilustrado com orientações passo a passo
  - **E** o documento descreve as telas pertinentes àquele papel, atalhos de teclado e procedimentos de contingência.

- [ ] **Cenário 2: Acesso à Central de Ajuda no Frontend**
  - **Dado que** o usuário está em qualquer tela do sistema e clica no botão com ícone de interrogação ("Central de Ajuda") no cabeçalho
  - **Quando** o modal `HelpCenterModal` for exibido
  - **Então** apresenta:
    1. Seletor de manuais para download com um clique
    2. Guia de Início Rápido (Onboarding Tour)
    3. Seção de Perguntas Frequentes (FAQ) da serralheria e vidraçaria
    4. Canal de suporte técnico direto.

- [ ] **Cenário 3: Exibição de dicas contextuais nas telas operacionais**
  - **Dado que** um operador abre uma tela pela primeira vez
  - **Quando** a página é carregada
  - **Então** tooltips informativos destacam os principais botões de ação (ex: "Clique aqui para emitir etiquetas térmicas" ou "Arraste para transicionar no Kanban").

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Linguagem Direta e Operacional)**: Os manuais devem utilizar termos familiares ao cotidiano da vidraçaria/serralheria (ex: folhas, vão luz, roldana, travessas), evitando jargões técnicos excessivos.
- **RN-02 (Acessibilidade e Disponibilidade)**: A Central de Ajuda deve estar acessível mesmo quando o usuário estiver operando em modo offline no PWA.

#### 🔌 Especificação Técnica
- **Backend**:
  - `OperationalManualPdfService`: Gerador de PDFs temáticos por papel profissional via OpenPDF.
  - `OnboardingController`: Endpoint `GET /api/onboarding/manuals/{role}/pdf`.
  - Testes com JUnit 5 validando geração para todos os perfis cadastrados.
- **Frontend**:
  - `HelpCenterModal.tsx` e `HelpCenterPage.tsx`: Interface com FAQ, busca de artigos e download de manuais.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-42.1**: Criar serviço `OperationalManualPdfService` gerando manuais em PDF para Vendedor, Produção, Estoque, Financeiro e Instalador em `backend/src/main/java/br/edu/ifpb/alumigest/onboarding/service/OperationalManualPdfService.java`
- **US-42.2**: Criar endpoint `GET /api/onboarding/manuals/{role}/pdf` no `OnboardingController`
- **US-42.3**: Criar teste unitário do `OperationalManualPdfServiceTest`
- **US-42.4**: Criar componente `HelpCenterModal` e página `HelpCenterPage` no frontend em `frontend/src/features/onboarding/`
- **US-42.5**: Documentar endpoints no OpenAPI/Swagger
- **US-42.6**: Adicionar botão "Central de Ajuda & Manuais" no cabeçalho do frontend
- **US-42.7**: Ratificar termo de homologação da Release 3 (v3.0.0)

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Carga Real e Importador CSV | **US-40** | US-40.1 a US-40.5 | US-40.7 | US-40.6 (`ClientCsvImportServiceTest`) |
| Homologação Integrada R3 | **US-41** | US-41.1 a US-41.10 | — | Testes E2E, TEA Release 3 |
| Manuais e Central de Ajuda | **US-42** | US-42.1, US-42.2 | US-42.4, US-42.6 | US-42.3 (`OperationalManualPdfServiceTest`) |