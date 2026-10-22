# [US-47.2] Criar serviço `TechnicalSheetPdfService` e endpoint `GET /api/v1/orders/{id}/technical-sheet.pdf` no backend

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-47.2`
- **US Pai**: `US-47: Central 360° do Cliente com Gestão Unificada de Orçamentos, O.S., Ficha Técnica e Etiquetas`
- **Issue no GitHub**: [#496](https://github.com/ADS-IFPB-SR/alumigest/issues/496)
- **Release**: Release 2 (v2.0.0) — Gestão de Produção & Fábrica
- **Sub-área**: `Backend / Relatórios PDF`
- **Arquivo / Alvo Principal**: `backend/src/main/java/br/edu/ifpb/alumigest/production/service/TechnicalSheetPdfService.java`
- **Labels Sugeridas**: `release-2`, `production`, `backend`, `java`, `pdf`, `technical-sheet`, `openpdf`

---

## 🎯 Objetivo & Descrição

Implementar o serviço especializado `TechnicalSheetPdfService` para geração e compilação da **Ficha Técnica de Produção Fabril** em formato PDF A4 a partir do identificador da Ordem de Serviço, expondo o endpoint `GET /api/v1/orders/{orderId}/technical-sheet.pdf`.

O documento gerado é o instrumento oficial de fabricação na serralheria Alumiportas e deve conter:
- Cabeçalho fabril institucional com número da O.S., data e identificação do cliente;
- Para cada item/esquadria da ordem:
  1. Identificação da tipologia e medidas nominais ($L \times A$ mm);
  2. Lista de corte de perfis de alumínio com código do perfil (ex: `SU-001`, `SU-002`, `SU-039`), descrição da peça, grau de corte ($45^\circ / 90^\circ$), quantidade e comprimento de corte calculado em milímetros;
  3. Especificação de vidros com cálculo de deduções de folgas industriais (conforme norma ABNT NBR 10821 e parâmetros da linha) e medidas finais de corte;
  4. Lista de componentes e acessórios de montagem (roldanas, fechos, escovas de vedação).

---

## 🛠️ Checklist de Implementação

- [ ] Analisar os requisitos específicos no arquivo de especificação (`docs/planejamento/backlog/US-47-painel-360-clientes/spec.md`)
- [ ] Criar a classe de serviço `TechnicalSheetPdfService` utilizando a biblioteca OpenPDF
- [ ] Implementar a regra de cálculo de corte e folgas no backend (mantendo o frontend 100% isolado de regras de negócio fabris)
- [ ] Diagramar a folha A4 com margens industriais limpas, cabeçalho da Alumiportas e tabelas de alta legibilidade
- [ ] Criar o endpoint `GET /api/v1/orders/{orderId}/technical-sheet.pdf` no `OrderController` ou controlador de produção dedicado
- [ ] Configurar os cabeçalhos HTTP de resposta: `Content-Type: application/pdf` e `Content-Disposition: inline; filename=ficha-tecnica-OS-YYYY-NNNN.pdf`
- [ ] Garantir compilação com `mvn clean compile`

---

## ✅ Critérios de Aceitação

1. O endpoint deve retornar status HTTP `200 OK` com os bytes binários do PDF A4 compilado.
2. Todas as medidas de corte de perfis e folgas de vidros devem ser calculadas no backend de forma determinística e testável.
3. Se a O.S. solicitada não for encontrada, deve responder com HTTP `404 Not Found`.
4. O documento gerado não deve apresentar quebra indevida de tabelas em páginas subsequentes.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
- 🖥️ **Protótipo com Modal de Ficha Técnica**: [painel-clientes-360.html](../../../prototipos/painel-clientes-360.html)
- 🏷️ **Serviço de Etiquetas Relacionado**: [US-17.1](../../../US-17-etiquetas-identificacao/issues/US-17.1-criar-servico-labelpdfservice-usando-openpdf/issue.md)
