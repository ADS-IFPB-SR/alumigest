# Feature Specification: Sprint 4 — Descontos Comerciais

**Feature Branch**: `feat/us-09-descontos-condicoes-comerciais`

**Created**: 2026-08-27

**Status**: Clarified

**Input**: User description: "Descontos comerciais, condicoes de pagamento, emissao de PDF de orcamentos em duas vias (comercial e oficina) e homologacao da Release 1"

## Clarifications

### Session 2026-08-27
- **Q1 (Política de Descontos)**: O vendedor tem autonomia total para aplicar descontos em percentual (%) ou valor fixo (R$) sem travas de alçada ou necessidade de aprovação de perfil administrador nesta fase.
- **Q2 (Condições de Pagamento)**: O sistema fornecerá uma lista de opções predefinidas de pagamento (ex: *"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*) com campo complementar para observações personalizadas.


## User Scenarios & Testing *(mandatory)*

### 📌 US-09: Aplicar Descontos e Condições Comerciais no Orçamento (Priority: P1) 🎯 MVP

Como vendedor da Alumiportas, desejo aplicar descontos (em porcentagem ou valor fixo em R$) com autonomia, adicionar taxas extras (instalação/frete), selecionar condições padronizadas de pagamento e definir o prazo de validade da proposta (padrão 15 dias), para que o orçamento reflita fielmente o acordo comercial com o cliente.

**Why this priority**: É o núcleo do fechamento de vendas, permitindo agilidade e flexibilidade na negociação direta com o cliente no balcão ou WhatsApp.

**Independent Test**: Criar um orçamento, aplicar desconto de 10% (ou R$ 100,00), selecionar a condição de pagamento "50% Entrada + 50% Entrega", ajustar a data de validade e validar o recálculo imediato do valor total líquido e dos totais consolidados.

**Acceptance Scenarios**:

1. **Given** um orçamento no estado RASCUNHO com valor bruto de R$ 1.500,00, **When** o usuário informa um desconto de 10%, **Then** o sistema exibe o desconto de R$ 150,00 e atualiza o valor total líquido para R$ 1.350,00.
2. **Given** um orçamento com valor bruto de R$ 2.000,00, **When** o usuário informa um desconto em valor fixo de R$ 200,00, **Then** o sistema calcula o percentual equivalente (10%) e define o valor total líquido para R$ 1.800,00.
3. **Given** um orçamento aberto, **When** o usuário tenta aplicar um desconto superior ao valor total bruto (ex: R$ 2.500,00 para um orçamento de R$ 2.000,00), **Then** o sistema bloqueia a ação com mensagem amigável de validação em português.
4. **Given** a tela de fechamento de orçamento, **When** o usuário seleciona a condição de pagamento em lista suspensa (ex: "50% Entrada + 50% na Entrega") e preenche observações adicionais, **Then** essas informações são persistidas e integradas ao resumo e documentos de saída.

---



### Functional Requirements

- **FR-001**: O sistema MUST permitir a aplicação de descontos em valor fixo (R$) ou percentual (%) sobre o total do orçamento com autonomia do vendedor.
- **FR-002**: O sistema MUST recalcular em tempo real o valor total bruto, valor do desconto e valor líquido sempre que houver alteração de itens, descontos ou taxas adicionais.
- **FR-003**: O sistema MUST disponibilizar opções de condições de pagamento pré-configuradas (*"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*) juntamente com campo para observações comerciais adicionais.
- **FR-004**: O sistema MUST definir automaticamente a data de validade do orçamento para 15 dias corridos a partir da data de criação/emissão, permitindo ajuste manual pelo vendedor.

### Key Entities *(include if feature involves data)*

- **Orcamento (Budget)**: Armazena número sequencial, clienteId, status (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO), valorBruto, valorDesconto, tipoDesconto (PERCENTUAL, VALOR_FIXO), percentualDesconto, taxaInstalacao, taxaFrete, valorLiquido, condicaoPagamento, observacoesPagamento, dataEmissao, dataValidade.
- **ItemOrcamento (BudgetItem)**: Itens do orçamento com referência a produtoId/template, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, listaFerragens, valorUnitario, valorTotal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tempo de aplicação de descontos e emissão do PDF comercial inferior a 5 segundos pelo usuário.

## Assumptions

- O controle de alçada avançado com aprovação formal de descontos por administradores fica postergado para releases futuras se houver demanda.