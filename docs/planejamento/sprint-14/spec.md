# Feature Specification: Sprint 14 — Modo PWA/Offline para Instaladores e Ajustes de Performance

**Feature**: `011-pwa-offline-performance`
**Release**: Release 3 (v3.0.0) — Financeiro, Instalações & Gestão
**Created**: 2026-08-27
**Status**: APPROVED (Esclarecimentos Resolvidos)

---

## 1. Visão Geral & Contexto de Negócio

Muitas obras residenciais e comerciais atendidas pela Alumiportas ficam em regiões com sinal de internet móvel (4G/5G) instável ou sem cobertura. Da mesma forma, no galpão de produção, o sinal Wi-Fi pode ter pontos cegos.

Para garantir que instaladores de campo e operadores de fábrica continuem trabalhando sem interrupções:
1. **Instalação PWA (Progressive Web App)**: O sistema pode ser adicionado à tela inicial de smartphones Android e iOS como um aplicativo nativo, sem necessidade de publicação em lojas de apps.
2. **Operação Offline Resiliente**: Consulta de Ordens de Serviço (OS), Ordens de Produção (OPs do dia) e listas de corte salvas localmente via IndexedDB.
3. **Fila de Sincronização em Segundo Plano (Offline Queue)**: Mudanças de status e fotos tiradas na obra são gravadas localmente e sincronizadas automaticamente com o servidor assim que a conexão for restabelecida (com botão manual "Sincronizar Agora").
4. **Compressão Inteligente de Imagens no Dispositivo**: Redução do peso das fotos capturadas na câmera para ~300KB (máx 1600px) antes do envio, poupando pacote de dados 4G.
5. **Otimização de Performance**: Lazy loading de módulos, cache com Service Workers e compressão Gzip/Brotli.

---

## 2. Histórias de Usuário (User Stories)

### User Story 1 (P1) — Instalação PWA e Acesso Offline a OPs e OS 🎯 MVP

**Como** Instalador de Campo e Operador da Fábrica,
**Quero** instalar o AlumiGest no meu smartphone e abrir minhas OSs mesmo sem sinal de internet,
**Para que** eu veja o endereço da obra, especificações das esquadrias e medidas sem depender de conexão.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Acesso a dados de instalação sem internet
  Dado que o instalador abriu suas OSs agendadas enquanto estava online
  Quando ele chega na obra sem conexão de internet e abre o app
  Então o sistema exibe os detalhes da OS e endereço a partir do cache local
  E mostra um banner discreto "Modo Offline ativo"
```

---

### User Story 2 (P1) — Fila de Sincronização Automática (Offline Queue) 🎯 MVP

**Como** Instalador na Obra,
**Quero** concluir a OS e anexar fotos mesmo desconectado,
**Para que** o sistema guarde as informações e envie automaticamente ao servidor quando eu voltar a ter internet.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Conclusão offline e sincronização automática
  Dado que o app está em modo offline
  Quando o instalador anexa fotos e toca em "Concluir Instalação"
  Então a ação é salva na fila local com status "Pendente de Sincronização (1 item)"
  E assim que o celular detecta rede Wi-Fi/4G, a sincronização é executada em segundo plano
  E o status da OS no servidor é atualizado com sucesso
```

---

### User Story 3 (P2) — Compressão no Dispositivo e Alta Performance Web

**Como** Usuário do Sistema,
**Quero** que as fotos carreguem rápido e as telas abram instantaneamente,
**Para que** a experiência de uso seja fluida tanto no computador do escritório quanto no celular.

#### Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Compressão de foto na câmera do celular
  Dado que o instalador tira uma foto de 6MB com a câmera
  Quando a imagem é selecionada no app
  Então o frontend comprime a foto para ~300KB antes de enfileirar para upload
  E a qualidade visual dos detalhes da esquadria é preservada
```

---

## 3. Requisitos Funcionais

1. **RF01 - Manifesto PWA e Service Worker**: Configuração de `manifest.webmanifest`, ícones responsivos, splash screen e cache estático via Workbox.
2. **RF02 - Armazenamento Local com IndexedDB**: Persistência de OPs do dia, OSs agendadas e listas de corte no dispositivo via Dexie.js.
3. **RF03 - Fila de Sincronização (Sync Queue)**: Enfileiramento de requisições POST/PATCH com retry exponencial e botão manual "Sincronizar Agora".
4. **RF04 - Banner de Status de Rede**: Indicador visual no cabeçalho: `Online (Verde)`, `Offline (Amarelo)` e `Sincronizando (Azul)`.
5. **RF05 - Compressão de Imagens no Cliente**: Redimensionamento via Canvas para máx 1600px e compressão WebP/JPEG (~300KB).

---

## 4. Decisões dos Esclarecimentos (Clarifications Resolved)

- **Q1 (Sincronização Offline)**: Sincronização automática em segundo plano ao detectar rede + botão manual "Sincronizar Agora".
- **Q2 (Compressão de Fotos)**: Compressão automática no navegador para ~300KB (máx 1600px).
- **Q3 (Escopo Offline)**: Foco exclusivo nas telas operacionais (OS de Instalação, OPs do dia e Lista de Corte).