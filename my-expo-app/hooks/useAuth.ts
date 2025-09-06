import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginApi, registerApi, logoutApi, meApi, LoginInput, RegisterInput } from 'services/auth';

function extractMessage(err: unknown): string {
  // axios error → tenta achar mensagem do backend (Laravel 422/401)
  const anyErr = err as any;
  const msg =
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    'Algo deu errado';
  return String(msg);
}

export function useLogin(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginInput) => loginApi(data),
    onSuccess: async () => {
      // atualiza dados do usuário
      await qc.invalidateQueries({ queryKey: ['me'] });
      opts?.onSuccess?.();
    },
    throwOnError: false,
    retry: false,
  });
}

export function useRegister(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RegisterInput) => registerApi(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['me'] });
      opts?.onSuccess?.();
    },
    throwOnError: false,
    retry: false,
  });
}

export function useLogout(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => logoutApi(),
    onSuccess: async () => {
      await qc.clear(); // limpa cache
      opts?.onSuccess?.();
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => meApi(),
    staleTime: 5 * 60 * 1000,
  });
}

export { extractMessage };
