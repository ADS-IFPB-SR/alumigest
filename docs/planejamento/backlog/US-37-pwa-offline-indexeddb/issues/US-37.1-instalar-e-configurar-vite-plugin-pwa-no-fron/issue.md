# [US-37.1] Configurar `vite-plugin-pwa` no `frontend/vite.config.ts` com manifesto standalone, ícones e atalho direto

## 📌 Metadados da Issue

- **ID da Tarefa**: `US-37.1`
- **US Pai**: `US-37: Instalar PWA Desktop/Mobile e Elaborar Rascunhos de Orçamentos Offline`
- **Release**: Release 3 (v3.0.0) — Comercial, Financeiro & Sustentação
- **Fase**: `Phase 1: Setup & Foundational`
- **User Story**: Não aplicável (Infraestrutura PWA)
- **Sub-área**: `Frontend`
- **Execução Paralela**: ❌ Não (Base para as demais issues)
- **Arquivo / Alvo Principal**: `frontend/vite.config.ts`, `frontend/public/manifest.json`
- **Labels Sugeridas**: `release-3`, `pwa`, `offline`, `frontend`, `vite`, `typescript`

---

## 🎯 Objetivo & Descrição

Instalar e configurar `vite-plugin-pwa` no `frontend/vite.config.ts` para permitir que o AlumiGest seja instalado com 1 clique diretamente na Área de Trabalho (Windows) ou Tela de Início (Android/iOS) como um aplicativo nativo (`display: standalone`), permitindo o acesso imediato sem necessidade de abrir navegador ou digitar URL.

### Contexto da Tarefa
- Configurar o manifesto com nome "AlumiGest - Gestão de Esquadrias", tema visual, ícones padronizados (192x192, 512x512 e maskable).
- Configurar estratégia Workbox para cache permanente dos assets estáticos (HTML, scripts, estilos, logos e ícones SVG de esquadrias).

---

## 🛠️ Checklist de Implementação

- [ ] Instalar o pacote `vite-plugin-pwa` em `frontend/package.json` caso não esteja presente.
- [ ] Configurar o plugin `VitePWA` no `frontend/vite.config.ts` com:
  - `registerType: 'autoUpdate'`
  - `manifest`: name, short_name, description, theme_color, background_color, display: "standalone", start_url: "/"
  - `workbox`: runtimeCaching para fontes e recursos estáticos
- [ ] Criar/validar ícones em `frontend/public/icons/` com dimensões adequadas para instalabilidade.
- [ ] Testar instalação local em ambiente de desenvolvimento e build via Chrome DevTools (Application > Manifest).

---

## ✅ Critérios de Aceitação

1. O navegador deve exibir o ícone de instalação do aplicativo na barra de endereços (Desktop) ou prompt de instalação (Mobile).
2. O aplicativo deve abrir em janela isolada de browser (sem barra de URL, botões de navegação padrão de browser ou abas).
3. `npm run build` deve passar com 0 erros de compilação ou tipagem.

---

## 🔗 Referências & Documentos Relacionados

- 📑 **Especificação Funcional**: [spec.md](../../spec.md)
