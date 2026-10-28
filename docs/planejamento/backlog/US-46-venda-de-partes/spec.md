# Especificação Funcional: US-46 — Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)

**Identificador**: `US-46`  
**Issue GitHub**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)  
**Status**: 🔵 Planejada para Sprint 08  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como consultor comercial e encarregado de almoxarifado da Alumiportas, desejo que o sistema AlumiGest permita orçar e vender insumos e partes individualizadas — chapas/peças de vidro sob medida por m², perfis de alumínio por metro linear ou peça cortada, ferragens avulsas por unidade (roldanas, puxadores, fechaduras, braços de articulação) e películas de controle solar/segurança sob medida por m² — especificando tipo, cor/acabamento, largura, altura e quantidade, com cálculo automático de preços, área/metragem faturável, margens de perda e exportação formal da cotação/pedido para PDF, visando atender vendas avulsas de reposição e serralheiros parceiros sem a obrigatoriedade de vincular a uma esquadria completa.

---

## 🏗️ Estrutura de Decomposição Vertical (*Thin Vertical Slices*)

As sub-tarefas da US-46 foram decompostas em **fatias verticais autônomas por tipo de insumo e capacidade funcional**. Cada fatia compreende banco de dados, regras de negócio/API, interface do usuário e testes automatizados, permitindo entrega contínua sem bloqueios por camada técnica:

| Código US | Título da Fatia Vertical | Foco Funcional | Entregáveis Fullstack |
|:---:|---|:---:|---|
| **`US-46.1`** | Venda Avulsa de Ferragens por Unidade | Ferragens (un) & Base do Módulo | Migration `tb_part_sales` e `tb_part_sale_items` com FK em `tb_materials`, cálculo unitário ($Q \times P$), tela `/vendas/partes/nova` com badge "Ferragem (un)", card flutuante de resumo e testes |
| **`US-46.2`** | Venda de Perfis de Alumínio em Metro Linear | Alumínio (Metro Linear) | Engine de cálculo de metragem linear com perdas, inputs contextuais de `Comprimento (mm)`, badge "Metro Linear (m)", consulta de preço reativa e testes |
| **`US-46.3`** | Venda de Vidros e Películas em m² | Vidros e Películas (m²) | Cálculo de área ($L \times A$), aplicação de fração mínima faturável ($0,25\text{ m}^2$), perdas de película, validações de limites dimensionais físicos no `onBlur` e testes |
| **`US-46.4`** | Geração e Exportação do Orçamento em PDF A4 | Relatório Comercial em PDF | `PartSalePdfService` (OpenPDF) agrupado por seções temáticas, botão de download via blob na interface e testes automatizados binários |

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

### US-46.1: Venda Avulsa de Ferragens por Unidade (Fullstack)

- [ ] **Cenário 1: Precificação de Ferragens com Contagem por Unidade Inteira**
  - **Dado que** o vendedor seleciona uma ferragem avulsa (`materialType = HARDWARE`, ex.: "Roldana Dupla Suprema 112", `quantity = 10`, `unitPrice = R$ 28,50/un`),
  - **Quando** a requisição de cálculo `POST /api/v1/part-sales/calculate-item` é enviada,
  - **Então** o backend define `widthMm = null`, `heightMm = null` e `calculatedUnitMeasure = 1.0000`,
  - **E** retorna o valor total de `R$ 285,00` multiplicando diretamente quantidade por valor unitário.

- [ ] **Cenário 2: Interface Reativa para Ferragens com Campos Desabilitados**
  - **Dado que** o vendedor está na tela `/vendas/partes/nova` e seleciona o tipo "Ferragem",
  - **Quando** a linha do item é renderizada,
  - **Então** os campos dimensionais de Largura e Altura são ocultados ou desabilitados com o rótulo "N/A",
  - **E** exibe o badge roxo `Ferragem (un)` (`bg-purple-500/10 text-purple-400 border-purple-500/20`), atualizando o resumo financeiro flutuante.

- [ ] **Cenário 3: Persistência e Saldo Comercial sem Bloqueio de Estoque**
  - **Dado que** a cotação é concluída ou aprovada (`POST /api/v1/part-sales`),
  - **Quando** a venda de partes é salva,
  - **Então** o registro é persistido vinculando os itens diretamente ao catálogo de insumos (`material_id` $\rightarrow$ `tb_materials`),
  - **E** a venda opera normalmente sem exigir saldo prévio de estoque enquanto o módulo de estoque (US-21) não estiver ativo.

---

### US-46.2: Venda de Perfis de Alumínio em Metro Linear (Fullstack)

- [ ] **Cenário 4: Cálculo de Metro Linear com Fator de Perda**
  - **Dado que** o vendedor seleciona um perfil de alumínio vendido por metro linear (`materialType = ALUMINUM_PROFILE`, `heightMm = 2500`, `quantity = 4` barras, `unitPrice = R$ 45,00/m`, `lossFactor = 0.05`),
  - **Quando** a requisição de cálculo é processada,
  - **Então** o sistema calcula a metragem líquida ($10,00\text{ m}$) e a metragem faturada com perda ($10,50\text{ m}$),
  - **E** retorna o valor total do item de `R$ 472,50`.

- [ ] **Cenário 5: Input Dinâmico de Comprimento e Badge Visual**
  - **Dado que** o usuário escolhe a categoria "Perfil de Alumínio",
  - **Quando** a linha do item é exibida,
  - **Então** o campo de comprimento/altura em milímetros fica disponível para digitação e a largura fica desabilitada ("N/A"),
  - **E** a UI exibe o badge âmbar `Metro Linear (m)` (`bg-amber-500/10 text-amber-400 border-amber-500/20`).

---

### US-46.3: Venda de Vidros e Películas em m² com Área Mínima (Fullstack)

- [ ] **Cenário 6: Cálculo Preciso de Vidro por m² com Fração Mínima Faturável**
  - **Dado que** o vendedor seleciona uma chapa de vidro (`materialType = GLASS`, `widthMm = 1200`, `heightMm = 1500`, `quantity = 2`, `unitPrice = R$ 180,00/m²`),
  - **Quando** o cálculo é solicitado,
  - **Então** o sistema apura a área unitária de $1,80\text{ m}^2$ (Área Total $= 3,60\text{ m}^2$),
  - **E** retorna o valor total de `R$ 648,00`, ajustando para a área mínima faturável por peça (ex.: $0,25\text{ m}^2$) caso a dimensão resulte em área inferior.

- [ ] **Cenário 7: Cálculo de Películas em m² com Perda da Bobina**
  - **Dado que** o vendedor seleciona uma película (`materialType = FILM`, `widthMm = 1000`, `heightMm = 2000`, `quantity = 3`, `unitPrice = R$ 60,00/m²`, `lossFactor = 0.10`),
  - **Quando** o cálculo é processado,
  - **Então** calcula a área líquida total ($6,00\text{ m}^2$) e a área faturada com perda ($6,60\text{ m}^2$), retornando o valor total de `R$ 396,00`.

- [ ] **Cenário 8: Validação de Dimensões Máximas e Feedback Visual Instantâneo**
  - **Dado que** uma dimensão informada excede os limites operacionais (ex.: vidro $> 3200\text{ mm}$ ou bobina $> 1520\text{ mm}$),
  - **Quando** o campo perde o foco (`onBlur`),
  - **Então** o input assume borda destrutiva (`border-red-500`) e o backend retorna `BusinessException` (HTTP 422 Unprocessable Entity) caso o formulário tente ser submetido.

---

### US-46.4: Geração e Exportação do Orçamento/Pedido em PDF A4 (Fullstack)

- [ ] **Cenário 9: Emissão do Orçamento Comercial em PDF com Seções Agrupadas**
  - **Dado que** uma cotação de partes possui itens cadastrados,
  - **Quando** o usuário clica no botão `<Button icon={<FileText />} variant="outline">Exportar PDF</Button>`,
  - **Então** o sistema requisita `GET /api/v1/part-sales/{id}/pdf` e inicia o download do arquivo `Orcamento_Partes_PART-YYYY-NNNN.pdf`.

- [ ] **Cenário 10: Estrutura Visual e Agrupamento no Documento**
  - **Dado que** o PDF é aberto,
  - **Quando** o documento é inspecionado,
  - **Então** apresenta:
    1. **Cabeçalho Institucional**: Logotipo Alumiportas, Razão Social, CNPJ, dados de contato e código da proposta (`PART-YYYY-NNNN`).
    2. **Dados do Cliente e Condições**: Nome/Razão Social, CPF/CNPJ, Condição de Pagamento e Validade.
    3. **Tabelas de Itens Agrupadas por Categoria**:
       - **Seção VIDROS**: Descrição/Espessura, Dimensões ($L \times A\text{ mm}$), Área Total ($\text{m}^2$), Quantidade, Preço Unitário, Total.
       - **Seção ALUMÍNIOS**: Descrição/Cor, Comprimento ($\text{mm}$), Metragem Total com Perda ($\text{m}$), Quantidade, Preço Unitário, Total.
       - **Seção FERRAGENS**: Descrição da peça, Código/Referência, Quantidade (`un`), Preço Unitário por peça, Total.
       - **Seção PELÍCULAS**: Descrição/Tonalidade, Dimensões ($L \times A\text{ mm}$), Área Total com Perda ($\text{m}^2$), Quantidade, Preço Unitário por m², Total.
    4. **Resumo Financeiro e Rodapé**: Subtotal, Desconto, Valor Total, espaço para assinatura e observações técnicas de corte/tolerância.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Fórmula Faturável para Vidro em m²):**
  $$\text{Área Unitária } (\text{m}^2) = \max\left(\frac{\text{Largura (mm)} \times \text{Altura (mm)}}{1.000.000}, \text{Área Mínima Faturável}\right)$$
  $$\text{Valor Total Item} = \text{Área Unitária } (\text{m}^2) \times \text{Quantidade} \times \text{Preço Base (m}^2) \times (1 + \text{Fator Perda})$$
- **RN-02 (Fórmula Faturável para Alumínio por Metro Linear):**
  $$\text{Metragem Total (m)} = \frac{\text{Altura ou Comprimento (mm)}}{1.000} \times \text{Quantidade}$$
  $$\text{Valor Total Item} = \text{Metragem Total (m)} \times \text{Preço Base (m)} \times (1 + \text{Fator Perda})$$
- **RN-03 (Fórmula Faturável para Ferragens por Unidade):**
  $$\text{Valor Total Item} = \text{Quantidade (un)} \times \text{Preço Base por Unidade}$$
  - Ferragens não admitem dimensões de corte (`width_mm = null`, `height_mm = null`) e sua unidade de medida faturável é sempre `1.0000` (unidade).
- **RN-04 (Fórmula Faturável para Películas em m²):**
  $$\text{Área Unitária } (\text{m}^2) = \frac{\text{Largura (mm)} \times \text{Altura (mm)}}{1.000.000}$$
  $$\text{Valor Total Item} = \text{Área Unitária } (\text{m}^2) \times \text{Quantidade} \times \text{Preço Base (m}^2) \times (1 + \text{Fator Perda})$$
- **RN-05 (Imutabilidade de Snapshot):** Quando o pedido transita para o status `APPROVED`, os valores unitários, alíquotas e dimensões ficam congelados nos campos snapshot de `tb_part_sale_items`, blindando o faturamento contra alterações cadastrais posteriores de preços de insumos.
- **RN-06 (Isolamento de Lógica de Negócio):** O frontend NUNCA executa cálculos contábeis, determinação de áreas mínimas ou precificação de perda; toda a computação faturável reside exclusivamente no backend através de `POST /api/v1/part-sales/calculate-item`.
- **RN-07 (Venda sem Bloqueio de Estoque):** A venda referencia os insumos de `tb_materials` e não é bloqueada pela inexistência ou insuficiência de saldo físico de estoque. Quando a US-21 (Estoque) for integrada, a mesma assinará os eventos de domínio `PartSaleApprovedEvent`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / JPA / PostgreSQL)

- **Flyway Migration:** `V46__create_part_sales_schema.sql`
- **Tabela `tb_part_sales`:**
  - `id`: UUID (PK)
  - `code`: VARCHAR(30) UNIQUE NOT NULL (Padrão: `PART-YYYY-NNNN`)
  - `customer_id`: UUID NOT NULL (FK para `tb_customers` ou clientes)
  - `status`: VARCHAR(20) NOT NULL (ENUM: `DRAFT`, `QUOTED`, `APPROVED`, `DELIVERED`, `CANCELLED`)
  - `subtotal_amount`: NUMERIC(12, 2) NOT NULL
  - `discount_amount`: NUMERIC(12, 2) DEFAULT 0.00
  - `total_amount`: NUMERIC(12, 2) NOT NULL
  - `created_at`: TIMESTAMP WITH TIME ZONE NOT NULL
  - `updated_at`: TIMESTAMP WITH TIME ZONE NOT NULL

- **Tabela `tb_part_sale_items`:**
  - `id`: UUID (PK)
  - `part_sale_id`: UUID NOT NULL (FK para `tb_part_sales`)
  - `material_id`: UUID NOT NULL (FK para `tb_materials` no catálogo)
  - `material_type`: VARCHAR(30) NOT NULL (ENUM: `GLASS`, `ALUMINUM_PROFILE`, `HARDWARE`, `FILM`)
  - `width_mm`: INT NULL (obrigatório para `GLASS` e `FILM`, nulo para `HARDWARE`)
  - `height_mm`: INT NULL (obrigatório para `GLASS`, `FILM` e comprimento para `ALUMINUM_PROFILE`, nulo para `HARDWARE`)
  - `quantity`: INT NOT NULL
  - `calculated_unit_measure`: NUMERIC(10, 4) NOT NULL (Área em m² para vidro/película, comprimento em metros para alumínio, ou 1.0000 para ferragem)
  - `unit_price`: NUMERIC(12, 2) NOT NULL
  - `total_price`: NUMERIC(12, 2) NOT NULL

- **Endpoints REST:**
  - `POST /api/v1/part-sales/calculate-item` — Pré-cálculo de preço e metragem faturável sem persistência.
  - `POST /api/v1/part-sales` — Salva rascunho ou gera nova cotação de partes.
  - `GET /api/v1/part-sales/{id}` — Retorna o detalhamento completo da venda e itens.
  - `PATCH /api/v1/part-sales/{id}/status` — Altera o status da cotação/venda (`APPROVED`, `DELIVERED`, `CANCELLED`).
  - `GET /api/v1/part-sales/{id}/pdf` — Gera e faz streaming do documento PDF de proposta/venda.

### Frontend (React 19 / TanStack Query / Tailwind CSS)

- **Páginas & Componentes:**
  - `PartSaleFormPage.tsx` (`/vendas/partes/nova`): Formulário principal com debounce e query reativa.
  - `PartSaleItemGrid.tsx`: Grid dinâmico para adição e remoção de peças com campos contextuais conforme o `materialType`.
  - `PartSaleSummaryCard.tsx`: Resumo financeiro flutuante com cálculo fornecido pelo backend.
  - `PartSalePdfExportButton.tsx`: Botão de exportação para download de blob com feedback visual.
- **Padrões Visuais:**
  - **Cards:** `bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg`
  - **Badge Vidro:** `bg-cyan-500/10 text-cyan-400 border-cyan-500/20`
  - **Badge Alumínio:** `bg-amber-500/10 text-amber-400 border-amber-500/20`
  - **Badge Ferragem:** `bg-purple-500/10 text-purple-400 border-purple-500/20`
  - **Badge Película:** `bg-emerald-500/10 text-emerald-400 border-emerald-500/20`

---

## 🛡️ Definition of Done (DoD)

- [ ] **Testes por Fatia Vertical:** Cada sub-tarefa possui seus próprios testes unitários e de integração (MockMvc e Vitest) com cobertura $\ge 80\%$.
- [ ] **Desempenho da API de PDF:** Tempo de geração e download do arquivo PDF inferior a $1,5\text{ segundo}$.
- [ ] **SonarQube Quality Gate:** Aprovação no Quality Gate com 0 vulnerabilidades e 0 code smells críticos.
- [ ] **Branch de Desenvolvimento:** `feat/us-46-venda-de-partes`.

---

## 📋 Sub-Tarefas / Fatias Verticais Vinculadas (4 fatias)

| Sub-Task | Issue GitHub | Tarefa / Descrição | Tipo | Status |
|---|:---:|---|:---:|:---:|
| [US-46.1](issues/US-46.1-venda-avulsa-ferragens-unidade/issue.md) | [#527](https://github.com/ADS-IFPB-SR/alumigest/issues/527) | Venda Avulsa de Ferragens por Unidade (Fullstack) | Fullstack | 🔲 No Backlog |
| [US-46.2](issues/US-46.2-venda-perfis-aluminio-metro-linear/issue.md) | [#528](https://github.com/ADS-IFPB-SR/alumigest/issues/528) | Venda de Perfis de Alumínio em Metro Linear (Fullstack) | Fullstack | 🔲 No Backlog |
| [US-46.3](issues/US-46.3-venda-vidros-peliculas-metro-quadrado/issue.md) | [#529](https://github.com/ADS-IFPB-SR/alumigest/issues/529) | Venda de Vidros e Películas em m² com Área Mínima (Fullstack) | Fullstack | 🔲 No Backlog |
| [US-46.4](issues/US-46.4-geracao-exportacao-orcamento-pedido-pdf/issue.md) | [#530](https://github.com/ADS-IFPB-SR/alumigest/issues/530) | Geração e Exportação do Orçamento/Pedido em PDF A4 (Fullstack) | Fullstack | 🔲 No Backlog |

---

## 🔗 Referências & Governança

- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
- 📦 **Catálogo de Materiais**: `tb_materials`
