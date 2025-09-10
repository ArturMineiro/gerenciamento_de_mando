// utils/mask.ts
export const digitsOnly = (v: string) => (v || '').replace(/\D+/g, '');

export function maskCpfCnpj(v: string) {
  const d = digitsOnly(v).slice(0, 14); // até 14 dígitos
  if (d.length <= 11) {
    // CPF: 000.000.000-00
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2}).*/, '$1.$2.$3-$4');
  }
  // CNPJ: 00.000.000/0000-00
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2}).*/, '$1.$2.$3/$4-$5');
}

// Brasil: (21) 90000-0000 ou (21) 2345-6789
export function maskPhone(v: string) {
  const d = digitsOnly(v).slice(0, 11); // até 11 dígitos
  if (d.length <= 10) {
    // (XX) XXXX-XXXX
    return d
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  // (XX) XXXXX-XXXX
  return d
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}
