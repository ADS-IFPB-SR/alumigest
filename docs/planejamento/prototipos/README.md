# 🎨 Catálogo de Protótipos de Interface do AlumiGest

Este diretório reúne os **protótipos interativos em HTML/CSS/JS** homologados para orientar o desenvolvimento das interfaces, fluxos de usuário e comportamentos visuais do AlumiGest.

---

## 📂 Mapa de Protótipos e Vínculo com User Stories

| Arquivo de Protótipo | Funcionalidade Principal | User Stories Vinculadas | Tecnologias Utilizadas | Autor Original |
|---|---|---|---|---|
| [**`painel-clientes-360.html`**](painel-clientes-360.html) | **Central 360° do Cliente**: Layout mestre-detalhe com barra lateral de clientes, cards de KPIs comerciais, histórico de orçamentos, tabela de Ordens de Serviço (O.S.) com esquadrias físicas e modais de Ficha Técnica e Etiquetas. | [**US-47**](../backlog/US-47-painel-360-clientes/spec.md) ([US-47.1](../backlog/US-47-painel-360-clientes/issues/US-47.1-hub-base-kpis-gestao-orcamentos-comerciais/issue.md), [US-47.2](../backlog/US-47-painel-360-clientes/issues/US-47.2-gestao-ordens-servico-detalhamento-esquadrias/issue.md), [US-47.3](../backlog/US-47-painel-360-clientes/issues/US-47.3-emissao-ficha-tecnica-a4-producao-corte/issue.md), [US-47.4](../backlog/US-47-painel-360-clientes/issues/US-47.4-impressao-etiquetas-termicas-hub-360/issue.md)) | HTML5, CSS3 Tokens, Google Fonts (Hanken Grotesk, Inter, JetBrains Mono) | Guylherme |
| [**`prototipo_etiquetas.html`**](prototipo_etiquetas.html) | **Impressão Térmica de Etiquetas (Elgin L42)**: Layout visual em proporção 2:1 ($100 \times 60\text{ mm}$ e $100 \times 50\text{ mm}$) com código de barras, medidas nominais em milímetros ($L \times A$ mm), dados do cliente e especificações de perfis e vidros. | [**US-17**](../backlog/US-17-etiquetas-identificacao/spec.md), [**US-47.4**](../backlog/US-47-painel-360-clientes/issues/US-47.4-impressao-etiquetas-termicas-hub-360/issue.md) | Tailwind CSS CDN, FontAwesome, Google Fonts (Inter, JetBrains Mono) | Guylherme |
| [**`prototipo_kambam.html`**](prototipo_kambam.html) | **Quadro Kanban de Produção Fabril**: Fluxo de cartões de O.S. nas colunas `WAITING_PRODUCTION`, `IN_PRODUCTION` e `COMPLETED`, com Drag & Drop, etiquetas de status de estoque, SLA e checklist de fabricação. | [**US-18**](../backlog/US-18-painel-kanban-producao/spec.md), [**US-21**](../backlog/US-21-reserva-baixa-estoque/spec.md) | Tailwind CSS CDN, FontAwesome, Drag & Drop nativo, Google Fonts | Guylherme |

---

## 🧭 Como Visualizar os Protótipos

Todos os protótipos são arquivos autônomos (*standalone*). Você pode abri-los diretamente em qualquer navegador moderno (Chrome, Edge, Firefox) sem necessidade de servidor web ativo ou build steps:

1. Clique com o botão direito sobre o arquivo `.html` no gerenciador de arquivos ou editor.
2. Selecione **"Abrir com o navegador padrão"** (ou use a extensão Live Server).
3. Interaja com os filtros, seletores de abas e botões para validar os fluxos homologados.
