# 📋 Especificação Funcional — Sprint 02

> **Sprint:** 02 — Catálogo de Materiais, Insumos e Fichas Técnicas de Produtos  
> **Período:** 04/08/2026 a 17/08/2026  
> **Release:** Release 1 (v1.0.0) — Fundação & Cadastros  
> **Status:** 🟢 Concluída (Baseline `B-ALG-v0.2.0-S02-01`)  
> **Responsáveis:** Italo Santos (Scrum Master), José Guylherme (PO), Equipe AlumiGest  

---

## 1. 🎯 Objetivo da Sprint 2

Implementar o **Catálogo Universal de Materiais** (Vidros, Perfis de Alumínio, Ferragens e Películas) e a **Estrutura de Produtos e Modelos de Esquadrias**, permitindo o cadastro, parametrização de preços e fichas técnicas com interface PWA em abas.

---

## 2. 👥 Histórias de Usuário

### EP-02: Catálogo de Materiais (Issue Pai #4)
* **US-013 (#12):** CRUD de Vidros (2mm a 10mm, cores, preço base por $m^2$).
* **US-014 (#13):** CRUD de Perfis de Alumínio (linhas comerciais, barras de 3m e 6m, NCM).
* **US-015 (#14):** CRUD de Películas (Fumê, Jateada, Leitosa, Espelhada por $m^2$).
* **US-016 (#15):** CRUD de Ferragens e Acessórios (unidade, par ou metro).
* **US-017 (#16):** Interface PWA com abas, busca textual e filtros de ativação.
* **US-018 (#17):** Testes Automatizados e Cobertura QA (48 testes unitários).

### EP-03: Fichas Técnicas de Produtos (Issue #31)
* **US-019 (#33, #39):** Cadastro de Categorias e Modelos de Produtos (`tb_products`).

---

## 3. 🧪 Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Cadastro de Vidro Temperado
  Dado que o usuário está na aba "Vidros" do Catálogo
  Quando preenche nome "Vidro Temperado Incolor 8mm", espessura 8mm e preço R$ 140,00/m²
  Então o material deve ser persistido com UUID e status ativo

Cenário: Cadastro de Perfil de Alumínio com Linha e Barra
  Dado que o usuário está na aba "Perfis de Alumínio"
  Quando cadastra perfil "S83" da linha "Rometal" barra 6m e preço R$ 45,00/m
  Então o perfil é cadastrado com sucesso
```

---

*Especificação homologada na Baseline da Sprint 2.*
