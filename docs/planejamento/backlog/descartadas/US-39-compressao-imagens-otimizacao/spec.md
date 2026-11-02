# Especificação Funcional: US-39 — Comprimir Imagens no Dispositivo e Otimizar Performance Web

**Identificador**: `US-39`  
**Issue GitHub**: [#164](https://github.com/ADS-IFPB-SR/alumigest/issues/164)  
**Status**: 🔵 No Backlog (Aguardando Sprint Planning)  
**Diretriz de Idioma**: Conforme `PAD-Padroes_de_Codigo.md`, variáveis, atributos Java, colunas SQL, DTOs e enums são em **inglês técnico** (`camelCase`/`snake_case`), e a tradução para `pt-BR` ocorre na camada de UI do Frontend.

---

## 🎯 Objetivo de Negócio

Como usuário móvel da Alumiportas utilizando conexões de dados 3G/4G em campo, desejo que fotos capturadas pela câmera sejam automaticamente compactadas e convertidas para WebP no navegador do celular antes do upload, e que a aplicação web utilize estratégias de divisão de código (*code-splitting*) e compressão Gzip no backend, reduzindo o consumo do plano de dados móveis e acelerando o tempo de resposta em até 80%.

---

## 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Compressão Client-Side e Conversão para WebP via Canvas**
  - **Dado que** o instalador tira uma foto em alta resolução na obra (arquivo original de ~8 MB em JPEG/PNG),
  - **Quando** o arquivo é selecionado no modal de upload da O.S.,
  - **Então** o utilitário `useImageCompressor` intercepta o arquivo e renderiza em um Canvas HTML5 fora da tela,
  - **E** redimensiona a imagem para no máximo 1600px na maior dimensão mantendo a proporção de aspecto,
  - **E** exporta o blob em formato `image/webp` com qualidade 0.82, resultando em um payload inferior a 400 KB (redução $\ge 90\%$).

- [ ] **Cenário 2: Indicador de Economia de Dados ao Usuário**
  - **Dado que** a compressão da imagem foi concluída com sucesso no dispositivo,
  - **Quando** a pré-visualização é renderizada,
  - **Então** o sistema exibe um badge discreto: "Otimizado: de 8.2 MB para 340 KB (-95%)",
  - **E** o upload é finalizado em menos de 2 segundos mesmo em conexão móvel moderada.

- [ ] **Cenário 3: Code-Splitting das Rotas do Frontend com React.lazy**
  - **Dado que** o usuário acessa apenas as rotas de instalação de campo (`/instalacoes`),
  - **Quando** o bundle inicial da aplicação é carregado,
  - **Então** o navegador faz download estritamente do chunk essencial (`vendor` e módulo de instalação),
  - **E** os módulos administrativos pesados (Financeiro, Orçamentos, Relatórios) só são baixados sob demanda quando as respectivas rotas forem visitadas,
  - **E** o tempo de First Contentful Paint (FCP) permanece abaixo de 1.5s em redes 4G.

- [ ] **Cenário 4: Compressão Gzip e Cache HTTP no Spring Boot**
  - **Dado que** o backend recebe requisições com header `Accept-Encoding: gzip, deflate`,
  - **Quando** responde com payloads JSON ou assets estáticos,
  - **Então** o servidor comprime a resposta com Gzip (nível 6),
  - **E** inclui cabeçalhos de cache `Cache-Control: max-age=31536000, immutable` para assets versionados por hash.

- [ ] **Cenário 5: Fallback Gracioso para Navegadores sem Suporte a WebP**
  - **Dado que** o navegador legado não suporta exportação nativa para WebP,
  - **Quando** o compressor processa a imagem,
  - **Então** detecta a incompatibilidade e realiza a compressão em JPEG padrão com qualidade 0.80, mantendo a integridade do fluxo.

---

## 📋 Regras de Negócio e Restrições

- **RN-01 (Dimensão Máxima):** Nenhuma foto de obra enviada ao servidor pode exceder a dimensão de 1600px de largura ou altura.
- **RN-02 (Economia de Banda e Bateria):** A compressão deve ser assíncrona com `requestAnimationFrame` ou Web Worker leve para evitar travamento da interface durante o processamento.
- **RN-03 (Diretriz de Idioma em Variáveis):** Hooks e utilitários em inglês: `useImageCompressor`, `maxDimension`, `compressionQuality`, `compressedBlob`, `originalSizeInBytes`, `compressedSizeInBytes`.

---

## 🔌 Especificação Técnica

### Backend (Spring Boot 3 / application.yml)
- **Configurações:**
  ```yaml
  server:
    compression:
      enabled: true
      mime-types: text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json,application/xml
      min-response-size: 1024
  ```

### Frontend (React 19 / Vite / React.lazy / Tailwind)
- **Hooks & Otimizações:**
  - `useImageCompressor.ts` (conversão Canvas para WebP com redimensionamento proporcional)
  - `AppRoutes.tsx` com `React.lazy()` e `Suspense` em todas as rotas secundárias
  - `ImagePreviewWithCompressionBadge.tsx`

---

## 🛡️ Definition of Done (DoD)

- [ ] Teste unitário de `useImageCompressor` validando que imagens grandes são reduzidas para $\le 1600\text{px}$ e formato WebP.
- [ ] Verificação de bundle size no Vite (`npm run build`) comprovando que nenhum chunk inicial excede 350 KB gzip.
- [ ] Auditoria Lighthouse atingindo Performance $\ge 90$ no mobile.
- [ ] Cobertura de testes $\ge 80\%$ e SonarQube Quality Gate verde.

---

## 📋 Sub-Tarefas / Issues Vinculadas (6 issues)

| Sub-Task | Tarefa / Descrição | Status |
|---|---|:---:|
| [US-39.1](issues/US-39.1-criar-utilitario-useimagecompressor-redimensi/issue.md) | Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts` | 🔲 No Backlog |
| [US-39.2](issues/US-39.2-integrar-compressao-no-componente-de-captura-/issue.md) | Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`) | 🔲 No Backlog |
| [US-39.3](issues/US-39.3-habilitar-compressao-gzip-e-cache-de-assets-n/issue.md) | Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`) | 🔲 No Backlog |
| [US-39.4](issues/US-39.4-configurar-code-splitting-com-react-lazy-nas-/issue.md) | Configurar code-splitting com `React.lazy` nas rotas do React Router | 🔲 No Backlog |
| [US-39.5](issues/US-39.5-documentar-endpoints-de-sincronizacao-no-open/issue.md) | Documentar endpoints de sincronização no OpenAPI/Swagger | 🔲 No Backlog |
| [US-39.6](issues/US-39.6-executar-validacao-dos-cenarios-de-teste-do-q/issue.md) | Executar validação dos cenários de teste da release | 🔲 No Backlog |

---

## 🔗 Referências & Governança
- 🏛️ **Constituição do Projeto**: [../../constitution.md](../../constitution.md)
- 🗺️ **Tabela De-Para Oficial**: [../../de-para-user-stories.md](../../de-para-user-stories.md)

---

**Branch:** `feat/us-39-compressao-imagens-otimizacao`
