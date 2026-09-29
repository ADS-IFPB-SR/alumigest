# SPEC — Integração SonarQube ao Pipeline CI/CD

> **Fase:** CI/SonarQube Pipeline  
> **Branch:** `ci/sonarqube-pipeline` (Mergeado via PR #78 na `develop`)  
> **Versão:** 2.0 (Concluído e Homologado no Pipeline)  
> **Data:** 31 de Agosto de 2026  
> **Autor:** Italo Jefferson  
> **Status:** 🟢 Concluído e em Produção  

---

## 1. Objetivo

Integrar o **SonarQube Community Edition** (self-hosted no Coolify em `https://sonar.italohub.cloud`) ao pipeline de CI do GitHub Actions, produzindo **dois relatórios de qualidade completamente independentes** — um para o Backend (Java 21 / Spring Boot 3.4 / Maven / JaCoCo) e outro para o Frontend (React 18 / TypeScript / Vite / Oxlint) — aplicando a metodologia **Clean as You Code** com Quality Gates para monitoramento de segurança (SAST), bugs e cobertura de testes.

---

## 2. Contexto e Decisão Arquitetural

### 2.1 Resolução do Problema

| Dimensão | Antes da Integração | Estado Atual (Homologado via PR #78) |
|---|---|---|
| **Análise Estática** | Apenas Checkstyle (backend) e Oxlint (frontend) | Análise estática avançada SAST (CWE/OWASP), detecção de code smells e bugs interprocedurais |
| **Cobertura de Testes** | Sem relatório de cobertura | Relatório JaCoCo XML gerado no `mvn verify` e enviado ao SonarQube (`> 80%` nos Services) |
| **Quality Gate** | Inexistente | Quality Gate ativo no SonarQube para novas features |
| **Dívida Técnica** | Não rastreada | Visibilidade contínua de duplicação, complexidade ciclomática e débito técnico |

### 2.2 Decisão Arquitetural: Dois Projetos Segregados no SonarQube
* **AlumiGest Backend (`alumigest-backend`):** Varrido via `sonar-maven-plugin` + JaCoCo XML.
* **AlumiGest Frontend (`alumigest-frontend`):** Varrido via `sonarsource/sonarqube-scan-action@v4` utilizando `frontend/sonar-project.properties`.

---

## 3. Infraestrutura e Configuração

### 3.1 Instância SonarQube no Coolify

| Atributo | Valor |
|---|---|
| **Service ID Coolify** | `service-axr94sqamu17cmcer1k8afao` |
| **UUID** | `xhyzzqsj4z6sejspbkojdnak` |
| **Imagem** | `sonarqube:community` |
| **Banco de Dados** | PostgreSQL 15 (`sonarqube-db`) |
| **URL Pública** | `https://sonar.italohub.cloud` |
| **Proxy** | Traefik (gerenciado pelo Coolify) |

### 3.2 Projetos Registrados

| Projeto | Project Key | Linguagens | Escopo |
|---|---|---|---|
| **AlumiGest Backend** | `alumigest-backend` | Java 21 | `backend/src/main/java/**` |
| **AlumiGest Frontend** | `alumigest-frontend` | TypeScript, JavaScript, CSS | `frontend/src/**` |

### 3.3 GitHub Actions Secrets
* `SONAR_HOST_URL`: `https://sonar.italohub.cloud`
* `SONAR_TOKEN`: Token de autenticação gerado no painel do SonarQube.

---

## 4. Implementação Técnica

### 4.1 Backend (`backend/pom.xml`)
Configuração dos plugins `jacoco-maven-plugin` (v0.8.13) e `sonar-maven-plugin` (v5.0.0.4389):

```xml
<!-- Exclusões do Sonar para DTOs, Configs e Application -->
<properties>
    <sonar.coverage.exclusions>
        **/dto/**,
        **/domain/**,
        **/config/**,
        **/exception/**,
        **/br/edu/ifpb/alumigest/AlumiGestApplication.java
    </sonar.coverage.exclusions>
</properties>

<!-- JaCoCo Plugin -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.13</version>
    <executions>
        <execution>
            <id>prepare-agent</id>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>verify</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

### 4.2 Frontend (`frontend/sonar-project.properties`)

```properties
sonar.projectKey=alumigest-frontend
sonar.projectName=AlumiGest Frontend
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/dist/**,**/*.d.ts,**/types/**,src/main.tsx,src/vite-env.d.ts
```

---

### 4.3 GitHub Actions CI (`.github/workflows/ci.yml`)

O workflow executa a análise nos pushes e pull requests para `main` e `develop`:

```yaml
# Backend CI Step
- name: SonarQube Analysis (Backend)
  if: github.event_name == 'push' || github.event_name == 'pull_request'
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
  run: |
    cd backend
    ./mvnw org.sonarsource.scanner.maven:sonar-maven-plugin:sonar \
      -Dsonar.projectKey=alumigest-backend \
      -Dsonar.projectName="AlumiGest Backend" \
      -Dsonar.host.url=$SONAR_HOST_URL \
      -Dsonar.token=$SONAR_TOKEN \
      -Dsonar.java.coveragePlugin=jacoco \
      -Dsonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml

# Frontend CI Step
- name: SonarQube Analysis (Frontend)
  if: github.event_name == 'push' || github.event_name == 'pull_request'
  uses: sonarsource/sonarqube-scan-action@v4
  with:
    projectBaseDir: frontend/
  env:
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
    SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
```

---

## 5. Critérios de Aceite e Definition of Done (DoD)

- [x] Plugin JaCoCo configurado no `backend/pom.xml` gerando relatório `jacoco.xml` no `verify`.
- [x] Configuração `frontend/sonar-project.properties` criada com exclusões adequadas.
- [x] Pipeline `.github/workflows/ci.yml` configurado com jobs paralelos para Backend e Frontend.
- [x] Secrets `SONAR_HOST_URL` e `SONAR_TOKEN` configurados no repositório GitHub.
- [x] Execuções de CI com SonarQube validadas com sucesso na branch `develop`.
- [x] Exclusão de classes anêmicas e DTOs da métrica de cobertura via `<sonar.coverage.exclusions>`.

---

*Especificação Técnica homologada e em operação — Versão 2.0 — 31/08/2026*
