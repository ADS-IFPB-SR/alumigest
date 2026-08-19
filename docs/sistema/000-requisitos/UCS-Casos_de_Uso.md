# UCS — Documento de Casos de Uso

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 1.0 |
| **Data** | 05/08/2026 |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial — Casos de uso da Sprint 2 (Materiais e Orçamentos) | Ítalo Jefferson / Equipe AlumiGest |

---

## 1. Atores do Sistema

| Ator | Descrição | Perfil |
|---|---|---|
| **Administrador** | Proprietário ou gerente da Alumiportas. Acesso total ao sistema, incluindo configurações, catálogos, relatórios e financeiro. | Administrador |
| **Vendedor** | Funcionário responsável pelo atendimento ao cliente, elaboração de orçamentos e registro de pedidos. | Vendedor |
| **Produção** | Funcionário da fábrica responsável pela execução das ordens de produção, corte e montagem. | Produção |
| **Sistema** | O próprio AlumiGest, quando realiza ações automáticas (cálculos, reservas, alertas). | Sistema |

---

## 2. Diagrama de Casos de Uso (Sprint 2)

```
┌─────────────────────────────────────────────────────────────────┐
│                        AlumiGest                                │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐   │
│  │  Módulo de Materiais │    │    Módulo de Orçamentos      │   │
│  │                      │    │                              │   │
│  │  UC-01 Cadastrar     │    │  UC-06 Criar Orçamento       │   │
│  │        Vidros        │    │  UC-07 Adicionar Item         │   │
│  │  UC-02 Cadastrar     │    │  UC-08 Calcular Orçamento    │   │
│  │        Perfis        │    │  UC-09 Aplicar Desconto      │   │
│  │  UC-03 Cadastrar     │    │  UC-10 Gerar PDF             │   │
│  │        Ferragens     │    │  UC-11 Alterar Status        │   │
│  │  UC-04 Cadastrar     │    │                              │   │
│  │        Películas     │    └──────────────────────────────┘   │
│  │  UC-05 Pesquisar     │                                       │
│  │        Materiais     │                                       │
│  └──────────────────────┘                                       │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────────────┐   │
│  │  Módulo de Clientes  │    │  Módulo de Autenticação      │   │
│  │                      │    │                              │   │
│  │  UC-12 Cadastrar     │    │  UC-14 Fazer Login           │   │
│  │        Cliente       │    │  UC-15 Gerenciar Usuários    │   │
│  │  UC-13 Pesquisar     │    │                              │   │
│  │        Cliente       │    └──────────────────────────────┘   │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
      │              │                │
┌─────┴──┐    ┌──────┴──┐     ┌───────┴────┐
│  Admin │    │Vendedor │     │  Produção  │
└────────┘    └─────────┘     └────────────┘
```

---

## 3. Especificação dos Casos de Uso

---

### UC-01: Cadastrar Tipo de Vidro

| Campo | Descrição |
|---|---|
| **ID** | UC-01 |
| **Nome** | Cadastrar Tipo de Vidro |
| **Ator Principal** | Administrador |
| **Pré-condições** | Usuário autenticado com perfil Administrador |
| **Pós-condições** | Novo tipo de vidro registrado no catálogo e disponível para orçamentos |
| **Requisitos** | RF-016, RF-020 |

**Fluxo Principal:**

1. O Administrador acessa o menu **Catálogo > Vidros**.
2. O sistema exibe a lista de tipos de vidro cadastrados.
3. O Administrador clica em **"Novo Vidro"**.
4. O sistema exibe o formulário com os campos:
   - Nome (texto, obrigatório) — Ex: "Vidro Temperado 8mm Incolor"
   - Espessura em mm (numérico, obrigatório) — Ex: 8
   - Cor/Acabamento (texto, obrigatório) — Ex: "Incolor"
   - Preço por m² (monetário, obrigatório) — Ex: R$ 180,00
   - Largura máxima da chapa em mm (numérico, obrigatório) — Ex: 2500
   - Altura máxima da chapa em mm (numérico, obrigatório) — Ex: 3500
5. O Administrador preenche os dados e clica em **"Salvar"**.
6. O sistema valida os campos e registra o tipo de vidro com status **Ativo**.
7. O sistema exibe mensagem de sucesso e retorna à lista.

**Fluxos Alternativos:**

- **FA-01 — Editar vidro existente:** No passo 3, o Administrador clica em "Editar" em um vidro existente. O sistema carrega os dados no formulário. O Administrador altera os campos desejados e salva.
- **FA-02 — Inativar vidro:** No passo 2, o Administrador clica em "Inativar" em um vidro ativo. O sistema solicita confirmação. Após confirmação, o vidro muda para status Inativo e não aparece mais em novos orçamentos, mas permanece visível em orçamentos existentes.

**Fluxos de Exceção:**

- **FE-01 — Campos obrigatórios vazios:** No passo 6, se algum campo obrigatório estiver vazio, o sistema destaca o campo em vermelho com mensagem "Campo obrigatório".
- **FE-02 — Preço inválido:** Se o preço por m² for ≤ 0, o sistema exibe "O preço deve ser maior que zero".
- **FE-03 — Nome duplicado:** Se já existir um vidro ativo com o mesmo nome e espessura, o sistema exibe "Já existe um vidro com este nome e espessura".

---

### UC-02: Cadastrar Perfil de Alumínio

| Campo | Descrição |
|---|---|
| **ID** | UC-02 |
| **Nome** | Cadastrar Perfil de Alumínio |
| **Ator Principal** | Administrador |
| **Pré-condições** | Usuário autenticado com perfil Administrador |
| **Pós-condições** | Novo perfil de alumínio registrado e disponível para composição de orçamentos |
| **Requisitos** | RF-017, RF-020 |

**Fluxo Principal:**

1. O Administrador acessa o menu **Catálogo > Perfis de Alumínio**.
2. O sistema exibe a lista de perfis cadastrados, agrupados por linha comercial.
3. O Administrador clica em **"Novo Perfil"**.
4. O sistema exibe o formulário com os campos:
   - Código interno (texto, obrigatório, único) — Ex: "ALU-SUP-MON-01"
   - Descrição (texto, obrigatório) — Ex: "Montante Suprema 25×50"
   - Linha comercial (seleção, obrigatório) — Ex: "Suprema", "Max-ar", "Standard"
   - Peso por metro linear em kg/m (numérico, obrigatório) — Ex: 0,450
   - Preço por metro linear em R$/m (monetário, obrigatório) — Ex: R$ 28,50
   - Comprimento padrão da barra em mm (seleção: 3000 ou 6000, obrigatório)
5. O Administrador preenche os dados e clica em **"Salvar"**.
6. O sistema valida os campos, verifica unicidade do código e registra o perfil com status **Ativo**.
7. O sistema exibe mensagem de sucesso e retorna à lista.

**Fluxos Alternativos:**

- **FA-01 — Editar perfil:** O Administrador seleciona "Editar" em um perfil existente e altera os dados.
- **FA-02 — Inativar perfil:** O Administrador inativa um perfil que não será mais utilizado.
- **FA-03 — Filtrar por linha:** O Administrador filtra a lista por linha comercial.

**Fluxos de Exceção:**

- **FE-01 — Código duplicado:** Se o código interno já existir, o sistema exibe "Código já cadastrado para outro perfil".
- **FE-02 — Peso ou preço inválido:** Se ≤ 0, o sistema exibe mensagem de validação.

---

### UC-03: Cadastrar Ferragem/Acessório

| Campo | Descrição |
|---|---|
| **ID** | UC-03 |
| **Nome** | Cadastrar Ferragem/Acessório |
| **Ator Principal** | Administrador |
| **Pré-condições** | Usuário autenticado com perfil Administrador |
| **Pós-condições** | Nova ferragem registrada com quantidade padrão por tipo de produto |
| **Requisitos** | RF-018, RF-020 |

**Fluxo Principal:**

1. O Administrador acessa o menu **Catálogo > Ferragens**.
2. O sistema exibe a lista de ferragens cadastradas.
3. O Administrador clica em **"Nova Ferragem"**.
4. O sistema exibe o formulário:
   - Nome (texto, obrigatório) — Ex: "Roldana Superior para Porta de Correr"
   - Código interno (texto, obrigatório, único) — Ex: "FER-ROL-SUP-01"
   - Unidade de medida (seleção: Unidade / Par / Jogo, obrigatório)
   - Preço unitário (monetário, obrigatório) — Ex: R$ 45,00
5. O Administrador preenche e salva.
6. O sistema exibe a seção **"Composição por Tipo de Produto"**:
   - Para cada tipo de produto (Porta de Correr, Janela de Correr, etc.), o Administrador define a **quantidade padrão** desta ferragem. Ex: Porta de Correr = 2 unidades.
7. O sistema salva as composições e retorna à lista.

**Fluxos Alternativos:**

- **FA-01 — Editar ferragem e composição:** O Administrador altera dados da ferragem e/ou as quantidades padrão por tipo de produto.

**Fluxos de Exceção:**

- **FE-01 — Código duplicado:** Mensagem de erro se código já existir.

---

### UC-04: Cadastrar Película

| Campo | Descrição |
|---|---|
| **ID** | UC-04 |
| **Nome** | Cadastrar Película |
| **Ator Principal** | Administrador |
| **Pré-condições** | Usuário autenticado com perfil Administrador |
| **Pós-condições** | Nova película registrada e disponível para seleção em orçamentos |
| **Requisitos** | RF-019, RF-020 |

**Fluxo Principal:**

1. O Administrador acessa **Catálogo > Películas**.
2. Clica em **"Nova Película"**.
3. Preenche: Nome, Tipo (Jateado/Fumê/Insulfilm/Espelhado/Decorativo) e Preço por m².
4. Salva o registro.

**Fluxos de Exceção:**

- **FE-01 — Nome duplicado:** Mensagem de erro se já existir película ativa com mesmo nome e tipo.

---

### UC-05: Pesquisar Materiais

| Campo | Descrição |
|---|---|
| **ID** | UC-05 |
| **Nome** | Pesquisar Materiais no Catálogo |
| **Ator Principal** | Administrador, Vendedor |
| **Pré-condições** | Usuário autenticado |
| **Pós-condições** | Lista de materiais filtrada exibida |
| **Requisitos** | RF-021 |

**Fluxo Principal:**

1. O usuário acessa **Catálogo** e seleciona a aba desejada (Todos / Vidros / Alumínio / Ferragens / Películas).
2. O usuário digita o termo de busca no campo de pesquisa (nome, código ou descrição).
3. O sistema filtra a lista em tempo real, exibindo resultados correspondentes.
4. O sistema exibe: Nome, Código, Tipo, Preço e Status (Ativo/Inativo).

---

### UC-06: Criar Orçamento

| Campo | Descrição |
|---|---|
| **ID** | UC-06 |
| **Nome** | Criar Orçamento |
| **Ator Principal** | Vendedor |
| **Atores Secundários** | Sistema (cálculo automático) |
| **Pré-condições** | Usuário autenticado com perfil Vendedor ou Administrador; Cliente cadastrado |
| **Pós-condições** | Orçamento criado com número sequencial, vinculado ao cliente, com status "Rascunho" |
| **Requisitos** | RF-022, RF-023 |

**Fluxo Principal:**

1. O Vendedor acessa **Orçamentos > Novo Orçamento**.
2. O sistema exibe o formulário de criação:
   - Campo de busca de cliente (nome, CPF/CNPJ ou telefone)
   - Data de validade (padrão: data atual + 15 dias)
   - Observações (texto livre, opcional)
3. O Vendedor pesquisa e seleciona o cliente.
4. O sistema preenche automaticamente os dados do cliente (nome, telefone, endereço).
5. O Vendedor confirma a data de validade e clica em **"Criar Orçamento"**.
6. O sistema gera o número sequencial `ORC-YYYYMMDD-NNNN`, cria o orçamento com status **Rascunho** e redireciona para a tela de adição de itens.

**Fluxos Alternativos:**

- **FA-01 — Cliente não encontrado:** O Vendedor pode cadastrar um novo cliente diretamente na tela de criação do orçamento (abre modal de cadastro rápido).
- **FA-02 — Alterar validade:** O Vendedor altera a data de validade padrão.

**Fluxos de Exceção:**

- **FE-01 — Cliente inativo:** Se o cliente selecionado estiver inativo, o sistema exibe "Este cliente está inativo. Reative-o antes de criar um orçamento."

---

### UC-07: Adicionar Item ao Orçamento

| Campo | Descrição |
|---|---|
| **ID** | UC-07 |
| **Nome** | Adicionar Item ao Orçamento |
| **Ator Principal** | Vendedor |
| **Atores Secundários** | Sistema (cálculo automático) |
| **Pré-condições** | Orçamento criado com status "Rascunho" |
| **Pós-condições** | Item adicionado com materiais calculados automaticamente |
| **Requisitos** | RF-024, RF-025 |

**Fluxo Principal:**

1. Na tela do orçamento, o Vendedor clica em **"Adicionar Item"**.
2. O sistema exibe o formulário:
   - Tipo de Produto (seleção: Porta de Correr 2 folhas, Porta de Correr 3 folhas, Janela de Correr 2 folhas, Janela Max-ar, Box de Banheiro, Espelho, Porta de Abrir, Outro)
   - Tipo de Vidro (seleção do catálogo ativo)
   - Película (seleção opcional do catálogo ativo)
   - Linha de Alumínio (seleção: Suprema, Max-ar, Standard — quando aplicável)
   - Largura em cm (numérico, obrigatório)
   - Altura em cm (numérico, obrigatório)
   - Quantidade (numérico, obrigatório, padrão: 1)
   - Observações do item (texto livre, opcional)
3. O Vendedor preenche os dados e clica em **"Calcular e Adicionar"**.
4. O **Sistema** executa automaticamente (UC-08):
   - Calcula a área de vidro (m²) e o custo
   - Calcula o consumo de perfis de alumínio (metro linear) e o custo
   - Inclui as ferragens padrão conforme composição do tipo de produto
   - Calcula a película (se selecionada)
5. O sistema exibe o item adicionado com todos os materiais detalhados e o subtotal.
6. O Vendedor pode adicionar mais itens ou finalizar.

**Fluxos Alternativos:**

- **FA-01 — Editar item:** O Vendedor clica em "Editar" em um item existente, altera as medidas e o sistema recalcula automaticamente.
- **FA-02 — Remover item:** O Vendedor remove um item do orçamento.
- **FA-03 — Duplicar item:** O Vendedor duplica um item existente (útil para itens semelhantes com medidas diferentes).

**Fluxos de Exceção:**

- **FE-01 — Medidas excedem dimensão máxima do vidro:** Se largura ou altura excedem o máximo da chapa do vidro selecionado, o sistema exibe "As medidas excedem a dimensão máxima disponível para este tipo de vidro (máx: {largura_max}mm × {altura_max}mm)."
- **FE-02 — Medidas inválidas:** Se largura ou altura ≤ 0, o sistema exibe mensagem de validação.

---

### UC-08: Calcular Orçamento (Automático)

| Campo | Descrição |
|---|---|
| **ID** | UC-08 |
| **Nome** | Calcular Materiais e Custos do Orçamento |
| **Ator Principal** | Sistema (automático) |
| **Pré-condições** | Item de orçamento com tipo de produto, vidro, perfis e medidas definidos |
| **Pós-condições** | Materiais, quantidades e custos calculados para o item |
| **Requisitos** | RF-026, RF-027, RF-028, RF-029 |

**Fluxo Principal:**

1. O Sistema recebe os dados do item (tipo, vidro, alumínio, medidas).
2. **Cálculo de Vidro:**
   - Área = (largura_cm / 100) × (altura_cm / 100) = m²
   - Se área < 0,50 m², aplica área mínima = 0,50 m²
   - Custo_Vidro = área × preço_m² × quantidade
3. **Cálculo de Perfis de Alumínio:**
   - Consulta a composição do tipo de produto (montantes, travessas superiores, travessas inferiores, trilhos)
   - Para cada perfil da composição:
     - Comprimento_necessário = fórmula conforme tipo (perímetro, largura, altura, etc.)
     - Custo_Perfil = comprimento_metros × preço_metro × quantidade
4. **Inclusão de Ferragens:**
   - Consulta a tabela de composição do tipo de produto
   - Para cada ferragem: Custo_Ferragem = preço_unitário × quantidade_padrão × quantidade_itens
5. **Cálculo de Película (se aplicável):**
   - Área = mesma área do vidro
   - Custo_Película = área × preço_m² × quantidade
6. **Subtotal do Item:**
   - Subtotal = Custo_Vidro + Σ(Custo_Perfis) + Σ(Custo_Ferragens) + Custo_Película
7. O Sistema armazena o detalhamento e exibe ao Vendedor.

---

### UC-09: Aplicar Desconto no Orçamento

| Campo | Descrição |
|---|---|
| **ID** | UC-09 |
| **Nome** | Aplicar Desconto |
| **Ator Principal** | Vendedor |
| **Pré-condições** | Orçamento com pelo menos 1 item e status "Rascunho" |
| **Pós-condições** | Desconto aplicado e total recalculado |
| **Requisitos** | RF-030, RF-031 |

**Fluxo Principal:**

1. Na tela do orçamento, o Vendedor clica em **"Aplicar Desconto"**.
2. O sistema exibe as opções:
   - Desconto percentual no total (%)
   - Desconto por item (%)
3. O Vendedor seleciona o tipo e informa o valor.
4. O sistema recalcula o total do orçamento em tempo real.
5. O Vendedor confirma o desconto.

**Fluxos de Exceção:**

- **FE-01 — Desconto > 100%:** O sistema impede descontos acima de 100%.
- **FE-02 — Desconto negativo:** O sistema impede valores negativos.

---

### UC-10: Gerar PDF do Orçamento

| Campo | Descrição |
|---|---|
| **ID** | UC-10 |
| **Nome** | Gerar PDF do Orçamento |
| **Ator Principal** | Vendedor |
| **Pré-condições** | Orçamento com pelo menos 1 item |
| **Pós-condições** | Arquivo PDF gerado e disponível para download |
| **Requisitos** | RF-033, RF-034 |

**Fluxo Principal:**

1. Na tela do orçamento, o Vendedor clica em **"Gerar PDF"**.
2. O sistema exibe as opções:
   - **Com valores** (proposta comercial para o cliente)
   - **Sem valores** (uso interno / produção)
3. O Vendedor seleciona a opção desejada.
4. O sistema gera o PDF contendo:
   - **Cabeçalho:** Logo Alumiportas, razão social, CNPJ, endereço, telefone
   - **Dados do Cliente:** Nome, telefone, endereço
   - **Número do orçamento** e data de validade
   - **Tabela de itens:** Tipo de produto, medidas, vidro, alumínio
   - **(Se com valores):** Preço por item, descontos, subtotais, total final
   - **Condições:** Validade, forma de pagamento, observações
5. O sistema disponibiliza o PDF para download e/ou impressão.

---

### UC-11: Alterar Status do Orçamento

| Campo | Descrição |
|---|---|
| **ID** | UC-11 |
| **Nome** | Alterar Status do Orçamento |
| **Ator Principal** | Vendedor |
| **Pré-condições** | Orçamento existente |
| **Pós-condições** | Status do orçamento atualizado |
| **Requisitos** | RF-035 |

**Fluxo Principal:**

1. O Vendedor acessa a lista de orçamentos.
2. Seleciona um orçamento e clica em **"Alterar Status"**.
3. O sistema exibe as transições válidas:
   - Rascunho → Enviado
   - Enviado → Aprovado / Recusado
   - (Automático) Se data atual > data de validade → Expirado
4. O Vendedor seleciona o novo status.
5. O sistema registra a alteração com data/hora e usuário.

**Regras de Transição:**

| De | Para | Condição |
|---|---|---|
| Rascunho | Enviado | Mínimo 1 item no orçamento |
| Enviado | Aprovado | Vendedor confirma aprovação do cliente |
| Enviado | Recusado | Vendedor registra recusa |
| Enviado | Expirado | Data atual > data de validade (automático) |
| Rascunho | Expirado | Data atual > data de validade (automático) |

---

### UC-12: Cadastrar Cliente

| Campo | Descrição |
|---|---|
| **ID** | UC-12 |
| **Nome** | Cadastrar Cliente |
| **Ator Principal** | Vendedor, Administrador |
| **Pré-condições** | Usuário autenticado |
| **Pós-condições** | Cliente cadastrado e disponível para orçamentos |
| **Requisitos** | RF-007, RF-008, RF-011 |

**Fluxo Principal:**

1. O usuário acessa **Clientes > Novo Cliente**.
2. Preenche: Nome completo, CPF ou CNPJ (com validação e máscara), Telefone (com máscara), E-mail, CEP (com preenchimento automático via API), Logradouro, Número, Complemento, Bairro, Cidade, UF.
3. Clica em **"Salvar"**.
4. O sistema valida CPF/CNPJ, verifica unicidade e registra o cliente com status Ativo.

**Fluxos de Exceção:**

- **FE-01 — CPF/CNPJ inválido:** Mensagem "CPF/CNPJ inválido".
- **FE-02 — CPF/CNPJ já cadastrado:** Mensagem "Já existe um cliente com este CPF/CNPJ" com link para o cadastro existente.

---

### UC-13: Pesquisar Cliente

| Campo | Descrição |
|---|---|
| **ID** | UC-13 |
| **Nome** | Pesquisar Cliente |
| **Ator Principal** | Vendedor, Administrador |
| **Pré-condições** | Usuário autenticado |
| **Pós-condições** | Lista filtrada de clientes exibida |
| **Requisitos** | RF-009 |

**Fluxo Principal:**

1. O usuário acessa **Clientes** e digita no campo de busca.
2. O sistema busca por nome (parcial), CPF/CNPJ (parcial) ou telefone.
3. Exibe a lista de resultados com: Nome, CPF/CNPJ, Telefone, Status.

---

### UC-14: Fazer Login

| Campo | Descrição |
|---|---|
| **ID** | UC-14 |
| **Nome** | Fazer Login no Sistema |
| **Ator Principal** | Todos os usuários |
| **Pré-condições** | Usuário cadastrado e ativo |
| **Pós-condições** | Sessão autenticada com token JWT |
| **Requisitos** | RF-002, RF-005 |

**Fluxo Principal:**

1. O usuário acessa a tela de login.
2. Informa e-mail e senha.
3. Clica em **"Entrar"**.
4. O sistema valida as credenciais, gera token JWT e redireciona ao dashboard.

**Fluxos de Exceção:**

- **FE-01 — Credenciais inválidas:** "E-mail ou senha incorretos."
- **FE-02 — Conta bloqueada:** "Conta bloqueada por excesso de tentativas. Tente novamente em 15 minutos."

---

### UC-15: Gerenciar Usuários

| Campo | Descrição |
|---|---|
| **ID** | UC-15 |
| **Nome** | Gerenciar Usuários do Sistema |
| **Ator Principal** | Administrador |
| **Pré-condições** | Autenticado com perfil Administrador |
| **Pós-condições** | Usuário criado, editado ou inativado |
| **Requisitos** | RF-001, RF-003, RF-004 |

**Fluxo Principal:**

1. O Administrador acessa **Configurações > Usuários**.
2. Pode: cadastrar novo usuário (nome, e-mail, senha, perfil), editar perfil de acesso de um usuário existente, ou inativar um usuário.

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
