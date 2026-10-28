# Especificação Técnica de Apoio: US-47.3 — Emissão da Ficha Técnica A4 de Produção com Lista de Corte

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-47.3**.

---

## ☕ 1. Backend Core & Motor OpenPDF

- **Pacote:** `br.edu.ifpb.alumigest.orders.service`
- **Classe:** `TechnicalSheetPdfService.java`
  - Utiliza biblioteca OpenPDF (Java 21).
  - Consulta os dados congelados do pedido via `OrderRepository.findByIdWithDetails(orderId)`.
  - **Motor de Dedução Paramétrica:**
    - Lê `product.getTemplateType()` (`DoorTemplateType`) e a configuração JSONB `templateConfig` (`TemplateConfig.java`).
    - Calcula o comprimento de corte exato de cada perfil (marcos superiores/inferiores, laterais, folhas móveis) em milímetros e o ângulo de corte ($45^\circ$ ou $90^\circ$).
    - Calcula as folgas e medidas finais de vidros em conformidade com as regras técnicas da linha (ex.: Linha Suprema / Linha 25) e norma ABNT NBR 10821.
    - Lista os componentes e acessórios de montagem (`handleConfig`, `drillingConfig`).
  - **Diagramação A4:**
    - Formato A4 Retrato industrial com margens limpas.
    - Cabeçalho corporativo da Alumiportas, número da O.S., data e identificação do cliente.
    - Tabela de Lista de Corte de Perfis: Código do perfil, descrição, quantidade de barras/peças, comprimento calculado (mm) e grau de corte ($45^\circ / 90^\circ$).
    - Tabela de Vidros: Dimensões nominais vs medidas finais de corte com folgas deduzidas.
    - Tabela de Acessórios de Montagem.
- **Endpoint REST (`OrderController.java`):**
  - `GET /api/v1/orders/{orderId}/technical-sheet.pdf`
  - Retorna `application/pdf` com cabeçalho `Content-Disposition: inline; filename=ficha-tecnica-OS-YYYY-NNNN.pdf`.
  - Tratamento de erro: HTTP 404 caso a ordem não seja encontrada.

---

## ⚛️ 2. Frontend UI & Componentes

- **Diretório:** `frontend/src/features/customers/components/`
- **Componente:** `TechnicalSheetModal.tsx`
  - Modal interativo renderizando o preview do documento PDF A4 via iframe ou canvas vetorial.
  - Exibe spinner de carregamento durante a compilação no backend.
  - Botão de impressão direta acionando `window.print()` ou impressão do frame.
  - Botão de download do arquivo PDF compilado via blob stream.
  - Acionamento integrado: prop `onOpenTechSheet(orderId: string)` conectada à tabela de ordens (`CustomerOrdersTab.tsx`) e ao drawer de esquadrias (`CustomerOrderItemsDrawer.tsx`).

---

## 🧪 3. Estratégia de Testes (QA)

- `TechnicalSheetPdfServiceTest.java`:
  - Teste de cálculo de corte para modelos homologados de `DoorTemplateType` (Porta de Correr 2 Folhas, Janela Maxim-ar, Box Frontal).
  - Validação da integridade dos bytes do PDF compilado (não nulo e tamanho $> 15\text{ KB}$).
- `OrderControllerTest.java` (MockMvc):
  - Validação do status HTTP 200 OK e headers de resposta do endpoint.
  - Validação de resposta HTTP 404 para identificador de ordem inexistente.
- `TechnicalSheetModal.test.tsx` (Vitest):
  - Abertura do modal ao clicar na ação da ordem.
  - Disparo de impressão e download.

---

## 🎨 4. Referências de Design e Protótipos

- 🖥️ **Protótipo Interativo da Central 360°**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html) — Especifica o modal de visualização da Ficha Técnica A4 de Produção com pré-visualização, atalho de impressão e download do PDF.
