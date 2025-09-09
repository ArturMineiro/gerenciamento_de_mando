import { z } from 'zod';
import { isValidCpfCnpj, onlyDigits } from '../utils/cpfCnpj';

// Nome obrigatório, máx. 30
const nome = z
  .string()
  .trim()
  .min(1, 'Nome é obrigatório')
  .max(30, 'Nome deve ter no máximo 30 caracteres');

// Telefone opcional: se vier, precisa ter 10–11 dígitos (aceita máscara)
const telefone = z
  .string()
  .trim()
  .optional()
  .refine((v) => {
    if (!v) return true;
    const d = onlyDigits(v);
    return /^\d{10,11}$/.test(d);
  }, 'Telefone deve ter 10 ou 11 dígitos');

// CPF/CNPJ obrigatório: aceita máscara na entrada
const cpfCnpj = z
  .string()
  .trim()
  .min(1, 'CPF/CNPJ é obrigatório')
  .refine((v) => isValidCpfCnpj(v), 'CPF/CNPJ inválido');

export const clienteSchema = z.object({
  nome,
  cpf_cnpj: cpfCnpj,
  telefone,
});

export type ClienteInput = z.infer<typeof clienteSchema>;
