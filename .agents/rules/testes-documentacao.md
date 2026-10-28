# Diretrizes de Governança de Testes e Formatação de Documentação de QA

## 1. Tríade Documental de Testes por Sprint (Docs-as-Code)
Toda sprint no AlumiGest deve manter sua tríade documental consolidada exclusivamente na pasta `docs/projeto-001/003-teste/sprint-XX/`:
1. **TEA-Testes_de_Aceitacao_SprintXX.md:** Planejamento e critérios formais BDD (Cenário, Arquivo .cy.ts, Estratégia [Real Fullstack vs Mockado com cy.intercept], Massa de Teste, Dado, Quando, Então, Status).
2. **RTM-Roteiro_de_Testes_Manuais_SprintXX.md:** Guia operacional passo a passo para reprodução e homologação manual pelo Product Owner (PO) e validadores.
3. **RET-Relatorio_Execucao_Testes_SprintXX.md:** Relatório formal de execução automatizada, métricas SonarQube, duração de cada it(), PRs e catalogação de defeitos no RBD.

> **Nota de Governança:** Pastas legadas como `docs/sistema/003-teste/` devem conter apenas ponteiros e redirecionamentos para a pasta canônica da sprint em `docs/projeto-001/003-teste/sprint-XX/`.

## 2. Padrão Rígido de Formatação para Roteiros de Testes Manuais (RTM)
- **PROIBIDO:** Nunca utilize tabelas Markdown para descrever passos de execução de testes manuais (anti-padrão de colunas `Passo | Ação | Comportamento | Validação`). Células de tabelas com múltiplas linhas ou caracteres especiais quebram o parser de Markdown e colapsam o texto em uma linha única crua e ilegível no preview do VS Code.
- **OBRIGATÓRIO:** Toda especificação de passo a passo de teste manual deve utilizar **Fichas Operacionais Executivas**:
  - Título com ID do cenário: `### 🧪 Cenário RTM-XXX-01: [Título do Cenário]`
  - Metadados em lista com marcadores:
    - **Objetivo:** [Descrição clara da finalidade]
    - **Equivalente Automatizado:** `cypress/e2e/...cy.ts`
    - **Ponto de Partida:** Rota inicial (`/pedidos/kanban`, etc.) e pré-condições
  - Passos operacionais numerados (`1.`, `2.`, `3.`):
    - Ação em negrito: **Clicar**, **Preencher**, **Arrastar**.
    - Elemento de interface com seletor exato em código: `[data-testid="..."]`.
    - Resultado imediato esperado descrito logo abaixo da ação.
  - Critérios de aceitação com caixas de marcação (`- [ ]`).
  - Tabelas Markdown são permitidas **APENAS** para matrizes de resumo compactas (ex: Matriz de Defesa contra Defeitos, Tabela Resumo de Execução).
