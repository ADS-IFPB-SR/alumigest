# [US-47.6] Edição de Dados Cadastrais do Cliente no Hub 360°

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.6`
- **Issue GitHub**: `#558`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Comercial / Operacional`
- **User Story**: Como Operador Comercial ou Gerente, eu quero poder editar os dados cadastrais do cliente diretamente através de um modal na "Central 360°", para manter as informações atualizadas sem sair do fluxo de atendimento.
- **Sub-área**: `Frontend (React)`
- **Execução Paralela**: ✅ Sim
- **Arquivo / Alvo Principal**: `EditCustomerModal.tsx`, `customersApi.ts`
- **Labels Sugeridas**: `feature`, `frontend`, `ux`, `react-query`

---

## 🎯 Objetivo & Descrição

Habilitar a capacidade de edição instantânea dos dados do cliente a partir da visualização mestre-detalhe da Central 360°. A implementação consome endpoints já consolidados no backend e se concentra em garantir uma experiência fluida no frontend, atualizando as telas subjacentes reativamente (invalidando o cache) sem a necessidade de recarregar a página.

### Contexto da Fase / Épico
Se um vendedor perceber que o telefone do cliente está desatualizado no meio de uma venda ou consulta, ele precisaria abandonar o Hub 360°, ir para a tela de Clientes, pesquisar, editar e voltar. O botão "Editar" resolve esse gargalo de UX integrando um modal reativo no próprio *Hero Card*.

---

## 🛠️ Checklist de Implementação

- [ ] **Criação do Componente Modal (`EditCustomerModal.tsx`)**:
    - [ ] Implementar formulário utilizando `react-hook-form`.
    - [ ] Configurar preenchimento automático a partir da API (`GET /api/v1/clients/{id}`).
- [ ] **Integração de Requisições (`customersApi.ts`)**:
    - [ ] Adicionar `getCustomerById` e `updateCustomer` na camada de serviços.
    - [ ] Criar os hooks globais `useCustomer` e `useUpdateCustomer`.
- [ ] **Validação e UX**:
    - [ ] Exibir mensagens de validação (ex: campos obrigatórios, formato inválido).
    - [ ] Integrar mutação via `React Query` (PUT) e invalidar o cache ativo ao salvar com sucesso.
    - [ ] Tratar erro de duplicidade (409 Conflict) caso o CPF/CNPJ pertença a outro cadastro.

---

## ✅ Critérios de Aceitação

1. Clicar no botão "Editar Cliente" no Hero Card deve abrir o `EditCustomerModal`, carregando os dados atuais do cliente na API.
2. Limpar campos obrigatórios ou preencher documentos inválidos deve barrar a submissão e exibir mensagens de erro amigáveis no formulário.
3. Submeter um formulário válido disparará a mutação `PUT`; ao receber sucesso (200 OK), o modal deve fechar, um toast de confirmação será exibido, e a Central 360° deve ser atualizada reativamente (invalidação de cache).
4. Caso o documento já exista em outro cliente (Status 409), o modal deve permanecer aberto apresentando um toast explicativo do conflito.

---

## 🔗 Referências & Documentos Relacionados

- 🖥️ **Protótipo Interativo**: `docs/planejamento/prototipos/painel-clientes-360.html`
- 📑 **Especificação Pai**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)