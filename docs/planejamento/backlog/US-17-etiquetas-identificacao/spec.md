# Especificação Funcional & Técnica: US-17 — Emitir Etiquetas de Identificação de Peças por Item da Ordem de Serviço (O.S.)

| Campo | Valor |
|---|---|
| **Identificador** | `US-17` |
| **Issue GitHub** | [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142) |
| **Módulo** | Orders / Production (Chão de Fábrica e Expedição) |
| **Release** | R2 (Transição de Orçamentos para Produção) |
| **Sprint** | Sprint 07 |
| **Branch da Feature** | `feat/us-17-emitir-etiquetas-identificacao-pecas` |
| **Pull Request (develop)** | [#476](https://github.com/ADS-IFPB-SR/alumigest/pull/476) |
| **Status** | 🟢 **Concluída** (100% das 5 sub-issues aprovadas e homologadas com Quality Gate verde) |

---

## 🎯 1. Objetivo de Negócio & Valor Operacional

Como encarregado de produção, operador de corte ou montador da Alumiportas, desejo emitir e imprimir etiquetas adesivas de identificação em formato térmico (100x60mm) para cada exemplar físico de esquadria de uma Ordem de Serviço (O.S.), com visualização prévia contínua em tela única e sem dependência de código de barras, contendo código da O.S. (`OS-YYYY-NNNN`), dados do cliente, medidas nominais em destaque ($L \times A$ mm), linha de perfil, acabamento de cor, especificação do vidro e identificação física da peça ("Peça 0X/0Y"), para identificar visualmente os materiais no chão de fábrica e evitar trocas ou erros durante o corte, montagem e expedição.

### Benefícios Operacionais:
1. **Rastreabilidade Física Individual (1:1):** Cada exemplar físico de peça cortada recebe uma etiqueta autoadesiva dedicada com numeração fracionada (`Peça 01/03`, `02/03`, etc.), eliminando extravios de peças irmãs.
2. **Eficiência no Chão de Fábrica:** Leitura humana instantânea com tipografia técnica limpa e alto contraste, sem dependência de leitores óticos de código de barras ou conectividade de rede na bancada de montagem.
3. **Fidelidade Visual Homologada:** Diagramação precisa com cantos curvos nos cartões e caixas de dados, espelhada identicamente na visualização em tela (`ThermalLabelModal.tsx`) e na impressão física/PDF OpenPDF.

---

## 📋 2. Matriz de Sub-Tarefas e Rastreabilidade (5 Sub-Issues Concluídas)

| Sub-Task | Título / Escopo Técnico | Issue | PR | Status |
|---|---|:---:|:---:|:---:|
| **US-17.1** | Criar serviço `LabelPdfService` usando OpenPDF com layout térmico (100x60mm), dados do pedido, cliente, medidas nominais, cor, vidro e numeração da peça | [#448](https://github.com/ADS-IFPB-SR/alumigest/issues/448) | [#463](https://github.com/ADS-IFPB-SR/alumigest/pull/463) | 🟢 Concluída |
| **US-17.2** | Adicionar endpoint `GET /api/orders/{orderId}/labels-pdf` no backend retornando documento `application/pdf` com filtro opcional por `itemId` | [#449](https://github.com/ADS-IFPB-SR/alumigest/issues/449) | [#465](https://github.com/ADS-IFPB-SR/alumigest/pull/465) | 🟢 Concluída |
| **US-17.3** | Criar testes unitários para `LabelPdfService` e `ThermalLabelDataResolver` validando geração de bytes, integridade de dados e paginação física exata | [#450](https://github.com/ADS-IFPB-SR/alumigest/issues/450) | [#465](https://github.com/ADS-IFPB-SR/alumigest/pull/465) | 🟢 Concluída |
| **US-17.4** | Adicionar botão "Imprimir Etiquetas" na tela de detalhes do pedido no frontend (`OrderDetailPage.tsx` e `OrderDetailHeader.tsx`) | [#451](https://github.com/ADS-IFPB-SR/alumigest/issues/451) | [#470](https://github.com/ADS-IFPB-SR/alumigest/pull/470) | 🟢 Concluída |
| **US-17.5** | Homologação E2E Cypress (6 cenários BDD), modal contínuo com filtros rápidos (`ThermalLabelModal.tsx`), download com revogação de Blob URL e saneamento SonarQube | [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474) | [#475](https://github.com/ADS-IFPB-SR/alumigest/pull/475) | 🟢 Concluída |

---

## 🧪 3. Cenários de Aceitação BDD Gherkin (100% Homologados)

### Cenário 1: Geração de Etiquetas Térmicas (100x60mm) com Paginação por Exemplar Físico de Peça
* **Dado que** o operador visualiza uma Ordem de Serviço aprovada na página `OrderDetailPage` contendo múltiplos itens e quantidades (ex: Item 1 com 2 janelas e Item 2 com 1 porta, totalizando 3 peças físicas),
* **Quando** clica no botão "Imprimir Etiquetas (100x60mm)" ou "Visualizar Etiquetas",
* **Então** o sistema compila o documento térmico padronizado (100 mm de largura $\times$ 60 mm de altura, ou 283.46 pt $\times$ 170.08 pt),
* **E** o documento possui paginação exata por peça física (3 páginas / 3 cartões), exibindo em cada uma a numeração sequencial fracionada:
  * `"Item 01 | Peça 01/03"`
  * `"Item 01 | Peça 02/03"`
  * `"Item 02 | Peça 03/03"`.

### Cenário 2: Tipografia Técnica Limpa de Alto Contraste (Sem Código de Barras)
* **Dado que** a etiqueta é renderizada para impressoras térmicas industriais (Zebra, Elgin, Argox),
* **Quando** os dados técnicos são diagramados no layout OpenPDF e na visualização prévia,
* **Então** a etiqueta exibe cabeçalho institucional com marca `Alumiportas` e nome do cliente,
* **E** exibe o código da O.S. (`#OS-YYYY-NNNN`) e badge da peça física com cantos curvos e fundo escuro,
* **E** destaca em caixa central e fonte mono de alto contraste as medidas nominais: `📐 Largura x Altura mm` (ex: `1200 x 1500 mm`),
* **E** exibe especificações de COR (`aluminumColor`), VIDRO (`glassType`) e `LOCAL / OBS:`,
* **E** exibe no rodapé apenas a data de emissão à esquerda, sem código de barras nem carimbos desnecessários.

### Cenário 3: Visualização Prévia Contínua no Modal Frontend com Filtro por Item
* **Dado que** o modal de etiquetas térmicas é acionado no frontend,
* **Quando** o modal `ThermalLabelModal` for exibido,
* **Então** todas as etiquetas físicas da O.S. são apresentadas em grade responsiva contínua em uma única tela,
* **E** o operador pode alternar os filtros rápidos: "Todas as Peças (N)", "Item 1 (X Peças)", "Item 2 (Y Peças)",
* **E** a interface disponibiliza botões para "Baixar PDF" e "Imprimir Todas na Térmica" (acionando `@media print` com `@page { size: 100mm 60mm; margin: 0; }`).

### Cenário 4: Download Direto de Arquivo PDF do Backend
* **Dado que** o usuário aciona a ação de baixar PDF das etiquetas,
* **Quando** o endpoint `GET /api/v1/orders/{orderId}/labels-pdf` for consumido,
* **Então** o backend responde com status HTTP `200 OK` e `Content-Type: application/pdf`,
* **E** o cabeçalho `Content-Disposition` sugere o nome de arquivo `etiquetas-OS-YYYY-NNNN.pdf`,
* **E** o frontend revoga o Blob URL em memória determinística e imediatamente após o download para prevenir vazamento de memória,
* **E** uma notificação toast de sucesso é apresentada.

### Cenário 5: Tratamento de Exceção para O.S. Inexistente ou sem Itens
* **Dado que** é solicitada a geração de etiquetas para um identificador de O.S. inválido ou sem itens registrados,
* **Quando** o backend processar a solicitação,
* **Então** responde com status HTTP `404 Not Found` (se não encontrada) ou HTTP `422 Unprocessable Entity` (se não houver itens válidos), retornando payload padronizado `ErrorResponse` em pt-BR com feedback amigável na interface.

### Cenário Bônus: Bloqueio e Ocultação das Ações de Etiquetas para Pedidos Cancelados
* **Dado que** o operador visualiza um pedido cancelado (`status: 'CANCELLED'`),
* **Quando** a tela de detalhes é renderizada,
* **Então** os botões de emissão e visualização de etiquetas não são exibidos no DOM.

---

## 📐 4. Regras de Negócio e Invariantes Técnicas

* **RN-01 (Invariante de Dimensão Física Térmica):** A página gerada via OpenPDF e na visualização CSS deve ter dimensões estritas de 100mm de largura por 60mm de altura (`283.46 pt x 170.08 pt`) com margens de resguardo mínimas (3mm/8pt), garantindo encaixe direto em rolos industriais padrão de bobina térmica contínua.
* **RN-02 (Invariante de Paginação Física 1:1):** Para cada unidade física informada no campo `quantidade` dos itens da O.S., deve ser gerada exatamente 1 página/cartão térmico individual. Se a O.S. possui 2 itens de quantidades 2 e 1, a paginação gerará 3 etiquetas (`Item 01 | Peça 01/03`, `Item 01 | Peça 02/03`, `Item 02 | Peça 03/03`).
* **RN-03 (Fidelidade ao Snapshot Imutável da O.S.):** Todos os dados descritos na etiqueta (cliente, código O.S., medidas nominais em mm, cor de perfil e especificação de vidro) provêm diretamente do snapshot imutável congelado na aprovação da O.S. (`tb_orders` e `tb_order_items`), blindando as etiquetas contra alterações posteriores no catálogo.
* **RN-04 (Design Tipográfico Sem Código de Barras):** Para garantir confiabilidade industrial em impressoras monocromáticas de qualquer fabricante (Zebra, Elgin, Argox) sem distorções de driver ou dependência de bibliotecas gráficas pesadas de códigos de barra 2D, a etiqueta utiliza tipografia nítida mono e forte contraste preto/branco.
* **RN-05 (Prioridade na Resolução de Localização):** O campo `LOCAL / OBS:` deve extrair preferencialmente as observações específicas da O.S. (`order.observacoes`), recorrendo ao endereço cadastral do cliente (`order.clienteEndereco`) apenas quando as observações não estiverem preenchidas.

---

## 🏗️ 5. Arquitetura e Implementação Técnica

### 5.1 Backend (Java 21 / Spring Boot 3 / OpenPDF)

* **Controller:** [OrderController.java](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/orders/controller/OrderController.java)
  * Mapeamento: `GET /api/v1/orders/{id}/labels-pdf` (aliases `/api/orders/{id}/labels-pdf` e `/api/v1/orders/{id}/etiquetas-pdf`)
  * Parâmetros: `id` (UUID da O.S., obrigatório) e `itemId` (UUID opcional para filtrar apenas peças de um item específico)
  * Resposta: `byte[]` com `Content-Type: application/pdf` e `Content-Disposition: attachment; filename="etiquetas-OS-YYYY-NNNN.pdf"`
* **Service Orchestrator:** [LabelPdfService.java](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/orders/service/LabelPdfService.java)
  * Transacionalidade: `@Transactional(readOnly = true)`
  * Gerenciamento de Recursos: Bloco `try-with-resources` com `ByteArrayOutputStream` e `Document` OpenPDF.
* **Data Resolver:** [ThermalLabelDataResolver.java](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/orders/service/pdf/ThermalLabelDataResolver.java)
  * Transforma a entidade `Order` em uma lista plana de DTOs imutáveis [ThermalLabelData.java](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/orders/service/pdf/ThermalLabelData.java), computando contadores sequenciais de peças físicas.
* **Pdf Renderer:** [ThermalLabelPdfRenderer.java](file:///c:/Users/italo/Desktop/Projects/alumigest/backend/src/main/java/br/edu/ifpb/alumigest/orders/service/pdf/ThermalLabelPdfRenderer.java)
  * Renderizador vetorial de baixo nível OpenPDF com `PdfContentByte.roundRectangle(...)`:
    * Moldura externa: raio curvo de 6pt.
    * Caixa de medidas nominais: raio curvo de 3.5pt com fundo cinza suave (`#F1F5F9`).
    * Badge de identificação física da peça: raio curvo de 3pt com fundo escuro (`#0F172A`) e texto branco.

### 5.2 Frontend (React 19 / Vite / TypeScript / Tailwind CSS)

* **Modal de Visualização:** [ThermalLabelModal.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/components/ThermalLabelModal.tsx)
  * Grade contínua em tela única com botões de alternância rápida de filtro por item.
  * Regras `@media print` com `@page { size: 100mm 60mm; margin: 0; }` e `-webkit-print-color-adjust: exact` para impressão térmica direta via navegador.
* **Integração de Tela:** [OrderDetailHeader.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/components/OrderDetailHeader.tsx) e [OrderDetailPage.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/pages/OrderDetailPage.tsx)
  * Botões `Visualizar Etiquetas` (`data-testid="btn-open-thermal-modal"`) e `Baixar PDF` (`data-testid="btn-download-labels-pdf"`).
* **Mock & Engine Vetorial Demo:** [demoOrdersData.ts](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/mocks/demoOrdersData.ts)
  * `generateDemoThermalLabelsPdf(order)`: Compilador de PDF 1.4 térmico puro via JavaScript, gerando curvas de Bézier cúbicas (`c`) e codificação ISO-8859-1/WinAnsi com escape octal dinâmico em passagem única (`String#codePointAt`).
* **API Client & Hook:** [ordersApi.ts](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/services/ordersApi.ts) e [useOrders.ts](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/hooks/useOrders.ts)
  * Mutação `useDownloadLabelsPdf()` com feedback reativo via React Hot Toast e revogação determinística de `URL.revokeObjectURL(url)`.

---

## 🛡️ 6. Matriz de Testes Automatizados & Quality Gate

```
                              [E2E Cypress]
                    us17_5_etiquetas_identificacao_termica.cy.ts
                            (6 cenários BDD - 100% verde)
                                   ▲
                                   │
                    [Testes de Componente / Vitest]
                ThermalLabelModal.test.tsx + OrderDetailHeader.test.tsx
                          (88 suítes / 722 testes verdes)
                                   ▲
                                   │
                     [Testes Unitários Backend / JUnit 5]
              LabelPdfServiceTest.java + ThermalLabelDataResolverTest.java
                     (30 testes unitários / 0 falhas / 0 erros)
                                   ▲
                                   │
                      [SonarQube & Checkstyle Linter]
                     0 violações Checkstyle / 0 Code Smells
```

### Resultados Oficiais de Homologação:
* **Backend JUnit 5**: **30/30 testes aprovados** (validações de robustez, limites de margem, paginação fracionada e extração de ambientes).
* **Backend Checkstyle**: **0 violações** (`BUILD SUCCESS`).
* **Frontend Vitest**: **88 arquivos de teste aprovados (722 testes verdes)**.
* **Frontend Linter (Oxlint)**: **0 erros**.
* **Cypress E2E**: **6/6 cenários BDD aprovados (16s)**.
* **SonarQube Quality Gate**: Todos os 11 code smells sanados (complexidade cognitiva de `getOrders` reduzida de 17 para 2, asserções semânticas `.toHaveLength` e constantes limpas).

---

## 🔗 Referências & Governança Docs-as-Code
* 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
* 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)
* 📜 **Especificação REST**: [../../../sistema/001-analise-projeto/API-Especificacao_API_REST.md](../../../sistema/001-analise-projeto/API-Especificacao_API_REST.md)
* 🐙 **PR de Integração na Develop**: [#476](https://github.com/ADS-IFPB-SR/alumigest/pull/476)
