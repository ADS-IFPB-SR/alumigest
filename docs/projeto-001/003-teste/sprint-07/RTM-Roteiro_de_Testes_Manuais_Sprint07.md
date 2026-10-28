# 📋 RTM — Roteiro de Testes Manuais — Sprint 07

| Informação | Detalhe |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 07 — Gestão Fabril: Etiquetas de Identificação de Peças (US-17) e Painel Kanban de Produção (US-18) |
| **Documento** | Roteiro Operacional de Execução Manual de Testes de Aceitação |
| **Público-Alvo** | Product Owner (PO), Engenheiros de QA, Desenvolvedores e Validadores |
| **Versão** | 3.0 (Estrutura em Fichas Operacionais Executivas — Sem Tabelas Quebradas) |
| **Governança** | Docs-as-Code — Tríade Documental ([`TEA`](./TEA-Testes_de_Aceitacao_Sprint07.md) • [`RTM`](./RTM-Roteiro_de_Testes_Manuais_Sprint07.md) • [`RET`](./RET-Relatorio_Execucao_Testes_Sprint07.md)) |
| **Status** | 🟢 **HOMOLOGADO** (Baseado na Baseline B-ALG-v0.7.0-S07-01) |

---

## 1. 🎯 Visão Geral e Guia Rápido

Este documento é o **guia oficial para reprodução manual dos testes de aceitação** da Release 2 (Gestão Fabril). Ele foi construído com base nas suítes automatizadas do Cypress, permitindo que qualquer testador ou o Product Owner valide o sistema ponta a ponta pelo navegador sem precisar ler código.

### 📌 Como usar este roteiro:
1. Siga os **Pré-requisitos de Ambiente** descritos na Seção 2 para garantir que o sistema esteja rodando.
2. Execute cada uma das **Fichas de Cenário** das Seções 3 (Etiquetas Térmicas) e 4 (Painel Kanban).
3. Cada ficha possui o **Objetivo**, a **Rota na Interface**, os **Passos Numerados de Ação**, o **Resultado Esperado** e os **Critérios de Validação** com caixas de seleção `- [ ]`.
4. Ao final, confira a **Matriz Defensiva de Defeitos** (Seção 5) e registre a assinatura na **Folha de Homologação** (Seção 6).

---

## 2. ⚙️ Pré-requisitos de Ambiente e Massa de Testes

### 2.1 Como subir a aplicação localmente:
Abra o terminal na pasta raiz do projeto e execute:

```bash
# 1. Subir o banco PostgreSQL
docker compose up -d postgres

# 2. Inicializar o backend Spring Boot (em outro terminal)
cd backend
./mvnw spring-boot:run

# 3. Inicializar o frontend Vite (em outro terminal)
cd frontend
npm run dev
```

* Endereço do Frontend: `http://localhost:5173`
* Endereço da API Backend: `http://localhost:8080/api`

### 2.2 Massa de dados recomendada:
* **Cliente de Teste:** `Construtora Alvorada Ltda` (Telefone: `(83) 98888-1717`).
* **Ordem de Serviço (O.S.) Aprovada:** Pelo menos uma O.S. no status `AGUARDANDO_PRODUCAO` contendo **itens fracionados**:
  * **Item 1:** Janela de Correr 2 Folhas (1200×1500 mm) — Quantidade: **2 peças**.
  * **Item 2:** Porta de Giro 1 Folha (900×2100 mm) — Quantidade: **1 peça**.
  * **Total de Peças Físicas:** **3 peças** (para validar a contagem fracionada `01/03`, `02/03`, `03/03`).
* **Ordem de Serviço Cancelada:** Uma O.S. no status `CANCELADA` (para validar o bloqueio defensivo).

> [!TIP]
> **Como criar a O.S. rapidamente:** Acesse `/orcamentos/novo`, cadastre uma proposta com as 2 esquadrias acima, salve e clique em **"Aprovar Orçamento"**. O sistema converte automaticamente em Pedido/O.S.

---

## 3. 🏷️ Módulo 1: Etiquetas Térmicas de Identificação de Peças (US-17)

---

### 🧪 Cenário RTM-ETQ-01: Visualização Prévia Contínua e Paginação por Peça Física
* 🎯 **Objetivo:** Garantir que o modal exiba exatamente um cartão de etiqueta para cada folha/peça física real a ser produzida.
* 🤖 **Equivalente Automatizado:** [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) — Cenários 1 e 3
* 📍 **Ponto de Partida:** Tela de detalhes da O.S. ativa (`/pedidos/:id` ou `/ordens-servico/:id`)

#### 👣 Passo a Passo de Execução:
1. Na barra superior de ações da ordem de serviço, localize e clique no botão **"Imprimir Etiquetas"** `[data-testid="btn-open-thermal-modal"]`.
2. Observe a abertura do modal térmico com fundo escurecido `[data-testid="thermal-label-modal"]`.
3. Inspecione a grade central de cartões `[data-testid="thermal-labels-grid"]`.
4. Conte os cartões renderizados: para uma O.S. com 2 janelas e 1 porta, devem existir exatamente **3 cartões** `[data-testid="thermal-label-card"]`.
5. Observe a numeração no topo de cada cartão `[data-testid="label-piece-fraction"]`.

#### ✅ Critérios de Aceitação:
- [ ] O modal abre suavemente sem travar a interface.
- [ ] São exibidos exatamente 3 cartões de etiqueta para os 2 itens da O.S.
- [ ] O primeiro cartão exibe o texto: `Item 01 - Peça 01/03`.
- [ ] O segundo cartão exibe o texto: `Item 01 - Peça 02/03`.
- [ ] O terceiro cartão exibe o texto: `Item 02 - Peça 03/03`.

---

### 🧪 Cenário RTM-ETQ-02: Inspeção do Conteúdo Técnico e Diagramação das Etiquetas
* 🎯 **Objetivo:** Verificar se os dados impressos nas etiquetas atendem às exigências de chão de fábrica sem poluição visual.
* 🤖 **Equivalente Automatizado:** [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) — Cenário 2
* 📍 **Ponto de Partida:** Modal de etiquetas aberto

#### 👣 Passo a Passo de Execução:
1. No primeiro cartão (Item 01), inspecione o cabeçalho superior.
2. Inspecione as dimensões nominais da esquadria `[data-testid="label-dimensions"]`.
3. Inspecione os acabamentos de perfil de alumínio e vidro `[data-testid="label-color"]` e `[data-testid="label-glass"]`.
4. Inspecione a presença da data de emissão `[data-testid="label-date"]`.
5. No segundo cartão (Item 02 — Porta), verifique se os dados mudam refletindo as dimensões e acabamentos da porta.
6. Observe a área inferior do cartão para conferir ausência de códigos gráficos corrompidos.

#### ✅ Critérios de Aceitação:
- [ ] Exibe o cabeçalho institucional em destaque: **ALUMIPORTAS**.
- [ ] O cartão 1 exibe as dimensões corretas: `1200 x 1500 mm`.
- [ ] O cartão 1 exibe: Perfil `Preto Anodizado` e Vidro `Incolor 6mm Temperado`.
- [ ] O cartão 3 (Porta) exibe as dimensões: `900 x 2100 mm`.
- [ ] O cartão 3 (Porta) exibe: Perfil `Branco Eletrostático` e Vidro `Fumê 8mm Temperado`.
- [ ] Não há códigos de barra simulados ou telas em branco poluindo a etiqueta.

---

### 🧪 Cenário RTM-ETQ-03: Filtragem Dinâmica por Item no Modal e Download Parcial
* 🎯 **Objetivo:** Validar a capacidade do operador filtrar peças de um item específico para impressão sob demanda (mitigação do BUG #487).
* 🤖 **Equivalente Automatizado:** [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) — Cenário 3
* 📍 **Ponto de Partida:** Modal de etiquetas aberto

#### 👣 Passo a Passo de Execução:
1. No topo do modal, localize a barra com os botões de filtro rápido.
2. Clique no botão de filtro **"Item 01"** `[data-testid="filter-piece-item-1"]`.
3. Observe a grade de cartões e o texto do botão principal de impressão.
4. Clique no botão de filtro **"Item 02"** `[data-testid="filter-piece-item-2"]`.
5. Com o filtro "Item 02" selecionado, clique no botão **"Baixar PDF"** `[data-testid="btn-modal-download-pdf"]`.
6. Clique no botão **"Todas as Peças"** `[data-testid="filter-piece-all"]`.
7. Clique no botão de fechar (ícone 'X') `[data-testid="btn-close-thermal-modal"]`.

#### ✅ Critérios de Aceitação:
- [ ] Ao clicar em "Item 01", a grade exibe apenas 2 cartões (`01/03` e `02/03`) e o botão passa a exibir *"Imprimir Peças Filtradas (2)"*.
- [ ] Ao clicar em "Item 02", a grade exibe apenas 1 cartão (`03/03`) e o botão passa a exibir *"Imprimir Peças Filtradas (1)"*.
- [ ] O download do PDF com o filtro ativo gera um documento contendo apenas a etiqueta do Item 02, propagando o parâmetro `itemId` corretamente na chamada de rede.
- [ ] Ao clicar em "Todas as Peças", os 3 cartões voltam a ser exibidos.
- [ ] O botão de fechar fecha o modal e retorna o foco à página da O.S.

---

### 🧪 Cenário RTM-ETQ-04: Download Direto de Arquivo PDF e Notificação Toast
* 🎯 **Objetivo:** Validar o download direto das etiquetas via backend e o feedback ao usuário.
* 🤖 **Equivalente Automatizado:** [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) — Cenário 4
* 📍 **Ponto de Partida:** Tela de detalhes da O.S. ativa (`/pedidos/:id`)

#### 👣 Passo a Passo de Execução:
1. Na barra superior de ações da O.S., clique no botão **"Baixar Etiquetas PDF"** `[data-testid="btn-download-labels-pdf"]`.
2. Observe a notificação visual exibida no canto superior direito da tela.
3. Acesse a pasta de Downloads do seu computador e abra o arquivo PDF baixado.
4. Verifique as dimensões das páginas e o conteúdo do documento.

#### ✅ Critérios de Aceitação:
- [ ] Uma notificação toast verde surge com a mensagem: *"Etiquetas térmicas baixadas com sucesso!"* (ou *"geradas com sucesso"*).
- [ ] O arquivo é salvo com o nome padronizado: `etiquetas-OS-YYYY-NNNN.pdf`.
- [ ] O leitor de PDF exibe páginas no formato de rolo térmico industrial: **100×60 mm** (ou 100×50 mm).
- [ ] O documento contém exatamente 3 páginas, uma para cada exemplar físico de peça.

---

### 🧪 Cenário RTM-ETQ-05: Tratamento de Exceções e Resiliência (404 e 422)
* 🎯 **Objetivo:** Garantir que erros de identificador inválido ou pedidos sem peças sejam tratados sem quebrar a aplicação.
* 🤖 **Equivalente Automatizado:** [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) — Cenário 5
* 📍 **Ponto de Partida:** Barra de endereço do navegador

#### 👣 Passo a Passo de Execução:
1. Na barra de endereço do navegador, digite uma URL com UUID inexistente: `http://localhost:5173/ordens-servico/00000000-0000-0000-0000-000000000404`.
2. Pressione `Enter` e aguarde a resposta da página.
3. Em seguida, em um pedido sem itens cadastrados (caso existente), tente acionar a impressão de etiquetas.

#### ✅ Critérios de Aceitação:
- [ ] Para O.S. inexistente: exibe tela amigável de erro `[data-testid="order-detail-error"]` com o texto *"Ordem de Serviço não encontrada"*.
- [ ] A aplicação não exibe tela branca (White Screen of Death) nem quebra o layout geral.
- [ ] Para requisições inválidas (422): exibe toast defensivo em português informando o motivo do erro.
- [ ] O botão de ação é restaurado para o estado habilitado após o erro.

---

### 🧪 Cenário RTM-ETQ-06: Bloqueio Estrito para Pedidos Cancelados (Defesa BUG #484)
* 🎯 **Objetivo:** Blindar o sistema contra a emissão indevida de etiquetas para ordens de serviço já canceladas.
* 🤖 **Equivalente Automatizado:** [`us17_5_etiquetas_identificacao_termica.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us17_5_etiquetas_identificacao_termica.cy.ts) — Cenário Bônus
* 📍 **Ponto de Partida:** Listagem de pedidos (`/pedidos`)

#### 👣 Passo a Passo de Execução:
1. Na listagem de pedidos, localize uma ordem de serviço com status **"Cancelada"** (`CANCELLED`).
2. Clique na O.S. para abrir a página de detalhes.
3. Inspecione a barra superior de ações e os badges de status.

#### ✅ Critérios de Aceitação:
- [ ] A página exibe o badge vermelho indicando status *"Cancelada"*.
- [ ] É exibido o bloco com a justificativa de cancelamento informada comercialmente.
- [ ] O botão **"Baixar Etiquetas PDF"** `[data-testid="btn-download-labels-pdf"]` **NÃO EXISTE** na tela.
- [ ] O botão **"Imprimir Etiquetas"** `[data-testid="btn-open-thermal-modal"]` **NÃO EXISTE** na tela.

---

## 4. 📊 Módulo 2: Painel Kanban de Produção (US-18)

---

### 🧪 Cenário RTM-KNB-01: Navegação via Menu Lateral e Acesso à Rota Canônica
* 🎯 **Objetivo:** Validar o atalho no menu principal e o carregamento da página de produção.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 1
* 📍 **Ponto de Partida:** Painel principal / Dashboard (`/dashboard`)

#### 👣 Passo a Passo de Execução:
1. No menu lateral esquerdo da aplicação (Sidebar), localize o item **"Produção (Kanban)"**.
2. Clique no link do menu.
3. Observe a URL no navegador e o realce visual na barra lateral.

#### ✅ Critérios de Aceitação:
- [ ] O sistema redireciona suavemente para a rota `/producao` (ou `/production/kanban`).
- [ ] O item "Produção (Kanban)" na barra lateral fica com indicador visual de aba ativa.
- [ ] A página carrega sem recarregar o navegador por completo (Single Page Application fluida).

---

### 🧪 Cenário RTM-KNB-02: Renderização do Quadro com as 3 Colunas Fabris
* 🎯 **Objetivo:** Conferir a disposição das três esteiras de fabricação e seus contadores.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 2
* 📍 **Ponto de Partida:** Página `/producao`

#### 👣 Passo a Passo de Execução:
1. Inspecione o quadro Kanban centralizado na tela.
2. Identifique as 3 colunas dispostas horizontalmente:
   * Coluna 1: **Aguardando Produção** `[data-testid="kanban-column-waiting_production"]`
   * Coluna 2: **Em Produção** `[data-testid="kanban-column-in_production"]`
   * Coluna 3: **Concluído** `[data-testid="kanban-column-completed"]`
3. Observe os badges numéricos localizados no cabeçalho de cada coluna.

#### ✅ Critérios de Aceitação:
- [ ] As 3 colunas estão visíveis simultaneamente com títulos claros e cores distintas.
- [ ] O badge no cabeçalho de cada coluna reflete a contagem exata de pedidos presentes nela.
- [ ] Se uma coluna estiver vazia, exibe mensagem amigável de estado vazio sem quebra de layout.

---

### 🧪 Cenário RTM-KNB-03: Barra Superior de Métricas Fabris e Contagem de Peças (BUG #500)
* 🎯 **Objetivo:** Validar que a métrica consolidada exibe a soma real de peças físicas e não apenas o número de linhas de pedidos.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 2 e 3
* 📍 **Ponto de Partida:** Página `/producao`

#### 👣 Passo a Passo de Execução:
1. No topo do quadro Kanban, localize a barra de métricas executivas `[data-testid="production-kanban-metrics"]`.
2. Inspecione o card com a métrica **"Em Produção"** `[data-testid="metric-in-production"]`.
3. Inspecione o card com a métrica **"Total de Peças"** `[data-testid="metric-total-pieces"]`.
4. Some manualmente a quantidade física de esquadrias dos pedidos presentes no quadro.

#### ✅ Critérios de Aceitação:
- [ ] A barra de métricas está visível com layout em cartões informativos.
- [ ] A métrica "Em Produção" indica a quantidade correta de ordens em andamento.
- [ ] A métrica "Total de Peças" exibe o somatório das quantidades unitárias de cada item (ex: `15 peças`, somando as folhas físicas e não apenas as linhas da O.S. — mitigação do BUG #500).

---

### 🧪 Cenário RTM-KNB-04: Alertas Visuais de Prazo (SLA) nos Cartões
* 🎯 **Objetivo:** Garantir que operários e encarregados identifiquem prazos críticos rapidamente por cores.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 3
* 📍 **Ponto de Partida:** Cartões de pedidos no quadro `[data-testid="order-production-card"]`

#### 👣 Passo a Passo de Execução:
1. Localize cartões com diferentes datas de entrega previstas nas colunas.
2. Inspecione as informações textuais contidas no corpo do cartão: Código da O.S., Nome do Cliente, Data Prevista e Total de Peças.
3. Observe o badge de prazo no canto do cartão.
4. Inspecione um cartão posicionado na coluna **"Concluído"**.

#### ✅ Critérios de Aceitação:
- [ ] Pedidos com prazo vencido exibem badge vermelho com o texto: **"Atrasado"**.
- [ ] Pedidos com entrega prevista para até 2 dias exibem badge amarelo/laranja com o texto: **"Crítico"** ou **"Urgente"**.
- [ ] Pedidos com prazo superior a 3 dias exibem badge neutro/verde com o texto: **"No Prazo"**.
- [ ] Pedidos finalizados na coluna "Concluído" **NÃO exibem** badge de atraso mesmo com data de entrega vencida (mitigação do BUG #501).

---

### 🧪 Cenário RTM-KNB-05: Filtragem em Tempo Real por Busca Textual e SLA
* 🎯 **Objetivo:** Validar a filtragem instantânea sem recarregamento de página.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 4
* 📍 **Ponto de Partida:** Barra de filtros na página `/producao`

#### 👣 Passo a Passo de Execução:
1. No campo de busca textual `[data-testid="input-search-kanban"]`, digite o código de um pedido (ex: `OS-2026-0002`).
2. Observe o quadro e o contador de resultados `[data-testid="filter-counter-badge"]`.
3. Clique no botão 'X' de limpar busca `[data-testid="btn-clear-search-text"]`.
4. No seletor de prazo `[data-testid="select-filter-deadline"]`, selecione a opção **"Apenas Atrasados"** (`LATE`).
5. Observe os cartões exibidos no quadro.
6. Clique no botão **"Limpar Filtros"** `[data-testid="btn-clear-all-filters"]`.

#### ✅ Critérios de Aceitação:
- [ ] A busca filtra os cartões instantaneamente enquanto você digita, sem recarregar a tela.
- [ ] O contador informa a quantidade de itens encontrados (ex: `1 de 3 pedidos exibidos`).
- [ ] O botão 'X' limpa a digitação e restaura a lista.
- [ ] O filtro "Atrasados" oculta imediatamente todos os pedidos dentro do prazo.
- [ ] O botão "Limpar Filtros" reseta tanto o campo de texto quanto o seletor de prazo em um único clique.

---

### 🧪 Cenário RTM-KNB-06: Transição de Etapa via Drag-and-Drop e Botão Rápido
* 🎯 **Objetivo:** Validar a máquina de estados linear fabril (`WAITING_PRODUCTION` ➔ `IN_PRODUCTION` ➔ `COMPLETED`).
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 5
* 📍 **Ponto de Partida:** Coluna "Aguardando Produção"

#### 👣 Passo a Passo de Execução:
1. Clique com o botão esquerdo e segure sobre um cartão na coluna **"Aguardando Produção"**.
2. Arraste o cartão até a coluna **"Em Produção"** e solte o clique.
3. Observe a animação visual e a notificação de confirmação.
4. No mesmo cartão agora em "Em Produção", localize o botão no rodapé: **"Concluir Produção"**.
5. Clique no botão "Concluir Produção".
6. Observe para qual coluna o cartão é movido.
7. Tente clicar e arrastar um cartão dentro da mesma coluna sem soltá-lo em outra.

#### ✅ Critérios de Aceitação:
- [ ] Ao arrastar, o cartão move-se com resposta visual imediata (atualização otimista).
- [ ] Surge um toast verde confirmando a atualização de status com sucesso.
- [ ] Ao clicar em "Concluir Produção", o cartão avança automaticamente para "Concluído".
- [ ] A data de conclusão é gravada no banco com o timezone oficial de Brasília (`America/Sao_Paulo`).
- [ ] Soltar o cartão na mesma coluna de origem não dispara requisição desnecessária (mitigação do BUG #498).

---

### 🧪 Cenário RTM-KNB-07: Resiliência e Rollback Otimista em Caso de Falha de Rede
* 🎯 **Objetivo:** Comprovar que falhas de conexão não deixam a interface dessincronizada com o banco.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 6
* 📍 **Ponto de Partida:** Página `/producao` com DevTools aberto

#### 👣 Passo a Passo de Execução:
1. Pressione `F12` no teclado para abrir as Ferramentas de Desenvolvedor (DevTools).
2. Acesse a aba **Network** (Rede) e altere a velocidade de conexão para **Offline**.
3. Tente arrastar um cartão de "Aguardando Produção" para "Em Produção".
4. Observe atentamente a reação do cartão e das mensagens na tela.
5. Volte à aba Network e desmarque o modo Offline.

#### ✅ Critérios de Aceitação:
- [ ] Ao soltar o cartão com a rede desativada, a interface tenta mover o card.
- [ ] Ao falhar a requisição, é exibido um toast vermelho de erro: *"Erro ao atualizar status de produção"*.
- [ ] **Rollback Automático:** O cartão retorna sozinho para a coluna original ("Aguardando Produção"), sem ficar preso na coluna destino.
- [ ] Ao recarregar a tela após restaurar a rede, o estado do banco permanece íntegro.

---

### 🧪 Cenário RTM-KNB-08: Ações da Página: Impressão PCP e Atalho de Nova O.S.
* 🎯 **Objetivo:** Validar os atalhos operacionais de apoio ao gestor de produção.
* 🤖 **Equivalente Automatizado:** [`us18_painel_kanban_producao.cy.ts`](file:///c:/Users/italo/Desktop/Projects/alumigest/frontend/cypress/e2e/orders/us18_painel_kanban_producao.cy.ts) — Cenário 7
* 📍 **Ponto de Partida:** Canto superior direito da página `/producao`

#### 👣 Passo a Passo de Execução:
1. No canto superior direito, clique no botão **"Imprimir Quadro (PCP)"** `[data-testid="btn-print-kanban"]`.
2. Observe a janela de impressão aberta pelo navegador.
3. Feche a tela de impressão.
4. Clique no botão **"Nova Ordem de Serviço"** `[data-testid="btn-new-order"]`.

#### ✅ Critérios de Aceitação:
- [ ] O comando de impressão abre a caixa de diálogo nativa do navegador formatada para modo paisagem (landscape).
- [ ] O cabeçalho da página e os menus laterais são ocultados na impressão para economizar tinta e papel.
- [ ] O botão "Nova Ordem de Serviço" redireciona o usuário para o fluxo de pedidos/orçamentos.

---

## 5. 🛡️ Matriz Defensiva de Não-Regressão de Bugs

Durante a execução deste roteiro, certifique-se de que os seguintes defeitos históricos corrigidos na Sprint 07 permanecem blindados:

| Defeito / Issue | Comportamento que NÃO deve ocorrer | Cenário de Validação |
|:---:|:---|:---:|
| **BUG #484** | Ordem de serviço cancelada conseguir emitir etiquetas térmicas. | Validado em `RTM-ETQ-06` |
| **BUG #485** | Download de etiquetas falhar silenciosamente ou corromper resposta em Blob. | Validado em `RTM-ETQ-04` e `RTM-ETQ-05` |
| **BUG #487** | Filtro de peças do modal ser ignorado durante o download do arquivo PDF. | Validado em `RTM-ETQ-03` |
| **BUG #498** | Arrastar um card e soltar na mesma coluna disparar erro HTTP 422. | Validado em `RTM-KNB-06` |
| **BUG #500** | Métrica de peças somar apenas linhas de itens em vez das quantidades físicas. | Validado em `RTM-KNB-03` |
| **BUG #501** | Pedidos na coluna "Concluído" exibirem badge vermelho de atrasado. | Validado em `RTM-KNB-04` |
| **Issue #524** | *Apontamento do PO:* Item duplicado do Kanban na barra lateral. | Em observação para Sprint 08 |
| **Issue #525** | *Apontamento do PO:* Colunas com muitos pedidos sem rolagem vertical. | Em observação para Sprint 08 |

---

## 6. 📝 Folha de Homologação Formal da Release 2

Preencha os campos abaixo após concluir todos os passos deste roteiro:

* **Data da Homologação:** 26/10/2026
* **Ambiente Testado:** `http://localhost:5173` (Local DEV) / `develop.italuhub.cloud` (Staging)
* **Homologador Responsável:** Jose Guylherme (Product Owner)
* **Total de Cenários Executados:** 14 cenários (6 de Etiquetas + 8 de Kanban)
* **Taxa de Aprovação:** **100% de Aprovação** nos fluxos operacionais
* **Parecer do Product Owner:**
  > "O fluxo operacional de emissão de etiquetas térmicas e o painel Kanban de produção atendem plenamente às necessidades da vidraçaria e oficina de esquadrias. Os defeitos de usabilidade secundários (#524 e #525) foram registrados e estão programados para o início da Sprint 08. Incremento apto para entrega e deploy."

---

*AlumiGest — Documento de Governança Docs-as-Code homologado pela Equipe de QA e Tech Lead — 28/10/2026*
