import { api } from 'api/api';

// ===== Tipos =====
export type Campo = {
  id: number;
  nome: string;
  localizacao?: string | null;
  usuario_id: number;
  created_at?: string;
  updated_at?: string;
};

export type CampoInput = {
  nome: string;
  localizacao?: string | null;
};

export type ListCamposParams = {
  q?: string; // filtro por nome
  page?: number; // número da página
  per_page?: number; // quantos por página
};

// Paginação genérica
export type Paginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

// ===== Services =====

// Listar (com paginação + filtro opcional)
export async function listCampos(params: ListCamposParams = {}) {
  const res = await api.get<Paginated<Campo>>('/campos', { params });
  return res.data;
}

// Buscar campo específico
export async function getCampo(id: number) {
  const res = await api.get<Campo>(`/campos/${id}`);
  return res.data;
}

// Criar campo
export async function createCampo(payload: CampoInput) {
  const res = await api.post<{ message: string; campo: Campo }>('/campos', payload);
  return res.data.campo;
}

// Atualizar campo
export async function updateCampo(id: number, payload: Partial<CampoInput>) {
  const res = await api.put<{ message: string; campo: Campo }>(`/campos/${id}`, payload);
  return res.data.campo;
}

// Deletar campo
export async function deleteCampo(id: number) {
  await api.delete(`/campos/${id}`);
  return id;
}
