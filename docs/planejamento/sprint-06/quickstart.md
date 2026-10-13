# Quickstart de homologação — Sprint 6

Este guia valida o fluxo completo de Pedidos de Venda: criar um orçamento, aprovar e converter, emitir o comprovante PDF, cancelar o pedido e reabrir o orçamento para renegociação.

## Pré-requisitos

- Docker Desktop com Docker Compose, ou Java 21 + Maven, Node.js 22+ e PostgreSQL 16;
- portas `3000`, `5173`, `8080` e `5432` livres, conforme a forma de execução;
- migrations executadas até a versão mais recente disponível em `backend/src/main/resources/db/migration`;
- um orçamento válido usa UUIDs reais retornados pela API. Não substitua identificadores por números sequenciais.

## 1. Subir a aplicação

Na raiz do repositório:

```bash
docker compose up -d --build postgres backend frontend
docker compose ps
```

Acesse o frontend em `http://localhost:3000`. Para desenvolvimento local, execute o backend e o frontend separadamente:

```bash
cd backend
mvn spring-boot:run

cd ../frontend
npm ci
npm run dev
```

Nesse modo, o Vite responde em `http://localhost:5173` e encaminha as chamadas de API para o backend.

## 2. Executar os quality gates

```bash
cd backend
mvn clean verify

cd ../frontend
npm ci
npm run build
npm run test
npm run test:e2e:us16
```

A suíte `test:e2e:us16` cobre, em formato BDD, aprovação/conversão, download do comprovante e cancelamento com reabertura. A criação real pela interface é coberta por `cypress/e2e/orders/us13_conversao_ordem_servico_real.cy.ts` quando a stack completa está disponível.

## 3. Homologar pela interface

1. Abra **Orçamentos > Novo Orçamento**.
2. Selecione ou cadastre um cliente, adicione ao menos uma esquadria e salve.
3. Na página do orçamento, clique em **Aprovar e Gerar O.S.**, informe canal e previsão de entrega e confirme.
4. Confirme o redirecionamento para a Ordem de Serviço e o congelamento dos itens e valores.
5. Clique em **Baixar Comprovante PDF**.
6. Confirme que o arquivo tem extensão `.pdf`, abre sem erro e contém código do pedido, cliente, itens e total contratado.
7. Clique em **Cancelar Ordem de Serviço**.
8. Verifique que uma justificativa com menos de 10 caracteres é recusada; informe uma justificativa válida e confirme.
9. Abra o orçamento de origem, confirme o aviso de pedido cancelado e clique em **Reabrir Orçamento**.
10. Confirme que o orçamento voltou para **Rascunho**, está editável e pode ser aprovado novamente depois da renegociação.

## 4. Homologar os endpoints

Defina `BUDGET_ID` e `ORDER_ID` com os UUIDs obtidos nas respostas da criação e conversão.

```bash
# Converter orçamento em pedido
curl -i -X POST "http://localhost:8080/api/v1/orders/convert/$BUDGET_ID" \
  -H "Content-Type: application/json" \
  -d '{"canalAprovacao":"WHATSAPP","dataPrevisaoEntrega":"2026-10-28","observacoes":"Homologação da US-16.4"}'

# Emitir comprovante
curl -i -o comprovante-pedido.pdf \
  "http://localhost:8080/api/v1/orders/$ORDER_ID/pdf/comprovante"

# Cancelar pedido
curl -i -X PATCH "http://localhost:8080/api/v1/orders/$ORDER_ID/cancel" \
  -H "Content-Type: application/json" \
  -d '{"justificativa":"Cliente solicitou renegociação antes do início da produção."}'

# Reabrir orçamento cancelado
curl -i -X POST "http://localhost:8080/api/budgets/$BUDGET_ID/reopen" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Resultados esperados:

- conversão retorna `200` ou `201`, com código `OS-AAAA-NNNN` e pedido aguardando produção;
- comprovante retorna `200`, `Content-Type: application/pdf` e `Content-Disposition: attachment`;
- cancelamento sem justificativa válida retorna `400`; com justificativa válida retorna `200` e status `CANCELLED`;
- reabertura retorna `200` e orçamento em `DRAFT`;
- após a reabertura, uma nova conversão é permitida porque o pedido anterior está cancelado.

## 5. Encerrar o ambiente

```bash
docker compose down
```

Use `docker compose down -v` somente quando houver intenção explícita de apagar os dados locais do PostgreSQL.

## Checklist de aceite

- [x] backend compilado e testes aprovados com `mvn clean verify`;
- [x] frontend compilado sem erro com `npm run build`;
- [x] testes unitários aprovados com `npm run test`;
- [x] suíte BDD da US-16.4 aprovada com `npm run test:e2e:us16`;
- [x] comprovante PDF baixado e conteúdo conferido por testes automatizados;
- [x] cancelamento exige justificativa válida;
- [x] orçamento vinculado reabre como rascunho;
- [x] resultado registrado no relatório de homologação da US-16.4.
