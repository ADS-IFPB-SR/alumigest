# Relatório de Testes e Homologação — US-16.4

**Issue:** #366 — Testes de Sistema E2E, Validação BDD e Homologação do Quickstart  
**Data:** 13/10/2026  
**Branch:** `test/us-16.4-e2e-bdd-quickstart-366`  
**Base:** `feat/us-16-emissao-comprovante-pedido-venda`

## Objetivo

Homologar a jornada comercial desde a criação do orçamento até a emissão do comprovante do pedido, incluindo cancelamento e reabertura do orçamento para renegociação.

## Evidências automatizadas

| Cenário BDD | Evidência | Resultado esperado |
|---|---|---|
| Dado um orçamento criado e enviado, quando é aprovado, então gera um pedido | `us13_conversao_ordem_servico_real.cy.ts` + cenário de conversão da US-16.4 | Pedido criado, valores congelados e navegação para o detalhe |
| Dado um pedido ativo, quando o comprovante é solicitado, então baixa um PDF | `us16_4_homologacao_quickstart.cy.ts` | HTTP 200, MIME `application/pdf`, nome contendo o código do pedido e mensagem de sucesso |
| Dado um pedido aguardando produção, quando é cancelado, então registra a justificativa | `us16_4_homologacao_quickstart.cy.ts` | Status `CANCELLED`, justificativa exibida e ação de cancelamento indisponível |
| Dado um pedido cancelado, quando o orçamento de origem é aberto, então pode ser reaberto | `us16_4_homologacao_quickstart.cy.ts` | Aviso do cancelamento, chamada de reabertura e retorno do orçamento para `DRAFT` |

O cenário real da US-13 é responsável pela criação visual do cliente, montagem da esquadria e persistência do orçamento. A suíte da US-16.4 controla as respostas HTTP para tornar reproduzíveis as validações específicas de comprovante, cancelamento e reabertura, sem depender de dados previamente cadastrados.

## Comandos de validação

```bash
cd backend
mvn clean verify

cd ../frontend
npm run build
npm run test
npm run test:e2e:us16
```

| Verificação | Resultado |
|---|---|
| Compilação e testes do backend | Aprovado — `BUILD SUCCESS`, 731 testes, 0 falhas e 0 erros |
| Build TypeScript/Vite | Aprovado — build de produção concluído |
| Testes unitários do frontend | Aprovado — 87 arquivos e 709 testes |
| Lint do frontend | Aprovado — 0 erros; 2 avisos não bloqueantes preexistentes de `react(only-export-components)` |
| Cypress US-16.4 | Aprovado — 3 cenários, 3 aprovados, 0 falhas |
| Configuração Docker Compose | Aprovada com `docker compose config --quiet`; avisos não bloqueantes para variáveis empresariais opcionais e atributo `version` obsoleto |
| Revisão do quickstart | Guia atualizado para UUIDs, rotas atuais e ciclo de reabertura |

## Critérios de aceite manual

- o comprovante abre como PDF e contém código do pedido, identificação do cliente, itens e total;
- pedidos em produção ou concluídos respeitam as regras de status e não expõem cancelamento comercial indevido;
- justificativas curtas são rejeitadas antes da chamada ao backend;
- o orçamento só oferece reabertura quando o pedido vinculado está cancelado;
- depois da reabertura, a proposta fica editável e uma reconversão não é bloqueada pelo pedido cancelado anterior.

## Riscos residuais

- a suíte controlada valida o contrato e a navegação no navegador; renderização visual e conteúdo final do PDF também devem ser conferidos na homologação com a stack Docker;
- mudanças futuras nas migrations ou nos dados iniciais podem exigir atualização do cenário E2E real;
- o SonarQube é executado pela pipeline da PR e permanece como quality gate externo.
