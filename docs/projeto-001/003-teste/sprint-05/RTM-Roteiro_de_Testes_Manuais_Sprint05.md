# 📋 RTM — Roteiro de Testes Manuais — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sigla** | ALG |
| **Sprint** | Sprint 05 — Fechamento US-09, PDF Via Comercial (US-10), PDF Via Técnica (US-11) e Release 1 |
| **Documento Equivalente BDD** | [`TEA-Testes_de_Aceitacao_Sprint05.md`](./TEA-Testes_de_Aceitacao_Sprint05.md) |
| **Relatório Técnico de Execução** | [`RET-Relatorio_Execucao_Testes_Sprint05.md`](./RET-Relatorio_Execucao_Testes_Sprint05.md) |
| **Perfil Executor** | Product Owner (PO), Analista de QA e Homologadores de Negócio |
| **Ambiente de Teste** | Homologação Local (`http://localhost:5173`) |
| **Data de Emissão** | 28/09/2026 |

---

## 1. Instruções para os Homologadores

Este roteiro guia a validação manual dos entregáveis da **Release 1 (v1.0.0)** do AlumiGest, focando no ciclo de vida de orçamentos, emissão e integridade da **Via Técnica de Oficina (Ficha Técnica de Chão de Fábrica)** e conformidade do **sigilo comercial estrito**.

### Pré-requisitos de Ambiente:
1. Backend ativo: `mvn spring-boot:run` (porta 8080)
2. Frontend ativo: `npm run dev` (porta 5173)
3. Leitor de PDF instalado no sistema operacional ou navegador

---

## 2. Fichas Operacionais de Execução Manual

### 🧪 Cenário RTM-S05-01: Ciclo de Vida de Orçamento e Transições de Status

* **Objetivo:** Validar o ciclo completo da proposta comercial através dos estados `DRAFT` ➔ `SENT` ➔ `APPROVED` na página de detalhes.
* **Equivalente Automatizado:** `BudgetControllerTest` (BE-ORC-04 / BE-ORC-05)
* **Ponto de Partida:** Rota `/orcamentos`

#### 👣 Passos de Execução:
1. **Acessar a Listagem de Orçamentos:** Navegar até `http://localhost:5173/orcamentos`.
2. **Localizar Proposta em Rascunho:** Clicar em um orçamento com badge cinza `Rascunho (DRAFT)`.
3. **Avançar para Enviado:** Na barra superior da `BudgetDetailPage`, clicar no botão `[data-testid="btn-status-enviar"]` ("Marcar como Enviado").
4. **Verificar Mudança de Badge:** Confirmar que o badge atualiza instantaneamente para azul `Enviado (SENT)` sem reload de página.
5. **Aprovar Proposta:** Clicar no botão `[data-testid="btn-status-aprovar"]` ("Aprovar Orçamento").
6. **Verificar Bloqueio de Edição:** Confirmar que o badge atualiza para verde `Aprovado (APPROVED)` e que os botões de edição de medidas e exclusão de itens ficam desabilitados.

#### ✅ Critérios de Aceitação:
- [ ] O histórico de transições registra o timestamp da alteração.
- [ ] O status persiste no banco de dados e permanece correto após pressionar `F5`.
- [ ] A máquina de estados impede que uma proposta cancelada seja aprovada diretamente.

---

### 🧪 Cenário RTM-S05-02: Emissão e Download da Via Técnica de Oficina (PDF)

* **Objetivo:** Validar a geração e download do documento PDF de produção, conferindo o nome do arquivo e integridade de formato.
* **Equivalente Automatizado:** `BudgetPdfServiceTest` (BE-PDF-T-01 / BE-PDF-T-05)
* **Ponto de Partida:** Rota `/orcamentos/:id` (proposta no status `APPROVED`)

#### 👣 Passos de Execução:
1. **Abrir Detalhes do Orçamento:** Selecionar um orçamento aprovado contendo ao menos 2 itens de esquadrias.
2. **Localizar Ação de Emissão:** No menu de exportação ou cabeçalho da página, clicar no botão `[data-testid="btn-download-pdf-tecnico"]` ("Via Técnica de Produção").
3. **Observar Feedback Visual:** Constatar o surgimento do spinner de carregamento `"Gerando documento técnico..."`.
4. **Verificar Download no Navegador:** Confirmar que o arquivo é baixado no diretório de downloads com o padrão exato: `ORC-YYYY-NNN-tecnico.pdf` (ex: `ORC-2026-0002-tecnico.pdf`).
5. **Validar Resolução do BUG-024:** Garantir que o nome do arquivo **NÃO** contenha caracteres como `UTF-8''...` ou códigos hexadecimais literais.

#### ✅ Critérios de Aceitação:
- [ ] O arquivo abre perfeitamente em leitores PDF padrão (Acrobat, Chrome, Edge) sem mensagens de arquivo corrompido.
- [ ] O tamanho do arquivo gerado é otimizado ($< 500\text{ KB}$).

---

### 🧪 Cenário RTM-S05-03: Auditoria Visual de Sigilo Comercial na Via Técnica

* **Objetivo:** Garantir que a Via Técnica de Oficina mantenha o sigilo comercial estrito, ocultando completamente preços de insumos, margens e valores totais para o chão de fábrica.
* **Equivalente Automatizado:** `PdfSecurityExtractorTest` (BE-PDF-T-06 / BE-PDF-T-07)
* **Ponto de Partida:** Leitura do arquivo PDF baixado no cenário anterior

#### 👣 Passos de Execução:
1. **Abrir o Arquivo PDF:** Abrir o arquivo `ORC-2026-0002-tecnico.pdf` no leitor de PDF.
2. **Verificar Cabeçalho:** Confirmar a presença destacada da tarja: `VIA TÉCNICA - USO INTERNO / OFICINA`.
3. **Buscar Termos Monetários (Ctrl+F):**
   * Pressionar `Ctrl+F` e pesquisar por `R$`. O leitor deve retornar **0 resultados**.
   * Pesquisar por `Total` e `Preço`. Nenhum campo monetário de venda deve existir.
4. **Inspecionar Colunas de Materiais:**
   * Tabela de Perfis: Deve exibir apenas Código, Linha, Comprimento de Corte (mm) e Quantidade de Barras.
   * Tabela de Vidros: Deve exibir apenas Modelo, Espessura (mm), Largura $\times$ Altura (mm) e Acabamento.
5. **Validar Informações de Apoio:** Confirmar que constam o Nome do Cliente, Código do Pedido e Data Prevista de Entrega para fins operacionais.

#### ✅ Critérios de Aceitação:
- [ ] Nenhuma informação financeira é exposta no documento de chão de fábrica.
- [ ] Todas as cotas dimensionais estão expressas em milímetros (mm) ou metros quadrados ($m^2$).

---

### 🧪 Cenário RTM-S05-04: Verificação da Usinagem Vetorial, Furações e Termos pt-BR

* **Objetivo:** Inspecionar visualmente o diagrama vetorial de usinagem gerado pelo `BudgetPdfDrawingHelper`, validando as correções dos bugs #342–#347.
* **Equivalente Automatizado:** `TechnicalMachiningResolverTest` (BE-PDF-T-08 a BE-PDF-T-16)
* **Ponto de Partida:** Seção de usinagem no PDF Técnico

#### 👣 Passos de Execução:
1. **Localizar o Bloco de Usinagem:** Rolar até o diagrama da esquadria no PDF.
2. **Validar Tipologia Específica (BUG-023 e BUG-028):**
   * Se for Porta 2 Folhas de Correr, verificar se o desenho exibe os 2 caixilhos divididos com setas de sentido.
   * Se for Janela Maxim-Ar, verificar a projeção do braço de articulação inferior.
3. **Inspecionar Cotas e Furações:**
   * Círculos vermelhos representam as furações técnicas com suas respectivas distâncias das bordas (mm).
4. **Verificar Posicionamento do Puxador (BUG-026):**
   * O puxador e seu rótulo de comprimento (ex: `Puxador (25cm)`) estão totalmente visíveis, sem cortes nas margens da folha.
5. **Conferir Tradução dos Termos (BUG-025 e BUG-027):**
   * Verificar se todos os textos estão em português: `"Tubular"` (e não `TUBULAR`), `"Direita"` (e não `RIGHT`) e `"Montagem"` (e não o termo abreviado ambíguo `Mont.`).

#### ✅ Critérios de Aceitação:
- [ ] O diagrama vetorial preserva clareza e nitidez ao aplicar zoom de 200%.
- [ ] Os checklists de produção (Corte, Usinagem, Montagem, Vidro, Embalagem) constam com caixas de marcação manuais vazias para a equipe de oficina.

---

## 3. Matriz Defensiva de Defeitos e Comportamentos Anômalos (RBD Sprint 05)

| Sintoma Observado | Causa Mais Provável | Ação de Contingência / Diagnóstico |
|---|---|---|
| Nome do PDF baixa como `UTF-8''ORC-2026-0002-tecnico.pdf` | Formatação de encoding RFC 5987 não suportada pelo navegador (`BUG-024`) | Verifique se a release possui o helper `extractFilenameFromContentDisposition` no frontend. |
| Diagrama técnico desenha folha única para janela de correr | Resolução incorreta do renderizador de moldura (`BUG-023`) | Certifique-se de que o backend executa a classe `TechnicalMachiningFrameRenderer` atualizada na Sprint 05. |
| Puxador ou furação cortada fora da margem da folha | Dimensões de canvas inadequadas no OpenPDF (`BUG-026`) | O canvas oficial é fixado em $126 \times 96\text{ pt}$ com margens assimétricas para acomodar cotas. |
| Erro `422` ao tentar emitir via técnica | Proposta orçamentária está no status `CANCELLED` | Não é permitida emissão técnica para propostas canceladas. Apenas orçamentos `SENT` ou `APPROVED` são emitíveis. |
