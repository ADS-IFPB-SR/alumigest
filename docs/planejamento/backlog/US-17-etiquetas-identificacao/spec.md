# Especificação Funcional: US-17 — Emitir Etiquetas de Identificação de Peças por Item da Ordem de Serviço

**Identificador**: `US-17`  
**Issue GitHub**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)  
**Status**: 🟢 Planejada para Sprint 07 (Sprint Ativa: 13/10/2026 a 27/10/2026)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como encarregado de produção, operador de corte ou montador da Alumiportas, desejo emitir e imprimir etiquetas adesivas de identificação em formato térmico (100x50mm) para cada exemplar físico de esquadria de uma Ordem de Serviço (O.S.), com visualização contínua em tela única e sem dependência de código de barras, contendo código da O.S. (`OS-YYYY-NNNN`), dados do cliente, medidas nominais em destaque ($L \times A$ mm), linha de perfil, acabamento de cor, especificação do vidro e identificação física da peça ("Peça 0X/0Y"), para identificar visualmente os materiais no chão de fábrica e evitar trocas ou erros durante o corte, montagem e expedição.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Geração de Etiquetas Térmicas (100x50mm) com Paginação por Exemplar Físico de Peça**
  - **Dado que** o operador visualiza uma Ordem de Serviço aprovada na página `OrderDetailPage` contendo múltiplos itens e quantidades (ex: Item 1 com 2 janelas e Item 2 com 1 porta, totalizando 3 peças físicas),
  - **Quando** clica no botão "Imprimir Etiquetas (100x50mm)",
  - **Então** o sistema compila um documento PDF térmico padronizado (100 mm de largura $\times$ 50 mm de altura, ou 283.46 pt $\times$ 141.73 pt),
  - **E** o documento possui paginação exata por peça física (3 páginas), exibindo em cada uma a numeração sequencial fracionada (ex: "Item 01 | Peça 01/03", "Item 01 | Peça 02/03", "Item 02 | Peça 03/03").

- [ ] **Cenário 2: Tipografia Técnica Limpa de Alto Contraste (Sem Código de Barras)**
  - **Dado que** a etiqueta é renderizada para impressoras térmicas industriais (Zebra, Elgin, Argox) conforme `prototipo_etiquetas.html`,
  - **Quando** os dados técnicos são diagramados no layout,
  - **Então** a etiqueta exibe cabeçalho institucional com marca `AlumiGest ERP` e nome do cliente,
  - **E** exibe o código da O.S. (`OS-YYYY-NNNN`) e identificador do item (`PRD-...`),
  - **E** destaca em caixa central e fonte mono de alto contraste as medidas nominais: `📐 Largura x Altura mm` (ex: `📐 1200 x 1500 mm`),
  - **E** exibe especificações de `COR` (ex: `🎨 Preto Anodizado`), `VIDRO` (ex: `🪟 Incolor 6mm Temperado`) e `LOCAL / OBS` de entrega/instalação,
  - **E** exibe no rodapé o código do item, data de emissão e carimbo institucional sem elementos de código de barras.

- [ ] **Cenário 3: Visualização Prévia Contínua no Modal Frontend com Filtro por Item**
  - **Dado que** o modal de etiquetas térmicas é acionado no frontend,
  - **Quando** o modal `ThermalLabelModal` for exibido,
  - **Então** todas as etiquetas físicas da O.S. são apresentadas em grade responsiva contínua em uma única tela,
  - **E** o operador pode alternar os filtros rápidos: "Todas as Peças (N)", "Item 1 (X Peças)", "Item 2 (Y Peças)",
  - **E** a interface disponibiliza botões para "Baixar PDF" e "Imprimir Todas na Térmica" (acionando `@media print` com `@page { size: 100mm 50mm; margin: 0; }`).

- [ ] **Cenário 4: Download Direto de Arquivo PDF do Backend**
  - **Dado que** o usuário aciona a ação de baixar PDF das etiquetas,
  - **Quando** o endpoint `GET /api/v1/orders/{orderId}/labels-pdf` for consumido,
  - **Então** o backend responde com status HTTP `200 OK` e `Content-Type: application/pdf`,
  - **E** o cabeçalho `Content-Disposition` sugere o nome de arquivo `etiquetas-OS-YYYY-NNNN.pdf`,
  - **E** o frontend revoga o Blob URL em memória determinística e imediatamente após o download para prevenir vazamento de memória.

- [ ] **Cenário 5: Tratamento de Exceção para O.S. Inexistente ou sem Itens**
  - **Dado que** é solicitada a geração de etiquetas para um identificador de O.S. inválido ou sem itens registrados,
  - **Quando** o backend processar a solicitação,
  - **Então** responde com status HTTP `404 Not Found` (se não encontrada) ou HTTP `422 Unprocessable Entity` (se não houver itens válidos), retornando payload padronizado `ErrorResponse` em pt-BR.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Invariante de Dimensão Física Térmica):** A página gerada via OpenPDF deve ter dimensões estritas de 100mm de largura por 50mm de altura (`283.46 pt x 141.73 pt`) com margens mínimas (3mm), garantindo encaixe direto em rolos de etiquetas padrão de serralherias industriais.
- **RN-02 (Invariante de Exemplar Físico 1:1):** Para cada unidade física informada no campo `quantity` dos itens da O.S., deve ser gerada exatamente 1 etiqueta (Ex: 2 itens de quantidade 2 e 1 geram exatamente 3 etiquetas).
- **RN-03 (Fidelidade ao Snapshot Imutável da O.S.):** Todos os dados descritos na etiqueta (cliente, código O.S., medidas nominais em mm, linha, acabamento de cor e vidro) devem vir diretamente do snapshot congelado em `tb_orders` e `tb_order_items`.
- **RN-04 (Design Tipográfico Sem Código de Barras):** Para garantir robustez e impressão rápida em qualquer impressora térmica sem dependência de drivers gráficos pesados ou bibliotecas de código de barras, a etiqueta deve priorizar tipografia nítida e contraste preto/branco puro.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / OpenPDF / PostgreSQL)
- **Endpoint:** `GET /api/v1/orders/{orderId}/labels-pdf` (suporte a query param opcional `?itemId={uuid}`)
- **Content-Type:** `application/pdf`
- **Service:** `LabelPdfService.gerarEtiquetasPdf(UUID orderId, UUID itemId)` com `@Transactional(readOnly = true)`
- **Layout Motor:** OpenPDF com `Rectangle(283.46f, 141.73f)`

### Frontend (React 19 / Vite / TanStack Query / Tailwind)
- **Modal:** `ThermalLabelModal.tsx` com visualização contínua de etiquetas e botões de filtro por item
- **Estilos de Impressão:** Regras `@media print` com `@page { size: 100mm 50mm; margin: 0; }`
- **API Client & Hook:** `ordersApi.downloadLabelsPdf(orderId)` e hook `useDownloadLabelsPdf()`
- **Integração:** Inclusão de botão "Imprimir Etiquetas (100x50mm)" em `OrderDetailActions.tsx` e tabela de itens em `OrderDetailPage.tsx`

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `LabelPdfServiceTest` validando total exato de páginas geradas (soma das quantidades dos itens) e layout 100x50mm.
- [ ] Teste de integração REST validando retorno HTTP 200, headers `application/pdf` e erro HTTP 404 em O.S. inexistente.
- [ ] Componente visual `ThermalLabelModal.tsx` testado com filtros de peças e impressão térmica direta.
- [ ] Cobertura de testes $\ge 80\%$ nas novas classes de backend e frontend.
- [ ] SonarQube Quality Gate verde sem bugs, vulnerabilidades ou code smells.

---

## 📋 Sub-Tarefas / Issues Vinculadas (4 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-17.1](issues/US-17.1-criar-servico-labelpdfservice-usando-openpdf/issue.md) | Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x50mm) contendo dados da O.S., cliente, medidas nominais, cor, vidro e numeração da peça | 🔲 No Backlog |
| [US-17.2](issues/US-17.2-adicionar-endpoint-get-api-orders-orderid-labels-pdf/issue.md) | Adicionar endpoint `GET /api/v1/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf` | 🔲 No Backlog |
| [US-17.3](issues/US-17.3-criar-teste-unitario-do-labelpdfservice/issue.md) | Criar teste unitário do `LabelPdfService` validando geração de bytes e paginação exata por quantidade de peças | 🔲 No Backlog |
| [US-17.4](issues/US-17.4-adicionar-botao-imprimir-etiquetas-no-frontend/issue.md) | Adicionar botão "Imprimir Etiquetas (100x50mm)" e modal no frontend (`OrderDetailPage.tsx`) | 🔲 No Backlog |

---

**Branch:** `feat/us-17-etiquetas-identificacao-termica-pecas`
