# Especificação Funcional: US-46 — Módulo de Venda Avulsa de Partes (Vidro em m² e Alumínio em Metro Linear)

**Identificador**: `US-46`  
**Issue GitHub**: [#171](https://github.com/ADS-IFPB-SR/alumigest/issues/171)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como consultor comercial e encarregado de almoxarifado da Alumiportas, desejo que o sistema AlumiGest permita orçar e vender insumos e partes individualizadas (chapas/peças de vidro sob medida por m² e perfis de alumínio por metro linear ou peça cortada), especificando tipo, cor/acabamento, largura, altura e quantidade, com cálculo automático de preços, área/metragem faturável, margens de perda e exportação formal da cotação/pedido para PDF, visando atender vendas avulsas de reposição e serralheiros parceiros sem a obrigatoriedade de vincular a uma esquadria completa.

---

## 🏗️ Estrutura de Decomposição (USs Filhas)

| Código US | Título da US Filha | Foco Principal | Entregáveis Principais |
|:---:|---|:---:|---|
| **`US-46.1`** | Engine de Cálculo e Modelo de Dados para Venda por Medida | Backend | Entidades `tb_part_sales`, `tb_part_sale_items`, DTOs e endpoints de precificação e validação dimensional |
| **`US-46.2`** | Formulário Dinâmico de Cotação de Partes no AlumiGest UI | Frontend | Componentes React 19 / Tailwind / TanStack Query com cálculo reativo via API e resumo financeiro |
| **`US-46.3`** | Geração e Exportação do Orçamento/Pedido em PDF | Back & Front | `PartSalePdfService` (JasperReports/OpenPDF) com layout térmico/A4 Alumiportas e download via blob |
| **`US-46.4`** | Integração da Venda de Partes com Reserva e Baixa de Estoque | Backend | Integração com US-21 (`DIRECT_SALE_RESERVATION` na aprovação e `DIRECT_SALE_OUTFLOW` na entrega) |

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

### US-46.1: Engine de Cálculo de Preços e Modelo de Dados (Backend)

- [ ] **Cenário 1: Cálculo Preciso de Vidro por m² com Fração Mínima Faturável**
  - **Dado que** o vendedor seleciona uma chapa de vidro (`materialType = GLASS`, `widthMm = 1200`, `heightMm = 1500`, `quantity = 2`, `unitPrice = R$ 180,00/m²`),
  - **Quando** o endpoint `POST /api/v1/part-sales/calculate-item` é acionado,
  - **Então** o sistema calcula a área unitária de $1,80\text{ m}^2$ (Área Total $= 3,60\text{ m}^2$),
  - **E** retorna o valor total do item de `R$ 648,00`, ajustando para a área mínima faturável por peça (ex.: $0,25\text{ m}^2$) caso a dimensão informada resulte em área inferior.

- [ ] **Cenário 2: Cálculo de Perfil de Alumínio por Metro Linear com Fator de Perda**
  - **Dado que** o vendedor seleciona um perfil de alumínio vendido por metro linear (`materialType = ALUMINUM_PROFILE`, `heightMm = 2500`, `quantity = 4` barras, `unitPrice = R$ 45,00/m`, `lossFactor = 0.05`),
  - **Quando** a requisição de cálculo é processada no backend,
  - **Então** o sistema calcula a metragem líquida ($10,00\text{ m}$) e a metragem faturada com perda ($10,50\text{ m}$),
  - **E** retorna o valor total do item de `R$ 472,50`.

- [ ] **Cenário 3: Validação de Dimensões Máximas e Mínimas Operacionais**
  - **Dado que** uma dimensão inserida excede os limites operacionais cadastrados para o insumo (ex.: vidro temperado 8mm com altura $> 3200\text{ mm}$),
  - **Quando** o cálculo é solicitado,
  - **Então** o backend interrompe o processamento e retorna erro `BusinessException` (HTTP 422 Unprocessable Entity) informando a restrição técnica.

---

### US-46.2: Formulário Dinâmico e Interface de Cotação (Frontend)

- [ ] **Cenário 4: Inserção Dinâmica de Item de Vidro com Reatividade Instantânea**
  - **Dado que** o vendedor está na tela de nova cotação avulsa (`/vendas/partes/nova`),
  - **Quando** seleciona o insumo "Vidro Temperado 8mm Incolor", digita Largura (`1000 mm`), Altura (`2000 mm`) e Quantidade (`2`),
  - **Então** a interface exibe instantaneamente a área total calculada ($4,00\text{ m}^2$) e o subtotal do item através do consumo da API via TanStack Query,
  - **E** atualiza o resumo financeiro flutuante no canto direito da tela sem realizar processamento de negócio local.

- [ ] **Cenário 5: Seleção de Perfil de Alumínio e Indicação Visual de Unidade**
  - **Dado que** o usuário escolhe o insumo "Perfil U Linha Suprema 25mm",
  - **Quando** seleciona a cor "Anodizado Preto", digita a Altura/Comprimento (`6000 mm`) e Quantidade (`3 barras`),
  - **Então** a UI exibe o badge **Metro Linear (m)**, apresentando a metragem faturável ($18,00\text{ m}$) e o preço correspondente retornado pelo backend.

- [ ] **Cenário 6: Validação de Formulário e Feedback de Erro em Tempo Real**
  - **Dado que** o usuário insere uma dimensão inválida (ex.: altura $= 0\text{ mm}$ ou quantidade $= 0$),
  - **Quando** o campo perde o foco (`onBlur`),
  - **Então** a borda do input assume o tom destrutivo (`border-red-500`), apresentando a mensagem de erro sob o campo e desabilitando o botão "Aprovar Venda".

---

### US-46.3: Exportação do Orçamento/Pedido em PDF

- [ ] **Cenário 7: Emissão do Orçamento Comercial em PDF**
  - **Dado que** uma cotação de partes possui ao menos um item válido cadastrado,
  - **Quando** o usuário clica no botão `<Button icon={<FileText />} variant="outline">Exportar PDF</Button>`,
  - **Então** o sistema faz a requisição `GET /api/v1/part-sales/{id}/pdf` e inicia o download do arquivo `Orcamento_Partes_PART-YYYY-NNNN.pdf`.

- [ ] **Cenário 8: Estrutura Visual e Técnica do Documento Exportado**
  - **Dado que** o PDF é baixado e visualizado,
  - **Quando** o documento é inspecionado,
  - **Então** apresenta rigorosamente:
    1. **Cabeçalho Institucional**: Logotipo Alumiportas, Razão Social, CNPJ, dados de contato e código da proposta (`PART-YYYY-NNNN`).
    2. **Dados do Cliente e Condições**: Nome/Razão Social, CPF/CNPJ, Condição de Pagamento e Validade da Proposta.
    3. **Tabela de Itens Agrupada**:
       - **Seção VIDROS**: Descrição/Espessura, Dimensões ($L \times A\text{ mm}$), Área Total ($\text{m}^2$), Quantidade, Preço Unitário, Total.
       - **Seção ALUMÍNIOS**: Descrição/Cor, Comprimento ($\text{mm}$), Metragem Total ($\text{m}$), Quantidade, Preço Unitário, Total.
    4. **Resumo Financeiro e Rodapé**: Subtotal, Desconto, Valor Total, espaço para assinatura e observações técnicas de corte/tolerância.

---

### US-46.4: Integração com Estoque de Insumos (Reserva e Baixa - US-21)

- [ ] **Cenário 9: Reserva Automática na Aprovação do Pedido de Partes**
  - **Dado que** o vendedor aprova um pedido de partes avulsas (`DRAFT` $\rightarrow$ `APPROVED`),
  - **Quando** o status do pedido é atualizado,
  - **Então** o sistema invoca o `StockService` (conforme US-21) gerando registros do tipo `DIRECT_SALE_RESERVATION` em `tb_stock_movements`,
  - **E** incrementa `reserved_quantity` e decrementa `available_quantity` no item correspondente em `tb_stock_items`.

- [ ] **Cenário 10: Baixa Física Definitiva na Conclusão/Entrega das Partes**
  - **Dado que** um pedido de partes aprovado é entregue ao cliente (`DELIVERED`),
  - **Quando** a baixa da venda é confirmada,
  - **Então** o sistema converte a reserva em baixa física definitiva (`DIRECT_SALE_OUTFLOW`),
  - **E** decrementa simultaneamente `physical_quantity` e `reserved_quantity` no estoque.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Fórmula Faturável para Vidro em m²):**
  $$\text{Área Unitária } (\text{m}^2) = \max\left(\frac{\text{Largura (mm)} \times \text{Altura (mm)}}{1.000.000}, \text{Área Mínima Faturável}\right)$$
  $$\text{Valor Total Item} = \text{Área Unitária } (\text{m}^2) \times \text{Quantidade} \times \text{Preço Base (m}^2) \times (1 + \text{Fator Perda})$$
- **RN-02 (Fórmula Faturável para Alumínio por Metro Linear):**
  $$\text{Metragem Total (m)} = \frac{\text{Altura ou Comprimento (mm)}}{1.000} \times \text{Quantidade}$$
  $$\text{Valor Total Item} = \text{Metragem Total (m)} \times \text{Preço Base (m)} \times (1 + \text{Fator Perda})$$
- **RN-03 (Imutabilidade de Snapshot):** Quando o pedido transita para o status `APPROVED`, os valores unitários, alíquotas e dimensões ficam congelados nos campos snapshot de `tb_part_sale_items`, blindando o faturamento contra alterações cadastrais posteriores de preços de insumos.
- **RN-04 (Isolamento de Lógica de Negócio):** O frontend NUNCA executa cálculos contábeis, determinação de áreas mínimas ou precificação definitiva de perda; toda a computação faturável e regras fiscais/margens residem exclusivamente no backend através do endpoint `POST /api/v1/part-sales/calculate-item`.
- **RN-05 (Rastreabilidade de Estoque):** Toda movimentação deve registrar `DIRECT_SALE_RESERVATION` na aprovação e `DIRECT_SALE_OUTFLOW` na entrega, garantindo conformidade e idempotência com a esteira da US-21.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)

- **Flyway Migration:** `V46__create_part_sales_schema.sql`
- **Tabela `tb_part_sales`:**
  - `id`: UUID (PK)
  - `code`: VARCHAR(30) UNIQUE NOT NULL (Padrão: `PART-YYYY-NNNN`)
  - `customer_id`: UUID NOT NULL (FK para `tb_customers`)
  - `status`: VARCHAR(20) NOT NULL (ENUM: `DRAFT`, `QUOTED`, `APPROVED`, `DELIVERED`, `CANCELLED`)
  - `subtotal_amount`: NUMERIC(12, 2) NOT NULL
  - `discount_amount`: NUMERIC(12, 2) DEFAULT 0.00
  - `total_amount`: NUMERIC(12, 2) NOT NULL
  - `created_at`: TIMESTAMP WITH TIME ZONE NOT NULL
  - `updated_at`: TIMESTAMP WITH TIME ZONE NOT NULL

- **Tabela `tb_part_sale_items`:**
  - `id`: UUID (PK)
  - `part_sale_id`: UUID NOT NULL (FK para `tb_part_sales`)
  - `stock_item_id`: UUID NOT NULL (FK para `tb_stock_items`)
  - `material_type`: VARCHAR(30) NOT NULL (ENUM: `GLASS`, `ALUMINUM_PROFILE`)
  - `width_mm`: INT
  - `height_mm`: INT NOT NULL
  - `quantity`: INT NOT NULL
  - `calculated_unit_measure`: NUMERIC(10, 4) NOT NULL (Área em m² ou comprimento em m)
  - `unit_price`: NUMERIC(12, 2) NOT NULL
  - `total_price`: NUMERIC(12, 2) NOT NULL

- **Endpoints REST:**
  - `POST /api/v1/part-sales/calculate-item` — Executa pré-cálculo de preço e metragem faturável sem persistência.
  - `POST /api/v1/part-sales` — Salva rascunho ou gera nova cotação de partes.
  - `GET /api/v1/part-sales/{id}` — Retorna o detalhamento completo da venda e itens.
  - `PATCH /api/v1/part-sales/{id}/status` — Altera o status da cotação/venda (`APPROVED`, `DELIVERED`, `CANCELLED`).
  - `GET /api/v1/part-sales/{id}/pdf` — Gera e faz streaming do documento PDF de proposta/venda.

### Frontend (React 19 / TanStack Query / Tailwind CSS)

- **Páginas & Componentes:**
  - `PartSaleFormPage.tsx` (`/vendas/partes/nova`): Formulário principal com debounce e query reativa.
  - `PartSaleItemGrid.tsx`: Grid dinâmico para adição e remoção de peças de vidro e perfis de alumínio.
  - `PartSaleSummaryCard.tsx`: Resumo financeiro flutuante com cálculo fornecido pelo backend.
  - `PartSalePdfExportButton.tsx`: Botão de exportação para download de blob com feedback visual.
- **Padrões Visuais do Design System AlumiGest:**
  - **Cards e Módulos:** `bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg`
  - **Badge Vidro:** `bg-cyan-500/10 text-cyan-400 border border-cyan-500/20`
  - **Badge Alumínio:** `bg-amber-500/10 text-amber-400 border border-amber-500/20`
  - **Campos Dimensionais:** Agrupamento visual compacto com divisores verticais (`Largura (mm) | Altura (mm) | Qtd | Subtotal`).
  - **Validação de Erro:** Inputs com `border-red-500` em caso de valores inválidos no evento `onBlur`.

### PDF Service (JasperReports / OpenPDF)

- **Biblioteca Backend:** OpenPDF / JasperReports (Java 21).
- **Configuração de Página:** Padrão A4 Retrato, Margens $10\text{ mm}$, renderização gráfica vetorial das tabelas.
- **Headers HTTP:** `Content-Type: application/pdf`, `Content-Disposition: attachment; filename="Orcamento_Partes_PART-YYYY-NNNN.pdf"`.

---

## 🛡️ Definition of Done (DoD)

- [ ] **Testes Unitários:** `PartCalculationServiceTest` validando todas as variações de dimensões, frações mínimas e arredondamentos de m² e metros lineares com cobertura $\ge 85\%$.
- [ ] **Testes de Integração:** Fluxo completo da venda de partes (`Criação` $\rightarrow$ `Cálculo` $\rightarrow$ `Aprovação com Reserva no Estoque` $\rightarrow$ `Baixa Física` $\rightarrow$ `Emissão de PDF`).
- [ ] **Conformidade UI/UX:** Componentes e telas integrados e validados no Design System AlumiGest (React 19, Tailwind CSS e ícones Lucide).
- [ ] **Desempenho da API de PDF:** Tempo de geração e download do arquivo PDF inferior a $1,5\text{ segundo}$.
- [ ] **SonarQube Quality Gate:** Aprovação no Quality Gate com 0 vulnerabilidades e 0 code smells críticos.
- [ ] **Branch de Desenvolvimento:** `feat/us-46-venda-de-partes`.

---

## 📋 Sub-Tarefas / Issues Vinculadas (4 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-46.1](issues/US-46.1-engine-calculo-modelo-dados-venda-medida/issue.md) | Engine de Cálculo e Modelo de Dados para Venda por Medida (Backend) | 🔲 No Backlog |
| [US-46.2](issues/US-46.2-formulario-dinamico-cotacao-partes-frontend/issue.md) | Formulário Dinâmico de Cotação de Partes no AlumiGest UI (Frontend) | 🔲 No Backlog |
| [US-46.3](issues/US-46.3-geracao-exportacao-orcamento-pedido-pdf/issue.md) | Geração e Exportação do Orçamento/Pedido em PDF (Back & Front) | 🔲 No Backlog |
| [US-46.4](issues/US-46.4-integracao-venda-partes-reserva-baixa-estoque/issue.md) | Integração da Venda de Partes com Reserva e Baixa de Estoque (Backend - US-21) | 🔲 No Backlog |

---

## 🔗 Referências & Governança

- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
- 📦 **Integração com Estoque (US-21)**: [../US-21-reserva-baixa-estoque/spec.md](../US-21-reserva-baixa-estoque/spec.md)

---

**Branch:** `feat/us-46-venda-de-partes`
