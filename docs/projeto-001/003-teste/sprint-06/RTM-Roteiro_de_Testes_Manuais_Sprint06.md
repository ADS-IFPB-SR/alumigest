# 📋 RTM — Roteiro de Testes Manuais — Sprint 06

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 06 — Ordens de Serviço (O.S.) / Pedidos de Venda, Lock de Preços e Comprovante Oficial (Release 2) |
| **Documento Equivalente BDD** | [`TEA-Testes_de_Aceitacao_Sprint06.md`](./TEA-Testes_de_Aceitacao_Sprint06.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint06.md`](./RET-Relatorio_Execucao_Testes_Sprint06.md) |
| **Perfil Executor** | Product Owner (PO), Analista de QA e Homologadores de Negócio |
| **Ambiente de Teste** | Homologação Local (`http://localhost:5173`) |
| **Data de Emissão** | 14/10/2026 |

---

## 1. Instruções para os Homologadores

Este roteiro guia a validação operacional manual das funcionalidades da **Release 2 (Gestão Fabril & Pedidos de Venda)** do AlumiGest, permitindo conferir a conversão atômica de orçamentos em ordens de serviço, a imutabilidade dos preços e medidas (*Lock de Preços*), o cancelamento controlado e a emissão do comprovante oficial de venda em PDF.

### Pré-requisitos de Ambiente:
1. Backend ativo: `mvn spring-boot:run` (PostgreSQL na porta 5432)
2. Frontend ativo: `npm run dev` (porta 5173)
3. Ao menos um orçamento no status `SENT` ou `APPROVED` disponível para teste

---

## 2. Fichas Operacionais de Execução Manual

### 🧪 Cenário RTM-S06-01: Conversão de Orçamento em Ordem de Serviço com Canal e Prazo

* **Objetivo:** Validar a conversão atômica do orçamento aprovado em pedido de venda, conferindo a geração do código sequencial anual, o canal de aprovação e o cálculo da data sugerida (+15 dias).
* **Equivalente Automatizado:** `cypress/e2e/orders/us13_conversao_ordem_servico_real.cy.ts`
* **Ponto de Partida:** Rota `/orcamentos/:id` (proposta no status `SENT` ou `APPROVED`)

#### 👣 Passos de Execução:
1. **Acessar o Orçamento:** Navegar até a página de detalhes de um orçamento elegível (ex: `/orcamentos/orc-001`).
2. **Abrir Modal de Conversão:** Clicar no botão `[data-testid="btn-approve-budget"]` ("Aprovar e Converter em Pedido").
3. **Inspecionar o Modal de Aprovação:**
   * Confirmar a exibição do modal `[data-testid="order-approval-modal"]`.
   * Verificar se o campo `[data-testid="input-data-entrega"]` vem pré-preenchido com a data exata de **hoje + 15 dias corridos** e exibe o badge `"Sugerido: +15 dias corridos"`.
4. **Selecionar Canal de Aprovação:** Escolher a opção `WHATSAPP` no seletor de canal.
5. **Preencher Observações:**
   * Campo `[data-testid="input-observacoes"]`: Digitar `Cliente confirmou sinal via PIX e aprovou o início da produção.`
6. **Confirmar Conversão:** Clicar no botão `[data-testid="btn-confirm-approval"]`.
7. **Validar Redirecionamento:** Confirmar que o sistema redireciona automaticamente para a tela da nova Ordem de Serviço (`/ordens-servico/ord-...` ou `/pedidos/...`).
8. **Conferir Dados do Pedido:** Constatar que o status exibido é `CRIADO (CREATED)`, o código segue o padrão anual `OS-YYYY-NNNN` (ex: `OS-2026-0001`) e o valor total bate com o orçamento.

#### ✅ Critérios de Aceitação:
- [ ] O orçamento de origem tem seu status atualizado para aprovado/convertido.
- [ ] Tentativa de converter novamente o mesmo orçamento retorna erro amigável bloqueando duplicidade (HTTP 409).
- [ ] A data sugerida pode ser alterada manualmente pelo vendedor antes da confirmação.

---

### 🧪 Cenário RTM-S06-02: Blindagem Jurídica de Preços e Imutabilidade (*Lock de Preços*)

* **Objetivo:** Comprovar a clonagem profunda (*deep copy*) garantindo que alterações posteriores nos preços de insumos do catálogo não afetem pedidos já formalizados.
* **Equivalente Automatizado:** `cypress/e2e/orders/us14_3_blindagem_reajuste_catalogo.cy.ts`
* **Ponto de Partida:** Ordem de Serviço recém-criada e tela de Catálogo

#### 👣 Passos de Execução:
1. **Anotar Valores da Ordem de Serviço:** Na tela da O.S. criada no cenário anterior, anotar o valor unitário e total da esquadria (ex: Janela 2F por R$ 1.850,00).
2. **Navegar até o Catálogo de Materiais:** Abrir a rota `/` (ou aba Catálogo).
3. **Simular Inflação / Reajuste de Preço:**
   * Localizar o vidro utilizado na esquadria (ex: Vidro Canelado 4mm) e alterar seu preço de venda de R$ 110,00/m² para R$ 250,00/m².
   * Localizar o perfil de alumínio utilizado e elevar seu preço em +50%.
4. **Retornar à Ordem de Serviço:** Navegar de volta até `/ordens-servico/:id`.
5. **Conferência Rigorosa dos Valores:**
   * Inspecionar o card da esquadria (`[data-testid="order-item-list"]`).
   * Inspecionar o card financeiro (`[data-testid="order-financial-summary"]`).

#### ✅ Critérios de Aceitação:
- [ ] O valor unitário, subtotal e total geral da Ordem de Serviço permanecem **100% inalterados** (ex: R$ 1.850,00).
- [ ] Todas as opções salvas (cor do perfil, espessura do vidro e modelo do puxador) são mantidas fielmente a partir do snapshot.

---

### 🧪 Cenário RTM-S06-03: Cancelamento de Pedido com Justificativa Obrigatória ($\ge 10$ caracteres)

* **Objetivo:** Validar a barreira de cancelamento auditável e o bloqueio de cancelamento quando o pedido já estiver em esteira fabril.
* **Equivalente Automatizado:** `CancelOrderModal.test.tsx` / `OrderServiceTest`
* **Ponto de Partida:** Rota `/ordens-servico/:id` (pedido com status `CREATED`)

#### 👣 Passos de Execução:
1. **Localizar Ação de Cancelamento:** Na tela do pedido, clicar no botão `[data-testid="btn-cancel-order"]` ("Cancelar Pedido").
2. **Inspecionar Modal de Cancelamento:** Confirmar que surge o modal defensivo `[data-testid="cancel-order-modal"]`.
3. **Testar Bloqueio com Texto Curto:**
   * Campo `[data-testid="input-cancellation-reason"]`: Digitar apenas `Desistiu`.
   * Observar que o botão de confirmar permanece desabilitado e um aviso informa: `"A justificativa deve conter no mínimo 10 caracteres"`.
4. **Informar Justificativa Válida:**
   * Digitar: `Cliente solicitou o cancelamento devido a atraso na obra civil.`
5. **Confirmar Cancelamento:** Clicar no botão `[data-testid="btn-confirm-cancellation"]`.
6. **Validar Resposta:** Observar que o modal fecha, o badge do pedido muda para vermelho `CANCELADO (CANCELLED)` e um alerta informativo exibe a justificativa registrada.

#### ✅ Critérios de Aceitação:
- [ ] Pedidos com status `IN_PRODUCTION` (Em Produção) ou `COMPLETED` (Concluído) ocultam ou desabilitam o botão de cancelamento.
- [ ] O orçamento vinculado ao pedido cancelado é reaberto para edição ou marcado como disponível conforme a regra `US-15.2`.

---

### 🧪 Cenário RTM-S06-04: Emissão e Validação do Comprovante de Venda Oficial em PDF

* **Objetivo:** Validar o layout formal A4 do comprovante de venda para o cliente com cabeçalho institucional, discriminação de itens e rodapé.
* **Equivalente Automatizado:** `cypress/e2e/orders/us16_4_homologacao_quickstart.cy.ts`
* **Ponto de Partida:** Rota `/ordens-servico/:id`

#### 👣 Passos de Execução:
1. **Acionar Impressão / PDF:** Clicar no botão `[data-testid="btn-download-order-pdf"]` ("Comprovante Oficial").
2. **Aguardar Download:** Confirmar que o arquivo é baixado com o nome padrão `PED-YYYY-NNNN.pdf` (ou `OS-YYYY-NNNN.pdf`).
3. **Abrir Documento:** Abrir o PDF gerado no leitor.
4. **Validar Estrutura Institucional:**
   * Cabeçalho: Logotipo da vidraçaria, CNPJ, Razão Social, Telefone e E-mail.
   * Bloco do Cliente: Nome completo, CPF/CNPJ, endereço da obra e telefone.
   * Tabela de Itens (BUG-027): Conferir a numeração ordinal `# 1`, `# 2` (sem duplicidades do índice 1) e descrição das medidas e acabamentos.
   * Condição de Pagamento e Assinatura: Espaço dedicado para assinatura do cliente e do responsável comercial.

#### ✅ Critérios de Aceitação:
- [ ] O documento não apresenta quebras de página anômalas ou sobreposição de textos.
- [ ] A paginação exibe `Página X de Y` corretamente em todas as folhas.

---

## 3. Matriz Defensiva de Defeitos e Comportamentos Anômalos (RBD Sprint 06)

| Sintoma Observado | Causa Mais Provável | Ação de Contingência / Diagnóstico |
|---|---|---|
| Descrição de película sobrepõe o tipo de vidro (`BUG-024`) | Extrator do snapshot concatenava categorias sem filtro estrito | Resolvido no commit `c871c5e` com extração em duas passagens. |
| Puxador não é gravado no pedido (`BUG-025`) | Incompatibilidade de chave no DTO (`model` vs `handleType`) | Resolvido no commit `ccc44e5` com suporte a ambas as chaves. |
| Sentido de abertura da esquadria invertido após conversão (`BUG-026`) | Precedência invertida de `options` em relação a `item.templateConfig` | Resolvido no commit `4e4788c` mantendo a configuração do orçamento. |
| Índice `# 1` repete para todos os itens da O.S. (`BUG-027`) | Avaliação de base 0 no map do React (`index + 1`) com tipagem falha | Resolvido no commit `c3b47e0` com indexação sequencial correta. |
| Erro `409 Conflict` ao aprovar orçamento | Orçamento já foi convertido anteriormente por outro usuário | O pedido já existe; consulte a listagem em `/ordens-servico`. |
