# Feature Specification: Sprint 4 — Descontos Comerciais, Emissão de PDF (Comercial/Técnico) e Homologação R1

**Feature Branch**: `001-orcamento-descontos-pdf`

**Created**: 2026-08-27

**Status**: Clarified

**Input**: User description: "Descontos comerciais, condicoes de pagamento, emissao de PDF de orcamentos em duas vias (comercial e oficina) e homologacao da Release 1"

## Clarifications

### Session 2026-08-27
- **Q1 (Política de Descontos)**: O vendedor tem autonomia total para aplicar descontos em percentual (%) ou valor fixo (R$) sem travas de alçada ou necessidade de aprovação de perfil administrador nesta fase.
- **Q2 (Condições de Pagamento)**: O sistema fornecerá uma lista de opções predefinidas de pagamento (ex: *"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*) com campo complementar para observações personalizadas.
- **Q3 (Detalhamento Técnico da Oficina)**: A via técnica em PDF para a oficina conterá detalhamento completo de engenharia (medidas L x A em mm, modelo de esquadria/template, cor do perfil de alumínio, tipo/espessura do vidro, lado/sentido de abertura e relação de ferragens/acessórios previstos), omitindo estritamente quaisquer valores monetários.
- **Q4 (Validade da Proposta)**: O prazo padrão de validade do orçamento é de 15 dias corridos a partir da data de emissão, podendo ser editado pelo vendedor.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Aplicação de Descontos e Condições Comerciais no Orçamento (Priority: P1)

Como vendedor da Alumiportas, desejo aplicar descontos (em porcentagem ou valor fixo em R$) com autonomia, adicionar taxas extras (instalação/frete), selecionar condições padronizadas de pagamento e definir o prazo de validade da proposta (padrão 15 dias), para que o orçamento reflita fielmente o acordo comercial com o cliente.

**Why this priority**: É o núcleo do fechamento de vendas, permitindo agilidade e flexibilidade na negociação direta com o cliente no balcão ou WhatsApp.

**Independent Test**: Criar um orçamento, aplicar desconto de 10% (ou R$ 100,00), selecionar a condição de pagamento "50% Entrada + 50% Entrega", ajustar a data de validade e validar o recálculo imediato do valor total líquido e dos totais consolidados.

**Acceptance Scenarios**:

1. **Given** um orçamento no estado RASCUNHO com valor bruto de R$ 1.500,00, **When** o usuário informa um desconto de 10%, **Then** o sistema exibe o desconto de R$ 150,00 e atualiza o valor total líquido para R$ 1.350,00.
2. **Given** um orçamento com valor bruto de R$ 2.000,00, **When** o usuário informa um desconto em valor fixo de R$ 200,00, **Then** o sistema calcula o percentual equivalente (10%) e define o valor total líquido para R$ 1.800,00.
3. **Given** um orçamento aberto, **When** o usuário tenta aplicar um desconto superior ao valor total bruto (ex: R$ 2.500,00 para um orçamento de R$ 2.000,00), **Then** o sistema bloqueia a ação com mensagem amigável de validação em português.
4. **Given** a tela de fechamento de orçamento, **When** o usuário seleciona a condição de pagamento em lista suspensa (ex: "50% Entrada + 50% na Entrega") e preenche observações adicionais, **Then** essas informações são persistidas e integradas ao resumo e documentos de saída.

---

### User Story 2 - Emissão e Download de Orçamento em PDF — Via Comercial (Priority: P1)

Como vendedor ou cliente da Alumiportas, desejo emitir e baixar o orçamento em formato PDF oficial com layout profissional e responsivo, contendo cabeçalho institucional, dados do cliente, especificações completas dos itens com valores discriminados, descontos, totais e condições comerciais, além de poder copiar o resumo para o WhatsApp.

**Why this priority**: É a proposta comercial formal apresentada ao cliente para fechamento da venda.

**Independent Test**: Gerar o PDF comercial de um orçamento e validar cabeçalho, dados do cliente, tabela de itens, valores unitários e totais, descontos, condições de pagamento e texto para WhatsApp.

**Acceptance Scenarios**:

1. **Given** um orçamento com itens calculados e desconto aplicado, **When** o usuário clica em "Emitir PDF Comercial", **Then** o sistema renderiza a pré-visualização do PDF em menos de 2 segundos com opção de download direto.
2. **Given** o PDF comercial gerado, **When** o documento é inspecionado, **Then** ele exibe logotipo da Alumiportas, número do orçamento, datas de emissão e validade (15 dias), dados do cliente, itens com medidas (L x A), cor do alumínio, tipo de vidro, valor unitário, desconto, valor total e condição de pagamento.
3. **Given** a página de visualização do orçamento, **When** o vendedor clica em "Copiar Resumo Comercial", **Then** o texto formatado para envio via WhatsApp é copiado para a área de transferência.

---

### User Story 3 - Emissão de Orçamento em PDF — Via Técnica / Oficina (Priority: P2)

Como serralheiro ou responsável técnico da oficina da Alumiportas, desejo emitir uma via técnica detalhada do orçamento com todas as medidas nominais (L x A mm), modelos de esquadrias, cores de perfil, especificações de vidros, lado/sentido de abertura e ferragens previstas, sem exibir nenhum valor financeiro (preços unitários ou totais), para conferência prévia e instrução técnica.

**Why this priority**: Permite a separação e conferência antecipada dos materiais e especificações construtivas mantendo sigilo de valores para o time de montagem.

**Independent Test**: Emitir a via técnica de um orçamento e certificar-se de que constam todos os parâmetros de engenharia (medidas, cores, lado de abertura, ferragens) e zero referências a preços ou valores em R$.

**Acceptance Scenarios**:

1. **Given** um orçamento com múltiplos itens de esquadrias e vidros, **When** o usuário seleciona "Emitir Via Técnica (Oficina)", **Then** o sistema gera o PDF técnico detalhado.
2. **Given** o PDF técnico gerado, **When** inspecionado, **Then** constam nome da esquadria, dimensões nominais (L x A em mm), cor do alumínio, especificação do vidro, lado/sentido de abertura e ferragens/acessórios, sem nenhum campo de preço unitário ou valor total.

---

### User Story 4 - Homologação Integrada da Release 1 (v1.0.0) (Priority: P2)

Como equipe técnica e stakeholders da Alumiportas, desejamos validar a integração completa de ponta a ponta da Release 1 (Catálogo de Insumos ➔ Produto Paramétrico ➔ Motor de Cálculo ➔ Orçamento com Desconto ➔ Emissão de PDFs Comercial e Técnico), assegurando estabilidade, qualidade de código e conformidade com o SonarQube Quality Gate.

**Why this priority**: Consolida a entrega oficial da primeira versão utilizável do sistema em produção.

**Independent Test**: Execução dos testes automatizados backend/frontend e validação dos cenários de aceitação (TEA) da Release 1.

**Acceptance Scenarios**:

1. **Given** a suite completa de testes de backend e frontend, **When** executados no pipeline de CI, **Then** 100% dos testes passam e o SonarQube Quality Gate é aprovado.
2. **Given** o fluxo do sistema em ambiente local/staging, **When** um orçamento completo é criado e exportado em PDF, **Then** o comportamento segue com precisão as fórmulas de cálculo e regras da Alumiportas.

---

### Edge Cases

- O que acontece se o usuário informar um desconto percentual negativo ou superior a 100%? O sistema bloqueia a entrada com validação no frontend e no backend (JSR-380 `@DecimalMin("0.0")` e `@DecimalMax("100.0")`).
- O que acontece se o cliente não tiver CPF/CNPJ ou endereço completo cadastrado? O PDF comercial é gerado exibindo os dados existentes (Nome e Telefone), marcando campos ausentes como "Não informado" sem comprometer o layout.
- O que acontece se o orçamento tiver muitos itens e ultrapassar 1 página? O gerador de PDF realiza quebra e paginação automática com rodapé numerado ("Página X de Y") e repetição do cabeçalho simplificado.
- O que acontece quando a data atual ultrapassa a data de validade? O sistema exibe um badge visual de "Expirado" no orçamento, mantendo os dados preservados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir a aplicação de descontos em valor fixo (R$) ou percentual (%) sobre o total do orçamento com autonomia do vendedor.
- **FR-002**: O sistema MUST recalcular em tempo real o valor total bruto, valor do desconto e valor líquido sempre que houver alteração de itens, descontos ou taxas adicionais.
- **FR-003**: O sistema MUST disponibilizar opções de condições de pagamento pré-configuradas (*"À Vista (PIX / Dinheiro)"*, *"50% Entrada + 50% na Entrega"*, *"Cartão de Crédito até 12x"*, *"A Combinar"*) juntamente com campo para observações comerciais adicionais.
- **FR-004**: O sistema MUST definir automaticamente a data de validade do orçamento para 15 dias corridos a partir da data de criação/emissão, permitindo ajuste manual pelo vendedor.
- **FR-005**: O sistema MUST gerar o PDF do Orçamento - Via Comercial contendo identidade visual da Alumiportas, dados do cliente, itens com medidas e materiais, valores unitários e totais, descontos discriminados, total líquido, forma de pagamento e validade.
- **FR-006**: O sistema MUST gerar o PDF do Orçamento - Via Técnica (Oficina) contendo medidas nominais (L x A mm), modelo da esquadria, cores, vidro, lado de abertura e ferragens/acessórios, omitindo rigorosamente quaisquer valores monetários.
- **FR-007**: O sistema MUST permitir copiar o resumo comercial do orçamento em texto simples formatado para envio direto via WhatsApp.
- **FR-008**: O sistema MUST validar que o valor total de desconto não seja negativo e não exceda o valor total bruto do orçamento.

### Key Entities *(include if feature involves data)*

- **Orcamento (Budget)**: Armazena número sequencial, clienteId, status (RASCUNHO, ENVIADO, APROVADO, REJEITADO, EXPIRADO), valorBruto, valorDesconto, tipoDesconto (PERCENTUAL, VALOR_FIXO), percentualDesconto, taxaInstalacao, taxaFrete, valorLiquido, condicaoPagamento, observacoesPagamento, dataEmissao, dataValidade.
- **ItemOrcamento (BudgetItem)**: Itens do orçamento com referência a produtoId/template, larguraMm, alturaMm, quantidade, corAluminio, tipoVidro, orientacaoAbertura, listaFerragens, valorUnitario, valorTotal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Tempo de aplicação de descontos e emissão do PDF comercial inferior a 5 segundos pelo usuário.
- **SC-002**: Renderização do PDF em tela ou geração do arquivo em menos de 2 segundos para orçamentos de até 20 itens.
- **SC-003**: 100% de exatidão matemática nos cálculos de descontos, taxas e totais utilizando precisão decimal monetária (`BigDecimal` com 2 casas decimais).
- **SC-004**: Aprovação de 100% dos testes automatizados unitários/integração no CI com Quality Gate do SonarQube aprovado.

## Assumptions

- A geração de PDFs no frontend/backend utilizará bibliotecas compatíveis com a arquitetura existente (ex: `@react-pdf/renderer` / `pdfmake` no frontend ou `OpenPDF`/`iText` no backend).
- O envio por WhatsApp é realizado através de link direto (`https://api.whatsapp.com/send?text=...`) com mensagem pré-formatada e cópia para área de transferência.
- O controle de alçada avançado com aprovação formal de descontos por administradores fica postergado para releases futuras se houver demanda.