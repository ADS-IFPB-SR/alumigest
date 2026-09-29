# 🐞 RBD — Registro de Bugs e Defeitos do Projeto AlumiGest

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Documento** | Registro Unificado de Bugs, Defeitos e Hotfixes (RBD) |
| **Versão** | 2.2.0 (Catálogo de Bugs BUG-023 a BUG-027 da US-10 na Sprint 05) |
| **Data de Atualização** | 29/09/2026 |
| **Responsável QA / SM** | Júlio Kennedy dos Santos Silva (Scrum Master) / Equipe de Engenharia AlumiGest |
| **Branch** | `planejamento` |
| **Padrão de Template** | Baseado em [`.github/ISSUE_TEMPLATE/bug_report.md`](../../../.github/ISSUE_TEMPLATE/bug_report.md) |
| **Auditoria Técnica** | Análise estática SonarQube, Pipeline CI/CD GitHub Actions e Histórico Git |

---

## 1. 🎯 Finalidade e Metodologia de Qualidade

Este documento consolida o **catálogo histórico e investigativo de todos os bugs, defeitos, falhas de ambiente, incompatibilidades de tipagem e regressões de software** identificados e tratados nas branches `develop` e `main` do repositório **AlumiGest**.

Seguindo a governança do **Plano de Gerência de Configuração (PGC)** e do **Plano Geral de Testes (PLT)**:
1. Todos os relatos respeitam estritamente a estrutura formal do template [`.github/ISSUE_TEMPLATE/bug_report.md`](../../../.github/ISSUE_TEMPLATE/bug_report.md).
2. Cada defeito é rastreado com sua severidade, passos de reprodução, comportamento esperado, ambiente afetado e **análise técnica de causa raiz e solução aplicada**.
3. O monitoramento contínuo aplica a filosofia **Clean as You Code**, suportada pela suíte de **242 testes automatizados JUnit 5**, **24 suítes E2E Cypress**, **Oxlint** e **SonarQube Community Edition**.

---

## 2. 📊 Matriz Consolidada de Defeitos Catalogados

| ID | Título do Defeito / Bug | Módulo | Severidade | Sprint | Status | Detecção / Correção |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **[BUG-001](#bug-001)** | Bloqueio de CORS e Rotas Incorretas na API de Materiais do Frontend | Frontend / API | 🔴 Alta | Sprint 02 | ✅ Resolvido | Commit `6d4907c` |
| **[BUG-002](#bug-002)** | Mapeamento JSONB e Parâmetros Nullable Quebrando Consultas no PostgreSQL e Swagger | Backend / JPA | 🔴 Alta | Sprint 02 | ✅ Resolvido | Commit `d394cc7` |
| **[BUG-003](#bug-003)** | Unidade de Comprimento em Milímetros e Falta de Edição no Modal de Perfis | Frontend / Catálogo | 🟡 Média | Sprint 02 | ✅ Resolvido | Commit `5c0022e` |
| **[BUG-004](#bug-004)** | Serialização Divergente de Booleano `isActive` vs `active` no DTO de Vidros | Backend / DTO | 🟡 Média | Sprint 02 | ✅ Resolvido | Commit `ca9a13f` |
| **[BUG-005](#bug-005)** | Impossibilidade de Atualizar ou Reativar Materiais Inativados (Soft Delete) | Backend / Service | 🔴 Alta | Sprint 02 | ✅ Resolvido | Commit `48738ec` |
| **[BUG-006](#bug-006)** | Perda de Padding Principal e Quebra Visual de Espaçamento no DashboardLayout | Frontend / UI | 🟢 Baixa | Sprint 02 | ✅ Resolvido | Commit `e3d7d62` |
| **[BUG-007](#bug-007)** | Quebra de Fixtures de Testes Unitários após Adição de Dimensões em Vidros | Backend / Testes | 🟡 Média | Sprint 02 | ✅ Resolvido | Commit `4c3ccff` |
| **[BUG-008](#bug-008)** | Falha no Build de Produção por Imports Não Utilizados do React e Erros Oxlint | Frontend / CI | 🔴 Alta | Sprint 02 | ✅ Resolvido | Commits `136d1c8`, `1dab61a` |
| **[BUG-009](#bug-009)** | Isolamento Indevido de Portas no Docker Bloqueando Acesso Local (Host) | Infra / Docker | 🔴 Alta | Sprint 02 | ✅ Resolvido | PR #55, #58 / Commit `25bd60a` |
| **[BUG-010](#bug-010)** | Duplo Desempacotamento de Resposta da API Gerando Telas Vazias de Produtos | Frontend / State | 🔴 Alta | Sprint 02 | ✅ Resolvido | PR #56 / Commit `e993e97` |
| **[BUG-011](#bug-011)** | Crash na Ficha Técnica por `crypto.randomUUID()` Não Definido em Conexões HTTP | Frontend / PWA | 🔴 Crítica | Sprint 02 | ✅ Resolvido | PR #59, #60 / Commit `6b47302` |
| **[BUG-012](#bug-012)** | Falhas de Validação, Mensagens Genéricas e Quebra de Layout nos Modais (Issue #75) | Frontend / Modais | 🔴 Alta | Sprint 02 | ✅ Resolvido | PR #77 / Commit `eb38861` |
| **[BUG-013](#bug-013)** | Falha de Resolução do Plugin SonarQube Maven no Pipeline do GitHub Actions | CI/CD / Sonar | 🔴 Alta | Sprint 03 | ✅ Resolvido | PR #78 / Commit `d0da2e3` |
| **[BUG-014](#bug-014)** | Merge Prematuro de Orçamentos na Branch `main` e Reversão Emergencial | Arquitetura / Git | 🔴 Crítica | Sprint 03 | ✅ Resolvido | PR #105 / Revert PR #109 |
| **[BUG-015](#bug-015)** | Conflito Fatal de Versões de Migração Flyway (`V8` Duplicada no Banco) | Backend / Flyway | 🔴 Alta | Sprint 03 | ✅ Resolvido | Commit `bad5c2d` |
| **[BUG-016](#bug-016)** | Incompatibilidade de Propriedade `fullName` no MapStruct de Orçamentos | Backend / Mapper | 🔴 Alta | Sprint 03 | ✅ Resolvido | Commits `c6b1842`, `530f8e1` |
| **[BUG-017](#bug-017)** | Quebra de Compilação do `BudgetIntegrationTest` após Remoção de `laborCost` | Backend / Testes | 🔴 Alta | Sprint 03 | ✅ Resolvido | PR #120 / Commit `e47bff9` |
| **[BUG-018](#bug-018)** | Erro de Inferência de Tipos no Schema Zod do SKU de Películas | Frontend / Zod | 🟡 Média | Sprint 03 | ✅ Resolvido | Commit `7751850` |
| **[BUG-019](#bug-019)** | Falha de Compilação e DI por Inconsistência na `MaterialCalculatorFactory` | Backend / Motor | 🔴 Alta | Sprint 03 | ✅ Resolvido | Commit `9cbf957` |
| **[BUG-020](#bug-020)** | Funções Não Utilizadas no Cypress Violando Linting Estrito no Pipeline | Frontend / QA | 🟢 Baixa | Sprint 03 | ✅ Resolvido | Commit `6a48859` |
| **[BUG-021](#bug-021)** | Perda de Insumos da Ficha Técnica em Produtos Estáticos e Ocultação de Templates na Categoria Janela | Frontend / Catálogo & Orçamentos | 🔴 Alta | Sprint 03 | ✅ Resolvido | Issue #235 / Branch `fix/products-static-items-and-window-category` |
| **[BUG-022](#bug-022)** | Itens do Orçamento Descartados na Criação via POST /api/budgets por Ausência de Campo no BudgetCreateRequest | Backend / Orçamentos | 🔴 Alta | Sprint 04 | 🟡 Em Correção | Issue #300 / PR #293 |
| **[BUG-023](#bug-023)** | Divergência de Cálculo de Mão de Obra (`laborCost`) entre Frontend e Backend com Múltiplas Quantidades (`quantity > 1`) | Motor de Orçamentos / Backend & UI | 🔴 Alta | Sprint 05 | 🟡 Em Aberto | Auditoria US-10 / Code Review |
| **[BUG-024](#bug-024)** | Falha da Clipboard API em Ambientes HTTP e Ausência de Link Direto para WhatsApp (`api.whatsapp.com/send`) | Frontend / Ações | 🟡 Média | Sprint 05 | 🟡 Em Aberto | Auditoria US-10.10 |
| **[BUG-025](#bug-025)** | Cálculo Incorreto de Dias de Validade no Rodapé do PDF com Sobrescrita Indevida para 15 Dias | Backend / PDF | 🟡 Média | Sprint 05 | 🟡 Em Aberto | Análise de Regra / US-10.1 |
| **[BUG-026](#bug-026)** | Razão Social da Empresa Hardcodada no Resumo para WhatsApp Ignorando `CompanyProperties` | Backend / WhatsApp | 🟢 Baixa | Sprint 05 | 🟡 Em Aberto | Análise Estática / US-10.3 |
| **[BUG-027](#bug-027)** | Resposta de Erro Empacotada como Blob sem Tratamento de Mensagem no Download de PDF Comercial | Frontend / API | 🟡 Média | Sprint 05 | 🟡 Em Aberto | Análise Estática / US-10.8 |

---

## 3. 📝 Registro Detalhado de Bugs e Defeitos

---

### BUG-001
#### [BUG] Bloqueio de CORS e Rotas Incorretas na API de Materiais do Frontend

**Descrição do Problema:**
Ao tentar carregar ou salvar dados na tela de Catálogo de Materiais (`/`), as requisições HTTP falhavam com erros `404 Not Found` e bloqueio de CORS no navegador. A aplicação frontend estava chamando diretamente a porta do backend (`http://localhost:8080/api/glasses`) sem o prefixo `/v1/catalog/` padronizado na arquitetura.

**Passos para Reproduzir:**
1. Iniciar o backend na porta 8080 e o frontend no Vite na porta 5173.
2. Acessar a aplicação em `http://localhost:5173`.
3. Navegar para a aba "Vidros" ou "Perfis".
4. Abrir o Console de Desenvolvedor (F12) e observar a falha de requisição `CORS Policy / 404`.

**Comportamento Esperado:**
O frontend deve se comunicar transparentemente através de reverse proxy (`/api/v1`) com suporte nativo a rotas prefixadas `/catalog/...` sem incidentes de CORS ou falha de porta.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Google Chrome / Firefox (Ambiente de Desenvolvimento Vite).
- **Módulo Afetado:** Catálogo de Materiais (`frontend/src/features/catalog/services/catalogApi.ts`, `vite.config.ts`, `api.ts`).
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `6d4907c` (Refs: US-013).

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** O cliente Axios apontava para `http://localhost:8080/api` de forma estática e sem o proxy reverso do Vite configurado, disparando restrições de Cross-Origin Resource Sharing.
* **Solução:** Configurado o proxy reverso no `vite.config.ts` redirecionando `/api` para `http://localhost:8080`, unificada a `baseURL` para `/api/v1` e adicionados os prefixos `/catalog/` em todas as chamadas de insumos.

---

### BUG-002
#### [BUG] Mapeamento JSONB e Parâmetros Nullable Quebrando Consultas no PostgreSQL e Swagger

**Descrição do Problema:**
A listagem filtrada de perfis de alumínio e o salvamento de atributos dinâmicos quebravam com exceções SQL no backend (`PSQLException: column "attributes_json" is of type jsonb but expression is of type character varying`). Adicionalmente, buscas com parâmetros nulos geravam falha de inferência de tipos e a documentação do Swagger exibia o objeto `Pageable` desestruturado de forma incorreta.

**Passos para Reproduzir:**
1. Acessar o endpoint `GET /api/v1/catalog/aluminum-profiles` sem informar filtros de nome ou cor.
2. Observar erro HTTP 500 com log do PostgreSQL indicando `could not determine data type of parameter $1`.
3. Tentar persistir um material com campo `attributes_json`.

**Comportamento Esperado:**
O PostgreSQL deve aceitar atributos nulos em cláusulas `OR` e persistir objetos JSONB nativamente via Hibernate sem divergência de tipos.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Spring Boot 3.4 / PostgreSQL 16 / Hibernate 6.
- **Módulo Afetado:** `backend/src/main/java/br/edu/ifpb/alumigest/catalog/domain/Material.java` e `MaterialRepository.java`.
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `d394cc7`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** O campo `attributesJson` na entidade `Material` estava mapeado como `TEXT` genérico, incompatível com o tipo de coluna `jsonb` criado no Flyway. Além disso, no Spring Data JPA, parâmetros opcionais em queries nativas sem cast explícito falham no driver do Postgres.
* **Solução:** Adicionada anotação `@JdbcTypeCode(SqlTypes.JSON)`, aplicado `CAST(:param AS string) IS NULL` nas queries JPQL do `MaterialRepository` e adicionada a anotação `@ParameterObject` no `AluminumProfileController`.

---

### BUG-003
#### [BUG] Unidade de Comprimento em Milímetros e Falta de Edição no Modal de Perfis

**Descrição do Problema:**
O formulário de cadastro de perfis de alumínio enviava o comprimento padrão da barra em milímetros (`6000`), enquanto as regras de cálculo do backend esperavam o valor em metros (`3.00` ou `6.00`). Adicionalmente, o modal não suportava a edição de perfis já cadastrados e hardcodava a linha comercial como "Suprema".

**Passos para Reproduzir:**
1. Acessar o Catálogo de Materiais > Aba Perfis de Alumínio.
2. Clicar em "Novo Perfil" e preencher os dados informando comprimento de barra.
3. Observar erro de validação de negócio no backend (`Tamanho padrão de barra inválido. Permitido apenas 3m ou 6m`).
4. Tentar clicar no botão de editar um perfil existente e notar que o formulário abria em branco para criação.

**Comportamento Esperado:**
O modal deve trabalhar com metros (`3m` ou `6m`), permitir selecionar a linha comercial dinâmica (ex: Rometal, Suprema) e preencher os dados existentes ao editar.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Frontend SPA React / TypeScript.
- **Módulo Afetado:** `frontend/src/features/catalog/components/ProfileFormModal.tsx`.
- **Severidade:** 🟡 Média | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `5c0022e`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Divergência de especificação entre contrato de tela (mm) e regra de cálculo da engenharia (m), além da ausência de branch condicional `isEditing` no hook de mutação do modal.
* **Solução:** Adequação das máscaras e parseadores numéricos (`formatInteger`, `parseWeightString`), conversão para metros (`unit="m"`), inclusão do hook `useUpdateProfile` e população correta do estado no `useEffect`.

---

### BUG-004
#### [BUG] Serialização Divergente de Booleano `isActive` vs `active` no DTO de Vidros

**Descrição do Problema:**
Ao listar vidros cadastrados na interface web, todos os itens apareciam com o badge visual de "Inativo", mesmo quando ativos no banco de dados. Os botões de alternância de status não refletiam o valor real.

**Passos para Reproduzir:**
1. Cadastrar um vidro com status "Ativo".
2. Consultar o retorno do endpoint `GET /api/v1/catalog/glasses`.
3. Notar que a propriedade serializada no JSON chegava como `active: true`, enquanto o DTO no backend declarava `boolean isActive`.

**Comportamento Esperado:**
O status ativo/inativo deve ser consistente entre o payload REST e o modelo de dados TypeScript no frontend.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Java 21 Records / Jackson ObjectMapper / React.
- **Módulo Afetado:** `backend/src/main/java/br/edu/ifpb/alumigest/catalog/dto/GlassResponseDTO.java`.
- **Severidade:** 🟡 Média | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `ca9a13f`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** A convenção do Jackson para campos booleanos com prefixo `is` em Records pode omitir o prefixo na serialização JSON, gerando incompatibilidade com tipagens que esperam `isActive`.
* **Solução:** Padronizado o nome do atributo para `boolean active` em todo o ecossistema backend e frontend.

---

### BUG-005
#### [BUG] Impossibilidade de Atualizar ou Reativar Materiais Inativados (Soft Delete)

**Descrição do Problema:**
Quando um material era desativado (soft delete), tornava-se impossível editá-lo ou reativá-lo através do painel administrativo. Qualquer requisição de `PUT` ou `DELETE` para um item inativo retornava erro `404 Not Found`.

**Passos para Reproduzir:**
1. Inativar um vidro no catálogo.
2. Tentar alterar o preço ou o nome desse vidro via modal de edição.
3. Clicar em "Salvar".
4. Receber mensagem de erro na tela: *"Vidro não encontrado ou inativo."* (HTTP 404).

**Comportamento Esperado:**
Materiais inativados devem poder ser consultados por administradores, editados e reativados quando necessário.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Backend Spring Boot / Repositório JPA.
- **Módulo Afetado:** `backend/src/main/java/br/edu/ifpb/alumigest/catalog/service/GlassService.java`.
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `48738ec`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Os métodos `update()` e `delete()` executavam `materialRepository.findByIdAndIsActiveTrue(id)`. Como o registro estava com `isActive = false`, a query não retornava resultados e disparava a exceção de entidade não encontrada.
* **Solução:** Alterada a busca para `materialRepository.findById(id)`, permitindo a localização do registro independentemente do status para posterior modificação.

---

### BUG-006
#### [BUG] Perda de Padding Principal e Quebra Visual de Espaçamento no DashboardLayout

**Descrição do Problema:**
Após uma alteração de estilização no layout principal do sistema, todo o conteúdo das páginas (tabelas, cabeçalhos, formulários) ficou colado diretamente às bordas da tela, sem nenhum espaçamento lateral ou superior.

**Passos para Reproduzir:**
1. Acessar o sistema em qualquer resolução de tela (Desktop ou Tablet).
2. Entrar em `/materiais` ou `/produtos`.
3. Observar que a tabela e os filtros encostavam diretamente na barra lateral e nas margens do navegador.

**Comportamento Esperado:**
O container central da aplicação deve possuir preenchimento interno consistente (`padding`) de acordo com os tokens do design system (`p-md sm:p-lg lg:p-xl`).

**Contexto / Ambiente:**
- **Navegador / Sistema:** Todos os navegadores / Tailwind CSS Vanilla.
- **Módulo Afetado:** `frontend/src/components/layout/DashboardLayout.tsx`.
- **Severidade:** 🟢 Baixa | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `e3d7d62`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Classes utilitárias de padding foram suprimidas acidentalmente da `div` que envolve o `<Outlet />`.
* **Solução:** Restaurada a classe `p-md sm:p-lg lg:p-xl flex flex-col` no container do `DashboardLayout`.

---

### BUG-007
#### [BUG] Quebra de Fixtures de Testes Unitários após Adição de Dimensões em Vidros

**Descrição do Problema:**
Após a introdução dos atributos de largura máxima (`maxWidthMm`) e altura máxima (`maxHeightMm`) na modelagem de vidros, a suíte de testes unitários do Maven falhou ao compilar, interrompendo a validação no CI.

**Passos para Reproduzir:**
1. Adicionar campos de dimensões ao `GlassResponseDTO`.
2. Executar `./mvnw clean test` no terminal.
3. Observar erros de compilação em `GlassServiceTest` e `GlassMapperTest` acusando construtores incompatíveis.

**Comportamento Esperado:**
Todas as fixtures de testes unitários e de integração devem refletir a assinatura exata dos DTOs vigentes.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Java 21 / Maven 3.9 / JUnit 5.
- **Módulo Afetado:** `backend/src/test/java/br/edu/ifpb/alumigest/catalog/...`.
- **Severidade:** 🟡 Média | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `4c3ccff`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Como os Records no Java geram construtores canônicos estritos com todos os parâmetros, a inclusão de campos sem atualização correspondente nos testes resulta em quebra de compilação.
* **Solução:** Atualização de todas as instâncias de fixtures de teste e ajustes no MapStruct.

---

### BUG-008
#### [BUG] Falha no Build de Produção por Imports Não Utilizados do React e Erros Oxlint

**Descrição do Problema:**
O job de CI `frontend-ci` no GitHub Actions falhava sistematicamente durante a etapa de `npm run build` devido à presença de diretivas `import React from 'react'` não utilizadas (desnecessárias no React 19 JSX Transform) e erros de linting detectados pelo Oxlint.

**Passos para Reproduzir:**
1. Abrir um Pull Request com arquivos contendo imports de React sem uso ou violações de acessibilidade em elementos `div` interativos.
2. O workflow do GitHub Actions executa `tsc --noEmit` e `oxlint`.
3. O build falha com código de saída 1.

**Comportamento Esperado:**
O código do frontend deve ser totalmente aderente às regras de tipagem estrita do TypeScript e às normas de acessibilidade sem resíduos de imports.

**Contexto / Ambiente:**
- **Navegador / Sistema:** GitHub Actions Linux Runner / Node 20 / TypeScript 5.5.
- **Módulo Afetado:** `frontend/src/App.tsx`, `ProductsPage.tsx`, `.github/workflows/ci.yml`.
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commits `136d1c8`, `1dab61a`, `f450e77`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Configuração estrita de compilação (`noUnusedLocals`) combinada com falta de papéis ARIA (`role="dialog"`, `aria-modal`) em overlays customizados.
* **Solução:** Remoção massiva de imports obsoletos, adição de atributos de acessibilidade nos modais e atualização das ações do CI.

---

### BUG-009
#### [BUG] Isolamento Indevido de Portas no Docker Bloqueando Acesso Local (Host)

**Descrição do Problema:**
Após ajustes de infraestrutura para evitar conflitos de portas no ambiente Coolify, as portas dos serviços no `docker-compose.yml` foram alteradas para a diretiva `expose:`. Como resultado, os desenvolvedores não conseguiam mais conectar suas ferramentas locais (DBeaver, pgAdmin, navegador local) ao banco PostgreSQL (5432) nem ao backend (8080).

**Passos para Reproduzir:**
1. Executar `docker compose up -d` na raiz do projeto.
2. Tentar conectar ao PostgreSQL via `localhost:5432` no DBeaver.
3. Conexão recusada (`Connection refused: connect`).

**Comportamento Esperado:**
O ambiente Docker Compose local deve mapear as portas no host de forma configurável para permitir desenvolvimento e depuração local.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Docker Engine / Docker Compose / Windows & Linux.
- **Módulo Afetado:** `docker-compose.yml`, `.env.example`.
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** PR #55, PR #58 / Commits `acbd8ae`, `25bd60a`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** A diretiva `expose:` apenas disponibiliza portas entre containers na mesma rede Docker interna, não as publicando no host do desenvolvedor.
* **Solução:** Restaurada a seção `ports:` com fallback dinâmico via variáveis de ambiente (`${POSTGRES_PORT:-5432}:5432`, `${BACKEND_PORT:-8080}:8080`, `${FRONTEND_PORT:-3000}:80`).

---

### BUG-010
#### [BUG] Duplo Desempacotamento de Resposta da API Gerando Telas Vazias de Produtos

**Descrição do Problema:**
Ao acessar a tela de Produtos (`/produtos`) e a tela de montagem de esquadrias (`/produtos/novo`), a listagem aparecia permanentemente vazia e a edição de produtos existentes travava. Os dados eram baixados com sucesso pela rede, mas não renderizavam no DOM.

**Passos para Reproduzir:**
1. Cadastrar produtos no backend.
2. Acessar `/produtos` no navegador.
3. Observar que a tabela exibia mensagem de nenhum produto encontrado.
4. Tentar abrir `/produtos/:id/editar` e ver a tela de edição em branco.

**Comportamento Esperado:**
A lista de produtos e os dados da ficha técnica devem ser extraídos corretamente do envelope da resposta HTTP e renderizados na UI.

**Contexto / Ambiente:**
- **Navegador / Sistema:** React 19 / TanStack React Query / Axios.
- **Módulo Afetado:** `frontend/src/features/catalog/services/catalogApi.ts`, `ProductBuilderPage.tsx`, `ProductsPage.tsx`.
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** PR #56 / Commit `e993e97` (Hotfix `hotfix/api-data-unwrap`).

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** O cliente Axios já desempacotava o payload bruto, mas o código dos hooks tentava realizar um segundo nível de leitura (`productsData?.data?.content`), resultando em `undefined`.
* **Solução:** Corrigida a tipagem genérica das chamadas Axios para `api.get<PageResponse<Product>>` e consumo direto de `productsData?.content`.

---

### BUG-011
#### [BUG] Crash na Ficha Técnica por `crypto.randomUUID()` Não Definido em Conexões HTTP

**Descrição do Problema:**
Ao utilizar o sistema em dispositivos móveis (tablets na fábrica ou celulares) conectados via IP local ou protocolo HTTP sem SSL (`http://192.168.x.x:5173`), a tela de montagem de esquadrias congelava ao tentar adicionar qualquer insumo à ficha técnica, disparando uma tela de erro vermelha com a mensagem: *`TypeError: crypto.randomUUID is not a function`*.

**Passos para Reproduzir:**
1. Acessar a aplicação através de uma conexão HTTP local sem certificado SSL (ex: `http://192.168.1.100:5173`).
2. Navegar para `/produtos/novo`.
3. Clicar em "Adicionar Insumo" e selecionar um vidro ou perfil.
4. Observar o travamento imediato da aplicação com erro fatal no console.

**Comportamento Esperado:**
O sistema deve gerar identificadores temporários de interface em qualquer ambiente, independentemente de haver ou não camada TLS/SSL ativa.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Navegadores Web em Tablets / Celulares / Redes Locais HTTP (Contexto Não Seguro).
- **Módulo Afetado:** `frontend/src/features/catalog/components/builder/ProductTechSheet.tsx`, `ProductBuilderPage.tsx`.
- **Severidade:** 🔴 Crítica | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** PR #59, PR #60 / Commit `6b47302` (Hotfix `hotfix/crypto-uuid` / Release `v0.2.2`).

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Conforme especificação da W3C, o método nativo `crypto.randomUUID()` está restrito exclusivamente a *Secure Contexts* (HTTPS ou localhost).
* **Solução:** Implementado gerador seguro com fallback: `Math.random().toString(36).slice(2)`.

---

### BUG-012
#### [BUG] Falhas de Validação, Mensagens Genéricas e Quebra de Layout nos Modais (Issue #75)

**Descrição do Problema:**
Os formulários de cadastro de Vidros, Perfis, Ferragens e Películas exibiam mensagens de erro vagas sem apontar visualmente qual campo estava incorreto. Em telas de menor resolução, a barra de rolagem cortava os botões de ação ("Salvar" e "Cancelar"), além de inconsistências tipográficas e ausência de normalização em caixa alta.

**Passos para Reproduzir:**
1. Acessar o Catálogo de Materiais.
2. Abrir o modal de cadastro de Ferragens ou Perfis.
3. Submeter o formulário sem preencher o preço ou com valores negativos.
4. Observar notificação genérica sem indicação visual no campo com erro e rodapé de ações fora da área visível.

**Comportamento Esperado:**
Cada campo inválido deve apresentar borda vermelha e texto explicativo logo abaixo. O rodapé de ações deve permanecer sempre visível na base do modal (`sticky bottom`).

**Contexto / Ambiente:**
- **Navegador / Sistema:** Frontend SPA React.
- **Módulo Afetado:** `frontend/src/features/catalog/components/*Modal.tsx`, `schemas/catalogSchemas.ts`.
- **Severidade:** 🔴 Alta | **Sprint:** 02 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Issue #75 / PR #77 / Commit `eb38861`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Controle manual de estado com múltiplos `useState` sem biblioteca de validação de esquemas e container flex sem overflow controlado.
* **Solução:** Adoção de `react-hook-form` integrado a esquemas `zod`, fixação do rodapé do modal com classes Tailwind `sticky bottom-0 bg-surface` e conversão automática de textos para maiúsculas.

---

### BUG-013
#### [BUG] Falha de Resolução do Plugin SonarQube Maven no Pipeline do GitHub Actions

**Descrição do Problema:**
Durante a implementação da pipeline de CI com SonarQube, o workflow falhava na execução do comando `./mvnw sonar:sonar`, gerando erro fatal: *`No plugin found for prefix 'sonar' in the current project and in the plugin groups`*.

**Passos para Reproduzir:**
1. Submeter código em uma branch com o workflow do SonarQube ativo.
2. O job `backend-ci` executa `./mvnw sonar:sonar`.
3. O build falha imediatamente antes da análise estática.

**Comportamento Esperado:**
O Maven deve resolver e executar o plugin do SonarQube Scanner enviando as métricas de cobertura JaCoCo para o servidor self-hosted.

**Contexto / Ambiente:**
- **Navegador / Sistema:** GitHub Actions Runner / Maven Wrapper / SonarQube 10.
- **Módulo Afetado:** `.github/workflows/ci.yml`, `backend/pom.xml`.
- **Severidade:** 🔴 Alta | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** PR #78 / Commit `d0da2e3`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** O plugin `sonar-maven-plugin` não estava explicitamente configurado no bloco `<build><plugins>` do `pom.xml`, impedindo o Maven Wrapper de resolver o prefixo curto `sonar:sonar`.
* **Solução:** Declarado o plugin `org.sonarsource.scanner.maven:sonar-maven-plugin:5.0.0.4389` no `pom.xml` e ajustado o comando no CI para as coordenadas completas do plugin.

---

### BUG-014
#### [BUG] Merge Prematuro de Orçamentos na Branch `main` e Reversão Emergencial

**Descrição do Problema:**
O Pull Request #105 (contendo o frontend do assistente de orçamentos) foi mergeado diretamente na branch de produção `main` antes que as rotas e o motor de cálculo do backend estivessem concluídos e disponíveis. A aplicação em produção passou a exibir links quebrados e disparar erros 404.

**Passos para Reproduzir:**
1. Acessar a aplicação implantada a partir da branch `main`.
2. Clicar no menu lateral "Orçamentos".
3. Tentar criar um novo orçamento.
4. Erro HTTP 404 em todas as chamadas de API, pois os endpoints não existiam na `main`.

**Comportamento Esperado:**
Nenhum código de funcionalidade deve ser incorporado na branch `main` sem que a dependência completa de backend e frontend esteja validada na branch `develop`.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Branch `main` (Produção / Staging).
- **Módulo Afetado:** Gestão de Orçamentos (`App.tsx`, `Sidebar.tsx`, `features/budgets/*`).
- **Severidade:** 🔴 Crítica | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** PR #105 / PR #109 (Revert emergencial commit `07eda8b` e `9e67ad2`).

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Quebra da política de Git Flow definida no PGC, com merge direto de feature incompleta na `main`.
* **Solução:** Reversão imediata na branch `main` via PR #109, mantendo o desenvolvimento protegido na branch `develop` até a entrega completa do motor no backend via PRs #110, #116 e #117.

---

### BUG-015
#### [BUG] Conflito Fatal de Versões de Migração Flyway (`V8` Duplicada no Banco)

**Descrição do Problema:**
Ao subir a aplicação Spring Boot na branch `develop`, o contexto quebrava na inicialização com a exceção: *`FlywayException: Found more than one migration with version 8`*.

**Passos para Reproduzir:**
1. Executar `./mvnw spring-boot:run` ou rodar a suite de testes.
2. O Flyway escaneia a pasta `db/migration`.
3. O log acusa duas migrações com o mesmo número de versão: `V8__add_template_fields_to_products.sql` e `V8__create_budgets_schema.sql`.

**Comportamento Esperado:**
As versões das migrações do Flyway devem ser estritamente sequenciais e unívocas para garantir aplicação determinística do DDL.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Spring Boot 3.4 / Flyway Migration / PostgreSQL.
- **Módulo Afetado:** `backend/src/main/resources/db/migration/`.
- **Severidade:** 🔴 Alta | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `bad5c2d`, `72d6907`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Desenvolvimento paralelo em branches distintas que nomearam suas respectivas migrações com o mesmo identificador sequencial `V8`.
* **Solução:** Renomeada a migração de orçamentos para `V9__create_budgets_schema.sql`, restaurando a ordem cronológica do banco relacional.

---

### BUG-016
#### [BUG] Incompatibilidade de Propriedade `fullName` no MapStruct de Orçamentos

**Descrição do Problema:**
O build do backend falhava com erro do processador de anotações do MapStruct: *`No property named "name" / "fullname" exists in source parameter(s)`* durante a geração de código do `BudgetMapper`.

**Passos para Reproduzir:**
1. Declarar `@Mapping(target = "clientName", source = "client.name")` na interface `BudgetMapper`.
2. Executar `./mvnw compile`.
3. Erro fatal de compilação do compilador Java.

**Comportamento Esperado:**
O MapStruct deve mapear com sucesso o nome completo do cliente (`client.fullName`) para os DTOs de resposta da proposta.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Java 21 / MapStruct 1.6 / Maven.
- **Módulo Afetado:** `backend/src/main/java/br/edu/ifpb/alumigest/budgets/mapper/BudgetMapper.java`.
- **Severidade:** 🔴 Alta | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commits `c6b1842`, `530f8e1`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Divergência de nomenclatura na entidade `Customer/Client`, que possui o campo `fullName` em camelCase, enquanto o mapper referenciava `name` e posteriormente `fullname` em minúsculas.
* **Solução:** Corrigido o target para `client.fullName` em todos os métodos de conversão do mapper.

---

### BUG-017
#### [BUG] Quebra de Compilação do `BudgetIntegrationTest` após Remoção de `laborCost`

**Descrição do Problema:**
Após a aprovação do refactoring que eliminou o custo de mão de obra (`laborCost`) da entidade base de produtos (PR #119), o teste integrado `BudgetIntegrationTest` na branch `develop` passou a falhar na compilação, bloqueando novas integrações.

**Passos para Reproduzir:**
1. Executar `mvn test -Dtest=BudgetIntegrationTest` na branch `develop`.
2. Falha de compilação: *`cannot find symbol: method setLaborCost(BigDecimal)`*.

**Comportamento Esperado:**
A suíte de testes de integração deve compilar e executar com 100% de sucesso alinhada à nova regra de negócio de mão de obra desvinculada do catálogo base.

**Contexto / Ambiente:**
- **Navegador / Sistema:** JUnit 5 / SpringBootTest / Mockito.
- **Módulo Afetado:** `backend/src/test/java/br/edu/ifpb/alumigest/budgets/service/BudgetIntegrationTest.java`.
- **Severidade:** 🔴 Alta | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** PR #120 / Commit `e47bff9`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** O método `setLaborCost()` foi removido da classe `Product`, mas uma chamada legada remanescente no mock de fixture do teste integrado não havia sido limpa na branch de origem.
* **Solução:** Removida a configuração obsoleta do mock através da PR corretiva #120.

---

### BUG-018
#### [BUG] Erro de Inferência de Tipos no Schema Zod do SKU de Películas

**Descrição do Problema:**
A compilação do TypeScript falhava no formulário de películas com o erro: *`Type 'undefined' is not assignable to type 'string'`*, gerado pelo tipo inferido `z.infer<typeof filmSchema>`.

**Passos para Reproduzir:**
1. Declarar o campo `skuCode: z.string().optional().transform(v => v ? v.toUpperCase() : undefined)`.
2. Executar `npm run build` ou `npx tsc --noEmit`.
3. Erro de tipo ao associar os valores do schema com o hook `useForm<FilmFormValues>()`.

**Comportamento Esperado:**
O schema do Zod deve inferir tipos primitivos compatíveis com o estado do formulário React Hook Form.

**Contexto / Ambiente:**
- **Navegador / Sistema:** TypeScript 5 / Zod 3.23 / React Hook Form.
- **Módulo Afetado:** `frontend/src/features/catalog/schemas/catalogSchemas.ts`.
- **Severidade:** 🟡 Média | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `7751850`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** A função `.transform()` altera a saída de tipos do Zod em tempo de compilação, quebrando a compatibilidade direta com inputs HTML.
* **Solução:** Simplificado o schema para `skuCode: z.string().toUpperCase().optional()`.

---

### BUG-019
#### [BUG] Falha de Compilação e DI por Inconsistência na `MaterialCalculatorFactory`

**Descrição do Problema:**
O Spring Boot não conseguia inicializar o motor de cálculo de orçamentos por ausência de um método de fábrica consistente para recuperar as calculadoras especializadas (`GlassCalculator`, `AluminumCalculator`, etc.).

**Passos para Reproduzir:**
1. Chamar o serviço de cálculo de orçamentos para um item contendo perfis e vidros.
2. Invocação de método com nome incorreto na factory.
3. Exceção em tempo de execução ou falha de injeção de dependência.

**Comportamento Esperado:**
A factory deve mapear via injeção de dependências do Spring todas as estratégias registradas por `CategoryType` e entregá-las via `getCalculator(categoryType)`.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Spring Boot / Strategy Pattern.
- **Módulo Afetado:** `backend/src/main/java/br/edu/ifpb/alumigest/budgets/calculator/MaterialCalculatorFactory.java`.
- **Severidade:** 🔴 Alta | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `9cbf957`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Typo no nome do método de recuperação de calculadoras e ausência de tratamento para categorias desconhecidas.
* **Solução:** Implementado mapa imutável no construtor via `Collectors.toMap` e método `getCalculator(CategoryType)` com lançamento semântico de `IllegalArgumentException`.

---

### BUG-020
#### [BUG] Funções Não Utilizadas no Cypress Violando Linting Estrito no Pipeline

**Descrição do Problema:**
O pipeline de CI rejeitava Pull Requests da Sprint 3 durante o job de qualidade do frontend devido à presença de funções auxiliares formatadoras que foram criadas nas specs de teste do Cypress (`catalog-film.cy.ts`, `catalog-hardware-details.cy.ts`), mas nunca chamadas no código.

**Passos para Reproduzir:**
1. Executar `npx oxlint` no diretório `frontend`.
2. O linter reporta violações de severidade Warning/Error: *`Variable 'formatBRL' is declared but never used`*.
3. O Quality Gate da pipeline é interrompido.

**Comportamento Esperado:**
O repositório deve manter zero variáveis ou funções órfãs para garantir clean code e aprovação no SonarQube e Oxlint.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Oxlint / SonarQube Frontend / GitHub Actions.
- **Módulo Afetado:** `frontend/cypress/e2e/catalog/*.cy.ts`, `frontend/src/pages/ProductsPage.tsx`.
- **Severidade:** 🟢 Baixa | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Commit `6a48859`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Código remanescente de testes exploratórios que permaneceu após refatoração dos asserções do Cypress.
* **Solução:** Remoção do código morto e refatoração de renderizadores inline para funções estáticas no `ProductsPage.tsx`.

---

### BUG-021
#### [BUG] Perda de Insumos da Ficha Técnica em Produtos Estáticos e Ocultação de Templates na Categoria Janela

**Descrição:**
Após a refatoração da tela de produtos para suporte a templates paramétricos vetoriais (PR #141 / Issue #63), foram identificados dois desvios funcionais de regra de negócio:
1. Ao salvar ou editar um produto estático (sem template), o frontend enviava fixamente `items: []` no payload JSON e a interface não renderizava mais a `<ProductTechSheet />`. No backend (`ProductService.java`), isso acionava `product.getItems().clear()`, apagando permanentemente toda a ficha técnica de insumos cadastrada.
2. Na função utilitária `mapCatalogTemplate.ts`, os templates `SLIDING_WINDOW_2F` e `SLIDING_WINDOW_4F` foram desacoplados da família `SLIDING`, tornando-se acessíveis unicamente se o texto do produto contivesse literalmente a palavra "janela", ignorando a categoria ("Janelas de Correr") associada à esquadria.

**Passos para Reproduzir:**
1. Acessar `/produtos/novo` e selecionar uma Categoria (ex: "Janelas de Correr").
2. Optar por "— Sem Template —".
3. Observar a ausência da ficha técnica para inclusão de materiais e o envio de `items: []` ao submeter o formulário.
4. No construtor de orçamentos, selecionar uma esquadria da categoria "Janelas de Correr" cujo nome seja "Esquadria Suprema 2F" (sem o termo "janela"). O seletor exibia apenas modelos de portas de correr.

**Comportamento Esperado:**
- Produtos sem template devem renderizar a ficha técnica de insumos, validar materiais com quantidade (> 0) e enviar `items: [...]` no payload.
- Esquadrias associadas à categoria Janela devem exibir os templates correspondentes de janela (2F, 4F e Maxim-Ar) tanto no catálogo quanto no construtor de orçamentos.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Google Chrome / React 19 / Vite.
- **Módulo Afetado:** `frontend/src/pages/ProductBuilderPage.tsx`, `frontend/src/features/catalog/components/builder/ProductCostSummary.tsx`, `frontend/src/features/budgets/utils/mapCatalogTemplate.ts`, `frontend/src/features/budgets/components/builder/WindowBuilderModal.tsx`.
- **Severidade:** 🔴 Alta | **Sprint:** 03 | **Status:** ✅ Resolvido.
- **Detecção / Correção:** Pós-merge da PR #141 / Issue #235 / Branch `fix/products-static-items-and-window-category`.

**Causa Raiz Técnica & Solução:**
* **Causa Raiz:** Foco excessivo no novo fluxo de templates gráficos paramétricos durante a entrega da issue #63, resultando na supressão indevida da ficha técnica estática e no acoplamento da resolução de modelos visuais exclusivamente ao nome do produto em vez de inspecionar também a categoria.
* **Solução:** 
  1. Reintrodução condicional do estado `items`, renderização da `<ProductTechSheet />` e mapeamento de `items` no payload de salvamento na ausência de template.
  2. Ajuste em `ProductCostSummary.tsx` para apresentar insumos e custo base de produtos estáticos, bloqueando salvamento com lista vazia.
  3. Atualização de `getAvailableSvgTemplatesForCatalogType` e `getDefaultSvgTemplateForCatalogType` para inspecionar `categoryName`, além da restauração dos templates de janela na família base `SLIDING`.

---



---

### BUG-022
#### [BUG] Itens do Orçamento Descartados na Criação via POST /api/budgets por Ausência de Campo no BudgetCreateRequest

**Descrição do Problema:**
Ao criar um novo orçamento através do assistente ou formulário no Frontend (`/budgets/new`), o usuário vincula o cliente e adiciona as esquadrias/itens desejados. Ao submeter o formulário, o Frontend transmite um payload contendo o array de itens (`items: [...]`) para o endpoint `POST /api/budgets` (ou `/api/orcamentos`).
No entanto, o backend utilizava o record `BudgetCreateRequest` contendo unicamente os campos `clientId` e `observacoes`. Por não declarar o campo `items`, a desserialização do Jackson descartava silenciosamente toda a lista de itens. Consequentemente, o orçamento era persistido no PostgreSQL com **0 itens e R$ 0,00 de subtotal**, gerando orçamentos vazios.

**Passos para Reproduzir:**
1. Acessar o frontend na rota `/budgets/new` (ou botão "Novo Orçamento").
2. Selecionar um cliente válido.
3. Adicionar uma ou mais esquadrias com medidas e componentes à lista de itens.
4. Clicar em **"Salvar Orçamento"**.
5. Verificar a requisição de rede: o payload enviado contém `items: [{ productId: ..., widthMm: ..., ... }]`.
6. O backend responde com HTTP 201 Created.
7. Ao abrir a listagem ou detalhes do orçamento recém-criado, a lista de itens está vazia e o valor total está zerado.

**Comportamento Esperado:**
O endpoint `POST /api/budgets` deve receber opcionalmente a lista de itens (`items`). Ao receber itens na criação, o backend deve instanciá-los, vinculá-los bidirecionalmente à entidade `Budget` e acionar os serviços de cálculo de quantitativos (`BudgetQuantityService`) e precificação (`BudgetPricingService`), gravando o orçamento completo e com totais consolidados.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Java 21 / Spring Boot 3.4 / PostgreSQL 16.
- **Módulo Afetado:** `backend/src/main/java/br/edu/ifpb/alumigest/budgets/dto/BudgetCreateRequest.java` e `BudgetService.java`.
- **Severidade:** 🔴 Alta | **Sprint:** 04 | **Status:** 🟡 Em Correção / Validado em QA.
- **Detecção / Correção:** Issue #300 / PR #293 (Refs: US-10).

**Causa Raiz Técnica & Solução:**
* **Solução:** Adicionado o campo opcional `List<BudgetItemRequestDTO> items` com `@Valid` ao record `BudgetCreateRequest` (mantendo construtor de compatibilidade), e atualizado o método `BudgetService.create` para iterar sobre os itens recebidos, invocar `budgetMapper.toEntity`, associar os itens e chamar o recálculo automático de quantitativos e preços.

---

### BUG-023
#### [BUG] Divergência de Cálculo de Mão de Obra (`laborCost`) entre Frontend e Backend com Múltiplas Quantidades (`quantity > 1`)

**Descrição do Problema:**
Existe uma divergência semântica crítica na fórmula de composição do valor de mão de obra (`laborCost`) e subtotal entre o Backend e o Frontend:
- No backend (`BudgetPricingService.java`, linhas 50-58), a mão de obra é somada fixamente uma única vez por linha de item:
  $$\text{itemSubtotal} = (\text{itemMaterialsSubtotal} \times \text{quantity}) + \text{itemLaborCost}$$
- Na geração do PDF comercial (`BudgetPdfService.java`, linhas 511-525), a mão de obra total é acumulada somando apenas `item.getLaborCost()` direto, sem multiplicar pela quantidade.
- No entanto, na tela de detalhes do frontend (`BudgetDetailPage.tsx`, linhas 89-91), o cálculo do resumo totaliza a mão de obra multiplicando pelo número de peças:
  ```typescript
  const totalLaborCost = (budget.items ?? []).reduce((sum, item) => {
    return sum + ((item.laborCost ?? 0) * (item.quantity ?? 1));
  }, 0);
  ```
Quando o usuário orça 2 ou mais unidades de uma esquadria com mão de obra atribuída (ex: 2 janelas com R$ 150,00 de mão de obra cada):
1. O backend calcula o subtotal como $(\text{materiais} \times 2) + 150,00$.
2. O PDF comercial lista R$ 150,00 de mão de obra.
3. A página de detalhes no frontend projeta R$ 300,00 de mão de obra. Ao tentar abater isso para apresentar o valor líquido dos insumos, os valores de tela tornam-se inconsistentes com o PDF e o banco de dados.

**Passos para Reproduzir:**
1. Acessar `/orcamentos/novo` e adicionar 1 item com quantidade = `2`.
2. Definir o custo de mão de obra do item como `R$ 150,00`.
3. Salvar o orçamento e acessar a tela de detalhes (`/orcamentos/{id}`).
4. Observar a mão de obra exibida no card financeiro do frontend versus o total discriminado no PDF comercial baixado.

**Comportamento Esperado:**
O modelo de domínio e cálculo deve ser unificado: ou a mão de obra é sempre unitária e multiplicada pela quantidade em todas as camadas ($\text{subtotal} = (\text{materiais} + \text{laborCost}) \times \text{quantity}$), ou é global por item e tratada de forma idêntica tanto no frontend quanto no backend e PDF.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Spring Boot 3.4 / React 19 / Vite.
- **Módulo Afetado:** Motor de Orçamentos e Precificação / PDF Comercial (`BudgetPricingService.java`, `BudgetPdfService.java`, `BudgetDetailPage.tsx`).
- **Severidade:** 🔴 Alta (P2) | **Sprint:** 05 | **Status:** 🟡 Em Aberto.
- **Detecção / Origem:** Auditoria de Regra de Negócio da US-10 / Code Review.

**Causa Raiz Técnica & Solução Recomendada:**
* **Causa Raiz:** Ausência de alinhamento no contrato DTO e na regra matemática do `BudgetPricingService` em relação ao caráter unitário ou global de `laborCost` ao iterar itens com `quantity > 1`.
* **Solução Recomendada:** 
  1. No `BudgetPricingService.java`, alinhar a fórmula de precificação para `itemSubtotal = (itemMaterialsSubtotal.add(itemLaborCost)).multiply(BigDecimal.valueOf(itemQty))`.
  2. No `BudgetPdfService.java`, acumular a mão de obra total ponderando pela quantidade: `totalMaoDeObra = totalMaoDeObra.add(item.getLaborCost().multiply(BigDecimal.valueOf(item.getQuantity())))`.
  3. Manter a paridade exata com o redutor do `BudgetDetailPage.tsx`.

---

### BUG-024
#### [BUG] Falha da Clipboard API em Ambientes HTTP e Ausência de Link Direto para WhatsApp (`api.whatsapp.com/send`)

**Descrição do Problema:**
O botão "Copiar para WhatsApp" em `BudgetDetailActions.tsx` invoca diretamente `navigator.clipboard.writeText(text)` sem verificar se o objeto `navigator.clipboard` está disponível no contexto de execução do navegador.
Conforme especificação da W3C, a Clipboard API é uma *Secure Context feature*, estando disponível exclusivamente sob HTTPS ou `localhost`. Em vidraçarias e oficinas onde a aplicação web/PWA é acessada pelo IP da rede local (ex: `http://192.168.1.50:5173`), `navigator.clipboard` é `undefined`. Ao clicar no botão, ocorre a exceção `TypeError: Cannot read properties of undefined (reading 'writeText')` e a mensagem de erro padrão é disparada.
Adicionalmente, a sub-tarefa **US-10.10** especifica expressamente a disponibilização de link direto para envio via WhatsApp (`https://api.whatsapp.com/send?text=...`), o qual não foi fornecido na interface (apenas o botão de cópia isolado foi implementado).

**Passos para Reproduzir:**
1. Acessar a aplicação através de um endereço de IP de rede local via HTTP (`http://<ip-servidor>:5173/orcamentos/<id>`) em um dispositivo móvel ou aba sem SSL.
2. Clicar no botão "Copiar para WhatsApp".
3. Observar o erro no console: `Uncaught (in promise) TypeError: Cannot read properties of undefined (reading 'writeText')` e o toast `'Erro ao gerar ou copiar o resumo para o WhatsApp.'`.
4. Observar a inexistência de um botão ou link para abertura direta da conversa no aplicativo WhatsApp com o texto pré-carregado.

**Comportamento Esperado:**
1. A cópia para a área de transferência deve possuir mecanismo de contingência (*fallback*) baseado em elemento `<textarea>` temporário com `document.execCommand('copy')` caso `navigator.clipboard` não esteja disponível.
2. Deve existir opção na interface para abertura direta do link `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}` (ou `https://wa.me/?text=...`), permitindo ao vendedor disparar a mensagem sem precisar alternar manualmente de app.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Google Chrome / Firefox / Safari (Mobile PWA & HTTP).
- **Módulo Afetado:** Frontend — Ações de Orçamento (`BudgetDetailActions.tsx`, `BudgetDetailPage.tsx`).
- **Severidade:** 🟡 Média (P3) | **Sprint:** 05 | **Status:** 🟡 Em Aberto.
- **Detecção / Origem:** Auditoria US-10.10 / Teste em PWA Mobile.

**Causa Raiz Técnica & Solução Recomendada:**
* **Causa Raiz:** Dependência irrestrita de API moderna restrita a contextos criptografados (HTTPS) e implementação parcial dos requisitos descritos na issue US-10.10.
* **Solução Recomendada:**
  1. Implementar função utilitária `copyToClipboard(text: string): Promise<boolean>` com fallback gracioso para `document.execCommand('copy')`.
  2. Adicionar menu drop-down ou botão secundário "Abrir no WhatsApp" que codifica a mensagem com `encodeURIComponent(text)` e invoca `window.open('https://api.whatsapp.com/send?text=' + encoded, '_blank')`.

---

### BUG-025
#### [BUG] Cálculo Incorreto de Dias de Validade no Rodapé do PDF com Sobrescrita Indevida para 15 Dias

**Descrição do Problema:**
Na emissão do PDF Comercial (`BudgetPdfService.java`, linhas 604-617), o texto de validade da proposta comercial tenta exibir o número de dias corridos até a expiração:
```java
if (budget.getValidUntil() != null) {
    long diasValidade = 15;
    if (budget.getCreatedAt() != null) {
        diasValidade = Duration.between(budget.getCreatedAt(), budget.getValidUntil()).toDays();
        if (diasValidade <= 0) {
            diasValidade = 15;
        }
    }
    document.add(new Paragraph("- Orçamento válido até " + formatarData(budget.getValidUntil())
            + " (" + diasValidade + " dias a partir da emissão).", FONTE_PEQUENA));
}
```
`Duration.between(...).toDays()` calcula intervalos inteiros de 24 horas. Se um orçamento for emitido com prazo curto (ex: 1 dia) ou criado às 16:00 com validade para o dia seguinte às 10:00 (intervalo de 18h), `toDays()` retorna `0`.
A verificação `if (diasValidade <= 0)` trata esse valor como erro e sobrescreve a variável com o valor padrão `15`. O documento impresso apresenta uma contradição de termos comercialmente gravíssima:
`- Orçamento válido até 30/09/2026 (15 dias a partir da emissão).` (quando a emissão foi no dia 29/09/2026).

**Passos para Reproduzir:**
1. Criar um orçamento informando validade para o dia seguinte (1 dia de validade).
2. Emitir o PDF Comercial chamando `GET /api/v1/budgets/{id}/pdf/comercial`.
3. Inspecionar o bloco "Informações Complementares" no final do documento.
4. O texto exibe a data de amanhã com "(15 dias a partir da emissão)".

**Comportamento Esperado:**
O cálculo de dias corridos deve considerar a diferença entre as datas de calendário (`ChronoUnit.DAYS.between(createdAt.toLocalDate(), validUntil.toLocalDate())`), exibindo o número exato de dias (ex: "1 dia a partir da emissão").

**Contexto / Ambiente:**
- **Navegador / Sistema:** OpenPDF / Java 21 / Spring Boot 3.4.
- **Módulo Afetado:** Backend — Serviço de PDF (`BudgetPdfService.java`).
- **Severidade:** 🟡 Média (P3) | **Sprint:** 05 | **Status:** 🟡 Em Aberto.
- **Detecção / Origem:** Análise de Regras de Negócio e Testes Paramétricos de Validade.

**Causa Raiz Técnica & Solução Recomendada:**
* **Causa Raiz:** Utilização de `Duration` (baseada em segundos/horas absolutas) em vez de `ChronoUnit.DAYS` ou `Period` sobre datas locais (`LocalDate`), associada a um fallback que força `15` para qualquer intervalo que resulte em 0 dias.
* **Solução Recomendada:**
  Substituir o cálculo por:
  ```java
  LocalDate dataCriacao = budget.getCreatedAt() != null ? budget.getCreatedAt().toLocalDate() : LocalDate.now();
  LocalDate dataValidade = budget.getValidUntil().toLocalDate();
  long diasValidade = java.time.temporal.ChronoUnit.DAYS.between(dataCriacao, dataValidade);
  if (diasValidade < 0) diasValidade = 0;
  ```

---

### BUG-026
#### [BUG] Razão Social da Empresa Hardcodada no Resumo para WhatsApp Ignorando `CompanyProperties`

**Descrição do Problema:**
O serviço de geração do resumo comercial para WhatsApp (`BudgetPdfService.java`, linha 231) encerra a mensagem com uma assinatura fixa:
```java
sb.append("_Alumiportas - Vidraçaria e Esquadrias_");
```
A classe `BudgetPdfService` já recebe via injeção de dependência o bean `CompanyProperties companyProps`, o qual contém a razão social e o nome fantasia configurados dinamicamente no `application.yml` da instalação do AlumiGest.
Ao hardcodar "Alumiportas", qualquer cliente corporativo ou vidraçaria parceira que personalize sua instância terá suas propostas de WhatsApp enviadas com a marca de terceiros.

**Passos para Reproduzir:**
1. Configurar no `application.yml` a propriedade `app.company.razao-social=Vidraçaria Modelo LTDA`.
2. Gerar o resumo para WhatsApp via endpoint `GET /api/v1/budgets/{id}/resumo-whatsapp`.
3. Inspecionar o rodapé do texto retornado.
4. O rodapé termina com `_Alumiportas - Vidraçaria e Esquadrias_` em vez de `_Vidraçaria Modelo LTDA_`.

**Comportamento Esperado:**
O resumo para WhatsApp deve extrair o nome da empresa de `companyProps.getRazaoSocial()` (com fallback seguro apenas se a propriedade for nula ou vazia).

**Contexto / Ambiente:**
- **Navegador / Sistema:** Spring Boot 3.4 / UTF-8 Text.
- **Módulo Afetado:** Backend — Resumo WhatsApp (`BudgetPdfService.java`).
- **Severidade:** 🟢 Baixa (P4) | **Sprint:** 05 | **Status:** 🟡 Em Aberto.
- **Detecção / Origem:** Análise Estática de Código da US-10.3 / US-10.5.

**Causa Raiz Técnica & Solução Recomendada:**
* **Causa Raiz:** Uso de string literal estática em vez de referenciar o atributo `this.companyProps.getRazaoSocial()`.
* **Solução Recomendada:**
  Alterar a linha 231 para:
  ```java
  String nomeEmpresa = (companyProps.getRazaoSocial() != null && !companyProps.getRazaoSocial().isBlank())
          ? companyProps.getRazaoSocial().trim()
          : "AlumiGest";
  sb.append("_").append(nomeEmpresa).append("_");
  ```

---

### BUG-027
#### [BUG] Resposta de Erro Empacotada como Blob sem Tratamento de Mensagem no Download de PDF Comercial

**Descrição do Problema:**
Ao solicitar o download do PDF comercial pelo frontend, a função `budgetsApi.downloadCommercialPdf` configura a chamada Axios com `responseType: 'blob'`:
```typescript
downloadCommercialPdf: async (id: string, code: string): Promise<void> => {
  const response = await api.get<Blob>(`/api/orcamentos/${id}/pdf/comercial`, {
    baseURL: '',
    responseType: 'blob',
  });
  // ...
}
```
Caso o servidor retorne um erro semântico de negócio, como status `422 Unprocessable Entity` ("Não é possível gerar o PDF de um orçamento cancelado") ou `404 Not Found`, a biblioteca Axios encapsula o JSON de erro do Spring Boot dentro de um objeto `Blob`.
No manipulador de eventos da interface (`BudgetDetailActions.tsx`), o bloco de captura genérico apenas dispara:
```typescript
toast.error('Erro ao gerar o PDF Comercial.');
```
Isso oculta a causa real da falha (orçamento cancelado, problema de permissão ou inexistência de itens), impedindo o operador de tomar a ação corretiva correta.

**Passos para Reproduzir:**
1. Localizar um orçamento com status `CANCELLED`.
2. Na página de detalhes do orçamento, acionar o botão "PDF Comercial".
3. O backend rejeita a requisição com HTTP 422 e payload `{"status": 422, "message": "Não é possível gerar o PDF de um orçamento cancelado."}`.
4. A tela exibe apenas o toast genérico "Erro ao gerar o PDF Comercial.", sem detalhar que orçamentos cancelados não podem ser emitidos.

**Comportamento Esperado:**
Ao interceptar erros em requisições de download com `responseType: 'blob'`, o cliente de API deve converter o Blob em texto (`await error.response.data.text()`), parsear o JSON de erro e exibir na notificação toast a mensagem exata retornada pela API.

**Contexto / Ambiente:**
- **Navegador / Sistema:** Axios 1.x / React 19 / Browser Blob API.
- **Módulo Afetado:** Frontend — Serviço de Orçamentos e Feedback UI (`budgetsApi.ts`, `BudgetDetailActions.tsx`).
- **Severidade:** 🟡 Média (P3) | **Sprint:** 05 | **Status:** 🟡 Em Aberto.
- **Detecção / Origem:** Auditoria de UX e Robustez de Tratamento de Erros da US-10.8.

**Causa Raiz Técnica & Solução Recomendada:**
* **Causa Raiz:** Ausência de conversor de erro para respostas do tipo binário no Axios e captura de erro sem extração de payload no componente React.
* **Solução Recomendada:**
  No `catch` da função ou em um interceptor:
  ```typescript
  if (error.response?.data instanceof Blob) {
    const errorJson = JSON.parse(await error.response.data.text());
    toast.error(errorJson.message || 'Erro ao gerar o PDF Comercial.');
  }
  ```

---

## 4. 📈 Análise Categórica e Lições Aprendidas de Qualidade

### 4.1 Distribuição dos Defeitos por Camada

```mermaid
pie title "Origem dos Defeitos Identificados"
    "Frontend & UI/UX" : 11
    "Backend & Regras de Negócio" : 10
    "Pipeline CI/CD & SonarQube" : 3
    "Infraestrutura & Docker" : 2
    "Governança & Git Flow" : 1
```

### 4.2 Classificação por Causa Raiz

| Categoria | Ocorrências | Ação Preventiva Definitiva Adotada |
|---|:---:|---|
| **Incompatibilidade de Contratos (DTOs / Types)** | 7 | Adoção de contratos OpenAPI sincronizados e tipagens estritas no TypeScript. |
| **Limitações de Ambiente (HTTP vs HTTPS / Docker)** | 4 | Uso de fallbacks nativos (`document.execCommand`, `Math.random`) e SSL obrigatório. |
| **Erros de Validação e Feedback ao Usuário** | 4 | Padronização dos formulários com **React Hook Form + Zod** e deserialização de erros Blob. |
| **Regressão por Refatoração** | 4 | Ampliação da suíte para **242 testes JUnit 5** e **24 suítes Cypress E2E** no pipeline obrigatório. |
| **Configuração de CI/CD e Build Tools** | 4 | Adição do Quality Gate no SonarQube bloqueando merges caso haja regressão ou falha de plugin. |
| **Desvio de Git Flow / Merge Prematuro** | 1 | Configuração de Rulesets protegendo `main` e `develop` contra merges diretos sem aprovação de PR. |

---

*Documento mantido e auditado pelo Time de Engenharia e QA — AlumiGest — Setembro/2026*

