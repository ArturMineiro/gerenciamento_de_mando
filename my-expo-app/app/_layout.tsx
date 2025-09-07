// app/_layout.tsx
import 'react-native-reanimated';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../providers/AuthProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {' '}
          {/* ✅ precisa envolver aqui */}
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#09090b' },
              headerTintColor: '#fff',
              contentStyle: { backgroundColor: '#09090b' },
            }}>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            {/* ⬇️ oculte o header do grupo inteiro */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />

            {/* (Opcional) você pode REMOVER as linhas abaixo e deixar o (auth)/_layout controlar tudo
  <Stack.Screen name="(auth)/login" options={{ title: 'Entrar' }} />
  <Stack.Screen name="(auth)/register" options={{ title: 'Criar conta' }} />
  <Stack.Screen name="(auth)/home" options={{ title: '🏟️ Meu Gerenciador' }} />
  */}
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
