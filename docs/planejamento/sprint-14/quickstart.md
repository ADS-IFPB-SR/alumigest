# Quickstart Validation Guide: Sprint 14 — PWA, Modo Offline e Performance

**Feature**: `011-pwa-offline-performance`
**Date**: 2026-08-27

## Prerequisites

- Frontend rodando com Vite
- Navegador com DevTools (aba Application / Network)

## Validation Scenarios

### Cenário 1: Instalação do PWA

1. Abrir o app no Chrome / Safari Mobile
2. Verificar ícone de instalação "Adicionar à tela de início"
3. Confirmar que o app abre em tela cheia (standalone) com logo da Alumiportas

### Cenário 2: Operação Offline e Sincronização

1. Abrir lista de Ordens de Serviço (OS) com conexão ativa
2. Colocar o navegador no modo **Offline** no DevTools
3. Navegar para uma OS e acionar "Concluir Instalação"
4. Verificar banner amarelo: *"Modo Offline — 1 ação na fila"*
5. Retornar para **Online** no DevTools
6. Verificar sincronização automática e badge verde *"Online / Sincronizado"*

### Cenário 3: Compressão de Imagem no Cliente

1. Fazer upload de uma imagem de teste de 6MB
2. Constatar que a requisição de upload envia arquivo comprimido com ~300KB