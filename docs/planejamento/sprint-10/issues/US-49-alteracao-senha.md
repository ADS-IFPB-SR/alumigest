## 🎯 Objetivo de Negócio

Como **operador autenticado no sistema**, desejo alterar minha senha de acesso a qualquer momento informando minha senha atual e definindo uma nova senha segura na área de Configurações, para substituir a senha padrão de implantação e manter sigilo total sobre o acesso ao sistema da empresa.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Alteração de Senha com Sucesso (`PUT /api/v1/auth/password`)**
  - **Dado que** estou autenticado e acesso a seção **"Segurança da Conta / Alterar Senha"** em `/configuracoes`,
  - **Quando** informo minha `Senha Atual` correta, preencho uma `Nova Senha` com no mínimo 8 caracteres e repito o mesmo valor em `Confirmar Nova Senha`, clicando em **"Atualizar Senha"**,
  - **Então** o backend valida a senha vigente, grava o novo hash `BCrypt` no banco, retorna **HTTP 200 OK**, limpa o formulário e exibe *toast* de sucesso.

- [ ] **Cenário 2: Bloqueio por Senha Atual Incorreta**
  - **Dado que** estou no formulário de alteração de senha,
  - **Quando** informo uma `Senha Atual` divergente da cadastrada no banco,
  - **Então** o backend rejeita a operação com **HTTP 400 / 422** informando *"A senha atual informada está incorreta"*, sem encerrar minha sessão ativa e sem alterar o hash salvo.

- [ ] **Cenário 3: Validação de Força Mínima, Confirmação e Não-Repetição**
  - **Dado que** preencho o formulário de troca de senha,
  - **Quando** digito uma `Nova Senha` com menos de 8 caracteres, diferente do campo `Confirmar Nova Senha`, ou idêntica à `Senha Atual`,
  - **Então** a validação cliente (Zod) e servidor impedem o salvamento exibindo mensagens claras por campo.

- [ ] **Cenário 4: Validação no Próximo Login**
  - **Dado que** concluí a troca de senha e encerrei minha sessão (`Logout`),
  - **Quando** tento entrar com a senha antiga recebo **HTTP 401**, e ao entrar com a nova senha o login ocorre com sucesso.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Exigência da Senha Vigente):** A troca de senha exige obrigatoriamente validação de `currentPassword` contra o hash atual no banco.
- **RN-02 (Usabilidade):** Toggles acessíveis mostrar/ocultar senha nos 3 campos do formulário.

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários e MockMvc para `PUT /api/v1/auth/password` (sucesso, senha atual errada, senha fraca/repetida, sem token).
- [ ] Testes Vitest do formulário de alteração de senha.
- [ ] Cobertura $\ge 80\%$ no código novo e SonarQube Quality Gate aprovado.

---

**Estimativa:** 3 Story Points (~5.5h) | **Branch:** `feat/us-49-alteracao-senha`
