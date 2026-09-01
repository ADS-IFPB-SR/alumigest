# REQ — Documento de Requisitos

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Versão** | 2.0 (Atualizado com regras de cálculo reais, milímetros e templates da Sprint 3/4) |
| **Data** | 31/08/2026 |

---

## Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 05/08/2026 | 1.0 | Versão inicial do Documento de Requisitos | Ítalo Jefferson / Equipe AlumiGest |
| 31/08/2026 | 2.0 | Ajuste de medidas nominais para milímetros (mm), área mínima de $0,25 m^2$, templates paramétricos SVG, descontos em %/R$ e PDF em duas vias | Equipe AlumiGest (Scrum Master: Italo Santos) |

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

Este documento descreve os requisitos funcionais e não-funcionais do sistema AlumiGest, uma Progressive Web Application (PWA) e API REST corporativa desenvolvida para a gestão operacional, precificação e controle de fabricação da **Alumiportas**.

### 1.2 Escopo

O sistema AlumiGest cobre os módulos de Catálogo Universal de Insumos, Templates de Esquadrias, Clientes, Motor de Orçamentos Dinâmico, Emissão de Propostas e Romaneios em PDF, Pedidos/PCP, Estoque e Financeiro.

### 1.3 Definições e Abreviações

| Termo | Definição |
|---|---|
| **mm** | Milímetro — unidade de medida padrão da engenharia e serralheria de esquadrias |
| **m²** | Metro quadrado — unidade de medida para cálculo de chapas de vidro e películas |
| **m linear** | Metro linear — unidade de medida para perfis e barras de alumínio |
| **OP** | Ordem de Produção |
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
| RF-001 | O sistema deve permitir o cadastro e gerenciamento de usuários operadores com nome completo, e-mail (único) e senha criptografada. | 🔴 Must | R1 |
| RF-002 | O sistema deve autenticar usuários por e-mail e senha, gerando token de sessão JWT com validade configurável. | 🔴 Must | R1 |
| RF-003 | O sistema deve suportar os perfis de acesso: **Administrador**, **Vendedor** e **Produção/Oficina**, cada um com visibilidade restrita. | 🔴 Must | R1 |
| RF-004 | O sistema deve manter os dados institucionais da Alumiportas (CNPJ, Razão Social, Telefone e Endereço) fixados no cabeçalho das propostas e telas. | 🔴 Must | R1 |
| RF-005 | O sistema deve registrar log de auditoria para operações críticas do sistema. | 🟢 Could | R2 |

---

### 2.2 Módulo de Cadastro de Clientes

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-007 | O sistema deve permitir o cadastro de clientes físicos (PF) e jurídicos (PJ) com: nome/razão social, CPF ou CNPJ (com validação de formato e unicidade), telefone/WhatsApp, e-mail e endereço completo. | 🔴 Must | R1 |
| RF-008 | O sistema deve validar a unicidade do CPF/CNPJ, impedindo duplicidades com erro semântico HTTP 409. | 🔴 Must | R1 |
| RF-009 | O sistema deve permitir pesquisa paginada de clientes por nome, documento ou telefone. | 🔴 Must | R1 |
| RF-010 | O sistema deve permitir a edição de dados cadastrais de clientes. | 🔴 Must | R1 |
| RF-011 | O sistema deve permitir inativação lógica (*soft delete*) de clientes, preservando a integridade dos orçamentos históricos vinculados. | 🔴 Must | R1 |

---

### 2.3 Módulo de Catálogo de Materiais e Insumos Universais

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-016 | O sistema deve permitir o cadastro de **Vidros** com espessuras em milímetros (**2mm, 4mm, 6mm, 8mm, 10mm**), acabamentos (Incolor, Fumê, Bronze, etc.), preço de custo e preço de venda por $m^2$. | 🔴 Must | R1 |
| RF-017 | O sistema deve permitir o cadastro de **Perfis de Alumínio e Puxadores** com código comercial (ex: `SU-001`, `S83`, `SPR-060`), linha (Rometal, Alternativa, Suprema), NCM opcional, preço por metro linear ($R\$/m$) e comprimento padrão de barra comercial (3.00m ou 6.00m). | 🔴 Must | R1 |
| RF-018 | O sistema deve permitir o cadastro de **Ferragens e Acessórios** por **Unidade (`UN`)**, **Par (`PAR`)** (dobradiças, roldanas) ou **Metro (`METRO`)** (trilhos, escovas de vedação), com preço unitário. | 🔴 Must | R1 |
| RF-019 | O sistema deve permitir o cadastro de **Películas** (Fumê G5/G20, Jateada, Leitosa, Espelhada) com preço de aplicação por $m^2$. | 🔴 Must | R1 |
| RF-020 | O sistema deve permitir ativar e inativar insumos por soft delete, garantindo que itens inativos não sejam selecionáveis em novos orçamentos. | 🔴 Must | R1 |
| RF-021 | O sistema deve fornecer busca textual com *debounce* e paginação em 4 abas dedicadas no frontend PWA. | 🔴 Must | R1 |

---

### 2.4 Módulo de Templates de Produtos (Esquadrias Paramétricas)

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-022 | O sistema deve permitir cadastrar e categorizar **Templates de Esquadrias** (Portas de Correr 2F/4F, Pivotante, Giro, Janelas e Boxes de Banheiro). | 🔴 Must | R1 |
| RF-023 | O sistema deve vincular a cada template sua tipologia (`TemplateType`) e o esquema paramétrico de desenho vetorial SVG (sentido de abertura, puxador tubular/concha e furação `Ø` no lado oposto). | 🔴 Must | R1 |
| RF-024 | O template deve definir as **Categorias Requeridas de Insumos** (`category_requirements`: `GLASS`, `PROFILE`, `HARDWARE`, `FILM`) para que o vendedor selecione os materiais correspondentes durante a montagem do orçamento. | 🔴 Must | R1 |

---

### 2.5 Módulo de Motor de Precificação e Orçamentos

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-025 | O sistema deve permitir criar orçamentos associados a um cliente, gerando código sequencial rastreável no formato `ORC-YYYYMMDD-NNNN`. | 🔴 Must | R1 |
| RF-026 | O sistema deve solicitar as **medidas nominais em milímetros (Largura × Altura em mm)** para cada item adicionado. | 🔴 Must | R1 |
| RF-027 | O sistema deve **calcular automaticamente a área de vidro ($m^2$)**: $\text{Área} = (\text{Largura\_mm} / 1000) \times (\text{Altura\_mm} / 1000)$, aplicando a **área mínima de faturamento de $0,25 m^2$** (`RN-V03`). | 🔴 Must | R1 |
| RF-028 | O sistema deve **calcular automaticamente o consumo linear de perfis de alumínio ($m$)** com base nas fórmulas do modelo de esquadria (ex: $4W + 6H$ para portas de correr) e multiplicar pelo preço por metro do perfil escolhido. | 🔴 Must | R1 |
| RF-029 | O sistema deve **incluir e calcular automaticamente as ferragens** com base na unidade de venda (UN, PAR ou METRO) ou peso/área do vidro. | 🔴 Must | R1 |
| RF-030 | O sistema deve calcular automaticamente a aplicação de película sobre a área de vidro quando selecionada. | 🔴 Must | R1 |
| RF-031 | O sistema deve permitir que o vendedor flexibilize o preço unitário de um insumo no item sem alterar a tabela mestre do catálogo (`RN-V04`). | 🔴 Must | R1 |
| RF-032 | O sistema deve permitir aplicar **Descontos Comerciais em percentual (%) ou valor fixo em reais (R$)**, com autonomia total do vendedor, além de taxas adicionais (instalação/frete). | 🔴 Must | R1 |
| RF-033 | O sistema deve permitir selecionar **Condições de Pagamento** pré-cadastradas (À Vista PIX/Dinheiro, 50% Entrada + 50% Entrega, Cartão até 12x) e definir a validade da proposta (padrão 15 dias). | 🔴 Must | R1 |
| RF-034 | O sistema deve exibir um **indicador de subtotal reativo em tempo real** durante a configuração do item no Wizard de orçamentos. | 🔴 Must | R1 |
| RF-035 | O sistema deve gerenciar a máquina de estados do orçamento: **RASCUNHO (`DRAFT`) → ENVIADO (`SENT`) → APROVADO (`APPROVED`) / CANCELADO (`CANCELLED`)**, congelando os valores após a aprovação. | 🔴 Must | R1 |
| RF-036 | O sistema deve permitir a emissão de **PDF da Proposta Comercial** (com logotipo institucional, dados do cliente, itens discriminados, valores unitários, totais, descontos e condições) e botão de cópia de resumo para o WhatsApp. | 🔴 Must | R1 |
| RF-037 | O sistema deve permitir a emissão de **PDF da Via Técnica / Oficina (Romaneio)** contendo todas as especificações de engenharia (medidas nominais L x A mm, modelo, cores, vidro, abertura e ferragens) **sem exibir nenhum valor financeiro (R$)**. | 🔴 Must | R1 |

---

### 2.6 Módulo de Pedidos, PCP e Fábrica (Release 2)

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-038 | O sistema deve permitir converter um orçamento aprovado em **Pedido de Venda**, congelando medidas e preços. | 🔴 Must | R2 |
| RF-039 | O sistema deve emitir **Ordem de Produção (OP)** com relação consolidada de corte de barras de alumínio e chapas de vidro. | 🔴 Must | R2 |
| RF-040 | O sistema deve controlar os status de produção: **Pendente → Em Fabricação → Montado → Pronto para Instalação**. | 🔴 Must | R2 |
| RF-041 | O sistema deve permitir a impressão de etiquetas térmicas com identificação de peças e cliente. | 🟡 Should | R2 |

---

### 2.7 Módulo de Estoque e Compras (Release 2)

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-042 | O sistema deve controlar o saldo de estoque físico e estoque reservado de perfis, vidros e ferragens. | 🔴 Must | R2 |
| RF-043 | O sistema deve dar baixa automática dos insumos ao iniciar a Ordem de Produção. | 🔴 Must | R2 |
| RF-044 | O sistema deve alertar o operador quando o saldo atingir o ponto de reposição (estoque mínimo). | 🟡 Should | R2 |

---

### 2.8 Módulo Financeiro e Fluxo de Caixa (Release 3)

| ID | Requisito | Prioridade | Release |
|---|---|---|---|
| RF-045 | O sistema deve gerar títulos de **Contas a Receber** com base no plano de pagamento acordado no pedido. | 🔴 Must | R3 |
| RF-046 | O sistema deve permitir registrar baixa de pagamentos (PIX, Cartão, Dinheiro, Boleto). | 🔴 Must | R3 |
| RF-047 | O sistema deve emitir relatórios de Fluxo de Caixa diário, faturamento mensal e ticket médio. | 🔴 Must | R3 |

---

## 3. Requisitos Não-Funcionais

### 3.1 Performance
* **RNF-001:** O cálculo automático do orçamento e subtotal deve responder em menos de **500ms**.
* **RNF-002:** A renderização da pré-visualização e geração do PDF deve ocorrer em menos de **2 segundos**.
* **RNF-003:** Consultas paginadas de materiais e orçamentos devem responder em até **1 segundo**.

### 3.2 Segurança e Arquitetura
* **RNF-004:** Senhas armazenadas com hash BCrypt seguro.
* **RNF-005:** Arquitetura Backend em **Java 21 LTS + Spring Boot 3.4** seguindo o padrão *package-by-feature*.
* **RNF-006:** Frontend em **React 18 + TypeScript + Vite**, estruturado como Progressive Web App (PWA).
* **RNF-007:** Banco de dados relacional **PostgreSQL 16** gerenciado com migrações versionadas via **Flyway**.

### 3.3 Qualidade e DevOps
* **RNF-008:** Pipeline de CI/CD automatizada no GitHub Actions com relatórios segregados do **SonarQube**.
* **RNF-009:** Cobertura de testes unitários e de integração superior a **80%** nos serviços críticos de negócio.
* **RNF-010:** Suíte de testes End-to-End automatizada com **Cypress** para fluxos de interface.

---

## 4. Regras de Negócio Fundamentais

| ID | Regra | Módulo |
|---|---|---|
| **RN-V01** | Vidros possuem espessuras nominais padrão de 2mm a 10mm. | Catálogo |
| **RN-V02** | $\text{Preço Vidro} = (\text{Largura\_mm}/1000) \times (\text{Altura\_mm}/1000) \times \text{Preço}/m^2 \times \text{Qtd}$. | Orçamentos |
| **RN-V03** | **Área Mínima de Faturamento:** Se a área de uma peça for $< 0,25 m^2$, adota-se $0,25 m^2$ para cálculo de corte. | Orçamentos |
| **RN-V04** | **Flexibilidade Comercial:** O preço unitário do insumo pode ser editado no orçamento sem alterar a tabela mestre do catálogo. | Orçamentos |
| **RN-AL01** | Perfis de alumínio são calculados por metro linear ($m$) a partir do perímetro e montantes da esquadria. | Orçamentos |
| **RN-DESC01** | O vendedor possui autonomia total para aplicar descontos em percentual (%) ou valor fixo (R$) no orçamento. | Orçamentos |
| **RN-PDF01** | A via técnica para oficina omite estritamente quaisquer valores monetários (R$). | Orçamentos |

---

*Documento de Requisitos homologado pela Equipe AlumiGest — Versão 2.0 — 31/08/2026*
