# 📋 RTM — Roteiro de Testes Manuais — Sprint 02

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 02 — Catálogo de Materiais Universais e Fichas Técnicas de Produtos |
| **Documento Equivalente BDD** | [`TEA-Testes_de_Aceitacao_Sprint02.md`](./TEA-Testes_de_Aceitacao_Sprint02.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint02.md`](./RET-Relatorio_Execucao_Testes_Sprint02.md) |
| **Perfil Executor** | Product Owner (PO), Analista de QA e Homologadores de Negócio |
| **Ambiente de Teste** | Homologação Local (`http://localhost:5173`) |
| **Data de Emissão** | 18/08/2026 |

---

## 1. Instruções para os Homologadores

Este roteiro guia a validação operacional manual das funcionalidades do **Catálogo de Materiais** entregues na Sprint 02. Cada cenário abaixo reproduz passo a passo os fluxos automatizados nas suítes Cypress, permitindo inspecionar o comportamento dos modais, máscaras monetárias, validações Zod e filtros de abas.

### Pré-requisitos de Ambiente:
1. Backend ativo e migrado: `mvn spring-boot:run` (ou porta 8080)
2. Frontend ativo: `npm run dev` (ou porta 5173)
3. Usuário autenticado com perfil habilitado no catálogo

---

## 2. Fichas Operacionais de Execução Manual

### 🧪 Cenário RTM-S02-01: Cadastro de Vidros com Validação Dimensional e de Preço

* **Objetivo:** Validar a criação de um novo vidro no catálogo, conferindo o preenchimento de espessura (mm), NCM, preço por $m^2$ e renderização na tabela.
* **Equivalente Automatizado:** `cypress/e2e/catalog/catalog-glass.cy.ts`
* **Ponto de Partida:** Rota `/` (Catálogo de Materiais)

#### 👣 Passos de Execução:
1. **Acessar o Catálogo:** Navegar até `http://localhost:5173/` e confirmar a visualização do título `[data-cy="catalog-title"]` ("Catálogo de Materiais").
2. **Selecionar a Aba de Vidros:** Clicar na aba `[data-cy="catalog-tab-glasses"]`.
3. **Abrir o Modal de Inclusão:** Clicar no botão `[data-cy="new-material-button"]`.
4. **Escolher o Tipo de Insumo:** No modal `[data-cy="material-type-modal"]`, clicar na opção `[data-cy="material-type-glass"]`.
5. **Preencher os Campos Obrigatórios:**
   * Campo `[data-cy="glass-form-name"]`: Digitar `Vidro Canelado 4mm`
   * Campo `[data-cy="glass-form-ncm"]`: Digitar `7005.29.00`
   * Campo `[data-cy="glass-form-thickness"]`: Selecionar `4.0`
   * Campo `[data-cy="glass-form-color-finish"]`: Digitar `Incolor`
   * Campo `[data-cy="glass-form-cost-price"]`: Digitar `70.00`
   * Campo `[data-cy="glass-form-sale-price"]`: Digitar `110.00`
6. **Submeter o Formulário:** Clicar no botão `[data-cy="glass-form-save-button"]`.
7. **Verificar a Notificação:** Aguardar a exibição do toast de sucesso: `"Vidro cadastrado com sucesso!"`.
8. **Validar na Tabela:** Confirmar que a tabela `[data-cy="glass-table"]` exibe a nova linha com o nome em maiúsculas, espessura 4mm e preço R$ 110,00.

#### ✅ Critérios de Aceitação:
- [ ] O modal de seleção de material fecha automaticamente após a escolha do tipo.
- [ ] O toast de sucesso surge no canto superior direito sem erros no console DevTools (F12).
- [ ] O item recém-cadastrado é listado imediatamente na tabela de vidros sem necessidade de recarregar a página (F5).

---

### 🧪 Cenário RTM-S02-02: Cadastro de Perfis de Alumínio em Barras de 3m e 6m

* **Objetivo:** Validar o cadastro de perfis de alumínio com referências comerciais de catálogo (ex: Rometal / Alternativa), tamanho padrão de barra e NCM.
* **Equivalente Automatizado:** `cypress/e2e/catalog/catalog-profile.cy.ts`
* **Ponto de Partida:** Rota `/` (Catálogo de Materiais)

#### 👣 Passos de Execução:
1. **Acessar a Aba de Perfis:** Clicar na aba `[data-cy="catalog-tab-profiles"]`.
2. **Abrir o Formulário:** Clicar em `[data-cy="new-material-button"]` e selecionar `[data-cy="material-type-profile"]`.
3. **Preencher os Metadados do Perfil:**
   * Campo `[data-cy="profile-form-name"]`: Digitar `Perfil Puxador S83`
   * Campo `[data-cy="profile-form-line"]`: Digitar `Rometal`
   * Campo `[data-cy="profile-form-ref"]`: Digitar `S83`
   * Campo `[data-cy="profile-form-bar-length"]`: Selecionar `3.00`
   * Campo `[data-cy="profile-form-weight"]`: Digitar `0.450`
   * Campo `[data-cy="profile-form-sale-price"]`: Digitar `45.00`
4. **Salvar o Registro:** Clicar em `[data-cy="profile-form-save-button"]`.
5. **Conferir Listagem:** Localizar o item na `[data-cy="profile-table"]` e validar se a referência `S83` está legível e o comprimento da barra consta como 3,00m.

#### ✅ Critérios de Aceitação:
- [ ] O formulário aplica a máscara dimensional sem travar o teclado.
- [ ] O perfil é gravado com o status ATIVO por padrão.
- [ ] Tentativa de cadastrar outro perfil com a mesma referência `S83` na mesma linha exibe alerta de duplicidade (HTTP 409).

---

### 🧪 Cenário RTM-S02-03: Cadastro de Películas Decorativas e Solares por m²

* **Objetivo:** Validar a inclusão de películas arquiteturais com precificação em metro quadrado ($m^2$).
* **Equivalente Automatizado:** `cypress/e2e/catalog/catalog-film.cy.ts`
* **Ponto de Partida:** Rota `/` (Catálogo de Materiais)

#### 👣 Passos de Execução:
1. **Acessar a Aba de Películas:** Clicar na aba `[data-cy="catalog-tab-films"]`.
2. **Abrir o Modal:** Clicar em `[data-cy="new-material-button"]` e escolher `[data-cy="material-type-film"]`.
3. **Preencher os Campos da Película:**
   * Campo `[data-cy="film-form-name"]`: Digitar `Película Fumê G5`
   * Campo `[data-cy="film-form-type"]`: Selecionar `Fumê`
   * Campo `[data-cy="film-form-sale-price"]`: Digitar `35.00`
4. **Confirmar a Criação:** Clicar em `[data-cy="film-form-save-button"]`.
5. **Conferência Visual:** Verificar a inclusão na `[data-cy="film-table"]` com a indicação da unidade monetária por $m^2$.

#### ✅ Critérios de Aceitação:
- [ ] O campo de tipo restringe opções aos valores permitidos (`FUMÊ`, `JATEADA`, `LEITOSA`, `ESPELHADA`).
- [ ] O preço de custo e venda aceita casas decimais com vírgula ou ponto conforme a localidade pt-BR.

---

### 🧪 Cenário RTM-S02-04: Cadastro de Ferragens com Unidades Flexíveis (UN, PAR, METRO)

* **Objetivo:** Validar o suporte a múltiplas unidades de comercialização de ferragens e acessórios para esquadrias.
* **Equivalente Automatizado:** `cypress/e2e/catalog/catalog-hardware.cy.ts`
* **Ponto de Partida:** Rota `/` (Catálogo de Materiais)

#### 👣 Passos de Execução:
1. **Acessar a Aba de Ferragens:** Clicar na aba `[data-cy="catalog-tab-hardwares"]`.
2. **Abrir o Cadastro:** Clicar em `[data-cy="new-material-button"]` e selecionar `[data-cy="material-type-hardware"]`.
3. **Preencher Ferragem em PAR:**
   * Campo `[data-cy="hardware-form-name"]`: Digitar `Kit Roldana Dupla Côncava`
   * Campo `[data-cy="hardware-form-unit"]`: Selecionar `PAR`
   * Campo `[data-cy="hardware-form-sale-price"]`: Digitar `28.00`
4. **Salvar:** Clicar no botão `[data-cy="hardware-form-save-button"]`.
5. **Cadastrar Ferragem Linear (METRO):** Repetir o processo informando `Escova de Vedação 5x7` com unidade `METRO` e preço `3.50`.

#### ✅ Critérios de Aceitação:
- [ ] A unidade de medida selecionada (`PAR` ou `METRO`) é exibida de forma destacada na coluna da tabela.
- [ ] Nenhum valor numérico perde precisão após ser persistido no banco.

---

### 🧪 Cenário RTM-S02-05: Validação Defensiva de Campos Obrigatórios e Máscaras

* **Objetivo:** Verificar a barreira do validador Zod/React Hook Form impedindo submissões inconsistentes.
* **Equivalente Automatizado:** `cypress/e2e/catalog/catalog-glass-validation.cy.ts`
* **Ponto de Partida:** Modal de inclusão de qualquer insumo

#### 👣 Passos de Execução:
1. **Abrir Formulário:** Iniciar o cadastro de um vidro sem preencher nada.
2. **Submissão Prematura:** Clicar diretamente no botão de salvar.
3. **Inspecionar Mensagens de Erro:** Constatar que campos obrigatórios exibem rótulos em vermelho:
   * `"Nome é obrigatório"`
   * `"Preço de venda deve ser maior que zero"`
4. **Testar Valor Negativo:** Informar `-10.00` no campo de preço e constatar a impossibilidade de submissão.

#### ✅ Critérios de Aceitação:
- [ ] O botão de salvar permanece inerte ou exibe feedbacks visuais claros sem recarregar a tela.
- [ ] O backend rejeita requisições manuais inválidas com HTTP 400/422 com payload de erro semântico.

---

## 3. Matriz Defensiva de Defeitos e Comportamentos Anômalos (RBD Sprint 02)

| Sintoma Observado | Causa Mais Provável | Ação de Contingência / Diagnóstico |
|---|---|---|
| Erro `409 Conflict` ao cadastrar perfil | Referência comercial já existe para a mesma linha | Altere o campo `[data-cy="profile-form-ref"]` ou edite o perfil já existente na tabela. |
| Erro `422 Unprocessable` ou crash de UUID | Falha de tipagem no driver PostgreSQL (PR #38) | Verifique se a migração `V1` rodou e se o dialect do PostgreSQL 16 está configurado no `application.yml`. |
| Máscara monetária ignora centavos ou inverte dígitos | Bug de renderização de input controlado (Issue #75) | Digite os números continuamente sem pontuação; a formatação em reais (R$) é calculada automaticamente. |
| Botão "Novo Material" não abre o modal | Script de modal interceptado por backdrop invisível | Recarregue a página com `Ctrl+F5` para limpar cache do bundle Vite. |
