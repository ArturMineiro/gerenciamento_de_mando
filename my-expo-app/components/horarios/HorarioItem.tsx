// components/horarios/HorarioItem.tsx
import React from 'react';
import { Text, View, Pressable } from 'react-native';
import type { Horario } from 'services/horarios';

export default function HorarioItem({
  item,
  onEdit,
  onDelete,
}: {
  item: Horario;
  onEdit: (h: Horario) => void;
  onDelete: (h: Horario) => void;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-zinc-900 p-4">
      <View>
        <Text className="text-lg font-semibold text-emerald-300">
          {item.hora_inicio} - {item.hora_fim}
        </Text>
        <Text className="text-xs text-zinc-400">ID {item.id}</Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          className="rounded-xl bg-emerald-600/90 px-3 py-2 active:opacity-90"
          onPress={() => onEdit(item)}>
          <Text className="font-semibold text-white">Editar</Text>
        </Pressable>
        <Pressable
          className="rounded-xl bg-red-600/90 px-3 py-2 active:opacity-90"
          onPress={() => onDelete(item)}>
          <Text className="font-semibold text-white">Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}
