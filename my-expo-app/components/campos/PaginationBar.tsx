// components/campos/PaginationBar.tsx
import { View, Text, Pressable } from 'react-native';

type Props = {
  page: number;
  lastPage: number;
  disabled?: boolean;
  onPrev(): void;
  onNext(): void;
};

export default function PaginationBar({ page, lastPage, disabled, onPrev, onNext }: Props) {
  return (
    <View className="mt-2 flex-row items-center justify-between">
      <Pressable
        onPress={onPrev}
        disabled={page <= 1 || disabled}
        className="rounded-lg bg-zinc-800 px-3 py-2 disabled:opacity-50"
      >
        <Text className="text-white">‹ Anterior</Text>
      </Pressable>

      <Text className="text-zinc-300">
        Página {page} de {lastPage}
      </Text>

      <Pressable
        onPress={onNext}
        disabled={page >= lastPage || disabled}
        className="rounded-lg bg-zinc-800 px-3 py-2 disabled:opacity-50"
      >
        <Text className="text-white">Próxima ›</Text>
      </Pressable>
    </View>
  );
}
