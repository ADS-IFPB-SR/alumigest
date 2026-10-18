---
description: Substask to pr
---

---

name: subtask-to-pr
description: Fluxo automatizado de desenvolvimento de subtarefas ate o Pull Request. Use quando o usuario pedir para listar tasks atribuidas, selecionar uma task para implementar, criar branch a partir da task principal, fazer commit/push e abrir PR seguindo o padrao do repositorio
---

# Fluxo de Subtask ate Pull Request

Voce tem acesso ao terminal integrado e as ferramentas de edicao de arquivos do IDE. Execute os comandos diretamente no terminal em vez de pedir para o usuario roda-los manualmente, pausando apenas quando a confirmacao do usuario for exigida.

## Passo 1: Ler Tasks Atribuidas e Solicitar Selecao

1. Execute no terminal a listagem de tasks/issues abertas atribuidas ao usuario:

   ```bash
   gh issue list --assignee "@me" --state open --limit 20

(Caso o projeto use arquivos locais de tasks ou MCP, consulte a fonte correspondente).
2. Apresente ao usuario uma lista numerada contendo:

ID / Numero da task (ex: us-17.1 ou #42)

Titulo da task

Branch principal correspondente estimada (ex: 17)

PARE AQUI e pergunte ao usuario qual task ele deseja desenvolver. Aguarde a resposta antes de executar o Passo 2.

Passo 2: Criar Branch a Partir da Task Principal
Assim que o usuario selecionar a task (ex: us-17.1):

Identifique a branch da task principal (ex: para us-17.1, a branch pai e 17).

Execute no terminal a atualizacao das referencias e localize o nome exato da branch pai existente:

Bash
git fetch --all
git branch -a | grep -E "(^|[/-])17($|[^.0-9])"
Faca checkout na branch da task principal, atualize com o remoto e crie a branch da subtarefa a partir dela:

Bash
git checkout <branch-pai>
git pull origin <branch-pai>
git checkout -b <nome-branch-subtask>
(Se a branch pai nao existir localmente nem no remoto, avise o usuario e pergunte de qual branch deve ramificar).

Passo 3: Ler Requisitos e Implementar
Consulte os detalhes e criterios de aceite da task selecionada no terminal:

Bash
gh issue view <id-da-issue>
Analise os arquivos relevantes do repositorio e implemente as alteracoes necessarias seguindo a arquitetura e o estilo de codigo existentes.

Execute a validacao local no terminal (testes, linter ou build do projeto) e corrija eventuais erros antes de avancar.

Passo 4: Commit e Push
Verifique no terminal o padrao dos ultimos commits do repositorio para manter consistencia:

Bash
git log -n 5 --oneline
Verifique os arquivos modificados (git status), adicione as alteracoes pertinentes ao stage e realize o commit referenciando a subtarefa:

Bash
git add <arquivos>
git commit -m "<tipo>(<escopo-ou-id>): <descricao objetiva>"
Envie a branch para o repositorio remoto:

Bash
git push -u origin <nome-branch-subtask>
Passo 5: Abrir Pull Request no Padrao dos PRs Anteriores
Inspecione os ultimos PRs do repositorio e a existencia de template local para replicar a mesma estrutura de titulo e descricao:

Bash
gh pr list --state all --limit 3 --json title,body
cat .github/pull_request_template.md 2>/dev/null || cat .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null
Monte o titulo e o corpo do PR espelhando exatamente as secoes, marcacoes e checklists encontrados nos PRs anteriores.

Crie o Pull Request via terminal apontando a base (--base) para a branch da task principal (ex: 17) e o head (--head) para a branch da subtarefa (ex: us-17.1):

Bash
gh pr create --base <branch-pai> --head <nome-branch-subtask> --title "<titulo-padronizado>" --body "<corpo-seguindo-template>"
Retorne ao usuario o link do Pull Request criado.

Regras de Seguranca
Nunca crie a branch da subtarefa a partir da main ou develop sem antes verificar e fazer checkout na branch da task principal.

Nunca aponte o --base do Pull Request para a main quando se tratar de uma subtarefa derivada de uma branch de historia principal, a menos que o usuario solicite explicitamente.

Se houver alteracoes nao commitadas na arvore de trabalho antes do Passo 2 (git status --porcelain), avise o usuario antes de trocar de branch.

### Requisitos para funcionar sem bloqueios no Antigravity

* **GitHub CLI (`gh`) autenticado:** Rode `gh auth status` no terminal do projeto uma vez para garantir que o agente consiga ler issues e abrir PRs sem travar em prompts de login.
* **Onde salvar:**
  * `.agent/skills/subtask-to-pr/SKILL.md`: O agente carrega automaticamente quando você pede algo como *"Veja minhas tasks e vamos fazer uma"*.
  * `.agent/workflows/subtask-to-pr.md`: Permite acionar diretamente digitando `/subtask-to-pr` no chat do Antigravity.
