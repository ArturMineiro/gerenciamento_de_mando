// hooks/useAuth.ts
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  loginApi,
  registerApi,
  logoutApi,
  meApi,
  type LoginInput,
  type RegisterInput,
  forgotPasswordApi,
  resetPasswordApi,
} from 'services/auth';
import { useAuth } from '../providers/AuthProvider';

/** ------------------ Tipos de respostas/variáveis ------------------ */
type MsgResp = { message: string };

type ForgotVars = { email: string };

type ResetVars = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

type LoginResp = {
  message?: string;
  usuario?: any;
  token?: string;
  access_token?: string;
  data?: { token?: string };
};

type RegisterResp = {
  message: string;
  usuario: any;
  token?: string;
};

/** ------------------ Utils ------------------ */
export function extractMessage(err: unknown): string {
  const anyErr = err as any;
  const msg =
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    'Algo deu errado';
  return String(msg);
}

/** ------------------ FORGOT PASSWORD ------------------ */
export function useForgotPassword(
  opts?: UseMutationOptions<MsgResp, unknown, ForgotVars>
) {
  return useMutation<MsgResp, unknown, ForgotVars>({
    mutationFn: (p) => forgotPasswordApi(p),
    ...opts,
  });
}

/** ------------------ RESET PASSWORD ------------------ */
export function useResetPassword(
  opts?: UseMutationOptions<MsgResp, unknown, ResetVars>
) {
  return useMutation<MsgResp, unknown, ResetVars>({
    mutationFn: (p) => resetPasswordApi(p),
    ...opts,
  });
}

/** ------------------ LOGIN ------------------ */
export function useLogin(
  opts?: UseMutationOptions<LoginResp, unknown, LoginInput>
) {
  const qc = useQueryClient();
  const { signIn } = useAuth();

  return useMutation<LoginResp, unknown, LoginInput>({
    mutationFn: (data) => loginApi(data),
    onSuccess: async (res, variables, ctx) => {
      const token = res?.token ?? res?.access_token ?? res?.data?.token;
      if (token) await signIn(token); // salva no AuthProvider/AsyncStorage e seta Authorization
      await qc.invalidateQueries({ queryKey: ['me'] });

      // encadear onSuccess externo (se passado)
      if (opts?.onSuccess) {
        await (opts.onSuccess as any)(res, variables, ctx);
      }
    },
    retry: false,
    // mantém outras opções passadas
    ...opts,
  });
}

/** ------------------ REGISTER ------------------ */
export function useRegister(
  opts?: UseMutationOptions<RegisterResp, unknown, RegisterInput>
) {
  const qc = useQueryClient();

  return useMutation<RegisterResp, unknown, RegisterInput>({
    mutationFn: (data) => registerApi(data),
    onSuccess: async (res, variables, ctx) => {
      await qc.invalidateQueries({ queryKey: ['me'] });

      if (opts?.onSuccess) {
        await (opts.onSuccess as any)(res, variables, ctx);
      }
    },
    retry: false,
    ...opts,
  });
}

/** ------------------ LOGOUT ------------------ */
export function useLogout(
  opts?: UseMutationOptions<boolean, unknown, void>
) {
  const qc = useQueryClient();
  const { signOut } = useAuth();

  return useMutation<boolean, unknown, void>({
    mutationFn: () => logoutApi(),
    onSettled: async (data, error, variables, ctx) => {
      await signOut();   // limpa token + Authorization
      await qc.clear();  // limpa cache
      if (opts?.onSettled) {
        await (opts.onSettled as any)(data, error, variables, ctx);
      }
    },
    ...opts,
  });
}

/** ------------------ ME ------------------ */
export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => meApi(),
    staleTime: 5 * 60 * 1000,
  });
}
