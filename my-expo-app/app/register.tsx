import { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Input from '.././components/ui/Input';
import Button from '.././components/ui/Button';
import { useRegister, extractMessage } from '.././hooks/useAuth';

export default function RegisterScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');

  const { mutate: doRegister, isPending } = useRegister({
    onSuccess: () => router.replace('/login'), // ou /home se já logar
  });

  function handleRegister() {
    setErro('');
    if (!nome || !email || !senha || !confirmar) return setErro('Preencha todos os campos.');
    if (senha !== confirmar) return setErro('As senhas não coincidem.');

    doRegister(
      { nome, email, senha },
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
            <Text className="text-3xl font-extrabold text-white">Criar conta 📝</Text>
            <Text className="mt-2 text-zinc-400">Leva menos de 1 minuto</Text>
          </View>

          <View className="gap-4">
            <Input label="Nome" placeholder="Seu nome" value={nome} onChangeText={setNome} />
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
            <Input
              label="Confirmar senha"
              placeholder="••••••••"
              secureTextEntry
              value={confirmar}
              onChangeText={setConfirmar}
            />

            {erro ? <Text className="text-red-400">{erro}</Text> : null}
            <Button title="Criar conta" onPress={handleRegister} loading={isPending} />

            <Text className="mt-4 text-center text-zinc-400">
              Já tem conta?{' '}
              <Link href="/login" className="font-semibold text-emerald-400">
                Entrar
              </Link>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
