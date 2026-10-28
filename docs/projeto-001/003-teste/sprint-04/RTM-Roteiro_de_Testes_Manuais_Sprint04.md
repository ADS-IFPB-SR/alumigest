# 📋 RTM — Roteiro de Testes Manuais — Sprint 04

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 04 — Refatoração de Templates (US-05), Orçamentos V2 (US-46), Descontos (US-09) e SonarQube |
| **Documento Equivalente BDD** | [`TEA-Testes_de_Aceitacao_Sprint04.md`](./TEA-Testes_de_Aceitacao_Sprint04.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint04.md`](./RET-Relatorio_Execucao_Testes_Sprint04.md) |
| **Perfil Executor** | Product Owner (PO), Analista de QA e Homologadores de Negócio |
| **Ambiente de Teste** | Homologação Local (`http://localhost:5173`) |
| **Data de Emissão** | 14/09/2026 |

---

## 1. Instruções para os Homologadores

Este roteiro guia a validação manual dos avanços técnicos e de negócio da Sprint 04, permitindo conferir a geração de orçamentos com múltiplos itens inclusos sem perda de dados (Budget V2), a parametrização vetorial do Studio CAD e as travas de descontos comerciais.

### Pré-requisitos de Ambiente:
1. Backend ativo: `mvn spring-boot:run` (PostgreSQL na porta 5432)
2. Frontend ativo: `npm run dev`
3. Acesso à aplicação via navegador moderno com DevTools (F12) habilitado

---

## 2. Fichas Operacionais de Execução Manual

### 🧪 Cenário RTM-S04-01: Configuração Paramétrica de Esquadria no Studio CAD e Alerta de Vão Mínimo

* **Objetivo:** Validar a renderização vetorial no Studio CAD para os 10 modelos canônicos e comprovar o bloqueio visual quando medidas de vão forem $< 400\text{ mm}$.
* **Equivalente Automatizado:** `WindowSvgPreview.test.tsx` / `TemplateValidator.test.ts`
* **Ponto de Partida:** Rota `/produtos/novo`

#### 👣 Passos de Execução:
1. **Acessar o Studio CAD:** Navegar até `http://localhost:5173/produtos/novo`.
2. **Selecionar Tipologia Canônica:** No carrossel de modelos, escolher `Janela 4 Folhas (2 Móveis / 2 Fixas)`.
3. **Informar Medidas Válidas:**
   * Largura ($W$): Digitar `2000` (mm)
   * Altura ($H$): Digitar `1200` (mm)
4. **Verificar Renderização:** Constatar que o painel exibe o desenho SVG com as 4 folhas proporcionais, setas indicando o sentido de deslizamento das folhas centrais e cotas milimétricas em ambos os eixos.
5. **Testar Alerta de Vão Físico Subdimensionado:**
   * Reduzir a largura para `350` (mm) e a altura para `300` (mm).
6. **Inspecionar Feedback Visual:** Verificar se a moldura do SVG assume coloração de alerta âmbar/vermelha e se o banner de aviso surge: `"Dimensão inferior ao vão mínimo construtivo (400 mm)"`.

#### ✅ Critérios de Aceitação:
- [ ] O componente não distorce proporções ao alternar entre modelos canônicos (Maxim-ar, Portas de Correr, Pivotante).
- [ ] O botão de salvar ou prosseguir é desabilitado enquanto o vão estiver em estado crítico de subdimensionamento.
- [ ] O seletor `CategoryRequirementsSelector` lista apenas os grupos de materiais compatíveis com a tipologia 4 Folhas.

---

### 🧪 Cenário RTM-S04-02: Criação de Orçamento Multi-Itens Budget V2 sem Descarte Atômico

* **Objetivo:** Comprovar a eliminação definitiva do BUG-022 (Issue #300), garantindo que orçamentos com 4 ou mais itens distintos sejam persistidos integralmente em transação única.
* **Equivalente Automatizado:** `BudgetIntegrationTest` (Issue #172)
* **Ponto de Partida:** Rota `/orcamentos/novo`

#### 👣 Passos de Execução:
1. **Iniciar Novo Orçamento:** Acessar a tela `/orcamentos/novo`.
2. **Selecionar Cliente:** Escolher um cliente ativo na lista suspensa.
3. **Adicionar 4 Itens Consecutivos:**
   * **Item 1:** Janela 2F Correr ($1200 \times 1000\text{ mm}$) com Vidro Canelado 4mm.
   * **Item 2:** Janela 4F Correr ($2000 \times 1200\text{ mm}$) com Vidro Fumê 6mm.
   * **Item 3:** Porta de Abrir 1F ($800 \times 2100\text{ mm}$) com Alumínio Linha Suprema.
   * **Item 4:** Janela Maxim-Ar ($600 \times 600\text{ mm}$) com Braço de Alumínio.
4. **Conferir Lista de Itens no Grid:** Verificar se os 4 cards de itens estão visíveis com seus subtotais parciais somados no rodapé.
5. **Disparar Salvamento Atômico:** Clicar no botão `[data-testid="btn-salvar-orcamento"]`.
6. **Validar Resposta:** Observar a notificação de sucesso e redirecionamento para a tela de visualização do orçamento.
7. **Inspecionar Persistência:** Confirmar na tela de detalhes que os 4 itens permanecem listados, sem qualquer descarte ou perda de atributos.

#### ✅ Critérios de Aceitação:
- [ ] A chamada REST envia o payload único `BudgetCreateRequest` com o array `items` contendo 4 objetos.
- [ ] Nenhum item é descartado silenciosamente durante a transação backend.
- [ ] O subtotal bruto corresponde com exatidão à soma dos 4 itens.

---

### 🧪 Cenário RTM-S04-03: Aplicação e Travas de Descontos Comerciais (% e R$) e Taxas

* **Objetivo:** Validar o cálculo de descontos determinísticos, travas de segurança contra descontos abusivos e adição de taxas de frete/instalação.
* **Equivalente Automatizado:** `PricingCalculatorTest` / `BudgetPricingServiceTest`
* **Ponto de Partida:** Rota `/orcamentos/novo` ou edição de orçamento existente

#### 👣 Passos de Execução:
1. **Abrir Resumo Financeiro:** Em um orçamento com subtotal de R$ 3.000,00, localizar a seção "Condições Comerciais e Descontos".
2. **Testar Desconto Percentual:**
   * Selecionar modalidade `%`.
   * Informar `10` no campo de desconto.
   * Constatar que o valor de desconto exibe R$ 300,00 e o subtotal líquido ajusta para R$ 2.700,00.
3. **Testar Trava de Desconto Abusivo:**
   * Informar `110%` no campo de desconto.
   * Constatar que o sistema bloqueia a entrada ou exibe mensagem em vermelho: `"Desconto não pode exceder 100%"`.
4. **Adicionar Taxas Complementares:**
   * Campo Frete: Informar `R$ 120,00`
   * Campo Instalação: Informar `R$ 250,00`
5. **Validar Total Geral:** Confirmar que o total final computa: $\text{R\$} 2.700,00 + \text{R\$} 120,00 + \text{R\$} 250,00 = \text{R\$} 3.070,00$.

#### ✅ Critérios de Aceitação:
- [ ] Todas as operações utilizam precisão de duas casas decimais com arredondamento `HALF_EVEN`.
- [ ] O valor total líquido não permite resultado financeiro negativo.

---

## 3. Matriz Defensiva de Defeitos e Comportamentos Anômalos (RBD Sprint 04)

| Sintoma Observado | Causa Mais Provável | Ação de Contingência / Diagnóstico |
|---|---|---|
| Itens do orçamento somem após clicar em Salvar | Regressão da entidade com perda de cascata (`BUG-022`) | Verifique se a branch possui o merge da Issue #172 (Budget V2 com `@OneToMany(cascade = CascadeType.ALL)`). |
| Total geral do orçamento exibe dízima periódica (ex: R$ 3070.000000001) | Variável monetária operada como primitive `float/double` | Inspecione o `PricingCalculator`; todas as grandezas financeiras devem ser encapsuladas em `BigDecimal`. |
| Alerta de vão mínimo não some após corrigir medidas | Estado reativo do React Hook Form preso em cache | Pressione a tecla `Tab` para disparar o evento `onBlur` do campo de medida ou use `F5`. |
| Erro `422 Unprocessable` ao salvar orçamento com desconto | Desconto em moeda maior que o subtotal dos materiais | Reduza o valor do desconto para que seja rigorosamente menor ou igual ao subtotal bruto. |
