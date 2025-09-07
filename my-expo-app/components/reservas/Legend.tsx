import { View, Text } from 'react-native';

export default function Legend() {
  return (
    <View className="mb-2 flex-row flex-wrap gap-2">
      <View className="flex-row items-center gap-2">
        <View className="h-3 w-3 rounded-full bg-emerald-500" />
        <Text className="text-xs text-zinc-400">Disponível</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="h-3 w-3 rounded-full bg-red-500" />
        <Text className="text-xs text-zinc-400">Reservado/Concluído</Text>
      </View>
      <View className="flex-row items-center gap-2">
        <View className="h-3 w-3 rounded-full bg-zinc-700" />
        <Text className="text-xs text-zinc-400">Sem horário / Passado</Text>
      </View>
    </View>
  );
}
