// components/campos/CampoItem.tsx
import { Text, View, Pressable } from 'react-native';
import type { Campo } from 'services/campos-service';

type Props = {
  item: Campo;
  onEdit(c: Campo): void;
  onAskDelete(c: Campo): void;
  deletingId?: number | null;
};

export default function CampoItem({ item, onEdit, onAskDelete, deletingId }: Props) {
  const isDeleting = deletingId === item.id;

  return (
    <View className="mb-2 rounded-xl border border-zinc-800 bg-zinc-900 p-3">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-white">{item.nome}</Text>
          {!!item.id && <Text className="text-xs text-zinc-400">ID: {item.id}</Text>}
        </View>

        <View className="flex-row gap-2">
          <Pressable onPress={() => onEdit(item)} className="rounded-lg bg-violet-600 px-3 py-2">
            <Text className="text-sm font-semibold text-white">Editar</Text>
          </Pressable>
          <Pressable
            onPress={() => onAskDelete(item)}
            disabled={isDeleting}
            className="rounded-lg bg-rose-600 px-3 py-2 disabled:opacity-50"
          >
            <Text className="text-sm font-semibold text-white">
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
