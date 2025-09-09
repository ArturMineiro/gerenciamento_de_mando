// utils/cpfCnpj.ts
export function onlyDigits(v: string) {
  return (v || '').replace(/\D+/g, '');
}

export function isValidCPF(cpf: string) {
  cpf = onlyDigits(cpf);
  if (!cpf || cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(cpf[10]);
}

export function isValidCNPJ(cnpj: string) {
  cnpj = onlyDigits(cnpj);
  if (!cnpj || cnpj.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  const calc = (base: string, factorInit: number) => {
    let sum = 0,
      factor = factorInit;
    for (let i = 0; i < base.length; i++) {
      sum += parseInt(base[i]) * factor--;
      if (factor < 2) factor = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = calc(cnpj.slice(0, 12), 5);
  const d2 = calc(cnpj.slice(0, 12) + d1, 6);
  return cnpj.endsWith(`${d1}${d2}`);
}

export function isValidCpfCnpj(v: string) {
  const d = onlyDigits(v);
  return d.length === 11 ? isValidCPF(d) : d.length === 14 ? isValidCNPJ(d) : false;
}
