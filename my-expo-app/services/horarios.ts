// services/horarios.ts
import { api } from 'api/api';

export type Horario = {
  id: number;
  hora_inicio: string; // "HH:mm"
  hora_fim: string; // "HH:mm"
  usuario_id: number;
  created_at?: string;
  updated_at?: string;
};

export type HorarioInput = {
  hora_inicio: string; // "HH:mm"
  hora_fim: string; // "HH:mm"
};

export type ListHorariosParams = {
  q?: string; // filtro por "HH:mm" (inicio ou fim)
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

// GET /horarios  (?q=, ?page=, ?per_page=)
export async function listHorarios(params: ListHorariosParams = {}) {
  const res = await api.get<Paginated<Horario>>('/horarios', { params });
  return res.data;
}

// GET /horarios/{id}
export async function getHorario(id: number) {
  const res = await api.get<Horario>(`/horarios/${id}`);
  return res.data;
}

// POST /horarios
export async function createHorario(payload: HorarioInput) {
  const res = await api.post<{ message: string; horario: Horario }>('/horarios', payload);
  return res.data.horario;
}

// PUT /horarios/{id}
export async function updateHorario(id: number, payload: HorarioInput) {
  const res = await api.put<{ message: string; horario: Horario }>(`/horarios/${id}`, payload);
  return res.data.horario;
}

// DELETE /horarios/{id}
export async function deleteHorario(id: number) {
  await api.delete(`/horarios/${id}`);
  return id;
}
