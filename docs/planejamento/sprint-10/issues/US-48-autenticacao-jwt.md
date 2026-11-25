## 🎯 Objetivo de Negócio

Como **operador responsável pela empresa**, desejo acessar o AlumiGest ERP por meio de uma tela de login protegida por e-mail e senha, mantendo todas as rotas e dados comerciais/fabris inacessíveis a terceiros não autenticados na web e podendo encerrar minha sessão com segurança ao deixar o computador.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Autenticação com Credenciais Válidas (`POST /api/v1/auth/login`)**
  - **Dado que** existe a conta oficial ativa provisionada no banco e estou na página pública `/login`,
  - **Quando** preencho meu e-mail e senha corretos e aciono **"Entrar"**,
  - **Então** o backend valida o hash `BCrypt`, retorna **HTTP 200 OK** com o token JWT assinado (validade de 8 horas) e os dados da conta (`id`, `name`, `email`),
  - **E** sou redirecionado para a tela operacional inicial (`/orcamentos` ou rota originalmente tentada), exibindo meu nome real na `Topbar.tsx`.

- [ ] **Cenário 2: Rejeição Segura de Credenciais Inválidas**
  - **Dado que** estou na tela `/login`,
  - **Quando** informo um e-mail não cadastrado ou uma senha incorreta,
  - **Então** a API responde com **HTTP 401 Unauthorized** e mensagem única em português (*"E-mail ou senha inválidos"*), sem revelar qual dos dois campos falhou.

- [ ] **Cenário 3: Bloqueio Universal de Rotas Privadas e Endpoints da API**
  - **Dado que** não possuo token JWT válido (acesso anônimo ou token expirado/adulterado),
  - **Quando** tento acessar diretamente qualquer rota interna no navegador ou consumir qualquer endpoint privado `/api/v1/**`,
  - **Então** o backend rejeita a chamada com **HTTP 401 Unauthorized** e o `ProtectedRoute` / interceptor Axios limpa a sessão local e redireciona imediatamente para `/login`.

- [ ] **Cenário 4: Encerramento Explícito de Sessão (`Logout`)**
  - **Dado que** estou autenticado no AlumiGest ERP,
  - **Quando** clico no botão **"Sair"** na `Sidebar.tsx`,
  - **Então** o token JWT é removido do armazenamento local, o cache do `QueryClient` é limpo e sou redirecionado para `/login`.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Operador Único sem Auto-Cadastro):** Apenas 1 perfil autenticado na Release 1.0, sem divisão em 3 perfis RBAC e sem tela de criação de contas na interface. Conta inicial provisionada via `V27__create_users_schema.sql`.
- **RN-02 (Hash Seguro):** Senhas armazenadas exclusivamente com `BCryptPasswordEncoder` (custo 10–12) e jamais expostas em DTOs ou logs.
- **RN-03 (Fora de Escopo na R1.0):** Bloqueio de 15 minutos (`RF-005`) e log de auditoria (`RF-006`) ficam para releases futuras.

---

## 🛡️ Definition of Done (DoD)

- [ ] Testes unitários e MockMvc cobrindo login válido, 401 inválido, token expirado e compatibilidade `@WithMockUser` nas suítes existentes.
- [ ] Testes Vitest cobrindo `LoginPage`, `ProtectedRoute`, interceptor 401 e `Logout`.
- [ ] Cobertura $\ge 80\%$ no código novo, Checkstyle/Oxlint limpos e SonarQube Quality Gate aprovado.

---

**Estimativa:** 5 Story Points (~8.5h) | **Branch:** `feat/us-48-autenticacao-jwt`
