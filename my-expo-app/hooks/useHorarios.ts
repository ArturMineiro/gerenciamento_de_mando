// hooks/useHorarios.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData, // React Query v5
} from '@tanstack/react-query';
import {
  listHorarios,
  getHorario,
  createHorario,
  updateHorario,
  deleteHorario,
  type Horario,
  type HorarioInput,
  type ListHorariosParams,
  type Paginated,
} from 'services/horarios';

// Se já tiver extractMessage em outro hook, importe de lá.
function extractMessage(err: unknown): string {
  const e: any = err as any;
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Algo deu errado';
}

const keys = {
  all: ['horarios'] as const,
  list: (params: ListHorariosParams) => [...keys.all, 'list', params] as const,
  detail: (id: number) => [...keys.all, 'detail', id] as const,
};

// LISTA com paginação e busca
export function useHorarios(params: ListHorariosParams) {
  return useQuery<Paginated<Horario>, Error>({
    queryKey: keys.list(params),
    queryFn: () => listHorarios(params),
    placeholderData: keepPreviousData, // v5
  });
}

// DETALHE
export function useHorario(id?: number) {
  return useQuery<Horario, Error>({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'none'],
    queryFn: () => getHorario(id as number),
    enabled: !!id,
  });
}

// CREATE
export function useCreateHorario(opts?: {
  onSuccess?: (h: Horario) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HorarioInput) => createHorario(payload),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(created);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// UPDATE
export function useUpdateHorario(opts?: {
  onSuccess?: (h: Horario) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: HorarioInput }) =>
      updateHorario(id, payload),
    onSuccess: async (updated) => {
      qc.setQueryData(keys.detail(updated.id), updated);
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(updated);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// DELETE com optimistic update simples
export function useDeleteHorario(opts?: {
  onSuccess?: (id: number) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteHorario(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.all });

      const listQueries = qc.getQueriesData<Paginated<Horario>>({
        queryKey: [...keys.all, 'list'],
      });

      const prevSnapshots = listQueries.map(([key, data]) => ({ key, data }));

      for (const [key, data] of listQueries) {
        if (!data) continue;
        qc.setQueryData(key, {
          ...data,
          data: data.data.filter((h) => h.id !== id),
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
