# Especificação Funcional: US-33 — Emitir Ordem de Serviço (OS) em PDF

**Identificador**: `US-33`  
**Issue GitHub**: [#158](https://github.com/ADS-IFPB-SR/alumigest/issues/158)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como líder de equipe de campo ou expedidor da Alumiportas, desejo emitir o documento formal da Ordem de Serviço em PDF A4 padronizado (`OS-YYYY-NNNN`), discriminando os dados do cliente, endereço de montagem, lista detalhada de peças e esquadrias com medidas, orientações de fixação e termo de aceite e garantia com campo para assinatura física, assegurando respaldo operacional mesmo em ambientes sem conectividade.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Emissão do Documento A4 com Identidade Visual Institucional**
  - **Dado que** o usuário está na página da Ordem de Serviço ou listagem de montagens,
  - **Quando** clica em "Emitir O.S. em PDF",
  - **Então** o backend processa o documento via `ServiceOrderPdfService` retornando `application/pdf`,
  - **E** o documento gerado apresenta o cabeçalho institucional da empresa (Logo, CNPJ, Razão Social, Telefone), código da O.S. em destaque (`OS-YYYY-NNNN`) e QR Code para validação rápida no rodapé.

- [ ] **Cenário 2: Discriminação Detalhada de Itens, Esquadrias e Medidas**
  - **Dado que** a O.S. possui múltiplos itens cadastrados (ex: Janela 4 folhas, Porta Pivotante, Box de Banheiro),
  - **Quando** a tabela de itens é renderizada no PDF,
  - **Então** exibe as colunas: Item, Descrição Técnica, Linha de Alumínio, Acabamento/Cor, Vidro (tipo/espessura), Largura (mm), Altura (mm), Quantidade e Ambiente de Instalação (ex: "Suíte Master").

- [ ] **Cenário 3: Termo de Garantia, Cuidados e Campos de Assinatura**
  - **Dado que** a O.S. necessita de formalização jurídica e técnica de entrega,
  - **Quando** a seção de fechamento é renderizada no documento,
  - **Então** inclui o termo de garantia de 12 meses para fixação/vedação e 90 dias para acessórios,
  - **E** disponibiliza linhas para assinatura do instalador responsável e assinatura/documento (CPF/RG) do cliente recebedor.

- [ ] **Cenário 4: Inclusão de Assinatura Digital e Fotos em O.S. Concluída**
  - **Dado que** a O.S. já foi concluída em campo com assinatura digital coletada via PWA,
  - **Quando** o PDF é reemitido no painel administrativo,
  - **Então** o documento estampa a imagem da assinatura capturada no campo de aceite com o timestamp de confirmação,
  - **E** anexa uma folha suplementar com as fotos de comprovação do "Antes" e "Depois".

- [ ] **Cenário 5: Tratamento de Impressão Direta e Pré-visualização**
  - **Dado que** o documento foi compilado com sucesso,
  - **Quando** a resposta chega ao frontend,
  - **Então** o sistema abre a visualização nativa em modal ou aba do navegador, permitindo impressão imediata (via `Ctrl+P`) ou download com nome `OS-{codigo}.pdf`.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Padrão de Código da O.S.):** A numeração exibida e o nome do arquivo gerado devem obedecer rigorosamente à máscara `OS-YYYY-NNNN`.
- **RN-02 (Paginação e Rodapé Imutável):** Todo PDF gerado deve conter rodapé com "Página X de Y", timestamp de geração e hash de validação documental.
- **RN-03 (Diretriz de Idioma em Variáveis):** Classes e atributos em inglês: `ServiceOrderPdfService`, `serviceOrderId`, `serviceOrderCode`, `clientName`, `deliveryAddress`, `itemsList`, `signatureBase64`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / OpenPDF / PostgreSQL)
- **Endpoints:**
  - `GET /api/v1/installation/service-orders/{id}/pdf` (stream de bytes PDF)
- **Serviço:** `ServiceOrderPdfService.java`

### Frontend (React 19 / TanStack Query / Tailwind)
- **Componentes:**
  - `ServiceOrderPdfButton.tsx` (botão de emissão com loading state)
  - `ServiceOrderPdfViewerModal.tsx` (preview do PDF em iframe seguro)

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `ServiceOrderPdfServiceTest` validando montagem de tabela de itens, paginação e integridade de streams.
- [ ] Teste de integração do endpoint `/pdf` validando headers HTTP (`Content-Disposition: inline; filename="OS-...pdf"`).
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (7 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-33.1](issues/US-33.1-criar-servico-serviceorderpdfservice-gerando-/issue.md) | Criar serviço `ServiceOrderPdfService` gerando PDF A4 de OS com OpenPDF | 🔲 No Backlog |
| [US-33.2](issues/US-33.2-adicionar-endpoint-get-api-installation-servi/issue.md) | Adicionar endpoint GET `/api/v1/installation/service-orders/{id}/pdf` no `ServiceOrderController` | 🔲 No Backlog |
| [US-33.3](issues/US-33.3-criar-teste-unitario-do-serviceorderpdfservic/issue.md) | Criar teste unitário do `ServiceOrderPdfServiceTest` | 🔲 No Backlog |
| [US-33.4](issues/US-33.4-adicionar-botao-emitir-os-em-pdf-no-frontend/issue.md) | Adicionar botão "Emitir OS em PDF" no frontend | 🔲 No Backlog |
| [US-33.5](issues/US-33.5-documentar-endpoints-no-openapi-swagger/issue.md) | Documentar endpoints no OpenAPI/Swagger | 🔲 No Backlog |
| [US-33.6](issues/US-33.6-adicionar-atalho-instalacoes-agenda-no-menu-d/issue.md) | Adicionar atalho "Instalações & Agenda" no menu do frontend | 🔲 No Backlog |
| [US-33.7](issues/US-33.7-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste da release | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-33-emissao-os-pdf`
