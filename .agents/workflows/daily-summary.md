---
description: Gera o resumo diario (Daily Scrum) minimalista inspecionando commits recentes, PRs abertos/revisados e tasks em andamento no Git/GitHub. Use quando o usuario pedir para gerar a daily, resumo do dia, status da sprint ou o que fez ontem/hoje
---

# Gerador de Resumo para Daily

Coleta os dados reais do repositório e do GitHub CLI (`gh`) para gerar o resumo da Daily Scrum em formato estritamente **minimalista e direto ao ponto**, com marcadores `*`.

## Passo 1: Coletar Histórico Recente ("O que fiz")

Execute os comandos abaixo no terminal para identificar entregas, commits e Code Reviews recentes do usuário (últimas 24h a 72h):

```bash
# 1. Data atual no formato DD/MM
date +"%d/%m"

# 2. Commits recentes do usuario em todas as branches locais
git log --all --author="$(git config user.name)" --since="3 days ago" --oneline

# 3. PRs criados pelo usuario recentemente (abertos ou mergeados)
gh pr list --author "@me" --state all --limit 5 --json number,title,state,updatedAt

# 4. PRs revisados ou comentados pelo usuario recentemente
gh pr list --search "reviewed-by:@me" --state all --limit 5 --json number,title,updatedAt
```

## Passo 2: Coletar Trabalho Atual e Próximos Passos ("O que vou fazer")

Execute os comandos abaixo para descobrir no que o usuário está trabalhando no momento ou qual é a próxima task:

```bash
# 1. Branch atual e arquivos sendo modificados no momento
git branch --show-current
git status --short

# 2. Issues/Tasks abertas atribuidas ao usuario
gh issue list --assignee "@me" --state open --limit 5 --json number,title,labels
```

## Passo 3: Impedimentos

Por padrão, preencha como `Nenhum.`, a menos que o usuário tenha mencionado algum bloqueio explícito ou exista erro/falha impeditiva na branch atual.

## Passo 4: Formatar e Entregar o Resumo

Sintetize as informações de forma **estritamente minimalista**, sem parágrafos longos ou descrições extensas de código/arquitetura.

### Regras de Redação:
1. **Cabeçalho:** Apenas a data `<DD/MM>` (sem número de Sprint).
2. **Listagem com `*`:** Cada item de "O que fiz:" e "O que vou fazer:" deve ser uma linha iniciando com `* `.
3. **Padrão dos itens:**
   - Novas funcionalidades: `* Implementação da US-X.Y (#Issue, PR #PR)`
   - Correções de bug: `* Correção do BUG-XXX (#Issue, PR #PR)`
   - Code Reviews: `* Code Review dos PRs #X e #Y` (agrupar os PRs revisados na mesma linha)
   - Próximo passo: `* Implementação da US-X.Y (#Issue)` ou `* Correção do BUG-XXX (#Issue)`
4. **Impedimento:** Em linha única (`Impedimento: Nenhum.` ou descrição direta e curta).
5. **Sem decorações extras:** Sem negritos, sem emojis e sem bullet points adicionais.

### Template Estrito:

```plaintext
<DD/MM>
O que fiz:
* <Item 1>
* <Item 2>
O que vou fazer:
* <Item 1>
Impedimento: <Nenhum. ou descrição direta do bloqueio>
```

### Exemplo de Saída Esperada:

```plaintext
16/10
O que fiz:
* Implementação da US-17.2 (#449, PR #465)
* Correção do BUG-039 (#436, PR #466)
* Code Review dos PRs #463 e #464
O que vou fazer:
* Correção do BUG-040 (#437)
Impedimento: Nenhum.
```
