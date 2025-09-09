// services/clientes.ts
import { api } from 'api/api';

export type Cliente = {
  id: number;
  cpf_cnpj: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
  usuario_id: number;
  created_at?: string;
  updated_at?: string;
};

export type ClienteInput = {
  cpf_cnpj: string;
  nome: string;
  telefone?: string | null;
  email?: string | null;
};

export type ClienteUpdate = Partial<ClienteInput>;

export type ListClientesParams = {
  q?: string;
  page?: number;
  per_page?: number;
};

export type Paginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export async function listClientes(params: ListClientesParams = {}) {
  const res = await api.get<Paginated<Cliente>>('/clientes', { params });
  return res.data;
}

export async function getCliente(id: number) {
  const res = await api.get<Cliente>(`/clientes/${id}`);
  return res.data;
}

export async function createCliente(payload: ClienteInput) {
  const res = await api.post<{ message: string; cliente: Cliente }>('/clientes', payload);
  return res.data.cliente;
}

export async function updateCliente(id: number, payload: ClienteUpdate) {
  const res = await api.put<{ message: string; cliente: Cliente }>(`/clientes/${id}`, payload);
  return res.data.cliente;
}

export async function deleteCliente(id: number) {
  await api.delete(`/clientes/${id}`);
  return id;
}
export async function findClienteByDoc(cpf_cnpj: string) {
  const res = await api.get('/clientes/by-doc', { params: { cpf_cnpj } });
  return res.data?.cliente ?? null;
}
