# 📋 Especificação Funcional — Sprint 02

> **Sprint:** 02 — Catálogo Universal de Materiais e Fichas Técnicas  
> **Período:** 04/08/2026 a 17/08/2026  
> **Release:** Release 1 (v1.0.0) — Fundação & Cadastros  
> **Status:** 🟢 Concluída (Baseline `B-ALG-v0.2.0-S02-01`)  
> **Responsáveis:** José Guylherme (PO), Nichollas Cavalcante (SM), Equipe AlumiGest  

---

## 1. 🎯 Objetivo da Sprint 2

Implementar o módulo completo de **Catálogo de Materiais Genérico** (vidros com cálculo por $m^2$, perfis de alumínio em barras de 3m/6m com linhas comerciais, películas e acabamentos por $m^2$, ferragens e acessórios unitários/pares/metro), suas migrations Flyway V1-V3, interface PWA com navegação em abas e início da modelagem de **Fichas Técnicas de Produtos**.

---

## 2. 👥 Histórias de Usuário (User Stories)

### 📌 US-02: Gerenciar Catálogo de Materiais Genérico (Vidros, Perfis, Películas e Ferragens)
- **Como** gestor da vidraçaria,
- **Quero** cadastrar, editar, listar e remover materiais com preços por unidade de medida,
- **Para que** eu tenha o catálogo de insumos atualizado para a composição de orçamentos.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-02.1**: Migrations Flyway V1-V3 e Entidades Base de Materiais (#11)
- **US-02.2**: Backend: CRUD de Vidros (2mm a 10mm) calculados por $m^2$ (#12)
- **US-02.3**: Backend: CRUD de Perfis de Alumínio (Barras 3m/6m, Linhas) (#13)
- **US-02.4**: Backend: CRUD de Películas e Acabamentos por $m^2$ (#14)
- **US-02.5**: Backend: CRUD de Ferragens e Acessórios (UN/PAR/METRO) (#15)
- **US-02.6**: Frontend: Interface PWA em Abas para Gestão de Materiais (#16)
- **US-02.7**: QA: Suíte de 48 Testes Unitários e 14 Cenários TEA (#17)

---

### 📌 US-03: Gerenciar Produtos e Fichas Técnicas de Esquadrias
- **Como** gestor da vidraçaria,
- **Quero** cadastrar produtos (esquadrias) com suas categorias e fichas técnicas base,
- **Para que** cada produto tenha uma composição clara de insumos.

#### Sub-tarefas Técnicas (Sub-issues):
- **US-03.1**: Backend: Cadastro de Categorias e Modelos de Produtos (`tb_products`) (#33 / #39)

---

## 3. 🧪 Cenários de Aceitação (BDD / Gherkin)

```gherkin
Cenário: Cadastro e Cálculo de Preço de Vidro
  Dado que o gestor cadastra um vidro "Temperado Incolor 8mm"
  E define o valor base de R$ 140,00 por m²
  Quando o sistema salva o registro
  Então o insumo fica disponível para orçamentação com cálculo de área mínima de 0,25 m²

Cenário: Restrição de exclusão de insumo vinculado
  Dado um perfil de alumínio vinculado a uma ficha técnica
  Quando o usuário tenta excluir o perfil
  Então o sistema bloqueia a exclusão com HTTP 409 (Conflict)
```

---

*Especificação homologada na Baseline da Sprint 2.*
