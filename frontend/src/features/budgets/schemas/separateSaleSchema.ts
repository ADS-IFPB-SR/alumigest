import { z } from 'zod';

export const SaleTypeEnum = z.enum(['GLASS', 'ALUMINUM']);
export type SaleType = z.infer<typeof SaleTypeEnum>;

const baseSaleSchema = z.object({
  quantity: z.coerce.number({ invalid_type_error: "Obrigatório" }).min(1, 'Mínimo de 1'),
  width: z.coerce.number({ invalid_type_error: "Obrigatório" }).min(1, 'Mínimo de 1mm'),
  height: z.coerce.number({ invalid_type_error: "Obrigatório" }).min(1, 'Mínimo de 1mm'),
});

const glassSaleSchema = baseSaleSchema.extend({
  saleType: z.literal(SaleTypeEnum.enum.GLASS),
  glassId: z.string().min(1, 'Selecione um tipo de vidro'),
  filmId: z.string().optional(),
});

const aluminumSaleSchema = baseSaleSchema.extend({
  saleType: z.literal(SaleTypeEnum.enum.ALUMINUM),
  profileId: z.string().min(1, 'Selecione um perfil de alumínio'),
  hardwareId: z.string().min(1, 'Selecione uma esquadreta/ferragem'),
  handleId: z.string().optional(),
});

export const separateSaleSchema = z.discriminatedUnion('saleType', [
  glassSaleSchema,
  aluminumSaleSchema,
]);

export type SeparateSaleFormData = z.infer<typeof separateSaleSchema>;