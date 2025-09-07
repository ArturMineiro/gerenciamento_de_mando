// hooks/useReservas.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData, // v5
} from '@tanstack/react-query';
import {
  listReservas,
  getReserva,
  createReserva,
  updateReserva,
  deleteReserva,
  type Reserva,
  type ReservaInput,
  type ReservaUpdate,
  type ListReservasParams,
  type Paginated,
} from 'services/reservas';

// Reuse seu extractMessage se já existir
function extractMessage(err: unknown): string {
  const e: any = err as any;
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Algo deu errado';
}

const keys = {
  all: ['reservas'] as const,
  list: (params: ListReservasParams) => [...keys.all, 'list', params] as const,
  detail: (id: number) => [...keys.all, 'detail', id] as const,
};

// LISTA c/ filtros e paginação
export function useReservas(params: ListReservasParams) {
  return useQuery<Paginated<Reserva>, Error>({
    queryKey: keys.list(params),
    queryFn: () => listReservas(params),
    placeholderData: keepPreviousData, // v5 substitute do keepPreviousData antigo
  });
}

// DETALHE
export function useReserva(id?: number) {
  return useQuery<Reserva, Error>({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'none'],
    queryFn: () => getReserva(id as number),
    enabled: !!id,
  });
}

// CREATE
export function useCreateReserva(opts?: {
  onSuccess?: (r: Reserva) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ReservaInput) => createReserva(payload),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(created);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// UPDATE
export function useUpdateReserva(opts?: {
  onSuccess?: (r: Reserva) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReservaUpdate }) =>
      updateReserva(id, payload),
    onSuccess: async (updated) => {
      qc.setQueryData(keys.detail(updated.id), updated);
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(updated);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// DELETE (optimistic)
export function useDeleteReserva(opts?: {
  onSuccess?: (id: number) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReserva(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.all });

      const listQueries = qc.getQueriesData<Paginated<Reserva>>({
        queryKey: [...keys.all, 'list'],
      });

      const prevSnapshots = listQueries.map(([key, data]) => ({ key, data }));

      for (const [key, data] of listQueries) {
        if (!data) continue;
        qc.setQueryData(key, {
          ...data,
          data: data.data.filter((r) => r.id !== id),
          total: Math.max(0, (data.total ?? 0) - 1),
        });
      }

      return { prevSnapshots };
    },
    onError: (e, _id, ctx) => {
      ctx?.prevSnapshots?.forEach(({ key, data }: any) => qc.setQueryData(key, data));
      opts?.onError?.(extractMessage(e));
    },
    onSuccess: async (deletedId) => {
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(deletedId);
    },
  });
}
