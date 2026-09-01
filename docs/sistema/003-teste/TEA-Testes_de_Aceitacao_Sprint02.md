# 🧪 TEA — Testes de Aceitação — Sprint 02

| Campo | Valor |
|---|---|
| **Projeto** | AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias |
| **Módulo** | Catálogo de Materiais Genérico, Categorias e Fichas Técnicas de Produtos |
| **Versão** | 2.0 (Homologado ao Fim da Sprint 2) |
| **Data** | 18/08/2026 |
| **QA Responsável** | Equipe AlumiGest |

---

## 1. 🎯 Objetivo da Sprint 2

Validar a conformidade e os critérios de aceitação da base arquitetural do **Catálogo Genérico de Materiais** (Vidros 2mm/4mm, Perfis de Alumínio Rometal/Alternativa com barras de 3m/6m, Películas, Ferragens), a **Ficha Técnica de Produtos/Categorias** e a **Interface Web/PWA** do catálogo.

---

## 2. 📋 Cenários de Teste por Sub-issue e Histórias

### TEA-S02-01: Sub-issue #11 / US-013 — Migration Flyway e Entidades Base
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Inicialização do Schema | Banco PostgreSQL ativo via Docker | Executa aplicação Spring Boot | Migration `V1__create_generic_catalog.sql` executa com sucesso e popula os 4 grupos nativos (`VIDRO`, `ALUMINIO`, `PELICULA`, `FERRAGEM`) com `is_system_default = true` | ✅ Passou |
| 2 | Proteção de Grupos Nativos | Grupo nativo `VIDRO` existente | Tenta deletar grupo nativo | Sistema impede exclusão física e mantém integridade | ✅ Passou |

### TEA-S02-02: Sub-issue #12 / US-017 — Vidros (2mm e 4mm) por m²
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Vidro 4mm | Formulário de Vidros aberto | Informa nome "Vidro Canelado 4mm", espessura 4.00mm, cor "Incolor", preço R$ 110,00/m² e salva | Vidro salvo com sucesso e listado na aba Vidros | ✅ Passou |
| 2 | Cadastro de Vidro 2mm | Formulário de Vidros aberto | Informa "Vidro Extra Fino 2mm", espessura 2.00mm | Salvo com sucesso | ✅ Passou |
| 3 | Preço Inválido | Formulário de Vidros aberto | Informa preço zero ou negativo | Sistema exibe validação "Preço deve ser maior que zero" | ✅ Passou |

### TEA-S02-03: Sub-issue #13 / US-014 — Perfis de Alumínio (Rometal/Alternativa, Barras 3m/6m)
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Perfil Barra 3m | Formulário de Alumínio aberto | Informa nome "Perfil Puxador S83", linha "Rometal", ref "S83", barra "3.00m", preço R$ 45,00/m | Perfil cadastrado com sucesso | ✅ Passou |
| 2 | Cadastro de Perfil Barra 6m | Formulário de Alumínio aberto | Informa linha "Alternativa", ref "SPR-060", barra "6.00m", NCM "7604.29.00" | Perfil cadastrado com sucesso | ✅ Passou |
| 3 | Unicidade de Referência Comercial | Perfil com ref "S83" já existente | Tenta cadastrar outro material com mesma ref comercial no mesmo grupo | Sistema rejeita com erro de unicidade (HTTP 409) | ✅ Passou |

### TEA-S02-04: Sub-issue #14 / US-016 — Películas por m²
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Película Fumê | Formulário de Películas | Informa "Película Fumê G5", preço R$ 35,00/m² | Película cadastrada com sucesso | ✅ Passou |

### TEA-S02-05: Sub-issue #15 / US-015 — Ferragens (UN, PAR, METRO)
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Rodízio (PAR) | Formulário de Ferragens | Informa "Kit Roldana Dupla", unidade "PAR", preço R$ 28,00 | Ferragem cadastrada com unidade de venda PAR | ✅ Passou |
| 2 | Cadastro de Escova (METRO) | Formulário de Ferragens | Informa "Escova de Vedação 5x7", unidade "METRO", preço R$ 3,50/m | Ferragem cadastrada com unidade METRO | ✅ Passou |

### TEA-S02-06: Categorias e Fichas Técnicas de Produtos (US-019 a US-021 / Issue #31)
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Categoria de Produto | Categoria "Portas de Alumínio" informada | Envia POST `/api/v1/products/categories` | Categoria criada com sucesso (HTTP 201) | ✅ Passou |
| 2 | Criação de Ficha Técnica | Materiais e categoria existentes | Cria produto associando itens (`ProductItem`) de perfil e vidro | Produto cadastrado com ficha técnica vinculada | ✅ Passou |

### TEA-S02-07: Frontend PWA e Navegação em Abas (US-022 e US-023)
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Navegação por Categorias de Material | Usuário na tela de Catálogo | Clica nas abas Vidros, Alumínio, Películas, Ferragens | Tabela filtra e exibe campos específicos de cada tipo | ✅ Passou |
| 2 | Modais de Criação e Edição | Usuário clica em "Novo Material" | Preenche formulário modal e confirma | Item é inserido na lista instantaneamente sem refresh | ✅ Passou |

---

## 3. 📊 Resultado da Sprint 2

| Métrica | Valor |
|---|---|
| Total de cenários avaliados | 14 |
| Aprovados | 14 |
| Rejeitados / Falhas | 0 |
| **Taxa de Aceitação (QA)** | **100%** |

---

*Homologado pela Equipe AlumiGest — Sprint 02 — 18 de Agosto de 2026*
