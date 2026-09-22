# [BUG #300] Itens do orçamento são descartados ao criar orçamento via POST /api/orcamentos (BudgetCreateRequest sem campo items)

- **Issue GitHub**: [#300](https://github.com/ADS-IFPB-SR/alumigest/issues/300)
- **Status**: Aberto
- **Labels**: `bug`, `backend`, `fix`
- **Severidade**: Alta (Perda de dados ao submeter formulário)

---

## 📌 Descrição do Problema
Ao criar um novo orçamento através do formulário no Frontend (`/budgets/new`), o usuário seleciona o cliente e adiciona as esquadrias/itens desejados. Ao submeter o formulário, o Frontend envia um payload contendo o array de itens (`items: [...]`) para o endpoint `POST /api/orcamentos`.

No entanto, o backend utiliza o record `BudgetCreateRequest`, que foi implementado na US-09.12 contendo apenas os campos `clientId` e `observacoes`. Por não possuir a propriedade `items`, o Jackson desserializa o corpo da requisição **descartando silenciosamente toda a lista de itens**.

Como consequência, o orçamento é persistido no banco com **0 itens e R$ 0,00 de subtotal**, gerando orçamentos vazios.

---

## 🔁 Passos para Reproduzir
1. Acessar o frontend na rota `/budgets/new` (ou criar orçamento).
2. Selecionar um cliente válido.
3. Adicionar uma ou mais esquadrias com medidas e componentes à lista de itens.
4. Clicar em **"Salvar Orçamento"**.
5. Verificar a requisição de rede: o payload enviado pelo frontend contém `items: [{ productId: ..., widthMm: ..., ... }]`.
6. O backend retorna HTTP 201 Created.
7. Ao abrir os detalhes do orçamento recém-criado, a lista de itens está **vazia** e o valor total está **R$ 0,00**.

---

## 🎯 Comportamento Esperado
- O endpoint `POST /api/orcamentos` (ou `/api/budgets`) deve aceitar opcionalmente uma lista de itens (`items`).
- Ao receber itens na criação, o backend deve instanciá-los, vinculá-los ao orçamento e disparar os serviços de cálculo de quantidades (`BudgetQuantityService`) e precificação (`BudgetPricingService`), persistindo o orçamento já com seus itens e totais calculados.
- Deve continuar suportando a criação sem itens (rascunho vazio para adição incremental posterior).

---

## 🔬 Causa Raiz Técnica
1. **`BudgetCreateRequest.java`**:
   ```java
   public record BudgetCreateRequest(
       @NotNull(message = "ID do cliente é obrigatório")
       UUID clientId,
       String observacoes
   ) {}
   ```
2. **`BudgetController.java`**:
   ```java
   @PostMapping
   public ResponseEntity<BudgetResponseDTO> create(@RequestBody @Valid BudgetCreateRequest request) {
       BudgetResponseDTO response = budgetService.create(request);
       ...
   }
   ```
3. **`BudgetService.java`**: O método `create` não possui lógica para processar nem persistir itens, apenas vincula o cliente e define status `DRAFT`.

---

## 💡 Solução Proposta

### 1. Atualizar `BudgetCreateRequest`:
Permitir receber `items` opcionalmente:
```java
public record BudgetCreateRequest(
    @NotNull(message = "ID do cliente é obrigatório")
    UUID clientId,
    
    String observacoes,

    @Valid
    List<BudgetItemRequestDTO> items
) {
    public BudgetCreateRequest(UUID clientId, String observacoes) {
        this(clientId, observacoes, null);
    }
}
```

### 2. Atualizar `BudgetService.create`:
Processar a lista de itens caso fornecida:
```java
if (requestDTO.items() != null && !requestDTO.items().isEmpty()) {
    for (BudgetItemRequestDTO itemDto : requestDTO.items()) {
        BudgetItem item = budgetMapper.toEntity(itemDto);
        if (item.getOptions() != null) {
            for (BudgetItemOption option : item.getOptions()) {
                option.setBudgetItem(item);
            }
        }
        budget.addItem(item);
    }
    budgetQuantityService.calculateQuantities(budget);
    budgetPricingService.calculatePricing(budget);
}
```
