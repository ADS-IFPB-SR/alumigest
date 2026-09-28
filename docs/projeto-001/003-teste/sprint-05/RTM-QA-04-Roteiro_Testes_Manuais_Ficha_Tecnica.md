# 📋 RTM — Roteiro e Execução de Testes Manuais Exploratórios — QA-04

| Metadado | Informação |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçarias e Serralherias de Alumínio |
| **Documento** | Roteiro de Teste Manual Exploratório e Evidências de Chão de Fábrica |
| **Demanda / Task** | [Issue #340](https://github.com/ADS-IFPB-SR/alumigest/issues/340) — `test(qa): QA-04 - Plano de Teste e Validação E2E da Via Técnica de Oficina (US-11)` |
| **User Story Pai** | [Issue #135](https://github.com/ADS-IFPB-SR/alumigest/issues/135) — `US-11: Emitir Orçamento em PDF - Via Técnica de Oficina` |
| **Sprint** | 05 — Integração End-to-End, Fechamento de Orçamentos e Exportação PDF |
| **Ambiente de Testes** | DEV Local (`http://localhost:5173` / `http://localhost:8081` / PostgreSQL 16) |
| **Perfis Envolvidos** | Serralheiro, Montador de Esquadrias, Encarregado de Produção / QA Fabril |
| **Data da Execução** | 28/09/2026 |
| **Amostra Gerada** | [`amostra-ficha-tecnica-ORC-2026-QA04.pdf`](./amostra-ficha-tecnica-ORC-2026-QA04.pdf) |
| **Status Geral** | 🟢 **100% HOMOLOGADO** (11/11 casos aprovados, 1 bug visual identificado e sanado) |

---

## 1. 🎯 Objetivo dos Testes Manuais

Complementar a pirâmide de testes automatizados (Cypress E2E, Spring Boot Integration Tests e Unit Tests do OpenPDF) através de **testes manuais exploratórios criteriosos** simulando a rotina real de chão de fábrica na Alumiportas:

1. **Usabilidade e Ergonomia Visual:** Avaliar clareza do botão "Via Técnica", tempos de resposta, feedback de loading e tratamento de cancelamento na tela de detalhes do orçamento (`BudgetDetailPage`).
2. **Fidelidade Visual do Documento Impresso (A4):** Comparar a saída impressa/renderizada da Ficha Técnica contra o protótipo canônico aprovado `ficha tecninca.html`.
3. **Mecânica e Geometria das Esquadrias:** Inspecionar a proporção do desenho vetorial, cotas milimétricas, posicionamento relativo de furações e puxadores e ausência de sobreposições textuais.
4. **Blindagem de Segredo Comercial:** Checagem humana e minuciosa de cada campo do documento para garantir total ausência de indicadores monetários.

---

## 2. 🛠️ Configuração do Ambiente de Teste Manual

### 2.1 Pré-requisitos
- Docker Engine com container `alumigest-postgres` ativo na porta `5432`.
- Backend Spring Boot 3 rodando no perfil `dev` na porta `8081`.
- Frontend React 19 + Vite ativo na porta `5173`.

### 2.2 Instruções de Inicialização Rápida
```bash
# 1. Banco de Dados
docker compose up -d postgres

# 2. Backend (Terminal 1)
cd backend
.\mvnw.cmd spring-boot:run

# 3. Frontend (Terminal 2)
cd frontend
npm run dev
```

---

## 3. 📋 Matriz de Execução dos Casos de Teste Manuais (TM-OF)

| ID | Cenário Avaliado | Procedimento de Teste | Comportamento Esperado | Resultado Obtido | Status |
|:---:|:---|:---|:---|:---|:---:|
| **TM-OF-01** | Visualização da Ação "Via Técnica" | Acessar `/orcamentos/:id` com proposta aprovada/enviada | O cabeçalho exibe o botão "Via Técnica" com ícone de prancheta/oficina, estilo secundário limpo e alinhado aos botões de PDF Comercial e WhatsApp. | Botão `[data-testid="btn-download-pdf-tecnico"]` visível, estilizado e perfeitamente integrado à barra de ações. | 🟢 **Aprovado** |
| **TM-OF-02** | Feedback de Loading e Prevenção de Concorrência | Clicar no botão "Via Técnica" simulando cliques repetidos | O botão exibe spinner giratório (`animate-spin`), texto "Gerando...", fica em estado `disabled` e rejeita novos cliques durante o processamento. | Feedback imediato; requisições concorrentes bloqueadas com sucesso. | 🟢 **Aprovado** |
| **TM-OF-03** | Download do Binário PDF pelo Navegador | Aguardar resposta do backend após o clique | O navegador inicia o download automático do arquivo com mimetype `application/pdf` e nome `ORC-XXXX-tecnico.pdf`; exibe toast verde "PDF da Ficha Técnica baixado com sucesso!". | Arquivo baixado em < 1.2s; toast disparado; link Blob temporário revogado da memória. | 🟢 **Aprovado** |
| **TM-OF-04** | Cabeçalho Fabril e Identificação de Produção | Abrir o PDF baixado em leitor de PDF / navegador | Topo exibe título *"FICHA DE USINAGEM E CORTE"*, badge em caixa alta *"VIA TÉCNICA - USO INTERNO / OFICINA"*, setor *"Fábrica / Vidraçaria"*, número do pedido `#ORC-XXXX` e data de emissão formatada. | Tipografia nítida (Helvetica), alinhamento perfeito conforme o protótipo `ficha tecninca.html`. | 🟢 **Aprovado** |
| **TM-OF-05** | Card de Obra e Volume do Pedido | Inspecionar bloco de informações do cliente/obra | Exibe "CLIENTE / OBRA" com razão social/nome em destaque maiúsculo, "VENDEDOR / CONTATO" com telefone formatado e "VOLUME DO PEDIDO" destacando a quantidade total de peças (ex: *"5 PEÇAS"*). | Card limpo com bordas sutis e contraste adequado para impressão monocromática de oficina. | 🟢 **Aprovado** |
| **TM-OF-06** | Tabela Técnica de 5 Colunas | Inspecionar a estrutura da tabela principal de peças | Tabela dividida em 5 colunas: `ITEM`, `ESQUEMA (USINAGEM/PUXADOR)`, `ESPECIFICAÇÕES TÉCNICAS`, `DETALHAMENTO FURAÇÃO / PUXADOR` e `STATUS`. | Estrutura harmoniosa, aproveitamento total da largura A4 (595pt). | 🟢 **Aprovado** |
| **TM-OF-07** | Motor Gráfico Vetorial de Usinagem | Inspecionar a célula gráfica de cada esquadria | Desenho em escala proporcional com moldura externa contínua (1.4pt), linha interna pontilhada de folga de usinagem, círculos vermelhos indicando furações e puxador desenhado na folha móvel. | Desenho vetorial renderizado diretamente no canvas OpenPDF sem perdas de resolução. | 🟢 **Aprovado** |
| **TM-OF-08** | Montantes Opostos: Furações vs. Puxador | Inspecionar porta de giro com furação e puxador cotados | As furações de dobradiça ficam posicionadas no montante pivô (esquerdo), enquanto o puxador e sua cota ficam no montante oposto (direito). Cotas não colidem. | **Aprovado após correção:** Cotas milimétricas e rótulo do puxador perfeitamente separados e legíveis. | 🟢 **Aprovado** |
| **TM-OF-09** | Auditoria Visual de Sigilo Comercial | Varrer visualmente todas as seções e células do PDF | Nenhuma menção a valores monetários (`R$`, `BRL`, centavos, "Preço", "Subtotal", "Desconto" ou "Total a Pagar"). Apenas medidas nominais ($W \times H$ cm/mm) e quantidades. | **Sigilo absoluto confirmado:** Zero dados de preço ou condição comercial impressos. | 🟢 **Aprovado** |
| **TM-OF-10** | Checkboxes Manuais de Chão de Fábrica | Inspecionar a coluna "STATUS" de cada item | Exibe 3 caixas de seleção vazias com cantos arredondados para conferência com caneta na oficina: `[ ] Alum.`, `[ ] Vidro`, `[ ] Mont.`. | Checkboxes nítidos, tamanho ideal para marcação com caneta pelo serralheiro e montador. | 🟢 **Aprovado** |
| **TM-OF-11** | Bloqueio para Proposta Cancelada (`CANCELLED`) | Acessar proposta com status cancelado no frontend | O botão "Via Técnica" permanece `disabled`, exibe cursor impeditivo (`not-allowed`) e tooltip "Não é possível emitir ficha técnica de orçamento cancelado". Requisições diretas retornam HTTP 422. | Operação defensiva validada na interface e na camada de serviço REST. | 🟢 **Aprovado** |

---

## 4. 🐛 Bug Identificado e Corrigido Durante o Teste Manual

### Análise da Não-Conformidade (NC-US11-01)
* **Sintoma:** Ao gerar o PDF da Ficha Técnica para esquadrias com sentido de abertura para a esquerda (`OpeningDirection.RIGHT_TO_LEFT`), as furações das dobradiças e o puxador foram desenhados sobre o **mesmo montante** (lado direito).
* **Impacto Visual:** A cota milimétrica do furo central (`1050 mm`) e o rótulo do puxador (`Puxador (40cm)`) colidiam no mesmo espaço geográfico, tornando a leitura difícil para o operador da oficina.
* **Causa Raiz:** Em `BudgetPdfDrawingHelper.desenharFuracoesUsinagem`, a variável `onLeftSide` estava definida como `!ctx.isOpeningLeft()`, invertendo o lado das furações em relação ao montante pivô.
* **Correção Aplicada:**
  ```java
  // Ajuste em BudgetPdfDrawingHelper.java
  boolean onLeftSide = ctx.hasHandle()
          ? ctx.handle().onRightSide()
          : (ctx.isOpeningLeft() || ctx.openingDirection() == null);
  ```
* **Resultado:** As furações de dobradiça passaram a ser renderizadas no montante de articulação (esquerdo) e o puxador no montante de fechamento (direito), eliminando a colisão e refletindo a física real de uma porta de giro.

---

## 5. 📸 Evidência Documental Gerada

A amostra oficial gerada pelo motor vetorial em ambiente real encontra-se salva e disponível no repositório:
* Arquivo: [`docs/projeto-001/003-teste/sprint-05/amostra-ficha-tecnica-ORC-2026-QA04.pdf`](./amostra-ficha-tecnica-ORC-2026-QA04.pdf)
* Volume do Pedido: 5 peças
* Itens Testados:
  1. Porta de Giro 1 Folha ($900 \times 2100\text{ mm}$), furações de dobradiça cotadas em $250\text{ mm}$, $1050\text{ mm}$, $1850\text{ mm}$ no montante esquerdo e puxador tubular inox $40\text{ cm}$ cotado no montante direito.
  2. Janela Maxim-ar Linha Suprema ($600 \times 800\text{ mm}$), furações equidistantes com fecho concha.

---

## 6. 🏁 Parecer Final de Homologação Manual

Os testes manuais exploratórios comprovam que a **Via Técnica de Oficina (US-11)** atende integralmente aos requisitos de negócio, critérios de aceitação e especificações ergonômicas de chão de fábrica. O documento garante sigilo comercial rigoroso, clareza gráfica e alta legibilidade para a equipe de produção da Alumiportas.

**Status de Homologação:** 🟢 **APROVADO PARA PRODUÇÃO (RELEASE 1)**
