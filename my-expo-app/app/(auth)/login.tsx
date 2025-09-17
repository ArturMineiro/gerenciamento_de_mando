import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useLogin, extractMessage } from '../../hooks/useAuth';


export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const { mutate: doLogin, isPending } = useLogin({
    onSuccess: () => router.replace('/(auth)/home'), // ✅ grupo correto
  });

  function handleLogin() {
    setErro('');
    if (!email || !senha) return setErro('Preencha e-mail e senha.');
    doLogin(
      { email, senha },
      {
        onError: (e) => setErro(extractMessage(e)),
      }
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-900">
      <KeyboardAvoidingView behavior={Platform.select({ ios: 'padding' })} className="flex-1">
        <View className="flex-1 px-6 py-8">
          <View className="mb-10 mt-8">
            <Text className="text-3xl font-extrabold text-white">Bem-vindo 👋</Text>
            <Text className="mt-2 text-zinc-400">Entre para continuar</Text>
          </View>

          <View className="gap-4">
            <Input
              label="E-mail"
              placeholder="seuemail@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <Input
              label="Senha"
              placeholder="••••••••"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            {erro ? <Text className="text-red-400">{erro}</Text> : null}
            <Button title="Entrar" onPress={handleLogin} loading={isPending} />

            <Text className="mt-4 text-center text-zinc-400">
              Não tem conta?{' '}
              <Link href="/register" className="font-semibold text-emerald-400">
                Registre-se
              </Link>
            </Text>
             <div style={{ marginTop: 8 }}>
         <Text className="mt-3 text-center">
        <Link href="/forgot-password" className="text-emerald-400">Esqueceu a senha?</Link>
      </Text>
      </div>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
