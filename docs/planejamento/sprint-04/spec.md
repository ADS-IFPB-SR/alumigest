# Feature Specification: Sprint 4 — Descontos Comerciais (Parte 1: Fundação & Modelagem) e Homologação R1

**Feature Branch**: `001-orcamento-descontos-pdf`

**Created**: 2026-08-27

**Status**: 🟡 Em Execução / Homologação (US-09 Parte 1 entregue; US-12 Homologação R1 / Baseline v0.4.0 não foi concluída ainda)

**Input**: User description: "Descontos comerciais, modelagem de orçamentos, infraestrutura Flyway V8, regras de cálculo e homologação da Release 1"

> ℹ️ **Nota de Alinhamento de Escopo (Sprint 04 vs Sprint 05)**:  
> Conforme histórico oficial do projeto registrado no Git e nas Atas de Daily Scrum:  
> - A **Sprint 04** cobriu a **US-09 (Parte 1: Fundação de Descontos, Modelagem de Banco Flyway V8 e Regras de Cálculo)** (🟢 Concluída) e a **US-12 (Homologação Integrada da Release 1 / Baseline v0.4.0)** (🟡 Em Homologação - Não Concluída).  
> - A **US-09 (Parte 2: Integração Comercial, Validade de 15 Dias e Listagem Paginada)**, a **US-10 (PDF Comercial e WhatsApp)** e a **US-11 (PDF Técnico de Oficina)** pertencem e foram implementadas na [Sprint 05](../sprint-05/spec.md).

## Clarifications

### Session 2026-08-27
- **Q1 (Política de Descontos)**: O vendedor tem autonomia total para aplicar descontos em percentual (%) ou valor fixo (R$) sem travas de alçada ou necessidade de aprovação de perfil administrador nesta fase.
- **Q2 (Condições de Pagamento)**: O sistema fornecerá uma lista de opções predefinidas de pagamento (ex: *"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*) com campo complementar para observações personalizadas.
- **Q3 (Precisão Numérica e Limites)**: Cálculos monetários utilizam estritamente `BigDecimal` com arredondamento `HALF_EVEN` e validação para impedir descontos superiores a 100% ou maiores que o valor bruto.
- **Q4 (Estrutura de Persistência)**: Criação das tabelas relacionais `budgets` e `budget_items` via migração Flyway V8 com rastreabilidade e integridade referencial.

## User Scenarios & Testing *(mandatory)*

### 📌 US-09 (Parte 1): Fundação e Regras Base de Descontos Comerciais e Orçamentos (Priority: P1) 🎯 MVP
**Status**: 🟢 Concluída na Sprint 04 ([Issue #133](https://github.com/ADS-IFPB-SR/alumigest/issues/133))

#### 🎯 Objetivo de Negócio
> **Como** vendedor da Alumiportas,  
> **Desejo** que o sistema possua a estrutura e o motor de cálculo para aplicar descontos comerciais (em percentual % ou valor fixo em R$) com autonomia, adicionar taxas extras de frete e instalação e computar valores brutos e líquidos com precisão centesimal,  
> **Para que** as regras de precificação comercial do AlumiGest sejam matematicamente exatas, auditáveis e sirvam de alicerce para a emissão de propostas.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [x] **Cenário 1: Aplicação de desconto percentual com recálculo numérico imediato**
  - **Dado que** existe um orçamento no estado `DRAFT` com valor bruto total de R$ 1.500,00
  - **Quando** o motor de cálculo processa um desconto percentual de 10%
  - **Então** o sistema calcula o desconto em R$ 150,00 e define o valor total líquido para R$ 1.350,00
  - **E** preserva a precisão decimal monetária (`BigDecimal` de duas casas decimais).

- [x] **Cenário 2: Aplicação de desconto em valor monetário fixo (R$)**
  - **Dado que** o orçamento possui valor bruto de R$ 2.000,00
  - **Quando** é informado um desconto fixo de R$ 200,00
  - **Então** o sistema computa o percentual equivalente (10,0%) e define o valor total líquido para R$ 1.800,00
  - **E** preserva a coerência entre percentual e valor monetário.

- [x] **Cenário 3: Validação de limite e rejeição de desconto abusivo**
  - **Dado que** um orçamento possui valor bruto de R$ 2.000,00
  - **Quando** há tentativa de informar um desconto superior a 100% ou maior que o valor bruto (ex: R$ 2.500,00)
  - **Então** o sistema impede a ação com mensagem amigável de validação em português: "O valor do desconto não pode ser superior ao valor total do orçamento".

- [x] **Cenário 4: Inclusão de taxas adicionais de frete e instalação**
  - **Dado que** o orçamento prevê taxa de entrega de R$ 120,00 e taxa de instalação de R$ 250,00
  - **Quando** o serviço processa os totais
  - **Então** o backend soma as taxas ao total líquido: `valor_liquido = (valor_bruto - desconto) + frete + instalacao`.

- [x] **Cenário 5: Persistência e modelagem relacional completa (Flyway V8)**
  - **Dado que** a migration `V8__create_budgets_schema.sql` é executada
  - **Quando** a aplicação sobe
  - **Então** as tabelas `budgets` e `budget_items` são criadas com todas as constraints, chaves estrangeiras com exclusão em cascata e índices de busca.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Autonomia Comercial)**: O vendedor possui autonomia direta para conceder descontos em % ou R$ sem necessidade de alçada ou aprovação gerencial nesta fase.
- **RN-02 (Fórmula do Valor Líquido)**: `valor_liquido = (valor_bruto - desconto) + frete + instalacao`.
- **RN-03 (Precisão Numérica)**: Operações monetárias com `BigDecimal` de duas casas decimais e arredondamento `HALF_EVEN`.
- **RN-04 (Continuidade na Sprint 05)**: A integração visual completa dos painéis de desconto, a regra de validade de 15 dias corridos e a listagem paginada foram finalizadas na [Sprint 05](../sprint-05/spec.md).

#### 🔌 Especificação Técnica
- **Backend**:
  - Migration Flyway `V8__create_budgets_schema.sql` criando o esquema de orçamentos.
  - Entidades `Budget` e `BudgetItem`, enums `BudgetStatus`, `DiscountType`, `PaymentCondition`.
  - Records DTOs: `BudgetCreateRequest`, `BudgetItemCreateRequest`, `DiscountRequest`, `BudgetResponse`.
  - Testes unitários com JUnit 5 cobrindo cálculo percentual, fixo e validação de limites.

---

> 🔀 **Transição de Escopo**:  
> As **US-10** (*Emitir e Exportar Orçamento em PDF - Via Comercial e WhatsApp*) e **US-11** (*Emitir Orçamento em PDF - Via Técnica de Oficina*) pertencem oficialmente à **Sprint 05**. Consulte a especificação integral em [docs/planejamento/sprint-05/spec.md](../sprint-05/spec.md).

---

### 📌 US-12: Homologação Integrada e Validação da Release 1 (v1.0.0 / Baseline v0.4.0) (Priority: P2)
**Status**: 🟡 Em Execução / Homologação (Não Concluída) ([Issue #136](https://github.com/ADS-IFPB-SR/alumigest/issues/136))

Como equipe de engenharia de software, QA e stakeholders da Alumiportas, desejamos executar a bateria completa de homologação ponta a ponta da Release 1 cobrindo todo o fluxo comercial (Insumo ➔ Produto Paramétrico ➔ Orçamento com Descontos e Itens Avulsos ➔ Emissão de PDF Comercial e Ficha Técnica), para certificar a estabilidade de produção, zero regressões e conformidade com o SonarQube Quality Gate antes do lançamento oficial da versão 1.0.0.

**Why this priority**: Consolida a entrega oficial da primeira versão utilizável do sistema em produção.

**Independent Test**: Execução dos testes automatizados backend/frontend e validação dos cenários de aceitação (TEA) da Release 1.

**Critérios de Aceitação (Dado / Quando / Então)**:

- [ ] **1. Execução Completa da Pirâmide de Testes Automatizados no Backend:**
  - **Dado que** o código da Release 1 está consolidado na branch de homologação,
  - **Quando** o comando `./mvnw clean verify` é executado no backend,
  - **Então** 100% dos testes unitários e de integração de controllers/repositories passam sem erros ou falhas (`BUILD SUCCESS`),
  - **E** a cobertura global de testes atinge $\ge 80\%$ nas classes de serviço do domínio de orçamentos e catálogo.
- [ ] **2. Compilação e Testes Rigorosos do Frontend (React / Vite):**
  - **Dado que** o frontend possui novos componentes, páginas de detalhes e builders CAD,
  - **Quando** os comandos `npm run lint`, `npm run build` e `npm test -- --run` são executados,
  - **Então** o linter (Oxlint) conclui com 0 erros, o TypeScript compila sem inconsistências de tipos e todas as suítes Vitest são aprovadas com sucesso.
- [ ] **3. Aprovação Integral no SonarQube Quality Gate:**
  - **Dado que** a pipeline de CI é acionada no GitHub Actions,
  - **Quando** os scanners do backend e frontend concluem a análise estática de código,
  - **Então** o Quality Gate deve reportar status `PASSED` com 0 bugs novos, 0 vulnerabilidades novas, 0 security hotspots abertos e cobertura de código novo $\ge 80\%$.
- [ ] **4. Homologação Ponta a Ponta do Fluxo Operacional (Quickstart / E2E):**
  - **Dado que** os serviços estão rodando em ambiente integrado com banco PostgreSQL,
  - **Quando** o usuário executa o fluxo completo do `quickstart.md` (Cadastro de perfil/vidro ➔ Montagem de esquadria ➔ Criação de orçamento base ➔ Aplicação de desconto de 10% ➔ Adição de venda avulsa),
  - **Então** todas as operações são concluídas com êxito, os dados batem exatamente com a tela e nenhuma exceção não tratada ocorre no console ou log.
- [ ] **5. Auditoria de Responsividade Mobile e PWA:**
  - **Dado que** o vendedor ou cliente acessa o sistema através de dispositivo móvel ou tablet (viewport $\le 768px$),
  - **Quando** navega pela listagem de orçamentos, wizard de esquadrias e página de detalhes,
  - **Então** o layout responde fluidamente com botões touch-friendly, ausência de overflow horizontal e topbars colapsáveis.
- [ ] **6. Documentação Formal dos Testes de Aceitação (TEA):**
  - **Dado que** todos os cenários de homologação foram testados e aprovados,
  - **Quando** a etapa de QA for encerrada,
  - **Então** os resultados, evidências de cobertura e métricas consolidadas são formalizados no documento `docs/projeto-001/003-teste/TEA-Testes_de_Aceitacao_Sprint04.md`.

---

### Edge Cases

- O que acontece se o usuário informar um desconto percentual negativo ou superior a 100%? O sistema bloqueia a entrada com validação no frontend e no backend (JSR-380 `@DecimalMin("0.0")` e `@DecimalMax("100.0")`).
- O que acontece se o cliente não tiver CPF/CNPJ ou endereço completo cadastrado? O sistema armazena os dados existentes (Nome e Telefone), marcando campos ausentes como "Não informado" sem comprometer o fluxo.
- O que acontece se o orçamento tiver muitos itens? A paginação e a renderização suportam listagens extensas sem estouro de pilha ou lentidão.
- O que acontece quando a data atual ultrapassa a data de validade? O sistema exibe um badge visual de "Expirado" no orçamento, mantendo os dados preservados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir a aplicação de descontos em valor fixo (R$) ou percentual (%) sobre o total do orçamento com autonomia do vendedor.
- **FR-002**: O sistema MUST recalcular em tempo real o valor total bruto, valor do desconto e valor líquido sempre que houver alteração de itens, descontos ou taxas adicionais.
- **FR-003**: O sistema MUST disponibilizar opções de condições de pagamento pré-configuradas (*"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*) juntamente com campo para observações comerciais adicionais.
- **FR-004**: O sistema MUST definir automaticamente a data de validade do orçamento para 15 dias corridos a partir da data de criação/emissão, permitindo ajuste manual pelo vendedor (finalizado na Sprint 05).
- **FR-005**: O sistema MUST gerar o PDF do Orçamento - Via Comercial (implementado na [Sprint 05](../sprint-05/spec.md) - US-10).
- **FR-006**: O sistema MUST gerar o PDF do Orçamento - Via Técnica de Oficina sob sigilo de preços (implementado na [Sprint 05](../sprint-05/spec.md) - US-11).
- **FR-007**: O sistema MUST permitir copiar o resumo comercial do orçamento em texto simples formatado para envio direto via WhatsApp (implementado na [Sprint 05](../sprint-05/spec.md) - US-10).
- **FR-008**: O sistema MUST validar que o valor total de desconto não seja negativo e não exceda o valor total bruto do orçamento.

### Key Entities *(include if feature involves data)*

- **Orcamento (Budget)**: Armazena número sequencial, clienteId, status (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO), valorBruto, valorDesconto, tipoDesconto (PERCENTUAL, VALOR_FIXO), percentualDesconto, taxaInstalacao, taxaFrete, valorLiquido, condicaoPagamento, observacoesPagamento, dataEmissao, dataValidade.
- **ItemOrcamento (BudgetItem)**: Itens do orçamento com referência a produtoId/template, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, listaFerragens, valorUnitario, valorTotal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tempo de aplicação de descontos e cálculo de totais inferior a 1 segundo pelo motor de precificação.
- **SC-002**: 100% de exatidão matemática nos cálculos de descontos, taxas e totais utilizando precisão decimal monetária (`BigDecimal` com 2 casas decimais).
- **SC-003**: Aprovação de 100% dos testes automatizados unitários/integração no CI com Quality Gate do SonarQube aprovado.

## Assumptions

- A modelagem relacional de orçamentos e itens foi persistida via Flyway V8 no PostgreSQL.
- As emissões de PDF e integrações de WhatsApp foram alocadas na Sprint 05 para permitir foco da equipe e maturidade da suíte de testes.