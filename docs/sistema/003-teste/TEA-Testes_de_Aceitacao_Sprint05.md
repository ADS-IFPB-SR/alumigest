# 🧪 TEA — Testes de Aceitação — Sprint 05

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Sprint** | 05 — Emissão de PDF Comercial e WhatsApp (US-10), Via Técnica de Oficina (US-11) e Homologação da Release 1 |
| **Período** | 15/09/2026 a 28/09/2026 (14 dias) |
| **Versão** | 1.0 (Baseline B-ALG-v0.5.0-S05-01) |
| **QA Responsável** | Equipe de QA AlumiGest / Herbert Carvalho / Júlio Kennedy |
| **Tech Lead** | Italo Jefferson Lima dos Santos |
| **Governança** | Docs-as-Code — Oficial de Governança (`alumigest-doc-governor`) |

---

## 1. 🎯 Objetivo da Sprint 05

Validar os critérios de aceitação e a conformidade técnica das entregas da Sprint 05:
1. **Emissão e Exportação de PDF Comercial e WhatsApp (`US-10 #134`):** Geração de proposta comercial oficial timbrada em PDF A4 via OpenPDF, paginação automática, motor gráfico de miniaturas vetoriais e envio/cópia de resumo estruturado para o WhatsApp.
2. **Emissão de Ficha Técnica de Oficina sob Sigilo Comercial (`US-11 #135`):** Geração de romaneio de fabricação em PDF com cotas nominais milimétricas, motor de usinagem vetorial (`TechnicalMachiningResolver`), posicionamento dinâmico de furações e puxadores e supressão total de dados financeiros (zero menções a R$ ou valores de venda).
3. **Resolução de Inconsistências e Bugs de Produção:** Correção de codificação de filename RFC 5987 (`#343`), divisão de moldura de correr multifolhas (`#342`) e substituição de siglas por nomes completos no checklist (`#346`).
4. **Homologação Integrada da Release 1 (v1.0.0):** Testes ponta a ponta (QA-03 e QA-04), aprovação no SonarQube com cobertura $\ge 80\%$, zero bugs e zero vulnerabilidades.

---

## 2. 📋 Cenários de Teste e Evidências de Execução (BDD / Gherkin)

### TEA-S05-01: Emissão do PDF Comercial e Resumo WhatsApp (`US-10 #134`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Download do PDF Comercial com layout timbrado | Orçamento válido existente no sistema | Usuário clica em "Emitir PDF Comercial" na `BudgetDetailPage` | O backend gera o stream `application/pdf` em menos de 2s com cabeçalho institucional, tabela de itens e totais | `BudgetPdfServiceTest` ✅ Aprovado |
| 2 | Paginação automática com rodapé numerado | Orçamento com grande número de itens excedendo 1 página A4 | O PDF comercial é renderizado | O sistema divide as páginas automaticamente e exibe no rodapé "Página X de Y" com timestamp | `BudgetPdfDrawingHelperTest` ✅ Aprovado |
| 3 | Inclusão de miniatura gráfica vetorial da esquadria | Itens do orçamento contêm tipologias cadastradas | O PDF comercial é emitido | Cada item exibe sua miniatura proporcional desenhada vetorialmente com cor do perfil | `AwningWindowThumbnailStrategyTest` ✅ Aprovado |
| 4 | Cópia do resumo formatado para o WhatsApp | Usuário acessa os detalhes do orçamento | Clica em "Copiar Resumo Comercial" | O texto formatado com negritos (`*`), emojis e link é copiado para a área de transferência com toast de confirmação | `WhatsAppSummaryModal.test.tsx` ✅ Aprovado |
| 5 | Tratamento de dados opcionais de cliente | Cliente cadastrado sem CPF ou endereço completo | PDF comercial é emitido | Campos ausentes exibem "Não informado" sem falha de renderização ou quebra de layout | `BudgetPdfServiceTest` ✅ Aprovado |

---

### TEA-S05-02: Ficha Técnica de Oficina com Sigilo Comercial (`US-11 #135`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Supressão absoluta de preços e sigilo financeiro | Orçamento calculado com valores, margens e descontos | Usuário clica em "Via Técnica" (`GET /api/budgets/{id}/pdf/tecnico`) | O PDF gerado omite completamente cifrões (R$), preços unitários, descontos e totalizadores | `BudgetTechnicalPdfServiceTest` ✅ Aprovado |
| 2 | Renderização de cotas nominais de corte e folgas | Ficha técnica de oficina gerada | Cortador inspeciona a folha | O documento exibe Largura x Altura nominais em mm, perímetro linear de perfis e área de vidros | `TechnicalMachiningResolverTest` ✅ Aprovado |
| 3 | Desenho vetorial de usinagem e furações | Esquadria possui puxador e furações parametrizadas | Motor vetorial processa o item | Furações são desenhadas no montante oposto ao puxador conforme especificação técnica | `BudgetPdfDrawingHelperTest` ✅ Aprovado |
| 4 | Checklist de bancada com descrições por extenso | Montador recebe a ficha de produção | Avalia os itens de conferência | O checklist exibe etapas com nomes completos ("Corte de Perfis", "Usinagem de Fechadura") sem siglas ambíguas | `RTE-QA-04` ✅ Aprovado |
| 5 | Divisão de moldura para esquadrias de correr multifolhas | Tipologia de correr com 3 ou mais folhas | PDF técnico é gerado | A representação técnica divide as molduras em folhas móveis e fixas corretamente | `SlidingThumbnailStrategyTest` ✅ Aprovado |

---

### TEA-S05-03: Homologação Integrada e QA E2E (`QA-03` e `QA-04`)

| # | Cenário | Dado | Quando | Então | Evidência / Status |
|---|---|---|---|---|---|
| 1 | Jornada Comercial Completa (Insumo ➔ PDF Comercial) | Base de dados zerada ou populada com catálogo | Executada suíte automatizada `qa03_e2e_journey.cy.ts` | Cria insumo, produto, orçamento com desconto comercial e valida emissão do PDF e WhatsApp | Cypress QA-03 ✅ Aprovado |
| 2 | Homologação de Bancada da Oficina (QA-04) | Ficha técnica gerada para tipologias variadas | Executado roteiro manual `RTM-QA-04` e testes automatizados | Todos os 10 modelos canônicos geram PDFs técnicos válidos com sigilo preservado | Cypress QA-04 ✅ Aprovado |

---

## 3. 🛡️ Resumo da Qualidade e Aprovação Final

- **Total de Cenários Avaliados:** 12 cenários formais
- **Aprovados:** 12 (100%)
- **Reprovados / Bloqueantes:** 0 (0%)
- **Parecer da Governança:** ✅ **APROVADO PARA RELEASE v1.0.0 E MERGE NA DEVELOP**
