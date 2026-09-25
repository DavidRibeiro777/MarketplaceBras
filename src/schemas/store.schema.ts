import { z } from "zod";
import {
  validateCpf,
  validateCnpj,
  validatePhone,
} from "@/lib/validators/brazil";

/**
 * ============================================================================
 * SCHEMA DE CADASTRO DE LOJISTA (ONBOARDING DE VENDEDOR DO BRÁS)
 * Inclui validação matemática de documentos, dados comerciais e dados bancários/PIX
 * ============================================================================
 */

export const sellerRegisterSchema = z
  .object({
    // --- 1. DADOS DE ACESSO E RESPONSÁVEL ---
    fullName: z
      .string()
      .trim()
      .min(3, "Informe seu nome completo (mínimo 3 caracteres)"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email("Informe um endereço de e-mail válido"),
    password: z
      .string()
      .min(8, "A senha deve conter no mínimo 8 caracteres")
      .regex(/[A-Z]/, "A senha deve conter pelo menos 1 letra maiúscula")
      .regex(/[0-9]/, "A senha deve conter pelo menos 1 número"),
    confirmPassword: z.string(),
    cpf: z
      .string()
      .trim()
      .refine((val) => validateCpf(val), {
        message: "Número de CPF inválido. Verifique os dígitos digitados.",
      }),
    whatsapp: z
      .string()
      .trim()
      .refine((val) => validatePhone(val), {
        message: "Número de WhatsApp inválido com DDD (ex: 11 99999-9999)",
      }),

    // --- 2. DADOS DA LOJA / CONFECÇÃO DO BRÁS ---
    storeName: z
      .string()
      .trim()
      .min(3, "Nome da loja deve conter no mínimo 3 caracteres")
      .max(100, "Nome da loja não pode exceder 100 caracteres"),
    cnpj: z
      .string()
      .trim()
      .optional()
      .or(z.literal(""))
      .refine(
        (val) => {
          if (!val || val === "") return true;
          return validateCnpj(val);
        },
        {
          message: "CNPJ inválido (compatível com formato 2026). Verifique os dígitos.",
        }
      ),
    mainCategory: z
      .string()
      .min(1, "Selecione a categoria principal dos seus produtos"),
    description: z
      .string()
      .max(500, "A descrição não pode exceder 500 caracteres")
      .optional(),
    physicalLocation: z
      .string()
      .trim()
      .max(200, "Localização muito longa")
      .optional(),

    // --- 3. DADOS BANCÁRIOS DO VENDEDOR PARA RECEBIMENTO (PIX / SPLIT) ---
    pixKeyType: z.enum(["CPF", "CNPJ", "EMAIL", "PHONE", "RANDOM_KEY"], {
      required_error: "Selecione o tipo de chave Pix para receber suas vendas",
    }),
    pixKey: z
      .string()
      .trim()
      .min(3, "Informe sua chave Pix para receber os repasses"),
    bankName: z
      .string()
      .trim()
      .min(2, "Informe o nome ou código do banco (ex: Nubank, Bradesco, Itaú)"),
    bankAgency: z
      .string()
      .trim()
      .min(1, "Agência bancária é obrigatória"),
    bankAccount: z
      .string()
      .trim()
      .min(1, "Número da conta bancária é obrigatório"),
    bankAccountDigit: z
      .string()
      .trim()
      .min(1, "Dígito da conta é obrigatório"),
    bankAccountType: z.enum(["CHECKING", "SAVINGS"], {
      required_error: "Selecione se é Conta Corrente ou Poupança",
    }),
    accountHolderDocument: z
      .string()
      .trim()
      .refine(
        (val) => {
          const clean = val ? val.replace(/\D/g, "") : "";
          if (clean.length === 11) return validateCpf(val);
          if (clean.length === 14) return validateCnpj(val);
          return false;
        },
        {
          message: "O documento do titular da conta deve ser um CPF ou CNPJ válido",
        }
      ),

    // --- 4. TERMOS DA PLATAFORMA ---
    termsAccepted: z.literal(true, {
      errorMap: () => ({
        message: "Você deve aceitar os Termos de Uso e comissão da plataforma para continuar.",
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas digitadas não coincidem",
    path: ["confirmPassword"],
  });

export type SellerRegisterInput = z.infer<typeof sellerRegisterSchema>;
