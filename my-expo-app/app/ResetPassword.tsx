// app/reset-password.tsx
import { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useResetPassword, extractMessage } from '../hooks/useAuth';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string; email?: string }>();
  const token = (params.token as string) || '';
  const email = (params.email as string) || '';

  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [ok, setOk] = useState(false);

  const { mutate: doReset, isPending } = useResetPassword({
    onSuccess: () => setOk(true),
    onError: (e: unknown) => setErro(extractMessage(e)),
  });

  useEffect(() => {
    if (!token || !email) setErro('Link inválido ou expirado.');
  }, [token, email]);

  function handleReset() {
    setErro('');
    if (!token || !email) return setErro('Link inválido ou expirado.');
    if (!senha || !confirmar) return setErro('Preencha todos os campos.');
    if (senha !== confirmar) return setErro('As senhas não coincidem.');
    doReset({ email, token, password: senha, password_confirmation: confirmar });
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} className="flex-1">
        <View className="flex-1 px-6 py-8">
          <View className="mb-10 mt-8">
            <Text className="text-3xl font-extrabold text-white">Definir nova senha 🔑</Text>
            <Text className="mt-2 text-zinc-400">Email: <Text className="text-zinc-200">{email || '-'}</Text></Text>
          </View>

          {!ok ? (
            <View className="gap-4">
              <Input label="Nova senha" placeholder="••••••••" secureTextEntry value={senha} onChangeText={setSenha} />
              <Input label="Confirmar senha" placeholder="••••••••" secureTextEntry value={confirmar} onChangeText={setConfirmar} />
              {erro ? <Text className="text-red-400">{erro}</Text> : null}
              <Button title="Redefinir senha" onPress={handleReset} loading={isPending} />
              <Text className="mt-4 text-center text-zinc-400">
                Lembrou a senha? <Link href="/login" className="font-semibold text-emerald-400">Entrar</Link>
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <Text className="text-emerald-400">Senha alterada com sucesso!</Text>
              <Button title="Ir para o login" onPress={() => router.replace('/login')} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
