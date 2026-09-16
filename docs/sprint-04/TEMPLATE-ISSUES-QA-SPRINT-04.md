# 📋 Pacote de Issues de QA — Sprint 04
## User Story: `US-QA01` — Testes de Integração de Backend e Auditoria SonarQube
**Projeto:** AlumiGest — Gestão Operacional para Vidraçaria e Esquadrias  
**Sprint:** Sprint 04  
**Responsáveis:** Equipe de Qualidade de Software (QA Engineers)  
**Status:** 🟡 Pronto para Envio / Cadastro no GitHub  
**Foco:** Testes de integração reais (`@SpringBootTest`), validação de regras de negócio, limites e constraints no banco H2, sem mocks e sem código em desenvolvimento (Produtos e Orçamentos excluídos).

---

## 🧭 1. Visão Geral da User Story `US-QA01`

### 🎯 Objetivo
Garantir a confiabilidade, integridade no banco de dados e conformidade das regras de negócio dos módulos finalizados na branch `develop` (**Clientes PF/PJ** e **Insumos do Catálogo**: Vidros, Perfis de Alumínio, Ferragens e Películas), além de instituir a auditoria contínua de **Quality Gate** via **SonarQube**.

### 💡 Justificativa
* **Eliminação de Mocks Frágeis:** O código atual desses módulos possui apenas testes unitários com Mockito. É necessário validar o comportamento integrado real com JPA, Flyway, H2 em memória, transações `@Transactional` e regras de unicidade de banco.
* **Atuação dos QAs desde o Início da Sprint:** Permite que os analistas de QA trabalhem ativamente em código estável, sem ociosidade aguardando o módulo de Orçamento ou homologações de aceitação pelo PO.
* **Escopo Estritamente Delimitado:** Focado em backend integration (`@SpringBootTest`). Não inclui Cypress nem módulos em desenvolvimento ativo (Produtos/Orçamentos).

---

## 🔍 2. Papel dos QAs com o SonarQube no AlumiGest

> [!IMPORTANT]
> **Ambiente Ativo:** A instância comunitária do SonarQube está em **`https://sonar.italohub.cloud`** com projetos segregados para Backend (`br.edu.ifpb:alumigest`) e Frontend.

Atividades contínuas de QA durante a Sprint 04:
1. **Acompanhamento do Quality Gate:** Monitorar os PRs para assegurar Rating A em Confiabilidade e Segurança, 0 Vulnerabilidades e 0 Bugs.
2. **Análise de Gaps de Cobertura (*Branch Coverage*):** Usar o mapa visual de linhas do SonarQube/JaCoCo para identificar caminhos não testados (`if/else`, validações e exceções) e criar testes de integração para cobri-los.
3. **Triagem de Débito Técnico:** Apontar duplicações e code smells críticos antes do fechamento da sprint.

---

## 📦 3. Templates de Issues Prontos para o GitHub

---

### 📄 Issue 1: `[QA-01.1]` Testes de Integração de Clientes: Persistência, Tipos (PF/PJ) e Unicidade de Documento

```markdown
# [QA-01.1] Testes de Integração de Clientes: Persistência, Tipos (PF/PJ) e Unicidade de Documento

## 📌 Metadados da Tarefa
- **ID**: `QA-01.1`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `backend/src/test/java/br/edu/ifpb/alumigest/clients/service/ClientIntegrationTest.java`
- **Endpoints**: `POST /api/v1/clients` e `POST /api/clientes`

---

## 🎯 Objetivo
Validar via testes de integração com `@SpringBootTest` e base H2 ativa o ciclo de cadastro de clientes, assegurando a persistência correta de Pessoa Física (`FISICA`) e Pessoa Jurídica (`JURIDICA`), o comportamento de clientes sem documento e o bloqueio de duplicidade de CPF/CNPJ.

---

## 🧪 Cenários e Casos de Teste

### 1. Cadastro com Sucesso
- **Pessoa Física com CPF:** Enviar `personType = FISICA` com CPF formatado (`"042.123.456-78"`) e não formatado (`"04212345678"`).
- **Pessoa Jurídica com CNPJ:** Enviar `personType = JURIDICA` com CNPJ formatado (`"12.345.678/0001-95"`) e não formatado (`"12345678000195"`).
- **Cliente sem Documento:** Enviar campo `documento` vazio (`""`) ou `null` (deve permitir o cadastro de cliente informal/balcão).

### 2. Bloqueio de Duplicidade e Conflito
- **Documento Já Cadastrado:** Tentar cadastrar um segundo cliente com o mesmo CPF/CNPJ de um cliente já existente no banco.
- **Inserção Concorrente:** Disparar requisições simultâneas com o mesmo documento para validar a constraint `UNIQUE (cpf_cnpj)` da migration Flyway V7.

### 3. Rejeição de Documentos Inválidos
- **Máscara ou Dígitos Inválidos:** Enviar documento com letras (`"123.456.ABC-00"`), com 10 dígitos ou com 12 dígitos.

---

## 🛠️ Checklist de Implementação
- [ ] Criar a classe de teste `ClientIntegrationTest.java` com `@SpringBootTest` e `@AutoConfigureMockMvc`.
- [ ] Testar cadastro de cliente PF com CPF válido conferindo os dados persistidos na tabela `tb_customers`.
- [ ] Testar cadastro de cliente PJ com CNPJ válido conferindo os dados persistidos.
- [ ] Testar cadastro de cliente com documento vazio/nulo.
- [ ] Testar resposta de conflito ao tentar cadastrar cliente com documento repetido.
- [ ] Testar rejeição de documento com formato inválido.
- [ ] Testar concorrência de cadastro com mesmo documento.

---

## ✅ Critérios de Aceitação
1. **Cadastro PF/PJ Válido:** O endpoint deve responder `HTTP 201 Created`, retornar o payload com o UUID gerado e gravar o registro com `is_active = true` no banco H2.
2. **Cadastro sem Documento:** Deve retornar `HTTP 201 Created` e persistir a linha com `documento = null` sem falhas de constraint.
3. **Duplicidade de Documento:** Deve retornar `HTTP 409 Conflict` contendo a mensagem: *"Já existe um cliente cadastrado com o documento: <numero>"*, sem expor stacktrace do banco.
4. **Documento Malformado:** Deve retornar `HTTP 400 Bad Request` com a mensagem *"Documento com formato inválido (deve ser CPF ou CNPJ)"*.
5. **Execução:** O teste deve rodar e passar 100% via `mvn test -Dtest=ClientIntegrationTest`.
```

---

### 📄 Issue 2: `[QA-01.2]` Testes de Integração de Clientes: Validações de Entrada, Paginação e Soft Delete

```markdown
# [QA-01.2] Testes de Integração de Clientes: Validações de Entrada, Paginação e Soft Delete

## 📌 Metadados da Tarefa
- **ID**: `QA-01.2`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `backend/src/test/java/br/edu/ifpb/alumigest/clients/service/ClientValidationAndLifecycleIntegrationTest.java`
- **Endpoints**: `POST /api/v1/clients`, `GET /api/v1/clients`, `PUT /api/v1/clients/{id}`, `PATCH /api/v1/clients/{id}/status`

---

## 🎯 Objetivo
Validar os limites de tamanho de campos e formatos do DTO de cliente, os filtros de busca e paginação de listagem no Spring Data JPA e o ciclo de vida de inativação lógica (`toggleStatus`) e reativação.

---

## 🧪 Cenários e Casos de Teste

### 1. Limites de Entrada (Tamanho de Campos)
- **Nome Completo:**
  - Vazio / Espaços: `""` ou `"   "` (deve ser rejeitado).
  - Limite mínimo: 1 caractere (deve ser aceito).
  - Limite máximo: 150 caracteres (deve ser aceito).
  - Excedendo limite: 151 caracteres (deve ser rejeitado).
- **Telefone:** 20 caracteres (aceito) vs 21 caracteres (rejeitado).
- **UF:** `"PB"` (2 caracteres - aceito) vs `"PBX"` (3 caracteres - rejeitado).
- **E-mail:** Formato válido (`"cliente@empresa.com"`) vs formato sem `@` (`"cliente.empresa.com"`).

### 2. Paginação e Filtros de Busca
- Inserir massa de 15 clientes no banco.
- Testar paginação com `size=5` e `page=0` (deve retornar 5 registros e metadados de total).
- Testar busca textual pelo parâmetro `busca` (por nome, documento, telefone e cidade).
- Testar filtro por tipo (`personType=FISICA` e `personType=JURIDICA`).
- Testar filtro por status (`ativo=true` e `ativo=false`).

### 3. Ciclo de Vida e Soft Delete
- Cadastrar cliente -> Confirmar `is_active = true`.
- Inativar via `PATCH /api/v1/clients/{id}/status` -> Confirmar retorno `200 OK` e `is_active = false`.
- Verificar que o cliente inativo NÃO aparece na listagem padrão com filtro `ativo=true`.
- Reativar via novo `PATCH /api/v1/clients/{id}/status` -> Confirmar retorno a `is_active = true`.
- Tentar requisição `DELETE /api/v1/clients/{id}` e confirmar que exclusão física é bloqueada (`405 Method Not Allowed`).

---

## 🛠️ Checklist de Implementação
- [ ] Criar classe `ClientValidationAndLifecycleIntegrationTest.java`.
- [ ] Testar limites de tamanho para `nomeCompleto`, `telefone` e `uf`.
- [ ] Testar validação de formato de e-mail.
- [ ] Testar paginação com `PageResponse` e metadados de total de páginas/elementos.
- [ ] Testar busca textual e filtros de `personType` e `ativo`.
- [ ] Testar alternância de status ativo/inativo via `PATCH /{id}/status`.
- [ ] Confirmar que a tupla permanece no banco e não sofre `DELETE FROM`.

---

## ✅ Critérios de Aceitação
1. **Validação de Entrada:** Qualquer campo que viole tamanho ou formato deve responder `HTTP 400 Bad Request` com o campo causador detalhado.
2. **Paginação Consistente:** O endpoint `GET /api/v1/clients` deve devolver um `PageResponse` com o número correto de itens, página corrente e contagem total do banco.
3. **Preservação Histórica (Soft Delete):** A inativação deve alterar exclusivamente a coluna `is_active` para `false`. O registro deve continuar existindo no banco.
4. **Sem Exclusão Física:** A rota `DELETE /api/v1/clients/{id}` não deve estar habilitada.
5. **Execução:** Suíte executada e aprovada com `mvn test -Dtest=ClientValidationAndLifecycleIntegrationTest`.
```

---

### 📄 Issue 3: `[QA-01.3]` Testes de Integração do Catálogo: Vidros (Espessuras Nominais, Preços e Dimensões)

```markdown
# [QA-01.3] Testes de Integração do Catálogo: Vidros (Espessuras Nominais, Preços e Dimensões)

## 📌 Metadados da Tarefa
- **ID**: `QA-01.3`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `backend/src/test/java/br/edu/ifpb/alumigest/catalog/service/GlassIntegrationTest.java`
- **Endpoints**: `POST /api/v1/catalog/glasses`, `GET`, `PUT /{id}`, `DELETE /{id}`

---

## 🎯 Objetivo
Validar via testes de integração a API de Vidros (`GlassController`), garantindo o vínculo automático ao grupo `VIDRO`, o respeito à lista de espessuras comerciais padronizadas (2, 4, 6, 8 e 10 mm) e o comportamento de preços e dimensões.

---

## 🧪 Cenários e Casos de Teste

### 1. Espessuras Nominais Permitidas e Bloqueadas
- **Espessuras Homologadas (Válidas):** Cadastrar vidros com espessuras `2.00mm`, `4.00mm`, `6.00mm`, `8.00mm` e `10.00mm` (devem ser aceitas com `201 Created`).
- **Limites Imediatamente Fora da Faixa:**
  - `1.99mm` (abaixo do mínimo permitido) $\to$ Rejeitar com `400 Bad Request`.
  - `10.01mm` (acima do máximo de catálogo) $\to$ Rejeitar com `400 Bad Request`.
- **Valores Intermediários Não Padronizados:**
  - `3.00mm`, `5.00mm`, `7.00mm` $\to$ Rejeitar com mensagem: *"Espessura inválida. Permitido apenas: 2mm, 4mm, 6mm, 8mm, 10mm."*.

### 2. Regras de Preço e Atributos de Banco
- **Preços:** Preço de custo e venda positivos (`costPrice > 0`, `salePrice > 0`). Valores $\le 0$ devem ser rejeitados com `400 Bad Request`.
- **Unidade de Medida:** Confirmar que no banco H2 a coluna `unit_measure` é salva obrigatoriamente como `'M2'`.
- **Grupo Automático:** Confirmar que o `group_id` associado aponta para o grupo mestre com código `'VIDRO'`.

### 3. Atualização e Soft Delete
- Atualizar preço e acabamento de um vidro existente via `PUT /{id}`.
- Chamar `DELETE /api/v1/catalog/glasses/{id}` e validar retorno `204 No Content` com marcação `is_active = false`.
- **Proteção de Integridade:** Tentar atualizar via endpoint de vidros um material cujo ID pertença a outro grupo (ex: alumínio) e validar rejeição com erro apropriado.

---

## 🛠️ Checklist de Implementação
- [ ] Criar `GlassIntegrationTest.java` com `@SpringBootTest`.
- [ ] Testar criação bem-sucedida para as 5 espessuras nominais: 2mm, 4mm, 6mm, 8mm e 10mm.
- [ ] Testar rejeição dos limites 1.99mm e 10.01mm.
- [ ] Testar rejeição de espessuras intermediárias (ex: 3mm e 5mm).
- [ ] Validar que `unit_measure` gravado é `'M2'` e o grupo é `'VIDRO'`.
- [ ] Testar rejeição de preços de custo/venda zerados ou negativos.
- [ ] Testar atualização via `PUT` e soft delete via `DELETE` (retorno 204).

---

## ✅ Critérios de Aceitação
1. **Espessuras Estritas:** Apenas e tão somente vidros de 2, 4, 6, 8 e 10 mm são aceitos. Qualquer outro valor numérico deve retornar `HTTP 400 Bad Request`.
2. **Gravação Correta no Banco:** Registros salvos devem ter `unit_measure = 'M2'` e chave estrangeira vinculada a `tb_material_groups` onde `code = 'VIDRO'`.
3. **Preços Válidos:** Tentativa de cadastrar preço de custo ou venda menor ou igual a zero deve retornar `HTTP 400 Bad Request`.
4. **Soft Delete:** A exclusão via `DELETE` deve retornar `HTTP 204 No Content` mantendo o registro no banco com `is_active = false`.
5. **Execução:** Suíte aprovada via `mvn test -Dtest=GlassIntegrationTest`.
```

---

### 📄 Issue 4: `[QA-01.4]` Testes de Integração do Catálogo: Perfis de Alumínio (Barras Comerciais, NCM e Unicidade)

```markdown
# [QA-01.4] Testes de Integração do Catálogo: Perfis de Alumínio (Barras Comerciais, NCM e Unicidade)

## 📌 Metadados da Tarefa
- **ID**: `QA-01.4`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `backend/src/test/java/br/edu/ifpb/alumigest/catalog/service/AluminumProfileIntegrationTest.java`
- **Endpoints**: `POST /api/v1/catalog/aluminum-profiles`, `GET`, `PUT /{id}`, `DELETE /{id}`

---

## 🎯 Objetivo
Construir testes de integração para o catálogo de perfis de alumínio, assegurando a obrigatoriedade de barras comerciais industriais (3.00m e 6.00m), a validação de formato do NCM, limites de peso e a restrição de unicidade por referência comercial e acabamento.

---

## 🧪 Cenários e Casos de Teste

### 1. Comprimento Padrão de Barra Comercial
- **Barras Padrão (Aceitas):** Cadastrar perfil com `standardLengthM = 3.00` e outro com `6.00` (devem retornar `201 Created`).
- **Comprimentos Inválidos:** Tentar cadastrar barras com `2.50m`, `4.00m`, `5.00m` ou `0.00m` (devem ser rejeitadas com erro de negócio informando que apenas 3.00m e 6.00m são aceitos).

### 2. Unicidade de Referência Comercial e Acabamento (Flyway V3)
- Cadastrar perfil com referência `"SU-001"` e acabamento `"PRETO"` $\to$ Sucesso (`201 Created`).
- Cadastrar outro perfil com a mesma referência `"SU-001"`, mas acabamento `"BRANCO"` $\to$ Sucesso (`201 Created`).
- Tentar cadastrar perfil com a mesma referência `"SU-001"` e mesmo acabamento `"PRETO"` $\to$ Rejeitar com erro informando conflito de cadastro.

### 3. Validação de NCM e Peso Linear
- **NCM:**
  - 8 dígitos numéricos (`"76042100"`) $\to$ Aceito.
  - 7 dígitos (`"7604210"`) ou 9 dígitos (`"760421000"`) $\to$ Rejeitado com `400 Bad Request`.
  - Letras (`"7604210A"`) $\to$ Rejeitado com `400 Bad Request`.
- **Peso:** `weight = 0` $\to$ Rejeitado (`@Positive` exige $> 0$). `weight = 0.450` $\to$ Aceito.

---

## 🛠️ Checklist de Implementação
- [ ] Criar classe `AluminumProfileIntegrationTest.java` com `@SpringBootTest`.
- [ ] Testar cadastro de perfis com barras de 3.00m e 6.00m.
- [ ] Testar rejeição de perfil com barra de comprimento não homologado (ex: 4.50m).
- [ ] Testar unicidade: permitir mesma referência com cores diferentes, mas bloquear referência e cor idênticas.
- [ ] Testar limites de NCM (7 dígitos vs 8 dígitos vs 9 dígitos).
- [ ] Testar validação de peso maior que zero.
- [ ] Testar inativação via `DELETE /{id}` (soft delete retornando 204).

---

## ✅ Critérios de Aceitação
1. **Comprimento de Barra:** Perfis com comprimento diferente de 3.00m ou 6.00m devem ser rejeitados com mensagem explicativa.
2. **Unicidade Composta:** O sistema não deve permitir dois perfis ativos com a mesma referência e mesma cor de acabamento.
3. **Código NCM:** Deve exigir exatamente 8 caracteres numéricos, rejeitando qualquer entrada menor, maior ou contendo letras com `HTTP 400`.
4. **Soft Delete:** A exclusão deve responder `HTTP 204 No Content` e manter o perfil com `is_active = false`.
5. **Execução:** Suíte aprovada via `mvn test -Dtest=AluminumProfileIntegrationTest`.
```

---

### 📄 Issue 5: `[QA-01.5]` Testes de Integração do Catálogo: Ferragens e Películas (Unidades, Metragens e JSONB)

```markdown
# [QA-01.5] Testes de Integração do Catálogo: Ferragens e Películas (Unidades, Metragens e JSONB)

## 📌 Metadados da Tarefa
- **ID**: `QA-01.5`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `backend/src/test/java/br/edu/ifpb/alumigest/catalog/service/HardwareAndFilmIntegrationTest.java`
- **Endpoints**: `POST /api/v1/catalog/hardware` e `POST /api/v1/catalog/films`

---

## 🎯 Objetivo
Validar via testes de integração os endpoints de Ferragens e Películas, conferindo o suporte restrito às unidades de comercialização (`UN`, `PAR`, `METRO`), a cobrança de películas por $m^2$, a integridade do JSONB `attributes_json` e a unicidade de `skuCode`.

---

## 🧪 Cenários e Casos de Teste

### 1. Ferragens: Unidades e Atributos de Cálculo
- **Unidade PAR:** Cadastrar roldana dupla (`unitMeasure = 'PAR'`) com cálculo `FIXED_SUM` $\to$ Sucesso (`201 Created`).
- **Unidade UN:** Cadastrar fecho concha (`unitMeasure = 'UN'`) $\to$ Sucesso (`201 Created`).
- **Unidade METRO:** Cadastrar escova de vedação (`unitMeasure = 'METRO'`) com cálculo `PER_METER` $\to$ Sucesso (`201 Created`).
- **Filtro de Unidade Inválida:** Chamar `GET /api/v1/catalog/hardware?unit=M2` e confirmar rejeição com `400 Bad Request` informando que apenas UN, PAR e METRO são aceitos.
- **Unicidade de SKU:** Tentar cadastrar duas ferragens ativas com o mesmo `skuCode` $\to$ Bloquear com erro de negócio.

### 2. Películas: Área e Parâmetros de Bobina
- **Criação de Película:** Cadastrar película jateada informando preço de venda, espessura e largura de bobina.
- **Unidade Automática:** Validar no banco H2 que a coluna `unit_measure` é salva estritamente como `'M2'` e o grupo vinculado é `'PELICULA'`.

### 3. Persistência de JSONB e Recuperação
- Consultar a ferragem cadastrada via `GET /{id}` e atestar que os atributos salvos no JSONB (`calculationType`) são desserializados sem erro de driver no H2.

---

## 🛠️ Checklist de Implementação
- [ ] Criar classe `HardwareAndFilmIntegrationTest.java` com `@SpringBootTest`.
- [ ] Testar cadastro de ferragens com unidades `PAR`, `UN` e `METRO`.
- [ ] Testar rejeição de parâmetro de filtro com unidade inválida para ferragens (`HTTP 400`).
- [ ] Testar bloqueio de duplicidade de código `skuCode`.
- [ ] Testar cadastro de película garantindo unidade `'M2'` no banco.
- [ ] Validar integridade da recuperação dos dados com coluna JSONB.
- [ ] Testar soft delete de ferragem e película.

---

## ✅ Critérios de Aceitação
1. **Unidades de Ferragem:** As unidades `UN`, `PAR` e `METRO` devem ser aceitas e persistidas; valores fora dessa lista devem ser barrados.
2. **SKU Único:** Não deve ser permitida a inclusão de ferragem com SKU já existente.
3. **Película por M²:** Películas devem ser persistidas com `unit_measure = 'M2'` e vinculadas ao grupo `PELICULA`.
4. **Desserialização JSONB:** A coluna `attributes_json` deve ser lida e mapeada para os DTOs de resposta sem exceções de banco.
5. **Execução:** Testes aprovados no comando `mvn test -Dtest=HardwareAndFilmIntegrationTest`.
```

---

### 📄 Issue 6: `[QA-01.6]` Testes de Integridade do Schema Flyway e Inicialização do Banco

```markdown
# [QA-01.6] Testes de Integridade do Schema Flyway e Inicialização do Banco

## 📌 Metadados da Tarefa
- **ID**: `QA-01.6`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `backend/src/test/java/br/edu/ifpb/alumigest/catalog/repository/FlywaySchemaIntegrationTest.java`

---

## 🎯 Objetivo
Validar a esteira de migrações do Flyway (`V1` até a versão corrente `V15`), garantindo que o banco de dados é gerado do zero sem erros de DDL SQL, que tabelas obsoletas eliminadas por refatoração não constam no schema e que os registros sementes essenciais estão presentes.

---

## 🧪 Cenários e Casos de Teste

### 1. Execução Completa das Migrações
- Iniciar o contexto Spring com Flyway ativo em base limpa H2.
- Atestar que todas as migrações aplicam com status de sucesso e que não existem migrações com falha ou pendentes.

### 2. Validação da Existência e Inexistência de Tabelas
- **Tabelas que DEVEM existir:**
  - `tb_material_groups` (grupos mestres)
  - `tb_materials` (catálogo universal)
  - `tb_customers` (clientes)
  - `tb_products` (produtos)
  - `tb_budgets` e `tb_budget_items` (orçamentos)
- **Tabelas que NÃO DEVEM existir (Dropadas em V12 e V13):**
  - `tb_product_categories` (removida em favor de enum)
  - `tb_product_items` (removida em favor de tabela de requisitos)

### 3. Integridade dos Dados Semente (Seed Data)
- Validar via consulta direta a `tb_material_groups` a presença obrigatória dos 4 grupos base com flag `is_system_default = true`:
  - `VIDRO`
  - `ALUMINIO`
  - `FERRAGEM`
  - `PELICULA`

---

## 🛠️ Checklist de Implementação
- [ ] Criar classe `FlywaySchemaIntegrationTest.java` anotada com `@SpringBootTest`.
- [ ] Injetar `Flyway` e validar estado das migrações (`flyway.info().pending().length == 0`).
- [ ] Inspecionar metadados JDBC (`DatabaseMetaData.getTables`) para verificar as tabelas obrigatórias.
- [ ] Inspecionar metadados e atestar ausência de `tb_product_categories` e `tb_product_items`.
- [ ] Validar que os 4 grupos padrão de materiais existem no banco.

---

## ✅ Critérios de Aceitação
1. **Zero Falhas de Migração:** O Flyway deve aplicar todas as versões (`V1` a `V15`) sem erros de sintaxe ou dependência circular.
2. **Schema Limpo:** Nenhuma tabela descontinuada deve permanecer no banco.
3. **Grupos Fundamentais:** Os grupos `VIDRO`, `ALUMINIO`, `FERRAGEM` e `PELICULA` devem estar presentes com `is_system_default = true`.
4. **Execução:** Teste verde via `mvn test -Dtest=FlywaySchemaIntegrationTest`.
```

---

### 📄 Issue 7: `[QA-01.7]` Auditoria Contínua de Quality Gate, Branch Coverage e Relatório SonarQube

```markdown
# [QA-01.7] Auditoria Contínua de Quality Gate, Branch Coverage e Relatório SonarQube

## 📌 Metadados da Tarefa
- **ID**: `QA-01.7`
- **US Pai**: `US-QA01: Testes de Integração Backend e Qualidade SonarQube`
- **Fase**: `Sprint 04 - Garantia da Qualidade`
- **Alvo**: `docs/sistema/003-teste/sprint-04/REL-Auditoria_SonarQube_Sprint04.md`
- **Dashboard**: `https://sonar.italohub.cloud`

---

## 🎯 Objetivo
Operar a auditoria contínua de qualidade de código no SonarQube durante a Sprint 04, identificando lacunas de cobertura de ramificações (*branch coverage gap analysis*) nos relatórios do JaCoCo, monitorando os limites do Quality Gate e formalizando o parecer técnico de QA para a release.

---

## 🧪 Cenários e Casos de Auditoria

### 1. Análise de Cobertura de Ramificações (Branches Críticas)
Identificar no SonarQube se os testes cobriram ambos os lados das decisões:
- `validateThickness`: ramo nulo, ramo de espessura permitida e ramo de exceção.
- `validateStandardLength`: ramo nulo, ramo 3m/6m e ramo de exceção.
- `validateDocumentUniqueness`: ramo nulo/branco, ramo documento inexistente e ramo duplicado.
- `toggleStatus`: transição de ativo para inativo e vice-versa.

### 2. Auditoria das Métricas do Quality Gate
- **Cobertura em Código Novo:** Garantir $\ge 80.0\%$ (reprova se estiver abaixo de 80%).
- **Duplicação de Código:** Garantir $< 3.0\%$.
- **Confiabilidade e Segurança:** 0 Bugs e 0 Vulnerabilidades abertas.
- **Security Hotspots:** 100% revisados.

---

## 🛠️ Checklist de Implementação
- [ ] Acessar `https://sonar.italohub.cloud` e auditar o projeto `br.edu.ifpb:alumigest`.
- [ ] Executar análise local via Maven: `mvn clean verify sonar:sonar`.
- [ ] Realizar mapeamento de gaps de cobertura visualizando as linhas não exercitadas no SonarQube.
- [ ] Reportar aos desenvolvedores eventuais code smells críticos ou duplicações identificadas.
- [ ] Auditar o dashboard do frontend para consistência geral.
- [ ] Redigir e publicar o relatório `docs/sistema/003-teste/sprint-04/REL-Auditoria_SonarQube_Sprint04.md`.

---

## ✅ Critérios de Aceitação
1. **Quality Gate Aprovado:** O status no dashboard do SonarQube para o backend deve ser **PASSED** (Verde).
2. **Zero Bloqueios de Segurança:** 0 bugs e 0 vulnerabilidades de severidade Alta ou Crítica.
3. **Cobertura Mínima:** A cobertura geral em código novo deve atingir ou superar 80%.
4. **Relatório Formal:** Relatório de auditoria documentado no repositório com evidências visuais e parecer conclusivo dos QAs.
```

---

*Documento consolidado para cadastro e envio das issues de QA da Sprint 04 — AlumiGest*
