# [US-46.4] Geração e Exportação do Orçamento em PDF A4

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-46.4`
- **US Pai**: `US-46: Módulo de Venda Avulsa de Partes (Vidro em m², Alumínio em Metro Linear, Ferragens e Películas)`
- **Release**: Sprint 08
- **Fase**: `Desenvolvimento Comercial / Documentação`
- **User Story**: Como serralheiro parceiro ou cliente final, desejo emitir uma folha de cotação/pedido profissional em PDF A4 diagramado para conferência, controle de pagamento e liberação na bancada de corte.
- **Sub-área**: `Backend & Frontend`
- **Execução Paralela**: ✅ Sim (Após a conclusão da US-46.2)
- **Arquivo / Alvo Principal**: `PartSaleForm.tsx`, Serviço de Geração de PDF (`application/pdf`)
- **Labels Sugeridas**: `feature`, `backend`, `frontend`, `pdf`, `export`

---

## 🎯 Objetivo & Descrição

Esta tarefa fecha o ciclo operacional e comercial do módulo de venda avulsa de partes, permitindo a geração e exportação instantânea do documento oficial em PDF A4. Foca na diagramação do documento com agrupamento inteligente de seções por categoria e tempo de resposta otimizado (< 1,5s).

### Contexto da Fase / Épico
Quando um pedido de partes avulsas é aprovado, a oficina necessita de um documento físico ou digital padronizado para entregar ao cliente e à produção. A interface principal já possui os botões mapeados, restando a lógica de integração e formatação do arquivo `application/pdf`.

---

## 🛠️ Checklist de Implementação

- [ ] **Serviço de Geração de PDF A4 no Backend**:
    - [ ] Implementar cabeçalho padronizado da Alumiportas (logotipo, CNPJ, contato, numeração e dados do cliente).
    - [ ] Criar tabela modular agrupando itens em seções temáticas (Vidros, Perfis, Ferragens, Películas).
    - [ ] Implementar lógica de ocultação de blocos temáticos vazios.
    - [ ] Configurar colunas dinâmicas específicas por material (ex: $m$ lineares para alumínio).
    - [ ] Desenvolver rodapé financeiro (subtotal, desconto, líquido, validade e assinatura).
- [ ] **Endpoint REST de Exportação**:
    - [ ] Criar endpoint `GET /api/v1/part-sales/{id}/pdf` com headers `Content-Disposition: attachment`.
- [ ] **Integração no Frontend (`PartSaleForm.tsx`)**:
    - [ ] Conectar botão "Exportar PDF" ao endpoint, com `loading spinner` durante a geração.
- [ ] **Testes Automatizados**:
    - [ ] Validar a montagem dos bytes do PDF e integração do endpoint garantindo tempo < 1,5s.

---

## ✅ Critérios de Aceitação

1. O acionamento do botão "Exportar PDF" no card de Resumo da Venda deve iniciar o download automático do documento A4 em menos de 1,5 segundo.
2. O documento deve apresentar cabeçalho corporativo completo, dados do cliente e código rastreável da proposta.
3. Os itens devem ser organizados em seções separadas por categoria, exibindo apenas as colunas relevantes para cada tipo e ocultando categorias sem itens.
4. Para itens de ferragens, a tabela não deve conter colunas de medidas físicas em branco, apresentando apenas quantidades inteiras e valores.
5. O botão "Exportar PDF" deve permanecer desabilitado enquanto a proposta não possuir itens adicionados.

---

## 🔗 Referências & Documentos Relacionados

- 🎨 **Protótipo Canônico**: `.prototipos/telas/prot_tipo_vendas_vidra_aria.html`
- 📑 **Especificação Pai**: [#477](https://github.com/ADS-IFPB-SR/alumigest/issues/477)