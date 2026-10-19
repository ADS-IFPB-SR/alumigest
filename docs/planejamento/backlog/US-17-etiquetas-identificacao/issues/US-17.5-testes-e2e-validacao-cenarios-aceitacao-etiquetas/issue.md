# [US-17.5] Testes E2E — Validação dos Cenários de Aceitação de Etiquetas Térmicas de Identificação

**Issue GitHub**: [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474)  
**Parent Issue**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142) (`US-17: Emitir Etiquetas de Identificação de Peças por Item do Pedido`)  
**Módulo**: Orders / Production (Etiquetas Térmicas de Chão de Fábrica)  
**Tipo**: Testes de Sistema / E2E (Cypress)  
**Prioridade**: P1  
**Sprint**: 07 / Transição R2  
**Branch**: `feat/us-17.5-testes-e2e-cenarios-aceitacao-etiquetas-474`  
**Status**: Concluído (100% dos testes aprovados)  

---

## 🎯 Objetivo & Valor de Negócio

Validar de ponta a ponta, através de testes automatizados de sistema no Cypress e testes unitários no Vitest, a suíte completa de homologação da **US-17**: emissão, diagramação, paginação por exemplar físico, visualização prévia contínua em modal com filtros por item, download direto com revogação de blob e tratamento de exceções (HTTP 404 e 422) das etiquetas adesivas de identificação térmica (100x60mm) a partir da tela de detalhes da Ordem de Serviço/Pedido (`OrderDetailPage`).

O valor de negócio está em garantir a confiabilidade operacional no chão de fábrica da Alumiportas: as etiquetas identificam cada peça física de esquadria (medidas nominais em mm, cor de perfil, modelo de vidro e cliente), evitando trocas e retrabalhos durante corte, usinagem, montagem e expedição.

---

## 📝 Escopo Técnico Implementado

- **Suíte E2E Cypress**: Implementação do arquivo [frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) cobrindo 6 cenários detalhados.
- **Componente Modal Térmico**: [frontend/src/features/orders/components/ThermalLabelModal.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/components/ThermalLabelModal.tsx) com paginação física, filtros rápidos, diagramação mono de alto contraste e regras de impressão `@media print` com `@page { size: 100mm 60mm; margin: 0; }`.
- **Integração na Ordem de Serviço**:
  - [frontend/src/features/orders/components/OrderDetailHeader.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/features/orders/components/OrderDetailHeader.tsx) com `data-testid="btn-open-thermal-modal"` e `data-testid="btn-download-labels-pdf"`.
  - [frontend/src/pages/OrderDetailPage.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/pages/OrderDetailPage.tsx) integrando modal, hook de download e tratamento resiliente de erros 404/422.
- **Suíte de Testes Unitários**:
  - [frontend/src/__tests__/features/orders/ThermalLabelModal.test.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/__tests__/features/orders/ThermalLabelModal.test.tsx) (5 testes passando 100%).
  - [frontend/src/__tests__/features/orders/OrderDetailHeader.test.tsx](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/src/__tests__/features/orders/OrderDetailHeader.test.tsx) (9 testes passando 100%).
- **Script de Automação**: Adicionado `"test:e2e:us17"` em [frontend/package.json](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/package.json).

---

## 🧪 Cenários de Aceitação BDD Validados

### Cenário 1: Geração de Etiquetas Térmicas (100x60mm) com Paginação por Exemplar Físico de Peça
- **Dado que** o operador visualiza uma Ordem de Serviço aprovada na página `OrderDetailPage` contendo múltiplos itens e quantidades (Item 1 com 2 janelas e Item 2 com 1 porta, totalizando 3 peças físicas),
- **Quando** clica no botão "Imprimir Etiquetas (100x60mm)" ou "Visualizar Etiquetas",
- **Então** o sistema compila o documento térmico padronizado (100 mm de largura $\times$ 60 mm de altura, ou 283.46 pt $\times$ 170.08 pt),
- **E** o documento possui paginação exata por peça física (3 páginas / 3 cartões), exibindo em cada uma a numeração sequencial fracionada:
  - `"Item 01 | Peça 01/03"`
  - `"Item 01 | Peça 02/03"`
  - `"Item 02 | Peça 03/03"`.

### Cenário 2: Tipografia Técnica Limpa de Alto Contraste (Sem Código de Barras)
- **Dado que** a etiqueta é renderizada para impressoras térmicas industriais (Zebra, Elgin, Argox) conforme `prototipo_etiquetas.html`,
- **Quando** os dados técnicos são diagramados no layout OpenPDF e na visualização prévia,
- **Então** a etiqueta exibe cabeçalho institucional com marca `AlumiGest ERP` e nome do cliente,
- **E** exibe o código da O.S. (`OS-YYYY-NNNN`) e identificador do item (`PRD-...`),
- **E** destaca em caixa central e fonte mono de alto contraste as medidas nominais: 📐 Largura x Altura mm (ex: `📐 1200 x 1500 mm`),
- **E** exibe especificações de COR (`aluminumColor`, ex: `🎨 Preto Anodizado`), VIDRO (`glassType`, ex: `🪟 Incolor 6mm Temperado`) e LOCAL / OBS de entrega/instalação,
- **E** exibe no rodapé o código do item, data de emissão e carimbo institucional sem elementos de código de barras.

### Cenário 3: Visualização Prévia Contínua no Modal Frontend com Filtro por Item
- **Dado que** o modal de etiquetas térmicas é acionado no frontend,
- **Quando** o modal `ThermalLabelModal` for exibido,
- **Então** todas as etiquetas físicas da O.S. são apresentadas em grade responsiva contínua em uma única tela,
- **E** o operador pode alternar os filtros rápidos: "Todas as Peças (N)", "Item 1 (X Peças)", "Item 2 (Y Peças)",
- **E** a interface disponibiliza botões para "Baixar PDF" e "Imprimir Todas na Térmica" (acionando `@media print` com `@page { size: 100mm 60mm; margin: 0; }`).

### Cenário 4: Download Direto de Arquivo PDF do Backend
- **Dado que** o usuário aciona a ação de baixar PDF das etiquetas,
- **Quando** o endpoint `GET /api/v1/orders/{orderId}/labels-pdf` for consumido,
- **Então** o backend responde com status HTTP 200 OK e `Content-Type: application/pdf`,
- **E** o cabeçalho `Content-Disposition` sugere o nome de arquivo `etiquetas-OS-YYYY-NNNN.pdf`,
- **E** o frontend revoga o Blob URL em memória determinística e imediatamente após o download para prevenir vazamento de memória,
- **E** uma notificação toast de sucesso é apresentada.

### Cenário 5: Tratamento de Exceção para O.S. Inexistente ou sem Itens
- **Dado que** é solicitada a geração de etiquetas para um identificador de O.S. inválido ou sem itens registrados,
- **Quando** o backend processar a solicitação,
- **Então** responde com status HTTP 404 Not Found (se não encontrada) ou HTTP 422 Unprocessable Entity (se não houver itens válidos), retornando payload padronizado `ErrorResponse` em pt-BR com feedback amigável na interface.

### Cenário Bônus: Bloqueio e Ocultação das Ações de Etiquetas para Pedidos Cancelados
- **Dado que** o operador visualiza um pedido cancelado (`status: 'CANCELLED'`),
- **Quando** a tela de detalhes é renderizada,
- **Então** os botões de emissão e visualização de etiquetas não são exibidos no DOM.

---

## 🛠️ Checklist de Implementação

- [x] Criar branch `feat/us-17.5-testes-e2e-cenarios-aceitacao-etiquetas-474`
- [x] Implementar componente `ThermalLabelModal.tsx` com grade contínua e filtros rápidos por item
- [x] Integrar `ThermalLabelModal` no `OrderDetailPage.tsx` e `OrderDetailHeader.tsx`
- [x] Criar testes unitários para `ThermalLabelModal.test.tsx` (5/5 aprovados)
- [x] Atualizar testes unitários de `OrderDetailHeader.test.tsx` (9/9 aprovados)
- [x] Criar arquivo de teste E2E `frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts`
- [x] Implementar Cenário 1: Paginação fracionada por peça física (3/3 peças)
- [x] Implementar Cenário 2: Diagramação técnica de alto contraste sem código de barras
- [x] Implementar Cenário 3: Visualização contínua com filtros dinâmicos por item e impressão térmica
- [x] Implementar Cenário 4: Download de PDF com intercept de headers e revogação determinística de Blob URL
- [x] Implementar Cenário 5: Resiliência a erro 404 (tela de erro amigável) e 422 (toast descritivo)
- [x] Implementar Cenário Bônus: Ocultação de ações em ordens canceladas
- [x] Adicionar script `"test:e2e:us17"` em `frontend/package.json`
- [x] Executar suíte Cypress e obter 100% de aprovação (6 de 6 testes verdes)
- [x] Executar suíte de testes unitários Vitest (`npm test` — 88 suítes / 722 testes aprovados)
- [x] Validar conformidade de lint com `npm run lint` (0 erros)
- [x] Validar compilação do TypeScript e Vite com `npm run build` (sucesso)

---

## ✅ Definition of Done (DoD)

1. [x] **Suíte E2E Cypress**: 6 cenários BDD implementados e aprovados com 100% de sucesso (15s).
2. [x] **Zero Regressão**: 722 testes unitários do frontend (`npm test`) continuam passando sem falhas.
3. [x] **Qualidade Estática**: 0 erros no linter (`npm run lint`).
4. [x] **Compilação**: Build do frontend (`npm run build`) executado com sucesso sem erros de tipagem.
5. [x] **Rastreabilidade**: Documento da issue registrado e vinculado à Issue GitHub #474 e à US-17 (#142).

---

## 🔗 Referências & Documentos Relacionados

- 🎯 **Issue Pai (GitHub)**: [#142](https://github.com/ADS-IFPB-SR/alumigest/issues/142)
- 🎫 **Issue E2E (GitHub)**: [#474](https://github.com/ADS-IFPB-SR/alumigest/issues/474)
- 📑 **Especificação Funcional da US-17**: [spec.md](../../spec.md)
- 🏛️ **Constituição do Projeto**: [constitution.md](../../../constitution.md)
