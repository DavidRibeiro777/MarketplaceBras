import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Concatena classes Tailwind com suporte a merge inteligente
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata valores numéricos para Real Brasileiro (R$)
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(num);
}

/**
 * Aplica máscara visual de CPF (000.000.000-00)
 */
export function maskCpf(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

/**
 * Aplica máscara visual de CNPJ (00.000.000/0000-00)
 */
export function maskCnpj(value: string): string {
  const clean = value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return clean
    .replace(/^([a-zA-Z0-9]{2})([a-zA-Z0-9])/, "$1.$2")
    .replace(/^([a-zA-Z0-9]{2})\.([a-zA-Z0-9]{3})([a-zA-Z0-9])/, "$1.$2.$3")
    .replace(/\.([a-zA-Z0-9]{3})([a-zA-Z0-9])/, ".$1/$2")
    .replace(/([a-zA-Z0-9]{4})([0-9]{1,2})$/, "$1-$2");
}

/**
 * Aplica máscara visual de Telefone Celular ((00) 00000-0000)
 */
export function maskPhone(value: string): string {
  const clean = value.replace(/\D/g, "");
  if (clean.length <= 10) {
    return clean
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  }
  return clean
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
}

/**
 * Aplica máscara visual de CEP (00000-000)
 */
export function maskCep(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
}

/**
 * Gera slug a partir de um texto (ex: "Confecções do Brás" -> "confeccoes-do-bras")
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres não alfanuméricos
    .replace(/[\s_-]+/g, "-") // Substitui espaços e underscores por hífen
    .replace(/^-+|-+$/g, ""); // Remove hífens no início e fim
}
