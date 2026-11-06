# Matriz de Casos de Teste e Roteiro de Regressão — US-47: Central 360° do Cliente

- **User Story:** [US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas #496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
- **Task de Testes:** US-47.5
- **Módulo:** Comercial / Clientes / PCP (`frontend/src/features/customers` & `backend/src/main/java/br/edu/ifpb/alumigest`)
- **Responsáveis:** Equipe de Qualidade e Desenvolvimento (AlumiGest)
- **Versão:** 1.0.0
- **Data:** Novembro/2026

---

## 1. 🎯 Objetivo

Garantir que a Central 360° do Cliente opere de forma estável, fluida e integrada, validando o layout Master-Detail, a sincronização instantânea de propostas e Ordens de Serviço (O.S.), o detalhamento de esquadrias físicas com medidas nominais em milímetros ($L \times A$ mm), e os fluxos de impressão de Ficha Técnica de Produção (A4) e Etiquetas Térmicas (Elgin L42).

---

## 2. 📋 Regras de Negócio Validadas

- **RN-01 (Segregação de Responsabilidades):** O frontend atua exclusivamente como camada de renderização reativa. Cálculos de listas de corte de perfis, deduções industriais de folgas de vidros e regras de transição de status residem no backend via DTOs CQRS.
- **RN-02 (Projeções Otimizadas CQRS):** O Hub consome endpoints leves de projeção (`ClientDashboardDto`, `OrderResponseDto`, `ClientBudgetSummaryDto`), eliminando consultas pesadas com *N+1* no banco.
- **RN-03 (Imutabilidade da Ficha Técnica):** A Ficha Técnica reflete os parâmetros congelados da O.S. no momento de sua aprovação, impedindo alterações acidentais no chão de fábrica.
- **RN-04 (Design System e Tokens M3):** Aderência integral aos tokens semânticos (`bg-surface-container-lowest`, `text-on-surface`, `border-outline-variant`), garantindo compatibilidade nativa com modo claro e escuro.

---

## 3. 🧪 Matriz Detalhada de Casos de Teste

| ID | Cenário / Regra | Tipo | Pré-condição | Passos de Execução | Dados de Entrada | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-47-HP01** | Seleção de Cliente e Carregamento do Hub | Caminho Feliz | Clientes cadastrados no banco | 1. Acessar `/clientes`<br>2. Digitar nome do cliente na busca da sidebar<br>3. Clicar no cartão do cliente | Termo: nome ou CPF/CNPJ | - Cliente recebe destaque visual ativo na sidebar.<br>- Hero Card exibe dados cadastrais e botões rápidos (WhatsApp, Novo Orçamento).<br>- 3 KPIs numéricos carregados: *Total Contratado*, *Qtd O.S.* e *Qtd Orçamentos*. |
| **TC-47-HP02** | Visualização e Ações de Orçamentos | Caminho Feliz | Cliente possui propostas vinculadas | 1. Selecionar cliente<br>2. Clicar na aba "Orçamentos" | Aba Orçamentos ativa | - Tabela renderiza código, data, validade, valor e status comercial.<br>- Botão "Proposta PDF" dispara download.<br>- Botão "WhatsApp" abre link com mensagem pré-formatada. |
| **TC-47-HP03** | Tabela de O.S. Sem Compressão Visual | Caminho Feliz | Cliente possui ordens de serviço | 1. Selecionar cliente<br>2. Clicar na aba "Ordens de Serviço (O.S.)" | Resoluções 1366x768 e 1920x1080 | - Colunas padronizadas (`Nº O.S.`, `Orçamento`, `Cliente`, `Aprovação`, `Entrega`, `Canal`, `Valor Total`, `Status`, `Ações`).<br>- Sem quebra ou sobreposição de texto. |
| **TC-47-HP04** | Detalhamento de Esquadrias e Medidas em mm | Caminho Feliz | Cliente com O.S. e esquadrias cadastradas | 1. Clicar sobre a linha de uma O.S. na tabela | Clique na linha da O.S. | - Cartão inferior é carregado exibindo cada peça física.<br>- Mostra título, acabamento de cor, especificação do vidro e medidas nominais formatadas (ex.: `📐 350 x 1470 mm`).<br>- Exibe botões "📋 Ficha Técnica" e "🏷️ Etiquetas". |
| **TC-47-HP05** | Emissão da Ficha Técnica A4 com Lista de Corte | Caminho Feliz | O.S. selecionada com esquadrias | 1. Clicar em "📋 Ficha Técnica" no cartão de esquadrias | Clique em Ficha Técnica | - Modal A4 abre com pré-visualização.<br>- Exibe plano de corte de perfis com ângulos ($45^\circ/90^\circ$).<br>- Lista de vidros com folgas industriais deduzidas e acessórios.<br>- Ação de impressão/download PDF funcional. |
| **TC-47-HP06** | Impressão de Etiquetas Térmicas (100x60mm) | Caminho Feliz | O.S. selecionada com esquadrias | 1. Clicar em "🏷️ Etiquetas" no cabeçalho do cartão | Clique em Etiquetas | - Janela renderiza etiquetas térmicas no formato $100 \times 60\text{ mm}$.<br>- Contém dados do cliente, código da ordem e medidas nominais individuais.<br>- Permite disparar para a Elgin L42. |
| **TC-47-HP07** | Novo Orçamento com Cliente Pré-selecionado | Caminho Feliz | Cliente selecionado no Hub | 1. Clicar no botão "+ Novo Orçamento" no Hero Card | Clique no botão | - Redireciona para `/orcamentos` com o ID/nome do cliente já preenchido e travado para edição acidental. |
| **TC-47-SP01** | Cliente sem Movimentação Comercial | Caminho Triste / Empty State | Cliente recém-cadastrado sem O.S. ou propostas | 1. Selecionar o cliente na sidebar | Cliente sem dados | - KPIs exibem `R$ 0,00`, `0 O.S.` e `0 Propostas`.<br>- Abas de O.S. e Orçamentos exibem empty state amigável.<br>- Nenhum crash de tela ou erro de console `undefined`. |
| **TC-47-SP02** | Falha de Conexão com a API (Erro 500/Rede) | Caminho Triste | Falha simulada no backend | 1. Tentar carregar dashboard do cliente com API indisponível | Falha de rede | - Exibe card de feedback de erro com botão "Tentar novamente".<br>- Não quebra a lista lateral de clientes. |
| **TC-47-SP03** | Busca sem Resultados na Barra Lateral | Caminho Triste | Sidebar de clientes aberta | 1. Digitar sequência inexistente (ex: `xyz999nonexistent`) | Busca inexistente | - Lista lateral exibe "Nenhum cliente encontrado".<br>- Botão rápido para limpar o campo de busca. |
| **TC-47-EC01** | O.S. com Múltiplas Peças e Rolagem Suave | Caso de Borda | O.S. com mais de 8 peças físicas | 1. Clicar em O.S. com grande volume de esquadrias | O.S. com 10+ peças | - Container de esquadrias ativa rolagem vertical interna.<br>- Header e botões de ação do cartão permanecem visíveis. |
| **TC-47-EC02** | Consistência Visual em Modo Escuro | Caso de Borda | Dark mode ativado no Topbar | 1. Alternar para modo noturno e navegar no Hub 360 | Tema escuro ativo | - Fundo harmonizado com tokens semânticos.<br>- Textos e badges com contraste adequado (WCAG AA).<br>- Ausência de flashes brancos. |

---

## 4. 🤖 Roteiro de Automação no Cypress

A suíte automatizada deve residir em:
`frontend/cypress/e2e/customers/us47_hub_360_cliente.cy.ts`

### Estrutura dos Testes:
```typescript
describe('US-47: Central 360° do Cliente (Suíte E2E)', () => {
  beforeEach(() => {
    cy.viewport(1366, 768);
    // Intercepts de clientes, dashboard, orçamentos e ordens de serviço
  });

  it('TC-47-HP01: Deve carregar a lista de clientes, permitir busca e selecionar cliente', () => { ... });
  it('TC-47-HP02: Deve exibir propostas na aba Orçamentos e acionar download de PDF', () => { ... });
  it('TC-47-HP03 & HP04: Deve listar O.S. e expandir cartão de esquadrias com medidas nominais', () => { ... });
  it('TC-47-HP05: Deve abrir modal de Ficha Técnica A4 de corte', () => { ... });
  it('TC-47-HP06: Deve renderizar modal de Etiquetas Térmicas 100x60mm', () => { ... });
  it('TC-47-HP07: Deve navegar para novo orçamento com cliente fixado', () => { ... });
  it('TC-47-SP01: Deve exibir empty states elegantes para clientes sem histórico', () => { ... });
});
```

---

## 5. 🔍 Roteiro para Teste Manual de Regressão

1. **Acesso:** Acesse a rota `/clientes` no AlumiGest.
2. **Seleção:** Clique no primeiro cliente da lista. Verifique se o Hero Card carrega nome, telefone e os 3 indicadores.
3. **Abas:** Alterne entre "Orçamentos" e "Ordens de Serviço". Verifique se a tabela responde sem lentidão.
4. **Inspeção de Esquadria:** Na aba de O.S., clique em uma linha. Veja se o cartão logo abaixo abre com a lista de esquadrias e as medidas em milímetros (`📐 L x A mm`).
5. **Ficha Técnica & Etiquetas:** Clique em "Ficha Técnica" e confira se a folha A4 abre com perfis e ângulos. Em seguida, feche e clique em "Etiquetas" para conferir o formato $100 \times 60\text{ mm}$.
