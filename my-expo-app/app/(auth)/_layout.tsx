// app/(auth)/_layout.tsx
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, Redirect, usePathname } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';

export default function AuthGroupLayout() {
  const { token, isBooting } = useAuth();
  const pathname = usePathname();

  const onAuthRoute = pathname?.endsWith('/login') || pathname?.endsWith('/register');

  if (isBooting) {
    return (
      <View className="flex-1 items-center justify-center bg-zinc-900">
        <ActivityIndicator />
      </View>
    );
  }

  // Não logado → bloqueia telas do grupo e manda pro login
  if (!token && !onAuthRoute) {
    return <Redirect href="/(auth)/login" />;
  }

  // Logado tentando ver login/register → manda pra home
  if (token && onAuthRoute) {
    return <Redirect href="/(auth)/home" />;
  }

  if (token && onAuthRoute) {
    return <Redirect href="/(auth)/cadastro-cliente" />;
  }

  return <Stack />;
}
//teste comentario
