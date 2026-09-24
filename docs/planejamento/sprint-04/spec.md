# Feature Specification: Sprint 4 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos/Condições (US-09) e Quality SonarQube

**Feature**: Refatoração Estrutural e Fundação de Orçamentos Comerciais  
**Release**: Release 1 (Baseline v0.4.0)  
**Período da Sprint**: 01/09/2026 a 14/09/2026 (14 dias)  
**Status**: 🟢 Concluída (44/50 Story Points — 88% de conclusão)  
**Quadro de Referência**: ZenHub / GitHub Projects (`has:parent-issue sprint:"Sprint 4"`)  
**Governança**: Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`)

---

## 1. 🎯 Visão Geral & Contexto de Negócio

A **Sprint 04** concentrou o esforço de engenharia na modernização arquitetural e consolidação de qualidade do AlumiGest, abrangendo 5 demandas estratégicas:

1. **`quality #245` — Resolução de Débitos Técnicos e Conformidade com SonarQube (5 pts / 100% Concluído):**
   - Adequação do código-fonte aos padrões do SonarLint e SonarQube Quality Gate.
   - Exclusão de DTOs/Mappers das métricas de cobertura no JaCoCo, focando a cobertura nos Services de negócio.
   - Resolução de vulnerabilidades SAST, code smells de concorrência e tipagens genéricas.
2. **`US-05 #126` — Refatorar Produtos com Templates Paramétricos de Esquadrias (5 pts / 100% Concluído):**
   - Reestruturação da modelagem de templates de esquadrias e suporte canônico aos 10 modelos paramétricos em SVG.
   - Implementação do Studio CAD com renderização dinâmica e isolamento das fórmulas de folga e contorno.
   - Criação do seletor `CategoryRequirementsSelector` desacoplando o catálogo estático dos modelos paramétricos.
3. **`US-46 #172` — Refatoração do Módulo de Orçamentos (Budget V2) (6 pts / 100% Concluído):**
   - Refatoração da arquitetura de orçamentos para suportar criação transacional atômica com itens inclusos (`BudgetCreateRequest` com lista de itens).
   - Desacoplamento entre serviços de cabeçalho e serviços de cálculo de itens com `BigDecimal`.
   - Tratamento de status e transições formais de máquina de estados (`DRAFT`, `SENT`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELLED`).
4. **`US-09 #133` — Aplicar Descontos e Condições Comerciais no Orçamento (32 pts / Parcialmente Concluído — 28 pts entregues):**
   - Implementação no backend do motor de cálculo de descontos em percentual (%) e valor fixo em reais (R$).
   - Disponibilização de opções predefinidas de condições de pagamento (*"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*).
   - Validações estritas de alçada comercial e recálculo determinístico com arredondamento `HALF_EVEN`.
   - *Nota de Transição:* A finalização dos painéis de UI, o controle de expiração de 15 dias e a listagem paginada foram migrados para a [Sprint 05](../sprint-05/spec.md).
5. **`US-12 #136` — Homologação Integrada e Validação da Release 1 (2 pts / Não Realizada na S04 — Diluída na Sprint 05):**
   - A homologação em lote fechado não foi realizada isoladamente na Sprint 04 para evitar gargalos de entrega.
   - **Decisão Deliberada de Governança:** Os critérios de homologação, testes de carga e validação ponta a ponta da Release 1 foram **diluídos e incorporados como Definition of Done (DoD) incremental das US-09 e US-10 da Sprint 05**.

---

## 2. 💡 Esclarecimentos e Decisões de Arquitetura (Clarifications)

- **Q1 (Escopo Real da Sprint 04 vs Sprint 05):** A Sprint 04 foi orientada a sanear débitos de qualidade e entregar a infraestrutura matemática e de templates, enquanto a Sprint 05 concentrou os artefatos de saída (PDFs comercial e técnico, WhatsApp e conclusão das telas de orçamento).
- **Q2 (Autonomia de Descontos na US-09):** O vendedor tem autonomia direta para aplicar descontos em % ou R$ sem necessidade de alçada gerencial, respeitando a trava de que o desconto não pode superar o valor bruto do orçamento.
- **Q3 (Precisão Numérica de Corte e Valores):** Todos os cálculos de preços, descontos, taxas de frete e instalação utilizam estritamente `BigDecimal` com escala 2 e arredondamento `HALF_EVEN`. Dimensões de corte utilizam escala milimétrica com arredondamento inteiro `CEILING` para barras comerciais de 6 metros.
- **Q4 (Conformidade SonarQube na `quality #245`):** Configurado limiar de 80% de cobertura em código novo para classes de serviço de domínio (`catalog`, `budgets`, `customers`), mantendo zero bugs e zero vulnerabilidades de segurança.

---

## 3. 👥 Histórias de Usuário e Cenários de Aceitação (BDD / Gherkin)

### 📌 Demandas 1 & 2: Qualidade e Templates Paramétricos

#### 🛠️ `quality #245`: Resolução de Débitos Técnicos e Conformidade com SonarQube (5 pts)
**Status**: 🟢 Concluído na Sprint 04 ([Issue #245](https://github.com/ADS-IFPB-SR/alumigest/issues/245))

- [x] **Cenário 1: Exclusão de DTOs e Mappers do JaCoCo**
  - **Dado que** o plugin JaCoCo avalia a cobertura de testes no build Maven
  - **Quando** a pipeline `./mvnw clean verify` é executada
  - **Então** classes record DTOs, mappers MapStruct e entidades JPA são excluídas das métricas de cobertura de linha
  - **E** o limiar de 80% passa a incidir estritamente sobre classes com regras de negócio (`*Service`, `*Calculator`).
- [x] **Cenário 2: Eliminação de Vulnerabilidades SAST e Code Smells de Concorrência**
  - **Dado que** o código Java 21 é inspecionado pelo SonarScanner
  - **Quando** são analisadas operações de coleções, streams e acessos concorrentes
  - **Então** nenhum alerta de segurança ou concorrência insegura é reportado, obtendo Security Rating A e Reliability Rating A.

#### 🪟 `US-05 #126`: Refatorar Produtos com Templates Paramétricos de Esquadrias (5 pts)
**Status**: 🟢 Concluído na Sprint 04 ([Issue #126](https://github.com/ADS-IFPB-SR/alumigest/issues/126))

- [x] **Cenário 1: Renderização SVG dos 10 Modelos Canônicos de Esquadrias**
  - **Dado que** o usuário acessa o catálogo e seleciona um modelo (ex: Janela 2 Folhas Correr, Porta Pivotante, Maxim-ar)
  - **Quando** informa as dimensões de largura ($W$) e altura ($H$) em milímetros
  - **Então** o componente visual Studio CAD renderiza o SVG vetorial proporcional em tempo real com cotas cotadas e indicações de abertura.
- [x] **Cenário 2: Validação de Vãos Físicos e Requisitos de Insumos**
  - **Dado que** o usuário tenta informar uma dimensão de vão inferior a 400 mm
  - **Quando** o validador do template processa a entrada
  - **Então** o sistema exibe alerta visual de subdimensionamento físico e impede a geração de cálculo com medidas inválidas.

---

### 📌 Demandas 3, 4 & 5: Orçamentos V2, Descontos e Homologação R1

#### 📦 `US-46 #172`: Refatoração do Módulo de Orçamentos (Budget V2) (6 pts)
**Status**: 🟢 Concluído na Sprint 04 ([Issue #172](https://github.com/ADS-IFPB-SR/alumigest/issues/172))

- [x] **Cenário 1: Criação Transacional Atômica com Itens Inclusos**
  - **Dado que** o cliente envia um `BudgetCreateRequest` contendo cabeçalho e lista de `BudgetItemCreateRequest`
  - **Quando** o endpoint `POST /api/budgets` é invocado
  - **Então** o backend executa em transação `@Transactional` única a persistência do orçamento e de todos os seus itens
  - **E** retorna o payload completo `BudgetResponse` com totais calculados e UUIDs gerados sem descarte de itens.
- [x] **Cenário 2: Desacoplamento de Serviços e Tipagens Fortes**
  - **Dado que** o módulo de orçamentos precisa calcular custos e validar regras
  - **Quando** as operações de negócio são executadas
  - **Então** as responsabilidades são divididas entre `BudgetService`, `BudgetItemService` e `PricingCalculator`, sem acoplamento cíclico.

#### 💰 `US-09 #133`: Aplicar Descontos e Condições Comerciais no Orçamento (32 pts)
**Status**: 🟡 Parcialmente Concluído na Sprint 04 (28 pts de backend entregues; fechamento e UI na [Sprint 05](../sprint-05/spec.md))

- [x] **Cenário 1: Aplicação de Desconto Percentual (%) no Backend**
  - **Dado que** um orçamento no estado `DRAFT` possui valor bruto de R$ 1.500,00
  - **Quando** é submetido um desconto percentual de 10%
  - **Então** o sistema calcula o desconto em R$ 150,00 e atualiza o valor líquido para R$ 1.350,00 com precisão `BigDecimal`.
- [x] **Cenário 2: Aplicação de Desconto em Valor Fixo (R$)**
  - **Dado que** o orçamento possui valor bruto de R$ 2.000,00
  - **Quando** é informado um desconto fixo de R$ 200,00
  - **Então** o sistema computa o valor líquido de R$ 1.800,00 e o percentual equivalente de 10%.
- [x] **Cenário 3: Bloqueio de Desconto Abusivo**
  - **Dado que** o orçamento possui valor bruto de R$ 2.000,00
  - **Quando** há tentativa de aplicar desconto de R$ 2.500,00 (maior que o valor bruto)
  - **Então** o backend rejeita a operação com `BusinessException` e código HTTP 400 Bad Request.
- [x] **Cenário 4: Seleção de Condições de Pagamento Pré-configuradas**
  - **Dado que** o vendedor está compondo a proposta
  - **Quando** seleciona a condição de pagamento (À Vista, Parcelado ou A Combinar)
  - **Então** os dados são armazenados na entidade `Budget` e refletidos no contrato da API.

#### 🧪 `US-12 #136`: Homologação Integrada e Validação da Release 1 (2 pts)
**Status**: ⏸️ Replanejada na Sprint 04 — Diluída como DoD na [Sprint 05](../sprint-05/spec.md) ([Issue #136](https://github.com/ADS-IFPB-SR/alumigest/issues/136))

- [x] **Decisão Técnica e Arquitetural de Diluição:**
  - A realização de uma fase estanque e isolada de homologação na Sprint 04 foi substituída pela **incorporação contínua dos critérios de qualidade da Release 1 no Definition of Done (DoD) das histórias US-09 e US-10 da Sprint 05**.
  - Esse replanejamento assegurou que as validações de ponta a ponta, testes de integração e conformidade de regressão fossem validados diretamente no contexto dos novos fluxos de PDF e fechamento comercial.

---

## 4. 📋 Requisitos Funcionais e Não-Funcionais

### Requisitos Funcionais (FR)
- **FR-001**: O sistema MUST permitir a modelagem e renderização SVG paramétrica de 10 modelos canônicos de esquadrias com suporte a variação de largura e altura em milímetros.
- **FR-002**: O sistema MUST suportar a criação de orçamentos de forma atômica com itens inclusos via payload unificado no backend.
- **FR-003**: O sistema MUST permitir a aplicação de descontos em percentual (%) ou valor fixo em reais (R$) sobre o total bruto do orçamento.
- **FR-004**: O sistema MUST impedir descontos superiores a 100% ou maiores que o valor total bruto do orçamento.
- **FR-005**: O sistema MUST registrar as condições de pagamento pré-configuradas e observações comerciais no orçamento.

### Requisitos Não-Funcionais (NFR)
- **NFR-001 (Precisão Numérica)**: Todas as operações monetárias MUST utilizar `BigDecimal` com escala 2 e arredondamento `RoundingMode.HALF_EVEN`.
- **NFR-002 (Quality Gate SonarQube)**: O código novo da Sprint MUST atingir cobertura de testes $\ge 80\%$ nas classes de serviço de domínio com zero vulnerabilidades e zero bugs novos.
- **NFR-003 (Modularidade SVG)**: Componentes de desenho vetorial MUST operar desacoplados de regras de persistência de banco de dados.

---

## 5. 🎯 Métricas de Sucesso e Fechamento da Sprint 04

| Indicador | Meta Planejada | Resultado Atingido | Status |
|---|:---:|:---:|:---:|
| **Story Points Entregues** | 50 pts | **44 pts** | 🟢 88% Entregue |
| **Quality Gate SonarQube** | Rating A / $\ge 80\%$ | **Aprovado (0 bugs, 0 vuln)** | 🟢 Aprovado |
| **Testes Automatizados Backend** | $> 150$ testes | **242 testes passando** | 🟢 Aprovado |
| **Transição de Escopo para S05** | Alinhamento PO/Eng | **6 pts transferidos / US-12 diluída** | 🟢 Alinhado |