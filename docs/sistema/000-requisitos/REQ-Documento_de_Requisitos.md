# REQ — Documento de Requisitos

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
| 05/08/2026 | 1.0 | Versão inicial do Documento de Requisitos | Ítalo Jefferson / Equipe AlumiGest |

---

## Sumário

1. [Introdução](#1-introdução)
2. [Requisitos Funcionais](#2-requisitos-funcionais)
3. [Requisitos Não-Funcionais](#3-requisitos-não-funcionais)
4. [Regras de Negócio](#4-regras-de-negócio)
5. [Rastreabilidade](#5-rastreabilidade)

---

## 1. Introdução

### 1.1 Propósito

Este documento descreve os requisitos funcionais e não-funcionais do sistema AlumiGest, um sistema web PWA para gestão integrada da vidraçaria Alumiportas. Serve como referência para desenvolvimento, testes e validação.

### 1.2 Escopo

O sistema AlumiGest cobre os módulos de Cadastros, Orçamentos, Pedidos/PCP, Estoque, Financeiro e Instalação/OS, conforme definido no PPJ e no Product Backlog (PBL).

### 1.3 Definições e Abreviações

| Termo | Definição |
|---|---|
| **m²** | Metro quadrado — unidade de medida para chapas de vidro |
| **Metro linear** | Unidade de medida para perfis/barras de alumínio |
| **OP** | Ordem de Produção |
| **OS** | Ordem de Serviço |
| **PWA** | Progressive Web Application |
| **PCP** | Planejamento e Controle de Produção |
| **SemVer** | Semantic Versioning (versionamento semântico) |
| **TEA** | Teste de Aceitação |
| **DoD** | Definition of Done |

---

## 2. Requisitos Funcionais

### 2.1 Módulo de Autenticação e Segurança

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-001 | O sistema deve permitir o cadastro de usuários com nome completo, e-mail (único) e senha. | 🔴 Must | R1 |
| RF-002 | O sistema deve autenticar usuários por e-mail e senha, gerando um token JWT com validade configurável. | 🔴 Must | R1 |
| RF-003 | O sistema deve suportar os perfis de acesso: **Administrador**, **Vendedor** e **Produção**, cada um com permissões específicas. | 🔴 Must | R1 |
| RF-004 | O sistema deve permitir que o Administrador altere o perfil de acesso de qualquer usuário. | 🟡 Should | R1 |
| RF-005 | O sistema deve bloquear o acesso após 5 tentativas consecutivas de login inválidas, desbloqueando após 15 minutos. | 🟡 Should | R1 |
| RF-006 | O sistema deve registrar log de auditoria para login, logout e alterações de perfil. | 🟢 Could | R1 |

### 2.2 Módulo de Cadastro de Clientes

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-007 | O sistema deve permitir o cadastro de clientes com os campos: nome completo, CPF ou CNPJ (com validação), telefone (com máscara), e-mail e endereço completo (CEP, logradouro, número, complemento, bairro, cidade, UF). | 🔴 Must | R1 |
| RF-008 | O sistema deve validar unicidade do CPF/CNPJ, impedindo cadastros duplicados. | 🔴 Must | R1 |
| RF-009 | O sistema deve permitir pesquisa de clientes por nome (parcial), CPF/CNPJ (parcial) ou telefone. | 🔴 Must | R1 |
| RF-010 | O sistema deve permitir edição dos dados do cliente, mantendo histórico da última alteração. | 🔴 Must | R1 |
| RF-011 | O sistema deve permitir inativar (soft delete) um cliente, impedindo novos orçamentos mas mantendo histórico. | 🔴 Must | R1 |
| RF-012 | O sistema deve exibir o histórico de orçamentos e pedidos associados a um cliente. | 🟡 Should | R1 |

### 2.3 Módulo de Cadastro de Fornecedores

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-013 | O sistema deve permitir o cadastro de fornecedores com razão social, CNPJ (validado), telefone, e-mail e endereço. | 🟡 Should | R1 |
| RF-014 | O sistema deve permitir associar um ou mais materiais a cada fornecedor. | 🟢 Could | R1 |
| RF-015 | O sistema deve permitir pesquisa, edição e inativação de fornecedores. | 🟡 Should | R1 |

### 2.4 Módulo de Catálogo de Materiais

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-016 | O sistema deve permitir o cadastro de **tipos de vidro** com: nome, espessura (mm), cor/acabamento, preço por m² e dimensões máximas da chapa (largura × altura em mm). | 🔴 Must | R1 |
| RF-017 | O sistema deve permitir o cadastro de **perfis de alumínio** com: código, descrição, linha comercial (Suprema, Max-ar, etc.), peso por metro linear (kg/m), preço por metro linear (R$/m) e comprimento padrão da barra (3000mm ou 6000mm). | 🔴 Must | R1 |
| RF-018 | O sistema deve permitir o cadastro de **ferragens e acessórios** com: nome, código interno, unidade de medida (unidade/par/jogo), preço unitário e quantidade padrão por tipo de produto. | 🔴 Must | R1 |
| RF-019 | O sistema deve permitir o cadastro de **películas** com: nome, tipo (jateado, fumê, insulfilm, etc.) e preço por m². | 🟡 Should | R1 |
| RF-020 | O sistema deve permitir ativar e inativar qualquer item do catálogo. Itens inativos não aparecem na criação de orçamentos mas permanecem visíveis em orçamentos já emitidos. | 🔴 Must | R1 |
| RF-021 | O sistema deve permitir pesquisa de materiais por nome, código ou tipo (vidro/alumínio/ferragem/película). | 🔴 Must | R1 |

### 2.5 Módulo de Orçamentos

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-022 | O sistema deve permitir criar um orçamento vinculado a um cliente, com data de criação automática e data de validade configurável (padrão: 15 dias). | 🔴 Must | R1 |
| RF-023 | O sistema deve gerar um número sequencial único para cada orçamento no formato `ORC-YYYYMMDD-NNNN`. | 🔴 Must | R1 |
| RF-024 | O sistema deve permitir adicionar itens ao orçamento, selecionando o tipo de produto (porta de correr, janela de correr, janela Max-ar, box de banheiro, espelho, porta de abrir, etc.). | 🔴 Must | R1 |
| RF-025 | O sistema deve solicitar as medidas (largura × altura em cm) para cada item adicionado. | 🔴 Must | R1 |
| RF-026 | O sistema deve **calcular automaticamente a área de vidro** (m²) = (largura_cm / 100) × (altura_cm / 100), multiplicando pelo preço/m² do vidro selecionado. | 🔴 Must | R1 |
| RF-027 | O sistema deve **calcular automaticamente o consumo de perfis de alumínio** (metro linear) com base na composição do tipo de produto e nas medidas informadas. | 🔴 Must | R1 |
| RF-028 | O sistema deve **incluir automaticamente as ferragens** necessárias com base no tipo de produto e suas quantidades padrão definidas no catálogo. | 🔴 Must | R1 |
| RF-029 | O sistema deve calcular automaticamente a área de película (quando aplicável) usando a mesma fórmula de área do vidro × preço/m² da película. | 🟡 Should | R1 |
| RF-030 | O sistema deve permitir aplicar **desconto percentual** (0% a 100%) por item ou no total do orçamento. | 🔴 Must | R1 |
| RF-031 | O sistema deve exibir em tempo real: subtotal por item, total de descontos, e valor final do orçamento. | 🔴 Must | R1 |
| RF-032 | O sistema deve permitir duplicar um orçamento existente para criar um novo com os mesmos itens. | 🟢 Could | R1 |
| RF-033 | O sistema deve gerar **PDF do orçamento COM valores** (proposta comercial), incluindo: dados da empresa, dados do cliente, lista de itens com medidas e preços, descontos, total e condições. | 🔴 Must | R1 |
| RF-034 | O sistema deve gerar **PDF do orçamento SEM valores** (uso interno/produção), contendo apenas descrição dos itens e medidas. | 🔴 Must | R1 |
| RF-035 | O sistema deve manter os status do orçamento: **Rascunho** → **Enviado** → **Aprovado** / **Recusado** / **Expirado**. | 🔴 Must | R1 |

### 2.6 Módulo de Pedidos e PCP

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-036 | O sistema deve permitir converter um orçamento aprovado em pedido, **congelando** todos os dados (preços, medidas, quantidades, descontos) na data da conversão. | 🔴 Must | R2 |
| RF-037 | O sistema deve gerar número sequencial único para pedidos no formato `PED-YYYYMMDD-NNNN`. | 🔴 Must | R2 |
| RF-038 | O sistema deve registrar e exibir o status do pedido: **Aprovado** → **Em Produção** → **Pronto** → **Instalado/Retirado**. | 🔴 Must | R2 |
| RF-039 | O sistema deve gerar uma **Ordem de Produção (OP)** a partir do pedido, listando todos os itens a produzir com materiais necessários. | 🔴 Must | R2 |
| RF-040 | O sistema deve gerar **listas de corte de perfis de alumínio** agrupados por tipo e comprimento da barra. | 🔴 Must | R2 |
| RF-041 | O sistema deve gerar **listas de corte de vidro** com as medidas de cada peça. | 🔴 Must | R2 |
| RF-042 | O sistema deve gerar etiquetas de identificação por peça (número do pedido, cliente, medidas, tipo). | 🟡 Should | R2 |

### 2.7 Módulo de Estoque

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-043 | O sistema deve permitir registrar **entrada de materiais** com quantidade, fornecedor, número da nota fiscal e data de entrada. | 🔴 Must | R2 |
| RF-044 | O sistema deve exibir o **saldo atual** de cada material (quantidade total - reservas - consumo + entradas). | 🔴 Must | R2 |
| RF-045 | O sistema deve **reservar automaticamente** os materiais necessários quando um pedido é aprovado. | 🔴 Must | R2 |
| RF-046 | O sistema deve permitir registrar **consumo real** de materiais ao executar a OP, dando baixa no estoque. | 🔴 Must | R2 |
| RF-047 | O sistema deve permitir registrar **perdas e quebras** durante a produção com motivo. | 🟡 Should | R2 |
| RF-048 | O sistema deve alertar quando o estoque de um material atingir o **estoque mínimo** configurado. | 🟡 Should | R2 |

### 2.8 Módulo Financeiro

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-049 | O sistema deve gerar **contas a receber** automaticamente a partir de pedidos aprovados. | 🔴 Must | R3 |
| RF-050 | O sistema deve permitir configurar **parcelamentos** (entrada + N parcelas) com datas e valores. | 🔴 Must | R3 |
| RF-051 | O sistema deve permitir registrar **baixa de pagamentos** com data, valor, forma de pagamento (dinheiro, PIX, cartão, boleto, cheque). | 🔴 Must | R3 |
| RF-052 | O sistema deve exibir **fluxo de caixa** diário, semanal e mensal com entradas e saídas previstas vs. realizadas. | 🔴 Must | R3 |
| RF-053 | O sistema deve gerar **relatórios gerenciais**: faturamento por período, ticket médio, taxa de conversão (orçamento → pedido), ranking de clientes. | 🟡 Should | R3 |

### 2.9 Módulo de Instalação e OS

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-054 | O sistema deve permitir agendar **instalações e entregas** com data, horário e endereço. | 🟡 Should | R3 |
| RF-055 | O sistema deve gerar **ordens de serviço (OS)** para instalações com lista de itens e dados do cliente. | 🟡 Should | R3 |
| RF-056 | O sistema deve registrar a conclusão da instalação/retirada, **encerrando o ciclo** do pedido. | 🟡 Should | R3 |

---

## 3. Requisitos Não-Funcionais

### 3.1 Performance

| ID | Requisito | Métrica |
|---|---|---|
| RNF-001 | O sistema deve responder a consultas de listagem em até 2 segundos para tabelas com até 10.000 registros. | Tempo de resposta ≤ 2s |
| RNF-002 | O cálculo automático de orçamento (vidro + alumínio + ferragens) deve ser processado em até 500ms. | Tempo de processamento ≤ 500ms |
| RNF-003 | A geração de PDF deve ser concluída em até 5 segundos. | Tempo de geração ≤ 5s |

### 3.2 Segurança

| ID | Requisito | Detalhamento |
|---|---|---|
| RNF-004 | Todas as senhas devem ser armazenadas com hash BCrypt (custo mínimo 12). | Armazenamento seguro |
| RNF-005 | Todas as comunicações devem utilizar HTTPS (TLS 1.2+). | Criptografia em trânsito |
| RNF-006 | Tokens JWT devem ter validade máxima de 8 horas, com refresh token de 7 dias. | Controle de sessão |
| RNF-007 | O sistema deve implementar proteção contra SQL Injection, XSS e CSRF. | Segurança de aplicação |

### 3.3 Usabilidade

| ID | Requisito | Detalhamento |
|---|---|---|
| RNF-008 | A interface deve ser responsiva, funcionando em telas de 360px (celular) até 1920px (desktop). | Design responsivo |
| RNF-009 | O sistema deve funcionar como PWA, permitindo instalação na tela inicial do celular/tablet. | Progressive Web App |
| RNF-010 | O sistema deve utilizar feedback visual claro (loading, success, error) em todas as operações. | UX consistente |
| RNF-011 | Formulários devem ter validação em tempo real (frontend) e validação no servidor (backend). | Validação dupla |

### 3.4 Confiabilidade

| ID | Requisito | Detalhamento |
|---|---|---|
| RNF-012 | O sistema deve manter disponibilidade mínima de 99% em horário comercial (08h-18h, seg-sáb). | Disponibilidade |
| RNF-013 | Backups do banco de dados devem ser realizados automaticamente a cada 24 horas. | Recuperação de desastres |
| RNF-014 | O sistema deve implementar migrações de banco de dados versionadas via Flyway. | Evolução controlada do schema |

### 3.5 Manutenibilidade

| ID | Requisito | Detalhamento |
|---|---|---|
| RNF-015 | O código backend deve seguir o padrão **package-by-feature** conforme definido no documento de arquitetura. | Organização modular |
| RNF-016 | Cobertura mínima de testes unitários de **70%** para as camadas de Service e Domain. | Qualidade de código |
| RNF-017 | Todo código deve passar por **Code Review** via Pull Request com pelo menos 1 aprovação. | Governança de código |

### 3.6 Infraestrutura

| ID | Requisito | Detalhamento |
|---|---|---|
| RNF-018 | O sistema deve ser containerizado com Docker, com Docker Compose para ambiente de desenvolvimento. | Portabilidade |
| RNF-019 | O CI/CD deve ser configurado com GitHub Actions para build, testes e deploy automáticos. | Entrega contínua |
| RNF-020 | O banco de dados de produção deve ser PostgreSQL 16+. | Compatibilidade |

---

## 4. Regras de Negócio

> **Nota:** As regras detalhadas de cálculo estão documentadas no artefato `RN-Regras_de_Calculo.md`.

| ID | Regra | Módulo |
|---|---|---|
| RN-001 | A área de vidro é calculada como `(largura_cm / 100) × (altura_cm / 100)` = m², com área mínima de 0,50 m². | Orçamentos |
| RN-002 | O consumo de perfis é calculado com base na composição do tipo de produto (perímetro, montantes, travessas). | Orçamentos |
| RN-003 | Ferragens são incluídas automaticamente conforme a tabela de composição do tipo de produto. | Orçamentos |
| RN-004 | Descontos não podem ultrapassar a margem mínima definida pelo administrador. | Orçamentos |
| RN-005 | Ao aprovar um orçamento, todos os dados (preços, medidas, quantidades) são congelados e não podem ser alterados no pedido resultante. | Pedidos |
| RN-006 | Materiais reservados por pedidos aprovados não estão disponíveis para novos orçamentos. | Estoque |
| RN-007 | O estoque não pode ficar negativo. Se não houver material suficiente, o sistema deve alertar antes da aprovação. | Estoque |
| RN-008 | Parcelas vencidas há mais de 30 dias devem ser destacadas como inadimplentes no painel financeiro. | Financeiro |

---

## 5. Rastreabilidade

### 5.1 Requisitos × User Stories

| Requisito | User Story |
|---|---|
| RF-001 a RF-006 | US-004 a US-006 |
| RF-007 a RF-012 | US-007 a US-010 |
| RF-013 a RF-015 | US-011 a US-012 |
| RF-016 a RF-021 | US-013 a US-021 |
| RF-022 a RF-035 | US-022 a US-034 |
| RF-036 a RF-042 | US-035 a US-041 |
| RF-043 a RF-048 | US-042 a US-046 |
| RF-049 a RF-053 | US-047 a US-051 |
| RF-054 a RF-056 | US-052 a US-054 |

---

*Documento elaborado pela Ítalo Jefferson / Equipe AlumiGest — IFPB CST em ADS — Agosto/2026*
