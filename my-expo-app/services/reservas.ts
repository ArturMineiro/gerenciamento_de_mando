// services/reservas.ts
import { api } from 'api/api';

export type ReservaStatus = 'reservado' | 'cancelado' | 'concluido';

export type Horario = {
  id: number;
  hora_inicio: string; // "HH:mm"
  hora_fim: string; // "HH:mm"
};

export type Reserva = {
  id: number;
  usuario_id: number;
  campo_id: number;
  horario_id: number;
  cliente_id: number;
  data: string; // "YYYY-MM-DD"
  status: ReservaStatus;
  created_at?: string;
  updated_at?: string;

  // Relações (se o backend retornar com with())
  cliente?: {
    id: number;
    nome: string;
    cpf_cnpj?: string | null;
    email?: string | null;
    telefone?: string | null;
  };
  campo?: {
    id: number;
    nome: string;
    localizacao?: string | null;
  };
  horario?: Horario;
};

export type ReservaInput = {
  campo_id: number;
  horario_id: number;
  cliente_id: number;
  data: string; // "YYYY-MM-DD"
  status?: ReservaStatus;
};

export type ReservaUpdate = Partial<ReservaInput>;

export type ListReservasParams = {
  data?: string; // "YYYY-MM-DD"
  status?: ReservaStatus;
  cliente_id?: number;
  campo_id?: number;
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

// GET /reservas
export async function listReservas(params: ListReservasParams = {}) {
  const res = await api.get<Paginated<Reserva>>('/reservas', { params });
  return res.data;
}

// GET /reservas/{id}
export async function getReserva(id: number) {
  const res = await api.get<Reserva>(`/reservas/${id}`);
  return res.data;
}

// POST /reservas
export async function createReserva(payload: ReservaInput) {
  const res = await api.post<{ message: string; reserva: Reserva }>('/reservas', payload);
  return res.data.reserva;
}

// PUT /reservas/{id}
export async function updateReserva(id: number, payload: ReservaUpdate) {
  const res = await api.put<{ message: string; reserva: Reserva }>(`/reservas/${id}`, payload);
  return res.data.reserva;
}

// DELETE /reservas/{id}
export async function deleteReserva(id: number) {
  await api.delete(`/reservas/${id}`);
  return id;
}
