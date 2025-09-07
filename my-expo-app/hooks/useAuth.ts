// hooks/useAuth.ts (o arquivo onde estão useLogin/useLogout/useMe)
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { loginApi, registerApi, logoutApi, meApi, LoginInput, RegisterInput } from 'services/auth';
import { useAuth } from '../providers/AuthProvider'; // ✅

export function extractMessage(err: unknown): string {
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
  const { signIn } = useAuth(); // ✅
  return useMutation({
    mutationFn: (data: LoginInput) => loginApi(data),
    onSuccess: async (res: any) => {
      // pegue o nome correto do campo de token retornado pela sua API
      const token = res?.token ?? res?.access_token ?? res?.data?.token;
      if (token) await signIn(token); // ✅ salva no AuthProvider/AsyncStorage
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
  const { signOut } = useAuth(); // ✅
  return useMutation({
    mutationFn: () => logoutApi(),
    // Se sua API não tiver endpoint de logout, pode usar mutationFn: async () => {}
    onSettled: async () => {
      await signOut(); // ✅ limpa token
      await qc.clear(); // limpa cache (opcional)
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
