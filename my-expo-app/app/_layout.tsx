import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

// ⬇️ IMPORTS NOVOS
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#09090b' },
            headerTintColor: '#fff',
            contentStyle: { backgroundColor: '#09090b' },
          }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ title: 'Entrar' }} />
          <Stack.Screen name="(auth)/register" options={{ title: 'Criar conta' }} />
          <Stack.Screen
            name="(auth)/home"
            options={{
              title: '🏟️ Meu Gerenciador',
              headerShown: true, // mostra/oculta
              headerStyle: { backgroundColor: '#d0dfdbff' }, // cor
              headerTintColor: '#000000ff', // texto/ícones
            }}
          />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
