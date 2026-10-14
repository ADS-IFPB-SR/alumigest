# Especificação Funcional: US-40 — Executar Carga Inicial de Dados e Importador de Clientes via CSV

**Identificador**: `US-40`  
**Issue GitHub**: [#165](https://github.com/ADS-IFPB-SR/alumigest/issues/165)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como administrador de sistemas da Alumiportas durante a fase de implantação, desejo disponibilizar uma carga inicial estruturada de catálogo (perfis das Linhas Suprema e Gold, vidros, acessórios e estoque inicial) e importar a carteira legada de clientes a partir de arquivos CSV, garantindo integridade de CPF/CNPJ, detecção de duplicidades e transição suave do sistema antigo.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Carga Inicial Automática e Idempotente de Catálogo (Seed Data)**
  - **Dado que** o sistema é inicializado pela primeira vez ou passa por deploy em novo ambiente,
  - **Quando** a migration Flyway `V16__seed_initial_production_data.sql` é executada,
  - **Então** popula os perfis das linhas Suprema (ex: SU-001, SU-002) e Gold (ex: LG-001), vidros comuns e temperados e estoque inicial,
  - **E** utiliza cláusula `ON CONFLICT DO NOTHING` para garantir idempotência sem falhas em reinicializações.

- [ ] **Cenário 2: Importação em Lote de Clientes via CSV Formatado com Sucesso**
  - **Dado que** o operador seleciona um arquivo CSV contendo 50 clientes válidos no modal `CsvClientImportModal`,
  - **Quando** submete o formulário via `POST /api/v1/onboarding/import-clients-csv`,
  - **Então** o serviço `ClientCsvImportService` processa as linhas em lote,
  - **E** persiste os registros na tabela `clients` com normalização de telefones e endereços,
  - **E** retorna o sumário: `totalRows = 50`, `importedCount = 50`, `errorsCount = 0`.

- [ ] **Cenário 3: Tratamento de Clientes Duplicados sem Abortar o Lote**
  - **Dado que** o arquivo CSV contém clientes com CPFs/CNPJs já existentes na base de dados,
  - **Quando** o processamento é executado,
  - **Então** o sistema ignora a criação dos registros duplicados (`skippedDuplicatesCount > 0`),
  - **E** continua processando as demais linhas válidas normalmente, listando os documentos ignorados no resumo final.

- [ ] **Cenário 4: Validação de Linhas Inválidas e Relatório de Erros**
  - **Dado que** o arquivo contém linhas com campos obrigatórios ausentes ou documento inválido (ex: CPF com 8 dígitos),
  - **Quando** o validador identifica a inconsistência,
  - **Então** registra o erro com o número da linha correspondente (`lineNumber`), campo afetado e mensagem de falha,
  - **E** exibe a listagem de inconformidades para que o usuário possa corrigir na planilha original.

- [ ] **Cenário 5: Disponibilização de Modelo / Template CSV para Download**
  - **Dado que** o usuário não sabe o formato esperado das colunas,
  - **Quando** clica em "Baixar Planilha Modelo",
  - **Então** o sistema baixa um arquivo `modelo_importacao_clientes.csv` pré-preenchido com cabeçalhos padrão (Nome;Documento;Telefone;Email;Endereco;Cidade;UF;CEP) e linhas de exemplo.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Validação de Documento):** CPFs e CNPJs devem ser limpos de caracteres especiais (máscaras) e validados aritmeticamente pelo algoritmo de dígitos verificadores.
- **RN-02 (Tolerância a Erros e Transacionalidade Parcial):** O importador deve operar com política resiliente: linhas com erro não cancelam a importação das linhas válidas.
- **RN-03 (Diretriz de Idioma em Variáveis):** Entidades, DTOs e serviços em inglês: `ClientCsvImportService`, `ClientImportSummaryResponse`, `ClientImportErrorDetail`, `totalRows`, `importedCount`, `skippedDuplicatesCount`, `errorsCount`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / Apache Commons CSV / Flyway)
- **Migration:** `V16__seed_initial_production_data.sql`
- **Endpoints:**
  - `POST /api/v1/onboarding/import-clients-csv` (upload multipart de CSV)
  - `GET /api/v1/onboarding/clients-csv-template` (download do arquivo modelo)
- **DTO:** `ClientImportSummaryResponse` (record Java 21)

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `CsvClientImportModal.tsx` (drag-and-drop de arquivo CSV, barra de progresso e sumário)
  - `ImportSummaryAlert.tsx` (card de resultado com badges de importados, duplicados e erros)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `ClientCsvImportServiceTest` cobrindo sucesso, tratamento de duplicatas e linhas com formato inválido.
- [ ] Validação da migration Flyway `V16` executando sem falhas em banco PostgreSQL limpo.
- [ ] Teste no frontend com upload de arquivo real contendo 100 linhas.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-40.1](issues/US-40.1-criar-package-br-edu-ifpb-alumigest-onboardin/issue.md) | Criar package `br.edu.ifpb.alumigest.onboarding` e diretório `frontend/src/features/onboarding` | 🔲 No Backlog |
| [US-40.2](issues/US-40.2-criar-migration-flyway-backend-src-main-resou/issue.md) | Criar migration Flyway `backend/src/main/resources/db/migration/V16__seed_initial_production_data.sql` populando perfis Suprema/Gold, vidros e estoque inicial | 🔲 No Backlog |
| [US-40.3](issues/US-40.3-criar-record-clientimportsummaryresponse-tota/issue.md) | Criar record `ClientImportSummaryResponse` (`totalRows`, `importedCount`, `skippedDuplicatesCount`, `errorsCount`) | 🔲 No Backlog |
| [US-40.4](issues/US-40.4-implementar-servico-clientcsvimportservice-im/issue.md) | Implementar serviço `ClientCsvImportService.importarClientes(MultipartFile file)` | 🔲 No Backlog |
| [US-40.5](issues/US-40.5-criar-endpoint-post-api-onboarding-import-cli/issue.md) | Criar endpoint POST `/api/v1/onboarding/import-clients-csv` no `OnboardingController` | 🔲 No Backlog |
| [US-40.6](issues/US-40.6-criar-testes-unitarios-do-clientcsvimportserv/issue.md) | Criar testes unitários do `ClientCsvImportServiceTest` | 🔲 No Backlog |
| [US-40.7](issues/US-40.7-criar-modal-csvclientimportmodal-no-frontend-/issue.md) | Criar modal `CsvClientImportModal` no frontend | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-40-carga-inicial-importador-csv`
