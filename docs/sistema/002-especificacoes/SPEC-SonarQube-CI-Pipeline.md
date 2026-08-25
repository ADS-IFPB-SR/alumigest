# SPEC — Integração SonarQube ao Pipeline CI/CD

> **Fase:** CI/SonarQube Pipeline  
> **Branch:** `ci/sonarqube-pipeline`  
> **Versão:** 1.0  
> **Data:** 2026-08-24  
> **Autor:** Italo Jefferson  
> **Status:** 🟡 Em Revisão

---

## 1. Objetivo

Integrar o **SonarQube Community Edition** (self-hosted no Coolify) ao pipeline de CI do GitHub Actions, produzindo **dois relatórios de qualidade completamente independentes** — um para o Backend (Java 21 / Spring Boot / Maven) e outro para o Frontend (React 19 / TypeScript / Vite) — aplicando a metodologia **Clean as You Code** com Quality Gates que bloqueiam o merge de Pull Requests que não atendam os critérios mínimos de qualidade.

---

## 2. Contexto e Motivações

### 2.1 Problema Atual

| Dimensão | Estado Atual | Impacto |
|---|---|---|
| **Análise estática** | Apenas Checkstyle (backend) e Oxlint (frontend) | Não detecta vulnerabilidades SAST, bugs de fluxo, nem vazamentos de recursos |
| **Cobertura de testes** | Sem relatório de cobertura gerado | Impossível medir se código novo vem testado |
| **Quality Gate** | Inexistente | PRs podem ser mergeados com vulnerabilidades, bugs ou zero cobertura |
| **Métricas de dívida técnica** | Não rastreadas | Sem visibilidade sobre duplicação, complexidade ciclomática ou code smells |

### 2.2 Decisão Arquitetural

**Opção escolhida: Dois Projetos Separados no SonarQube** (Opção 1 — aprovada pelo usuário).

**Justificativa:**
- O SonarQube Community Edition não suporta nativamente monorepos com PR Decoration múltiplo em um único projeto.
- Métricas de cobertura, linguagens e regras de análise são fundamentalmente diferentes entre Java e TypeScript/React.
- Quality Gates independentes permitem que cada stack evolua no seu ritmo sem bloquear a outra.

### 2.3 Referências do Projeto

- [ATA Sprint 02 — Daily 14/08](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/001-atas-reuniao/ATA-Sprint_02_Daily_14_08_2026.md) — Discussão sobre estratégia de testes e SonarQube.
- [ATA Sprint 02 — Reunião 11/08](file:///c:/Users/italo/Desktop/Projects/alumigest/docs/projeto-001/001-atas-reuniao/ATA-Sprint_02_Reuniao_11_08_2026.md) — Exigência de CI/CD com SonarQube para prevenir regressões.

---

## 3. Infraestrutura

### 3.1 SonarQube no Coolify

| Atributo | Valor |
|---|---|
| **Service ID Coolify** | `service-axr94sqamu17cmcer1k8afao` |
| **UUID** | `xhyzzqsj4z6sejspbkojdnak` |
| **Imagem** | `sonarqube:community` |
| **Banco de Dados** | PostgreSQL 15 (`sonarqube-db`) |
| **URL Pública** | `https://sonar.italohub.cloud` |
| **Proxy** | Traefik (gerenciado pelo Coolify) |

### 3.2 Projetos no SonarQube

| Projeto | Project Key | Linguagens | Escopo |
|---|---|---|---|
| **AlumiGest Backend** | `alumigest-backend` | Java 21 | `backend/src/main/java/**` |
| **AlumiGest Frontend** | `alumigest-frontend` | TypeScript, JavaScript, CSS | `frontend/src/**` |

### 3.3 Secrets do GitHub Actions

| Secret | Descrição | Obrigatório |
|---|---|---|
| `SONAR_HOST_URL` | `https://sonar.italohub.cloud` | ✅ |
| `SONAR_TOKEN` | Token global gerado no SonarQube (ou 2 tokens separados) | ✅ |

> **Alternativa com 2 tokens:** Se preferir isolamento de permissões, gerar `SONAR_TOKEN_BACKEND` e `SONAR_TOKEN_FRONTEND` separados no painel Administration > Security > Users > Tokens do SonarQube.

---

## 4. Requisitos Funcionais

### RF-01 — Relatório de Cobertura JaCoCo (Backend)

**O QUE:** O plugin JaCoCo deve ser adicionado ao `backend/pom.xml` para gerar o relatório XML de cobertura de testes unitários.

**Critérios de Aceite:**
- [ ] O plugin `jacoco-maven-plugin` está declarado na seção `<build><plugins>` do `pom.xml`.
- [ ] A execução `prepare-agent` instrumenta as classes antes dos testes.
- [ ] A execução `report` gera o arquivo `target/site/jacoco/jacoco.xml` após o `test` phase.
- [ ] O comando `./mvnw clean verify` termina com sucesso e o arquivo `jacoco.xml` existe no filesystem.

**Fronteira:** NÃO inclui enforcement de cobertura mínima via plugin Maven (isso é responsabilidade do Quality Gate do SonarQube).

---

### RF-02 — Scan do Backend no SonarQube (Job CI)

**O QUE:** O job `backend-ci` no GitHub Actions deve executar a análise SonarQube após o build e testes, enviando métricas para o projeto `alumigest-backend`.

**Critérios de Aceite:**
- [ ] O plugin `sonar-maven-plugin` é invocado via `./mvnw sonar:sonar` com os parâmetros:
  - `-Dsonar.projectKey=alumigest-backend`
  - `-Dsonar.projectName=AlumiGest Backend`
  - `-Dsonar.host.url=${{ secrets.SONAR_HOST_URL }}`
  - `-Dsonar.token=${{ secrets.SONAR_TOKEN }}`
  - `-Dsonar.java.coveragePlugin=jacoco`
  - `-Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml`
- [ ] A análise aparece no dashboard do SonarQube em `https://sonar.italohub.cloud/dashboard?id=alumigest-backend`.
- [ ] As métricas de cobertura, bugs, vulnerabilidades, code smells e duplicação estão populadas.

**Fronteira:** O scan do backend NÃO deve varrer arquivos do frontend.

---

### RF-03 — Scan do Frontend no SonarQube (Job CI)

**O QUE:** O job `frontend-ci` no GitHub Actions deve executar a análise SonarQube usando o `sonarqube-scan-action`, enviando métricas para o projeto `alumigest-frontend`.

**Critérios de Aceite:**
- [ ] Um arquivo `frontend/sonar-project.properties` é criado com:
  ```properties
  sonar.projectKey=alumigest-frontend
  sonar.projectName=AlumiGest Frontend
  sonar.sources=src
  sonar.exclusions=**/node_modules/**,**/dist/**,**/*.test.*,**/*.spec.*
  sonar.typescript.tsconfigPaths=tsconfig.json,tsconfig.app.json
  sonar.sourceEncoding=UTF-8
  ```
- [ ] O step usa `sonarsource/sonarqube-scan-action@v4` com `projectBaseDir: frontend/`.
- [ ] A análise aparece no dashboard do SonarQube em `https://sonar.italohub.cloud/dashboard?id=alumigest-frontend`.
- [ ] O scan detecta e reporta: code smells de TypeScript, complexidade de componentes React, uso abusivo de `any`, problemas de acessibilidade em JSX.

**Fronteira:** O frontend atualmente NÃO possui framework de testes configurado (`jest`, `vitest`). A cobertura será reportada como 0% até que testes unitários sejam adicionados em fase futura. Isso é **aceito e esperado**.

---

### RF-04 — Disparo Condicional (Paths Filter)

**O QUE:** A análise SonarQube de cada stack deve executar somente quando há mudanças relevantes na respectiva pasta, evitando scans desnecessários e consumo de recursos.

**Critérios de Aceite:**
- [ ] O job `backend-ci` só executa o scan Sonar se houver arquivos alterados em `backend/**`.
- [ ] O job `frontend-ci` só executa o scan Sonar se houver arquivos alterados em `frontend/**`.
- [ ] Alterações em arquivos da raiz (`.github/`, `docs/`, `README.md`) NÃO disparam nenhum dos dois scans.
- [ ] Alterações mistas (`backend/` + `frontend/` no mesmo PR) disparam ambos os scans em paralelo.

**Implementação sugerida:** Utilizar `dorny/paths-filter@v3` ou condicionais nativas de `paths:` do GitHub Actions.

---

### RF-05 — Quality Gate Padrão

**O QUE:** Os dois projetos devem usar o Quality Gate padrão do SonarQube ("Sonar way") com a metodologia Clean as You Code.

**Critérios de Aceite (métricas avaliadas sobre código NOVO):**

| Métrica | Threshold | Descrição |
|---|---|---|
| **New Vulnerabilities** | 0 | Zero vulnerabilidades de segurança no código novo |
| **New Bugs** | 0 | Zero bugs de severidade alta/bloqueante no código novo |
| **New Code Coverage** | ≥ 80% | Cobertura mínima de testes no código novo (backend) |
| **Duplicated Lines (New)** | < 3% | Limite de duplicação no código novo |
| **Security Hotspots** | 100% revisados | Todos os hotspots auditados antes do merge |

> **Nota sobre o Frontend:** Como não há testes configurados, a métrica de cobertura será N/A temporariamente. Recomenda-se criar um Quality Gate customizado `AlumiGest Frontend` sem a regra de cobertura até que Vitest/Jest seja integrado.

**Fronteira:** A configuração dos Quality Gates é feita **manualmente no painel do SonarQube**, não via código. O SPEC documenta os thresholds esperados, mas a criação dos gates é um passo manual pós-deploy.

---

## 5. Requisitos Não-Funcionais

### RNF-01 — Segurança de Credenciais
- O token do SonarQube NUNCA deve aparecer em código-fonte, logs de CI ou artefatos de build.
- Deve ser armazenado exclusivamente como GitHub Actions Secret.
- O `sonar-project.properties` do frontend NÃO deve conter `sonar.token` nem `sonar.host.url` (esses são passados via environment variables no workflow).

### RNF-02 — Performance do Pipeline
- O scan do SonarQube é executado **em paralelo** com os jobs existentes (o backend e frontend já rodam em paralelo).
- O scan NÃO deve aumentar o tempo total do pipeline em mais de 3 minutos por job.

### RNF-03 — Idempotência
- Múltiplas execuções do pipeline sobre o mesmo commit devem produzir o mesmo resultado no SonarQube.
- O scan deve funcionar tanto em pushes diretos quanto em Pull Requests.

---

## 6. Dimensões de Análise por Stack

### 6.1 Backend — Java 21 / Spring Boot

| Categoria | O que o SonarQube detecta |
|---|---|
| **Segurança (SAST)** | SQL/JPQL Injection, exposição de dados em logs (CWE-532), hardcoded secrets, CORS/CSRF inseguro, desserialização insegura, algoritmos criptográficos obsoletos (MD5, SHA-1) |
| **Bugs e Confiabilidade** | `NullPointerException` por análise interprocedural, vazamentos de recursos (JDBC, streams, EntityManager sem try-with-resources), problemas de concorrência e thread safety, deadlocks potenciais |
| **Manutenibilidade** | Complexidade ciclomática/cognitiva excessiva, violações OOP, `@Transactional` mal posicionado, acoplamento de classes, herança profunda, contratos `equals`/`hashCode` quebrados |
| **Cobertura** | Percentual de linhas e branches cobertos por JUnit 5 (via JaCoCo XML) |
| **Duplicação** | Blocos de código duplicados entre classes e pacotes |

### 6.2 Frontend — React 19 / TypeScript 6

| Categoria | O que o SonarQube detecta |
|---|---|
| **Segurança (Client-Side SAST)** | XSS via `dangerouslySetInnerHTML` / `innerHTML`, open redirects, uso inseguro de `window.postMessage` e `localStorage` para tokens, ReDoS em expressões regulares |
| **Bugs de Estado e Ciclo de Vida** | Vazamentos de memória (falta de cleanup em `useEffect`), violação de regras de Hooks (dependências omitidas em `useMemo`/`useCallback`/`useEffect`), mutação direta de estado/props, Promises sem `await`/`catch` |
| **Qualidade de Tipagem** | Uso abusivo de `any`, type assertions arriscadas que anulam segurança do TypeScript |
| **Acessibilidade (a11y/WCAG)** | Atributos `alt` ausentes em imagens, elementos clicáveis sem `role` semântico, labels de formulário órfãs |
| **Performance de Bundle** | Importações redundantes, seletores CSS de alta especificidade |

---

## 7. Arquivos Afetados

### Arquivos a CRIAR

| Arquivo | Descrição |
|---|---|
| `frontend/sonar-project.properties` | Configuração do SonarScanner para o projeto frontend |

### Arquivos a MODIFICAR

| Arquivo | Alteração |
|---|---|
| `backend/pom.xml` | Adicionar plugin `jacoco-maven-plugin` com execuções `prepare-agent` e `report` |
| `.github/workflows/ci.yml` | Adicionar steps de SonarQube scan nos jobs `backend-ci` e `frontend-ci` |

### Arquivos que NÃO serão tocados

- Nenhum arquivo de código-fonte Java (`backend/src/main/java/**`)
- Nenhum arquivo de código-fonte React/TypeScript (`frontend/src/**`)
- Nenhum arquivo de testes existente
- Nenhuma migration Flyway

---

## 8. Fora do Escopo (Fronteiras Explícitas)

| Item | Motivo |
|---|---|
| Configuração de testes no Frontend (Vitest/Jest) | Será feita na Sprint 3, issue QA-01 (#71) |
| PR Decoration (comentários automáticos no PR) | Requer SonarQube Developer Edition (pago) |
| Configuração de Webhooks do SonarQube para GitHub | Pode ser feito pós-deploy como melhoria, não é bloqueante |
| Enforcement de cobertura mínima via plugin Maven | Delegado ao Quality Gate do SonarQube |
| Criação manual dos projetos no painel do SonarQube | Passo manual documentado no README, não é código |
| Scan de branches de feature (fora de `main`/`develop`) | Requer configuração adicional futura |

---

## 9. Passos Manuais Pós-Deploy

Após o merge da branch `ci/sonarqube-pipeline` na `develop`, os seguintes passos manuais devem ser executados:

1. **No SonarQube (`https://sonar.italohub.cloud`):**
   - [ ] Fazer login com credenciais de admin
   - [ ] Criar projeto manual: Key = `alumigest-backend`, Name = `AlumiGest Backend`
   - [ ] Criar projeto manual: Key = `alumigest-frontend`, Name = `AlumiGest Frontend`
   - [ ] Gerar token de autenticação em Administration > Security > Users > Tokens
   - [ ] (Opcional) Criar Quality Gate customizado `AlumiGest Frontend` sem regra de cobertura

2. **No GitHub (`Settings > Secrets and variables > Actions`):**
   - [ ] Adicionar Secret `SONAR_HOST_URL` = `https://sonar.italohub.cloud`
   - [ ] Adicionar Secret `SONAR_TOKEN` = `<token_gerado_no_passo_anterior>`

3. **Validação:**
   - [ ] Fazer push de um commit na `develop` e verificar que ambos os dashboards são populados
   - [ ] Abrir um PR de teste e verificar que o Quality Gate é avaliado

---

## 10. Critérios de Aceite da Fase (Definition of Done)

- [ ] `backend/pom.xml` contém o plugin JaCoCo configurado e funcional
- [ ] `frontend/sonar-project.properties` existe com as configurações corretas
- [ ] `.github/workflows/ci.yml` contém os steps de SonarQube para ambos os jobs
- [ ] O pipeline executa com sucesso em push para `develop`
- [ ] O dashboard `alumigest-backend` no SonarQube mostra métricas de cobertura, bugs, vulnerabilidades e code smells
- [ ] O dashboard `alumigest-frontend` no SonarQube mostra métricas de bugs, vulnerabilidades e code smells
- [ ] Nenhum token ou credencial é exposta em código-fonte ou logs
- [ ] O tempo total do pipeline não aumenta mais de 3 minutos por job
