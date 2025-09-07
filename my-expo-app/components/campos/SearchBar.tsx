// components/campos/SearchBar.tsx
import { View, TextInput, Pressable, Text } from 'react-native';

type Props = {
  value: string;
  onChangeText(t: string): void;
  onCreate(): void;
};

export default function SearchBar({ value, onChangeText, onCreate }: Props) {
  return (
    <View className="mb-3 flex-row flex-wrap items-center justify-between gap-2">
      <View className="min-w-[200px] flex-1">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Buscar por nome..."
          placeholderTextColor="#a1a1aa"
          className="rounded-xl bg-zinc-800 px-3 py-3 text-white"
        />
      </View>

      <Pressable onPress={onCreate} className="rounded-xl bg-emerald-600 px-4 py-3">
        <Text className="font-semibold text-white">Novo campo</Text>
      </Pressable>
    </View>
  );
}
