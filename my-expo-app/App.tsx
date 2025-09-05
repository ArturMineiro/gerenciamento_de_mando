import 'react-native-reanimated';
import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable } from 'react-native';
import './global.css';

export default function App() {
  const [done, setDone] = useState(false);

  return (
    <SafeAreaProvider>
      <SafeAreaView className="flex-1 bg-zinc-900">
        <StatusBar style="light" />

        <View className="flex-1 items-center justify-center gap-6 px-6">
          <Text className="text-3xl font-extrabold text-white">Minha Home 🗂️</Text>

          <Text className="text-center text-zinc-300">
            {done ? 'Tarefa concluída ✅' : 'Nenhuma tarefa concluída ainda'}
          </Text>

          <Pressable
            onPress={() => setDone((v) => !v)}
            className="rounded-2xl bg-emerald-500 px-6 py-3">
            <Text className="font-bold text-zinc-900">{done ? 'Desfazer' : 'Concluir'}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
