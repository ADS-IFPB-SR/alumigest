# Especificação Técnica — Formulário de Clientes (Frontend TSX)

Este documento descreve detalhadamente todos os campos, tipagens TypeScript, validações Zod, máscaras e layout de tela para o desenvolvimento do módulo de **Clientes** em **React + TypeScript (`.tsx`)**.

---

## 🛠️ Stack do Frontend

* **Linguagem & Framework:** React 19 + TypeScript (`.tsx`)
* **Gerenciador de Estado de Servidor:** TanStack React Query (`@tanstack/react-query`)
* **Formulários & Validação:** React Hook Form (`react-hook-form`) + Zod (`zod`, `@hookform/resolvers/zod`)
* **Estilização:** Tailwind CSS + Lucide React (Ícones)
* **Cliente HTTP:** Axios (configurado em `src/lib/axios.ts`)

---

## 📋 Tabela Completa de Campos do Formulário

| Seção | Campo (`name`) | Tipo TS | Obrigatório? | Label na UI (PF vs PJ) | Máscara / Formato | Placeholder / Exemplo |
|---|---|---|---|---|---|---|
| **Identificação** | `personType` | `'FISICA' \| 'JURIDICA'` | Sim (Default: `FISICA`) | **Tipo de Pessoa** | Radio Button / Toggle | `(o) Pessoa Física ( ) Jurídica` |
| **Identificação** | `nomeCompleto` | `string` | **Sim** | PF: **Nome Completo**<br>PJ: **Razão Social** | Texto (máx. 150) | PF: *"João da Silva"*<br>PJ: *"Alumiportas LTDA"* |
| **Identificação** | `documento` | `string` | Não | PF: **CPF**<br>PJ: **CNPJ** | PF: `999.999.999-99`<br>PJ: `99.999.999/9999-99` | PF: `123.456.789-00`<br>PJ: `12.345.678/0001-90` |
| **Contato** | `telefone` | `string` | Não | **Telefone / Celular** | `(99) 99999-9999` ou `(99) 9999-9999` | `(83) 99999-0000` |
| **Contato** | `email` | `string` | Não | **E-mail** | Formato de e-mail | `cliente@email.com` |
| **Endereço** | `cep` | `string` | Não | **CEP** | `99999-999` *(com busca auto ViaCEP)* | `58300-000` |
| **Endereço** | `logradouro` | `string` | Não | **Logradouro (Rua / Av.)** | Texto (máx. 150) | `Rua das Flores` |
| **Endereço** | `numero` | `string` | Não | **Número** | Texto (máx. 20) | `123` ou `S/N` |
| **Endereço** | `complemento` | `string` | Não | **Complemento** | Texto (máx. 100) | `Apto 101`, `Bloco B` |
| **Endereço** | `bairro` | `string` | Não | **Bairro** | Texto (máx. 100) | `Centro` |
| **Endereço** | `cidade` | `string` | Não | **Cidade** | Texto (máx. 100) | `Santa Rita` |
| **Endereço** | `uf` | `string` | Não | **UF (Estado)** | Select (2 letras maiúsculas) | `PB`, `PE`, `RN` |
| **Outros** | `observacoes` | `string` | Não | **Observações / Local da Obra** | Textarea livre | `Entregar material no condomínio...` |

---

## 📦 Tipagem TypeScript (`src/features/customers/types/customer.types.ts`)

```typescript
export type PersonType = 'FISICA' | 'JURIDICA';

export interface CustomerFormData {
  nomeCompleto: string;
  personType: PersonType;
  documento?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
}

export interface CustomerResponse {
  id: string;
  nomeCompleto: string;
  personType: PersonType;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  cep: string | null;
  logradouro: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  uf: string | null;
  observacoes: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerSummary {
  id: string;
  nomeCompleto: string;
  personType: PersonType;
  documento: string | null;
  telefone: string | null;
  email: string | null;
  cidade: string | null;
  uf: string | null;
  ativo: boolean;
}

export interface CustomerFilterParams {
  busca?: string;
  personType?: PersonType;
  ativo?: boolean;
  page?: number;
  size?: number;
}
```

---

## 🛡️ Schema de Validação Zod (`src/features/customers/schemas/customer.schema.ts`)

```typescript
import { z } from 'zod';

export const customerSchema = z.object({
  personType: z.enum(['FISICA', 'JURIDICA'], {
    required_error: 'Selecione o tipo de pessoa',
  }).default('FISICA'),

  nomeCompleto: z
    .string({ required_error: 'O nome é obrigatório' })
    .trim()
    .min(1, 'O nome é obrigatório')
    .max(150, 'Máximo de 150 caracteres'),

  documento: z
    .string()
    .trim()
    .optional()
    .refine((val) => {
      if (!val || val === '') return true;
      const digits = val.replace(/\D/g, '');
      return digits.length === 11 || digits.length === 14;
    }, 'Documento inválido (informe um CPF de 11 dígitos ou CNPJ de 14 dígitos)'),

  telefone: z.string().trim().max(20, 'Máximo de 20 caracteres').optional(),

  email: z
    .string()
    .trim()
    .email('E-mail em formato inválido')
    .max(100, 'Máximo de 100 caracteres')
    .or(z.literal(''))
    .optional(),

  cep: z.string().trim().max(10, 'CEP inválido').optional(),
  logradouro: z.string().trim().max(150, 'Máximo de 150 caracteres').optional(),
  numero: z.string().trim().max(20, 'Máximo de 20 caracteres').optional(),
  complemento: z.string().trim().max(100, 'Máximo de 100 caracteres').optional(),
  bairro: z.string().trim().max(100, 'Máximo de 100 caracteres').optional(),
  cidade: z.string().trim().max(100, 'Máximo de 100 caracteres').optional(),
  uf: z.string().trim().max(2, 'A UF deve ter 2 caracteres').toUpperCase().optional(),
  observacoes: z.string().trim().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
```

---

## 🎨 Mockup do Layout do Formulário (Wireframe UI em TSX)

```text
+-------------------------------------------------------------------------------+
|  NOVO CLIENTE                                                   [ Salvar ]    |
+-------------------------------------------------------------------------------+
|  1. IDENTIFICAÇÃO DO CLIENTE                                                  |
|  +-------------------------------------------------------------------------+  |
|  | Tipo de Pessoa:  (o) Pessoa Física (PF)     ( ) Pessoa Jurídica (PJ)    |  |
|  |                                                                         |  |
|  | [ Nome Completo / Razão Social *                                      ] |  |
|  | [ CPF / CNPJ                                                          ] |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  2. CONTATO                                                                   |
|  +-------------------------------------------------------------------------+  |
|  | [ Telefone / WhatsApp              ]  [ E-mail                        ] |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  3. ENDEREÇO                                                                  |
|  +-------------------------------------------------------------------------+  |
|  | [ CEP                  ] [Buscar]     [ Estado (UF)                   ] |  |
|  | [ Logradouro (Rua, Av.)            ]  [ Número      ] [ Complemento   ] |  |
|  | [ Bairro                           ]  [ Cidade                        ] |  |
|  +-------------------------------------------------------------------------+  |
|                                                                               |
|  4. OBSERVAÇÕES DA OBRA                                                       |
|  +-------------------------------------------------------------------------+  |
|  | [ Observações adicionais sobre o cliente ou local de entrega...       ] |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
```

---

## 🚀 Integração com a API Backend

| Ação na Tela | Método & Endpoint | Payload / Params |
|---|---|---|
| **Salvar Novo** | `POST /api/clientes` | Body: `CustomerFormData` |
| **Carregar p/ Edição** | `GET /api/clientes/{id}` | - |
| **Salvar Edição** | `PUT /api/clientes/{id}` | Body: `CustomerFormData` |
| **Ativar / Inativar** | `PATCH /api/clientes/{id}/status` | - |
| **Listar / Buscar** | `GET /api/clientes` | Query: `?busca=...&personType=...&ativo=...` |
