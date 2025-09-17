// app/forgot-password.tsx
import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Link, useRouter } from 'expo-router';
import { useForgotPassword, extractMessage } from '../hooks/useAuth';


export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [enviado, setEnviado] = useState(false);

  const { mutate: doForgot, isPending } = useForgotPassword({
    onSuccess: () => setEnviado(true),
    onError: (e: unknown) => setErro(extractMessage(e)),
  });

  function handleSend() {
    setErro('');
    if (!email) return setErro('Informe seu e-mail.');
    doForgot({ email });
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} className="flex-1">
        <View className="flex-1 px-6 py-8">
          <View className="mb-10 mt-8">
            <Text className="text-3xl font-extrabold text-white">Esqueci minha senha 🔒</Text>
            <Text className="mt-2 text-zinc-400">Vamos te enviar um link por e-mail</Text>
          </View>

          {!enviado ? (
            <View className="gap-4">
              <Input
                label="E-mail"
                placeholder="seuemail@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              {erro ? <Text className="text-red-400">{erro}</Text> : null}
              <Button title="Enviar link" onPress={handleSend} loading={isPending} />

              <Text className="mt-4 text-center text-zinc-400">
                Lembrou a senha?{' '}
                <Link href="/login" className="font-semibold text-emerald-400">Entrar</Link>
              </Text>
            </View>
          ) : (
            <View className="gap-4">
              <Text className="text-emerald-400">
                Se o e-mail existir, você receberá um link para redefinir sua senha.
              </Text>
              <Button title="Voltar ao login" onPress={() => router.replace('/login')} />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
