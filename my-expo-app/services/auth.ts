// api/auth.ts
import { api } from 'api/api';

export type LoginInput = { email: string; senha: string };
export type RegisterInput = { nome: string; email: string; senha: string };

export async function loginApi(data: LoginInput) {
  const res = await api.post('/login', data);
  // NÃO salvar token aqui. Só retornar.
  return res.data as { message: string; usuario: any; token: string };
}

export async function registerApi(data: RegisterInput) {
  const res = await api.post('/register', data);
  // Teu backend de register NÃO cria token por padrão, então token pode não vir
  return res.data; // { message, usuario }
}

export async function meApi() {
  const res = await api.get('/me');
  return res.data;
}

export async function logoutApi() {
  // opcional: avisar o backend; o AuthProvider limpará o header/AsyncStorage
  try { await api.post('/logout'); } catch {}
  return true;
}

// 👉 novas APIs
export async function forgotPasswordApi(payload: { email: string }) {
  const res = await api.post('/password/forgot', payload);
  return res.data; // { message }
}

export async function resetPasswordApi(payload: {
  email: string; token: string; password: string; password_confirmation: string;
}) {
  const res = await api.post('/password/reset', payload);
  return res.data; // { message }
}
