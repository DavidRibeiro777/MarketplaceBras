/**
 * ============================================================================
 * VALIDADORES MATEMÁTICOS DE DOCUMENTOS BRASILEIROS
 * Zero-dependency, alta performance, compatível com TypeScript strict
 * Inclui suporte ao Novo CNPJ Alfanumérico (Receita Federal NT 2026.004)
 * ============================================================================
 */

/**
 * Validação matemática do CPF (Algoritmo Módulo 11)
 */
export function validateCpf(cpf: string | null | undefined): boolean {
  if (!cpf) return false;
  const clean = cpf.replace(/\D/g, "");

  if (clean.length !== 11) return false;

  // Rejeita sequências de números repetidos (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(clean)) return false;

  // Primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i], 10) * (10 - i);
  }
  let rest = (sum * 10) % 11;
  const d1 = rest === 10 || rest === 11 ? 0 : rest;
  if (d1 !== parseInt(clean[9], 10)) return false;

  // Segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i], 10) * (11 - i);
  }
  rest = (sum * 10) % 11;
  const d2 = rest === 10 || rest === 11 ? 0 : rest;
  return d2 === parseInt(clean[10], 10);
}

/**
 * Validação matemática do CNPJ
 * Compatível tanto com CNPJ tradicional (14 dígitos numéricos)
 * quanto com a nova especificação de CNPJ Alfanumérico (NT 2026.004)
 */
export function validateCnpj(cnpj: string | null | undefined): boolean {
  if (!cnpj) return false;

  const clean = cnpj.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (clean.length !== 14) return false;

  // Rejeita sequências de repetição
  if (/^(\d)\1{13}$/.test(clean)) return false;

  // As posições 13 e 14 (dígitos verificadores) devem ser estritamente numéricas
  if (!/^\d{2}$/.test(clean.substring(12))) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  const calculateDigit = (slice: string, weights: number[]): number => {
    let sum = 0;
    for (let i = 0; i < slice.length; i++) {
      // Regra ASCII Receita Federal: char.charCodeAt - 48
      // '0'-'9' => 48-48 = 0..9
      // 'A'-'Z' => 65-48 = 17..42
      const charVal = slice.charCodeAt(i) - 48;
      sum += charVal * weights[i];
    }
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const dv1 = calculateDigit(clean.substring(0, 12), weights1);
  const dv2 = calculateDigit(clean.substring(0, 12) + dv1, weights2);

  return clean.endsWith(`${dv1}${dv2}`);
}

/**
 * Validação de CEP brasileiro (8 dígitos)
 */
export function validateCep(cep: string | null | undefined): boolean {
  if (!cep) return false;
  const clean = cep.replace(/\D/g, "");
  return clean.length === 8;
}

/**
 * Validação de Telefone / WhatsApp celular brasileiro (10 ou 11 dígitos com DDD)
 */
export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;
  const clean = phone.replace(/\D/g, "");
  // DDDs válidos no Brasil iniciam de 11 a 99 e celular tem 11 dígitos começando com 9
  return clean.length === 10 || clean.length === 11;
}
