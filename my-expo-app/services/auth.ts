import { api } from 'api/api';
import { setToken, deleteToken } from 'api/storage';

export type LoginInput = { email: string; senha: string };
export type RegisterInput = { nome: string; email: string; senha: string };

export async function loginApi(data: LoginInput) {
  const res = await api.post('/login', data);
  const token = res.data?.token as string;
  if (token) await setToken(token);
  return res.data;
}

export async function registerApi(data: RegisterInput) {
  const res = await api.post('/register', data);
  const token = res.data?.token as string | undefined;
  if (token) await setToken(token);
  return res.data;
}

export async function meApi() {
  const res = await api.get('/me'); // rota protegida
  return res.data;
}

export async function logoutApi() {
  try {
    await api.post('/logout');
  } catch {}
  await deleteToken();
}
