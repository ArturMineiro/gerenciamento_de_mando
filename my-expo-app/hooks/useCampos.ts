import { useMutation, useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import {
  listCampos,
  getCampo,
  createCampo,
  updateCampo,
  deleteCampo,
  type Campo,
  type CampoInput,
  type ListCamposParams,
  type Paginated,
} from 'services/campos-service';
// Se você já tem essa função no seu useAuth, importe de lá.
// Caso não tenha, use esse fallback simples:
export function extractMessage(err: unknown): string {
  const anyErr = err as any;
  const msg =
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    'Algo deu errado';
  return String(msg);
}

// 🔑 Query Keys centralizados (evita typo e facilita cache)
const keys = {
  all: ['campos'] as const,
  list: (params: ListCamposParams) => [...keys.all, 'list', params] as const,
  detail: (id: number) => [...keys.all, 'detail', id] as const,
};

// LISTA paginada + filtro
export function useCampos(params: ListCamposParams) {
  return useQuery<Paginated<Campo>, Error>({
    queryKey: keys.list(params),
    queryFn: () => listCampos(params),
    placeholderData: keepPreviousData,
  });
}

// DETALHE por id
export function useCampo(id?: number) {
  return useQuery<Campo, Error>({
    queryKey: id ? keys.detail(id) : [...keys.all, 'detail', 'none'],
    queryFn: () => getCampo(id as number),
    enabled: !!id,
  });
}

// CREATE
export function useCreateCampo(opts?: {
  onSuccess?: (c: Campo) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CampoInput) => createCampo(payload),
    onSuccess: async (created) => {
      // invalida listas e detalhe
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(created);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// UPDATE
export function useUpdateCampo(opts?: {
  onSuccess?: (c: Campo) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CampoInput> }) =>
      updateCampo(id, payload),
    onSuccess: async (updated) => {
      // atualiza cache do detalhe e invalida listas
      qc.setQueryData(keys.detail(updated.id), updated);
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(updated);
    },
    onError: (e: unknown) => opts?.onError?.(extractMessage(e)),
  });
}

// DELETE (com optimistic update simples nas listas)
export function useDeleteCampo(opts?: {
  onSuccess?: (id: number) => void;
  onError?: (msg: string) => void;
}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCampo(id),
    onMutate: async (id) => {
      // pausa requisições relacionadas
      await qc.cancelQueries({ queryKey: keys.all });

      // snapshot das listas
      const listQueries = qc.getQueriesData<Paginated<Campo>>({
        queryKey: [...keys.all, 'list'],
      });

      const prevSnapshots = listQueries.map(([key, data]) => ({ key, data }));

      // remove otimisticamente
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
      // rollback
      ctx?.prevSnapshots?.forEach(({ key, data }) => qc.setQueryData(key, data));
      opts?.onError?.(extractMessage(e));
    },
    onSuccess: async (deletedId) => {
      await qc.invalidateQueries({ queryKey: keys.all });
      opts?.onSuccess?.(deletedId);
    },
  });
}
