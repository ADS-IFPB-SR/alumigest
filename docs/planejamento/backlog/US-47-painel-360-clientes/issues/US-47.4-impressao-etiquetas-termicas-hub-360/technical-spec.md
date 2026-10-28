# Especificação Técnica de Apoio: US-47.4 — Impressão de Etiquetas Térmicas (100x60mm) no Hub

Este documento detalha os aspectos de arquitetura, classes e contratos técnicos para a implementação da fatia vertical **US-47.4**.

---

## ⚛️ 1. Frontend UI & Integração de Hardware

- **Diretório:** `frontend/src/features/customers/pages/CustomerHubPage.tsx`
- **Reutilização do Componente de Pedidos:**
  ```typescript
  import { ThermalLabelModal } from '@/features/orders/components/ThermalLabelModal';
  import type { Order } from '@/features/orders/types';
  ```
- **Contrato do Modal Homologado (`ThermalLabelModalProps`):**
  ```typescript
  export interface ThermalLabelModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
    onDownloadPdf?: (itemId?: string) => void;
    isDownloadingPdf?: boolean;
  }
  ```
- **Gerenciamento de Estado no Hub 360°:**
  - `const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);`
  - `const [selectedOrderForLabels, setSelectedOrderForLabels] = useState<Order | null>(null);`
  - O gatilho de abertura é acionado pelo clique no botão "🏷️ Etiquetas" de uma linha da tabela de ordens de serviço (`CustomerOrdersTab.tsx`) ou do drawer de esquadrias (`CustomerOrderItemsDrawer.tsx`).
- **Comunicação com Backend:**
  - O download do PDF em lote consome o endpoint já homologado `GET /api/v1/orders/{orderId}/labels-pdf`.
  - A impressão direta para impressora térmica USB (Elgin L42) utiliza a rotina de renderização térmica já integrada no modal da US-17.

---

## 🧪 2. Estratégia de Testes (QA)

- `CustomerHubPage.test.tsx` (Vitest):
  - Simulação de clique no botão "🏷️ Etiquetas" na tabela de O.S. da Central 360°.
  - Verificação de renderização do modal `ThermalLabelModal` com as props corretas do pedido selecionado.
  - Teste de fechamento do modal restaurando o estado e sem perder a seleção do cliente.
- `ThermalLabelModal.test.tsx`:
  - Revalidação do comportamento de filtragem de itens e renderização de etiquetas 1:1 conforme quantidade de peças físicas.

---

## 🎨 3. Referências de Design e Protótipos

- 🖥️ **Protótipo Interativo da Central 360°**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html) — Especifica o botão de disparo "🏷️ Etiquetas" nas linhas da tabela de ordens de serviço e no cabeçalho do cartão de esquadrias físicas.
- 🏷️ **Protótipo Visual de Impressão Térmica**: [prototipo_etiquetas.html](../../../prototipos/prototipo_etiquetas.html) — Especifica o layout da etiqueta térmica na proporção 2:1 ($100 \times 60\text{ mm}$), tipografia Inter/JetBrains Mono, dados da ordem e identificação de corte.
