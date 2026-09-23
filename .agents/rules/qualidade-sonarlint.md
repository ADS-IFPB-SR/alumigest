---
name: qualidade-sonarlint-pre-pr
description: Protocolo obrigatório de inspeção estática com SonarLint e Checkstyle antes de commits e Pull Requests.
---

# 🛡️ Protocolo de Qualidade — SonarLint & Pre-PR

Antes de realizar qualquer `git commit`, `git push` ou abrir um novo Pull Request no AlumiGest, é **obrigatório** executar e passar na inspeção de qualidade estática para evitar retrabalho no CI:

---

## ☕ 1. Inspeção no Backend (Java / Spring Boot)

### No IntelliJ IDEA:
1. No menu de Commit (`Ctrl + K`), na engrenagem de opções, manter marcada a opção **☑️ Perform SonarLint analysis**.
2. Ou clicar com botão direito nos arquivos alterados ➔ **SonarLint** ➔ **Analyze with SonarLint**.
3. Corrigir qualquer apontamento apontado pelo SonarLint antes de confirmar o commit.

### Regras Sonar de Atenção Prioritária:
- **`java:S1128` (Unused Imports):** Remover todos os imports não utilizados.
- **`java:S1192` (String Literals):** Definir constantes (`private static final String`) para literais repetidos 3 ou mais vezes.
- **`java:S3776` (Cognitive Complexity):** Manter a complexidade cognitiva de métodos sempre $\le 15$.
- **`java:S1141` (Nested try-catch):** Extrair métodos auxiliares para evitar blocos `try-catch` aninhados.
- **`java:S4087` (Redundant close):** Não chamar `.close()` explicitamente em recursos gerenciados por `try-with-resources`.
- **`java:S1172` (Unused Parameters):** Remover parâmetros não utilizados de métodos privados e internos.
- **`java:S5976` (Parameterized Tests):** Agrupar testes repetitivos usando `@ParameterizedTest` com `@CsvSource` ou `@ValueSource`.
- **`java:S1130` (Undeclared Exceptions):** Remover `throws IOException` ou exceções não lançadas de assinaturas de métodos e testes.

### Comandos de Validação Local via Terminal:
```bash
cd backend
./mvnw checkstyle:check
./mvnw test
```

---

## ⚛️ 2. Inspeção no Frontend (React / TypeScript)

```bash
cd frontend
npm run lint
npm run test
```

---

## ✅ 3. Critério de Aceite (Definition of Done)
- [ ] 0 violações no Checkstyle
- [ ] 0 code smells / 0 warnings no SonarLint
- [ ] 100% dos testes unitários passando localmente
