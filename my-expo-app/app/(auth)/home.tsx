// app/(auth)/home.tsx
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter, Stack } from 'expo-router';
import { useLogout } from '../../hooks/useAuth';
import FootballPitchBackground from '../../components/Campo';

export default function HomeScreen() {
  const router = useRouter();
  const { mutate: doLogout, isPending } = useLogout({
    onSuccess: () => router.replace('/(auth)/login'),
  });

  return (
    <SafeAreaView className="flex-1 bg-emerald-700">
      {/* header desta tela */}
      <Stack.Screen
        options={{
          title: '🏟️ Meu Gerenciador',
          headerRight: () => (
            <Text
              onPress={() => !isPending && doLogout()}
              className="mr-3 font-semibold text-red-300">
              {isPending ? 'Saindo...' : 'Sair'}
            </Text>
          ),
        }}
      />

      <FootballPitchBackground />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-2xl text-white opacity-90">🎉 Bem-vindo</Text>
        <Text className="text-center text-4xl font-extrabold leading-tight text-white">
          ao seu Gerenciador{'\n'}de Mandos de Campo
        </Text>

        <Text className="mt-4 text-center text-white/80">
          Organize reservas, horários e campos num só lugar.
        </Text>

        <View className="mt-8 w-full max-w-sm gap-3">
          <Link
            href="/(auth)/reservas" // ✅ grupo correto
            className="rounded-2xl bg-white/95 py-3 text-center active:opacity-90">
            <Text className="font-bold text-emerald-700">Ir para Reservas</Text>
          </Link>

          <Link
            href="/(auth)/campos" // ✅ grupo correto
            className="rounded-2xl bg-white/90 py-3 text-center active:opacity-90">
            <Text className="font-bold text-emerald-700">Gerenciar Campos</Text>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
