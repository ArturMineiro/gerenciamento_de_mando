// hooks/useClientes.ts
import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData, // v5
} from '@tanstack/react-query';
import {
  listClientes,
  getCliente,
  createCliente,
  updateCliente,
  deleteCliente,
  type Cliente,
  type ClienteInput,
  type ClienteUpdate,
  type ListClientesParams,
  type Paginated,
} from 'services/clientes';

// opcional: reutilize seu extractMessage já existente
function extractMessage(err: unknown): string {
  const e: any = err as any;
  return e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Algo deu errado';
}

const keys = {
  all: ['clientes'] as const,
  list: (params: ListClientesParams) => [...keys.all, 'list', params] as const,
  detail: (id: number) => [...keys.all, 'detail', id] as const,
};

// LISTA (com paginação e busca) – v5 usa placeholderData: keepPreviousData
export function useClientes(params: ListClientesParams) {
  return useQuery<Paginated<Cliente>, Error>({
    queryKey: keys.list(params),
    queryFn: () => listClientes(params),
    placeholderData: keepPreviousData,
  });
}

// DETALHE
export function useCliente(id?: number) {
  return useQuery<Cliente, Error>({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'none'],
    queryFn: () => getCliente(id as number),
    enabled: !!id,
  });
}

// CREATE
export function useCreateCliente(opts?: {
  onSuccess?: (c: Cliente) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClienteInput) => createCliente(payload),
    onSuccess: async (created) => {
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(created);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// UPDATE
export function useUpdateCliente(opts?: {
  onSuccess?: (c: Cliente) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ClienteUpdate }) =>
      updateCliente(id, payload),
    onSuccess: async (updated) => {
      qc.setQueryData(keys.detail(updated.id), updated);
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(updated);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// DELETE com optimistic update simples
export function useDeleteCliente(opts?: {
  onSuccess?: (id: number) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: keys.all });

      const listQueries = qc.getQueriesData<Paginated<Cliente>>({
        queryKey: [...keys.all, 'list'],
      });

      const prevSnapshots = listQueries.map(([key, data]) => ({ key, data }));

      for (const [key, data] of listQueries) {
        if (!data) continue;
        qc.setQueryData(key, {
          ...data,
          data: data.data.filter((c) => c.id !== id),
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
