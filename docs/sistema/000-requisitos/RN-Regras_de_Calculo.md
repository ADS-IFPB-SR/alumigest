# 📐 RN — Regras de Cálculo e Negócio (AlumiGest)
**Projeto:** AlumiGest — Sistema de Gestão para Vidraçaria e Esquadrias  
**Cliente / Parceiro Social:** Alumiportas  
**Versão:** 2.0 (Atualizado conforme Planning Sprint 2 em 05/08/2026)  
**Autor:** Equipe de Engenharia de Software (Scrum Master: Nichollas Cavalcante)  

---

## 1. 🎯 Introdução e Desacoplamento Arquitetural

Este documento detalha as **regras de negócio e fórmulas matemáticas de precificação e montagem** do AlumiGest.

### 🌟 Conceito Fundamental: Insumos Básicos vs. Produtos Finais Compostos
1. **Insumos / Materiais Básicos (Sprint 2):** São os itens atômicos do catálogo comercializados por sua unidade física fundamental:
   * **Vidros:** Cobrados por área ($m^2$) com ênfase em espessuras para móveis (**2mm e 4mm**) e comuns/temperados (**6mm, 8mm, 10mm**).
   * **Perfis de Alumínio:** Cobrados por metro linear ($m$) e fornecidos em barras de **3.00m (comércio local)** ou **6.00m (indústria)**, abrangendo as linhas **Rometal** e **Alternativa**, além de **Puxadores**.
   * **Películas:** Cobradas por área de aplicação ($m^2$).
   * **Ferragens e Componentes:** Cobrados por **Unidade (`UN`)**, **Par (`PAR`)** (dobradiças, rodízios) ou **Metro (`METRO`)** (trilhos e escovas).
2. **Produtos Finais / Templates Compostos (Sprint 3):** Portas, janelas e esquadrias **NÃO são materiais**, mas sim **Templates (Receitas de Montagem)** que agregam múltiplos perfis (superior, inferior, laterais, travessas), vidros cortados sob medida, películas e puxadores.

---

## 2. 🪟 Cálculo de Vidros (Área em m²)

### 2.1 Fórmula Base
$$	ext{Área } (m^2) = \left(rac{	ext{Largura (mm)}}{1000}
ight) 	imes \left(rac{	ext{Altura (mm)}}{1000}
ight)$$

### 2.2 Regras Operacionais da Alumiportas
| ID | Regra | Descrição |
| :--- | :--- | :--- |
| **RN-V01** | **Espessuras Nativas** | O sistema suporta nativamente vidros finos para portas de móveis (**2.00mm** e **4.00mm**), além de temperados (**6.00mm, 8.00mm e 10.00mm**). |
| **RN-V02** | **Custo do Vidro** | $	ext{Preço Base} = 	ext{Área } (m^2) 	imes 	ext{Preço Venda por } m^2 	imes 	ext{Quantidade}$. |
| **RN-V03** | **Área Mínima de Faturamento** | Se a área calculada for inferior a **0,25 m²**, adota-se 0,25 m² para fins de custo mínimo de corte. |
| **RN-V04** | **Flexibilidade no Orçamento** | O preço por $m^2$ pode ser ajustado pontualmente para um cliente no momento do orçamento sem alterar o valor base do catálogo mestre. |

---

## 3. 🔩 Cálculo de Perfis de Alumínio e Puxadores (Metro Linear)

### 3.1 Fórmula Base
$$	ext{Comprimento } (m) = rac{	ext{Comprimento Necessário (mm)}}{1000}$$
$$	ext{Custo} = 	ext{Comprimento } (m) 	imes 	ext{Preço por Metro} 	imes 	ext{Quantidade de Perfis}$$

### 3.2 Regras Operacionais da Alumiportas
| ID | Regra | Descrição |
| :--- | :--- | :--- |
| **RN-AL01** | **Linhas Homologadas** | Suporte às linhas de catálogo **Rometal** e **Alternativa**. |
| **RN-AL02** | **Comprimento de Barra Comercial** | As barras padrão são cadastradas com comprimento de **3.00m (revenda/local)** ou **6.00m (indústria)**. |
| **RN-AL03** | **Código de Referência e NCM** | Todo perfil deve possuir código de referência de fábrica (ex: `SU-001`, `S83`, `SPR-060`) e NCM opcional para nota fiscal. |
| **RN-AL04** | **Puxadores** | Puxadores de alumínio são modelados como perfis lineares com acabamento específico. |

---

## 4. 🎨 Cálculo de Películas de Proteção e Acabamento (m²)

### 4.1 Fórmula Base
$$	ext{Custo Película} = 	ext{Área do Vidro } (m^2) 	imes 	ext{Preço de Aplicação por } m^2$$
* **Tipos Nativos:** Fumê G5/G20, Jateada, Leitosa e Espelhada.

---

## 5. 🚪 Templates de Produtos Finais (Portas e Esquadrias Compostas - Sprint 3)

Um **Template de Porta de Correr (ex: Linha Rometal)** é calculado agregando dinamicamente:
1. **Perfis Superiores e Inferiores:** $	ext{Comprimento} = 	ext{Largura Total da Porta}$.
2. **Perfis Laterais (Montantes/Puxadores):** $	ext{Comprimento} = 	ext{Altura Total da Porta}$.
3. **Chapa de Vidro:** $	ext{Área} = (	ext{Largura} - 	ext{Desconto Perfil}) 	imes (	ext{Altura} - 	ext{Desconto Perfil})$.
4. **Película Opcional:** Aplicada sobre a área do vidro.
5. **Kit de Ferragens:** 1 Par de Roldanas/Rodízios + Escova de Vedação ($2 	imes 	ext{Altura}$).

$$	ext{Preço Total do Produto Final} = \sum 	ext{Perfis} + 	ext{Vidro} + 	ext{Película} + 	ext{Ferragens} + 	ext{Mão de Obra/Margem}$$
