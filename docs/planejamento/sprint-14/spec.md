# Feature Specification: Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

**Feature**: `011-pwa-offline-performance`  
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão  
**Created**: 2026-08-27  
**Updated**: 2026-09-23  
**Status**: APPROVED (Esclarecimentos Resolvidos — Padrão BDD Gherkin)  

---

## 1. Visão Geral & Contexto de Negócio

Muitas obras residenciais e comerciais atendidas pela Alumiportas ficam em regiões com sinal de internet móvel (4G/5G) instável ou sem cobertura. Da mesma forma, no galpão de produção, o sinal Wi-Fi pode ter pontos cegos.

Para garantir que instaladores de campo e operadores de fábrica continuem trabalhando sem interrupções:
1. **Instalação PWA (Progressive Web App)**: O sistema pode ser adicionado à tela inicial de smartphones Android e iOS como um aplicativo nativo, sem necessidade de publicação em lojas de apps.
2. **Operação Offline Resiliente**: Consulta de Ordens de Serviço (OS), Pedidos e listas de corte salvas localmente via IndexedDB.
3. **Fila de Sincronização em Segundo Plano (Offline Queue)**: Mudanças de status e fotos tiradas na obra são gravadas localmente e sincronizadas automaticamente com o servidor assim que a conexão for restabelecida (com botão manual "Sincronizar Agora").
4. **Compressão Inteligente de Imagens no Dispositivo**: Redução do peso das fotos capturadas na câmera para ~300KB (máx 1600px) antes do envio, poupando pacote de dados 4G.
5. **Otimização de Performance**: Lazy loading de módulos, cache com Service Workers e compressão Gzip/Brotli.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-37: Instalar PWA e Consultar Pedidos e OS Offline via IndexedDB

#### 🎯 Objetivo de Negócio
> **Como** instalador de campo e operador da Alumiportas,  
> **Desejo** instalar o AlumiGest como um Progressive Web App (PWA) na tela inicial do meu smartphone e consultar meus agendamentos de OS e detalhes das esquadrias mesmo sem conexão com a internet,  
> **Para que** eu possa trabalhar continuamente nas obras dos clientes em locais remotos ou com sinal instável sem interrupção de produtividade.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Instalação do PWA na tela inicial do dispositivo móvel**
  - **Dado que** o usuário acessa o sistema através do navegador Chrome/Safari em um smartphone
  - **Quando** o manifesto PWA for reconhecido pelo navegador
  - **Então** o sistema exibe o prompt nativo de instalação "Adicionar AlumiGest à tela inicial"
  - **E** ao confirmar, o aplicativo é instalado com ícone oficial, splash screen estilizada e execução em modo standalone (sem barra de navegação de navegador).

- [ ] **Cenário 2: Consulta offline de Ordens de Serviço e dados de instalação**
  - **Dado que** o instalador está em uma obra sem nenhuma conexão de dados móveis ou Wi-Fi
  - **Quando** ele abre o aplicativo e navega até a lista de suas Ordens de Serviço do dia
  - **Então** o sistema lê os dados persistidos localmente no IndexedDB via Dexie.js
  - **E** exibe os endereços, clientes, telefones e esquadrias a instalar sem erros ou travamentos.

- [ ] **Cenário 3: Exibição do Banner de Conectividade em tempo real**
  - **Dado que** o status de rede do smartphone muda de online para offline
  - **Quando** o hook `useNetworkStatus` detectar o evento de perda de sinal
  - **Então** o componente `NetworkStatusBanner` exibe um banner amarelo no topo: "Modo Offline — Suas alterações serão salvas localmente e sincronizadas quando a conexão retornar".

- [ ] **Cenário 4: Pré-carregamento automático do pacote operacional ao conectar-se online**
  - **Dado que** o instalador abre o app com conexão de internet ativa pela manhã
  - **Quando** ele se autentica no sistema
  - **Então** o serviço dispara em background `GET /api/sync/field-package`
  - **E** armazena todas as OSs agendadas para sua equipe na base local IndexedDB, preparando o dispositivo para uso desconectado.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Segregação de Dados Locais)**: A base local IndexedDB armazena apenas os agendamentos da equipe logada e dados de referência necessários, otimizando o armazenamento do celular.
- **RN-02 (Padrão PWA Standalone)**: O arquivo de manifesto (`manifest.webmanifest`) deve conter configurações estritas de `display: standalone`, `theme_color: #1e3a8a` e ícones responsivos em 192x192 e 512x512 pixels.
- **RN-03 (Resiliência do Service Worker)**: Arquivos estáticos (HTML, JS, CSS, fontes) são armazenados em cache via Workbox com estratégia *Stale-While-Revalidate*, garantindo inicialização imediata.

#### 🔌 Especificação Técnica
- **Backend**:
  - `SyncController`: Endpoint `GET /api/sync/field-package` retornando o pacote diário compactado.
  - `SyncService.obterPacoteCampo(Long teamId)`: Monta lista de OSs, dados de clientes e especificações.
- **Frontend**:
  - `vite-plugin-pwa`: Configuração no `vite.config.ts`.
  - `offlineDb.ts`: Definição de tabelas no IndexedDB com Dexie.js (`serviceOrders`, `syncQueue`).
  - `useNetworkStatus.ts`: Hook escutando eventos nativos `online` e `offline`.
  - `NetworkStatusBanner.tsx`: Componente de sinalização visual.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-37.1**: Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto, ícones e splash screen
- **US-37.2**: Criar schema do banco local IndexedDB com Dexie em `frontend/src/features/pwa/db/offlineDb.ts`
- **US-37.3**: Criar custom hook `useNetworkStatus` para monitorar conectividade em `frontend/src/features/pwa/hooks/useNetworkStatus.ts`
- **US-37.4**: Criar componente `NetworkStatusBanner` no layout principal em `frontend/src/features/pwa/components/NetworkStatusBanner.tsx`
- **US-37.5**: Criar package `br.edu.ifpb.alumigest.sync` no backend
- **US-37.6**: Criar record `FieldPackageResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/FieldPackageResponse.java`
- **US-37.7**: Implementar serviço `SyncService.obterPacoteCampo(Long teamId)` agregando dados de campo em `backend/src/main/java/br/edu/ifpb/alumigest/sync/service/SyncService.java`
- **US-37.8**: Criar endpoint `GET /api/sync/field-package` no `SyncController` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/controller/SyncController.java`
- **US-37.9**: Implementar rotina de pré-carregamento no Dexie.js ao abrir o app online

---

### 📌 US-38: Sincronizar Fila de Alterações e Fotos em Segundo Plano

#### 🎯 Objetivo de Negócio
> **Como** instalador de campo da Alumiportas,  
> **Desejo** que todas as ações realizadas offline (mudanças de status de atendimento, registros de recebimento e fotos de vistoria) sejam enfileiradas localmente e transmitidas automaticamente ao servidor assim que houver sinal de rede,  
> **Para que** eu não perca nenhum dado registrado na obra e a central de atendimento seja atualizada sem esforço manual.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Enfileiramento de ações operacionais em modo offline**
  - **Dado que** o aplicativo está operando sem sinal de internet
  - **Quando** o instalador clica em "Iniciar Deslocamento", anexa uma foto ou conclui a OS
  - **Então** o sistema grava a ação na tabela local `syncQueue` do IndexedDB com timestamp do momento da operação
  - **E** a interface atualiza o estado visual na tela imediatamente como se a operação tivesse sido concluída
  - **E** exibe um contador de pendências no badge de sincronização (ex: "3 ações pendentes").

- [ ] **Cenário 2: Sincronização automática em lote ao restabelecer a conexão**
  - **Dado que** existem 3 ações pendentes na fila local e a conexão à internet é restabelecida
  - **Quando** o navegador dispara o evento `online`
  - **Então** o hook `useOfflineQueue` inicia o envio do lote via `POST /api/sync/batch`
  - **E** o backend processa sequencialmente as operações em transação controlada
  - **E** ao obter sucesso, o sistema limpa os itens sincronizados do IndexedDB
  - **E** o banner de status exibe toast verde: "Dados sincronizados com sucesso!".

- [ ] **Cenário 3: Acionamento manual via Gaveta de Sincronização (Drawer)**
  - **Dado que** o instalador deseja forçar o envio imediato das fotos e status
  - **Quando** ele clica no ícone de sincronização no topo e aciona "Sincronizar Agora" no `SyncQueueDrawer`
  - **Então** o sistema processa a fila com spinner de carregamento e lista o status de cada item transmitido.

- [ ] **Cenário 4: Resiliência contra falhas parciais e retry com backoff exponencial**
  - **Dado que** a transmissão falhou por instabilidade temporária no sinal da operadora durante o envio
  - **Quando** a requisição retornar erro de rede
  - **Então** o sistema mantém os dados intactos na fila local
  - **E** agenda nova tentativa com recuo exponencial sem perda de fotos ou dados cadastrados.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Ordem Cronológica Estrita - FIFO)**: As operações na fila de sincronização devem ser executadas e processadas na mesma ordem temporal em que foram geradas no cliente, preservando a máquina de estados da OS.
- **RN-02 (Idempotência no Backend)**: O endpoint `POST /api/sync/batch` deve verificar IDs de correlação de cliente para não duplicar fotos ou atualizações já aplicadas.
- **RN-03 (Tolerância a Desconexões)**: Uma perda de conexão durante a sincronização não corrompe a fila; apenas itens confirmados pelo servidor são excluídos da base local.

#### 🔌 Especificação Técnica
- **Backend**:
  - `SyncController`: Endpoint `POST /api/sync/batch`.
  - `SyncBatchRequest` e `SyncBatchResponse`: DTOs estruturados para transmissão de múltiplos eventos e arquivos multipart em base64.
  - Testes com JUnit 5 validando processamento ordenado e tratamento de erros.
- **Frontend**:
  - `useOfflineQueue.ts`: Gerenciamento da fila com Dexie e retry automático.
  - `SyncQueueDrawer.tsx`: Interface visual de monitoramento da fila de sincronização.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-38.1**: Criar record `SyncBatchRequest` e `SyncBatchResponse` em `backend/src/main/java/br/edu/ifpb/alumigest/sync/dto/`
- **US-38.2**: Implementar método `processarLote(SyncBatchRequest request)` no `SyncService`
- **US-38.3**: Criar endpoint `POST /api/sync/batch` no `SyncController`
- **US-38.4**: Criar testes unitários do `SyncServiceTest`
- **US-38.5**: Criar custom hook `useOfflineQueue` com processamento em segundo plano e retry automático
- **US-38.6**: Criar componente `SyncQueueDrawer` com lista de ações pendentes e botão "Sincronizar Agora"

---

### 📌 US-39: Comprimir Imagens no Dispositivo e Otimizar Performance Web

#### 🎯 Objetivo de Negócio
> **Como** usuário móvel e administrador de infraestrutura da Alumiportas,  
> **Desejo** que as fotografias capturadas em campo sejam compactadas automaticamente no dispositivo antes da transmissão e que o sistema carregue de forma ultrarrápida via lazy loading e cache inteligente,  
> **Para que** a economia do plano de dados móveis seja maximizada, a latência de upload em redes lentas seja reduzida e a aplicação proporcione uma experiência ágil e responsiva.

#### 🧪 Critérios de Aceitação (Dado que / Quando / Então)

- [ ] **Cenário 1: Compressão automática de imagem via HTML5 Canvas no cliente**
  - **Dado que** o instalador tira uma foto de alta resolução com a câmera do celular resultando em um arquivo de 8 MB (ex: 4000x3000px)
  - **Quando** o hook `useImageCompressor` intercepta o arquivo antes de salvá-lo na fila ou enviá-lo
  - **Então** o sistema redimensiona a imagem para no máximo 1600px na maior dimensão mantendo a proporção de aspecto
  - **E** converte para formato WebP ou JPEG com qualidade 80%
  - **E** o arquivo resultante passa a ter peso aproximado inferior a 350 KB mantendo excelente legibilidade das esquadrias instaladas.

- [ ] **Cenário 2: Transmissão rápida em redes móveis de baixa velocidade**
  - **Dado que** uma foto comprimida de ~300 KB está pronta para envio sob rede 3G ou 4G oscilante
  - **Quando** a sincronização for disparada
  - **Então** o upload é concluído em poucos segundos, consumindo menos de 5% da franquia de dados que seria consumida pela foto bruta original.

- [ ] **Cenário 3: Otimização de carregamento de rotas com Lazy Loading (Code Splitting)**
  - **Dado que** o usuário acessa apenas os módulos de atendimento em campo
  - **Quando** a aplicação é carregada no navegador
  - **Então** módulos administrativos pesados (DRE, Relatórios, Configurações de Fábrica) não são baixados no bundle inicial
  - **E** o carregamento da tela inicial ocorre em menos de 2 segundos.

- [ ] **Cenário 4: Compressão Gzip/Brotli e cache estático no Backend**
  - **Dado que** o navegador solicita assets estáticos da aplicação
  - **Quando** o servidor Spring Boot responde
  - **Então** os cabeçalhos HTTP incluem `Content-Encoding: gzip` e políticas de cache agressivas (`Cache-Control: max-age=31536000, immutable`) para bundles versionados.

#### 📋 Regras de Negócio e Restrições
- **RN-01 (Redimensionamento Obrigatório no Cliente)**: O cliente nunca deve transmitir fotos brutas sem compactação prévia, prevenindo esgotamento de memória e timeouts em redes 4G.
- **RN-02 (Teto Máximo Dimensional)**: Limite de 1600 pixels de largura ou altura máxima com preservação da fidelidade visual dos acabamentos de alumínio e vidro.
- **RN-03 (Fallback Automático de Formato)**: Caso o navegador do celular não suporte codificação nativa WebP no Canvas, o compressor reverte automaticamente para JPEG com compressão 0.8.

#### 🔌 Especificação Técnica
- **Frontend**:
  - `useImageCompressor.ts`: Hook utilitário utilizando HTMLCanvasElement e `toBlob()`.
  - Configuração do React Router com `React.lazy()` e `Suspense`.
- **Backend**:
  - Habilitação de compressão HTTP em `application.yml`: `server.compression.enabled=true`, `server.compression.mime-types=text/html,text/xml,text/plain,text/css,text/javascript,application/javascript,application/json`.

#### 🛠️ Sub-tarefas Técnicas (Sub-issues):
- **US-39.1**: Criar utilitário `useImageCompressor` redimensionando para máx 1600px via Canvas em `frontend/src/features/pwa/hooks/useImageCompressor.ts`
- **US-39.2**: Integrar compressão no componente de captura de fotos da OS (`FieldExecutionModal.tsx`)
- **US-39.3**: Habilitar compressão Gzip e cache de assets no Spring Boot (`application.yml`)
- **US-39.4**: Configurar code-splitting com `React.lazy` nas rotas do React Router
- **US-39.5**: Documentar endpoints de sincronização no OpenAPI/Swagger
- **US-39.6**: Executar validação dos cenários de teste do `quickstart.md` da Sprint 14

---

## 3. Matriz de Rastreabilidade

| Requisito | User Story | Sub-tarefa Backend | Sub-tarefa Frontend | Testes Automatizados |
| :--- | :--- | :--- | :--- | :--- |
| Instalação PWA e Modo Offline | **US-37** | US-37.5 a US-37.8 | US-37.1 a US-37.4, US-37.9 | `offlineDb.test.ts`, `useNetworkStatus.test.ts` |
| Fila de Sincronização | **US-38** | US-38.1 a US-38.3 | US-38.5, US-38.6 | US-38.4 (`SyncServiceTest`), `useOfflineQueue.test.ts` |
| Compressão e Otimização Web | **US-39** | US-39.3, US-39.5 | US-39.1, US-39.2, US-39.4 | `useImageCompressor.test.ts` |