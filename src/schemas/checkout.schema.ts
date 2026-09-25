import { z } from "zod";
import { validateCpf, validatePhone, validateCep } from "@/lib/validators/brazil";

export const checkoutSchema = z.object({
  // Dados do Comprador
  buyerName: z.string().trim().min(3, "Informe seu nome completo"),
  buyerEmail: z.string().trim().email("Informe um e-mail válido"),
  buyerCpf: z.string().trim().refine((val) => validateCpf(val), {
    message: "CPF inválido",
  }),
  buyerPhone: z.string().trim().refine((val) => validatePhone(val), {
    message: "Telefone / WhatsApp inválido com DDD",
  }),

  // Endereço de Entrega
  shippingType: z.enum(["EXCURSAO_BRAS", "CORREIOS", "TRANSPORTADORA"], {
    required_error: "Selecione a forma de entrega",
  }),
  excursaoDetails: z.string().optional(), // Detalhes da caravana/ônibus no Brás
  zipCode: z.string().trim().refine((val) => validateCep(val), {
    message: "CEP inválido (8 dígitos)",
  }),
  street: z.string().trim().min(2, "Logradouro obrigatório"),
  number: z.string().trim().min(1, "Número obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().trim().min(1, "Bairro obrigatório"),
  city: z.string().trim().min(1, "Cidade obrigatória"),
  state: z.string().trim().length(2, "UF inválida (ex: SP)"),

  // Pagamento
  paymentMethod: z.literal("PIX"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
