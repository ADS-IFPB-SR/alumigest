---
description: pr-review
---

Markdown
---

name: pr-review
description: Fluxo de revisao de Pull Requests onde o usuario esta assinado como reviewer. Use quando o usuario pedir para listar PRs pendentes de review, analisar codigo de um PR, validar testes/checks ou enviar um review (approve, request-changes ou comment)
---

# Fluxo de Review de Pull Request

Voce possui acesso ao terminal e aos arquivos do projeto no IDE. Execute os comandos de consulta e analise diretamente no terminal, pausando nas etapas de selecao do PR e de confirmacao antes de publicar o review no GitHub.

## Passo 1: Listar PRs Pendentes de Review e Solicitar Selecao

1. Execute no terminal a busca por Pull Requests abertos onde o review do usuario foi solicitado:

   ```bash
   gh pr list --search "review-requested:@me" --state open --json number,title,author,baseRefName,headRefName,updatedAt

Caso a lista retorne vazia, verifique tambem se ha PRs onde o usuario esta listado como assignee ou mencione que nao ha revisoes pendentes no momento.

Exiba os PRs encontrados em uma lista numerada contendo:

Numero (#<id>) e Titulo

Autor

Fluxo de branches (<headRefName> -> <baseRefName>)

PARE AQUI e pergunte ao usuario qual PR ele deseja revisar. Aguarde a resposta antes de prosseguir.

Passo 2: Coletar Contexto, Checks e Diff do PR
Assim que o usuario escolher o PR (ex: #45):

Consulte os detalhes do PR, status do CI e comentarios existentes:

Bash
gh pr view <id> --comments
gh pr checks <id>
Verifique o historico de reviews recentes do repositorio para manter um tom e formato compativeis com a equipe:

Bash
gh pr list --state merged --limit 3 --json number,title,reviews
Inspecione o diff completo das alteracoes:

Bash
gh pr diff <id>
Se a analise exigir leitura de arquivos completos ou execucao de testes locais:

Verifique se a arvore de trabalho local esta limpa (git status --porcelain).

Salve o nome da branch atual (git branch --show-current) para retornar a ela no final.

Faca checkout do PR (gh pr checkout <id>) e rode os testes/linter do projeto.

Passo 3: Analisar o Codigo e a Estrutura do PR
Avalie as mudancas considerando os seguintes criterios praticos:

Branch de destino (baseRefName): Verifique se o PR aponta para a branch correta (ex: se a branch for de uma subtarefa como us-17.1, confirme se o merge aponta para a branch principal 17 e nao diretamente para main por engano).

Aderencia ao escopo: Compare o codigo alterado com a descricao do PR e a task/issue vinculada.

Qualidade tecnica e riscos:

Bugs logicos, tratamento de erros ausente ou casos de borda nao cobertos.

Quebra de contratos de API, tipagem ou padroes arquiteturais do projeto.

Problemas de seguranca (dados sensiveis expostos, falta de validacao de entrada) ou gargalos evidentes de consulta/performance.

Testes e validacao: Verifique se os testes automatizados passam e se novas regras de negocio possuem cobertura adequada.

Passo 4: Apresentar o Parecer e Aguardar Confirmacao
Apresente o resultado da revisao ao usuario no chat, estruturado em:

Resumo do PR: O que foi alterado e se a branch base esta correta.

Bloqueios / Problemas (se houver): Pontos que precisam de correcao antes do merge (indicando arquivo:linha e sugestao de correcao).

Sugestoes / Melhorias opcionais: Ajustes de legibilidade ou organizacao que nao impedem o merge.

Recomendacao de acao: APPROVE, REQUEST_CHANGES ou COMMENT.

Rascunho do comentario final: O texto exato em Markdown que sera enviado no GitHub.

PARE AQUI e pergunte ao usuario se ele concorda com o parecer, se deseja editar algum ponto do texto ou alterar a decisao (approve / request-changes / comment).

Passo 5: Publicar o Review e Restaurar Ambiente
Apos a confirmacao do usuario:

Envie o review pelo terminal conforme a decisao escolhida:

Bash

# Para aprovar

gh pr review <id> --approve --body "<corpo-do-review>"

# Para solicitar alteracoes

gh pr review <id> --request-changes --body "<corpo-do-review>"

# Para apenas comentar

gh pr review <id> --comment --body "<corpo-do-review>"
Caso tenha feito gh pr checkout <id> no Passo 2, retorne para a branch original em que o usuario estava trabalhando:

Bash
git checkout <branch-original>
Confirme ao usuario que o review foi registrado no GitHub.

Regras de Seguranca
Nunca publique um review (gh pr review) sem antes mostrar o rascunho no chat e receber a confirmacao explicita do usuario.

Nao altere nem faca commit de codigo na branch do PR revisado, a menos que o usuario peca explicitamente para aplicar uma correcao diretamente nela.

Evite apontar preferencias puramente estilisticas se o linter/formatter do projeto ja estiver passando sem erros; foque em comportamento, manutencao e corretude.
