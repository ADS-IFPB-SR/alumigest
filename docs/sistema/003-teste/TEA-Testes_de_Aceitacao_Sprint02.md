# 🧪 TEA — Testes de Aceitação (Sprint 02)
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Módulo:** Catálogo de Materiais e Insumos Genéricos & Cadastro de Clientes  
**Versão:** 2.0 (Atualizado após Planning Sprint 2 em 05/08/2026)  

---

## 1. 🎯 Objetivo da Sprint 2

Validar os critérios de aceitação do **Catálogo de Materiais Genérico** (Vidros 2mm/4mm, Perfis de Alumínio Rometal/Alternativa com barras de 3m/6m, Películas e Ferragens) e do **Cadastro de Clientes**.

---

## 2. 📋 Cenários de Teste por Sub-issue

### TEA-S02-01: Sub-issue #11 — Migration Flyway e Entidades Base
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Inicialização do Schema | Banco PostgreSQL ativo via Docker | Executa aplicação Spring Boot | Migration `V1__create_generic_catalog.sql` executa com sucesso e popula os 4 grupos nativos (`VIDRO`, `ALUMINIO`, `PELICULA`, `FERRAGEM`) com `is_system_default = true` | 📋 A testar |
| 2 | Proteção de Grupos Nativos | Grupo nativo `VIDRO` existente | Tenta deletar grupo nativo | Sistema impede exclusão física | 📋 A testar |

### TEA-S02-02: Sub-issue #12 — Vidros (2mm e 4mm) por m²
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Vidro 4mm | Formulário de Vidros aberto | Informa nome "Vidro Canelado 4mm", espessura 4.00mm, cor "Incolor", preço R$ 110,00/m² e salva | Vidro salvo com sucesso e listado na aba Vidros | 📋 A testar |
| 2 | Cadastro de Vidro 2mm | Formulário de Vidros aberto | Informa "Vidro Extra Fino 2mm", espessura 2.00mm | Salvo com sucesso | 📋 A testar |
| 3 | Preço Inválido | Formulário de Vidros aberto | Informa preço zero ou negativo | Sistema exibe validação "Preço deve ser maior que zero" | 📋 A testar |

### TEA-S02-03: Sub-issue #13 — Perfis de Alumínio (Rometal/Alternativa, Barras 3m/6m)
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Perfil Barra 3m | Formulário de Alumínio aberto | Informa nome "Perfil Puxador S83", linha "Rometal", ref "S83", barra "3.00m", preço R$ 45,00/m | Perfil cadastrado com sucesso | 📋 A testar |
| 2 | Cadastro de Perfil Barra 6m | Formulário de Alumínio aberto | Informa linha "Alternativa", ref "SPR-060", barra "6.00m", NCM "7604.29.00" | Perfil cadastrado com sucesso | 📋 A testar |

### TEA-S02-04: Sub-issue #14 — Películas por m²
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Película Fumê | Formulário de Películas | Informa "Película Fumê G5", preço R$ 35,00/m² | Película cadastrada com sucesso | 📋 A testar |

### TEA-S02-05: Sub-issue #15 — Ferragens (UN, PAR, METRO)
| # | Cenário | Dado | Quando | Então | Status |
|---|---|---|---|---|---|
| 1 | Cadastro de Rodízio (PAR) | Formulário de Ferragens | Informa "Kit Roldana Dupla", unidade "PAR", preço R$ 28,00 | Ferragem cadastrada com unidade de venda PAR | 📋 A testar |
| 2 | Cadastro de Escova (METRO) | Formulário de Ferragens | Informa "Escova de Vedação 5x7", unidade "METRO", preço R$ 3,50/m | Ferragem cadastrada com unidade METRO | 📋 A testar |
