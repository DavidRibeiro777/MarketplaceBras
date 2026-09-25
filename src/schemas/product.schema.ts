import { z } from "zod";

/**
 * Schema de uma variação individual de grade (Tamanho x Cor)
 */
export const productVariationSchema = z.object({
  id: z.string().optional(),
  size: z.string().trim().min(1, "Informe o tamanho (ex: P, M, G, 38, Único)"),
  color: z.string().trim().min(1, "Informe o nome da cor (ex: Preto, Jeans Claro)"),
  colorHex: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Código hexadecimal inválido")
    .optional()
    .or(z.literal("")),
  stock: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
  sku: z.string().trim().min(1, "O SKU/código de referência é obrigatório"),
  additionalPrice: z.coerce.number().min(0, "Acréscimo não pode ser negativo").default(0),
  isActive: z.boolean().default(true),
});

export type ProductVariationInput = z.infer<typeof productVariationSchema>;

/**
 * Schema para Cadastro / Edição de Produto Completo
 */
export const productSchema = z
  .object({
    id: z.string().optional(),
    storeId: z.string().uuid("ID da loja inválido").optional(),
    categoryId: z.string().min(1, "Selecione uma categoria").optional(),
    title: z
      .string()
      .trim()
      .min(3, "O título do produto deve ter no mínimo 3 caracteres")
      .max(150, "O título não pode exceder 150 caracteres"),
    description: z
      .string()
      .trim()
      .min(10, "Informe uma descrição com no mínimo 10 caracteres")
      .max(3000, "A descrição não pode exceder 3000 caracteres"),
    
    // Precificação Atacado vs Varejo
    retailPrice: z.coerce
      .number()
      .positive("O preço de varejo deve ser maior que zero"),
    wholesalePrice: z.coerce
      .number()
      .positive("O preço de atacado deve ser maior que zero"),
    minWholesaleQty: z.coerce
      .number()
      .int()
      .min(1, "A quantidade mínima para atacado deve ser de pelo menos 1 peça")
      .default(6),

    // Status e destaque
    status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "OUT_OF_STOCK"]).default("ACTIVE"),
    isFeatured: z.boolean().default(false),

    // Fotos do Produto
    images: z
      .array(
        z.object({
          url: z.string().url("URL de imagem inválida"),
          isMain: z.boolean().default(false),
          order: z.number().default(0),
        })
      )
      .min(1, "Adicione pelo menos 1 foto do produto"),

    // Grade de Variações
    variations: z
      .array(productVariationSchema)
      .min(1, "Cadastre pelo menos 1 variação de grade (tamanho e cor) para o produto"),
  })
  .refine(
    (data) => data.wholesalePrice <= data.retailPrice,
    {
      message: "O preço de atacado deve ser menor ou igual ao preço de varejo",
      path: ["wholesalePrice"],
    }
  );

export type ProductInput = z.infer<typeof productSchema>;
