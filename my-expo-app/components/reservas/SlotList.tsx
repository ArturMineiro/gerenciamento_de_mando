// SlotList.tsx
import { FlatList, View, ActivityIndicator, Text, Pressable } from 'react-native';
import { Slot } from '../../utils/datetime';
import SlotItem from './SlotItem';

type Props = {
  slots: Slot[];
  domingo: boolean;
  campoId?: number;
  busyByHorarioId: Set<number>;
  isPastSlot(slot: Slot): boolean;
  loadingAny: boolean;
  isFetching: boolean;
  onPick(slot: Slot): void;
  onOpenDetails?(horarioId?: number): void; // <-- novo
};

export default function SlotList({
  slots,
  domingo,
  campoId,
  busyByHorarioId,
  isPastSlot,
  loadingAny,
  isFetching,
  onPick,
  onOpenDetails,
}: Props) {
  if (loadingAny) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="text-zinc-4 00 mt-2">
          Carregando {isFetching ? '(atualizando...)' : '...'}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={slots}
      keyExtractor={(s) => s.label}
      contentContainerStyle={{ paddingBottom: 24 }}
      renderItem={({ item }) => {
        const isBusy = item.horario_id ? busyByHorarioId.has(item.horario_id) : false;
        const past = isPastSlot(item);
        const disabled = domingo || !campoId || !item.horario_id || past;

        const status: 'available' | 'busy' | 'disabled' = isBusy
          ? 'busy'
          : disabled
            ? 'disabled'
            : 'available';

        return (
          <View className="mb-2">
            {isBusy && (
              <View className="mb-1 items-end">
                <Pressable
                  onPress={() => onOpenDetails?.(item.horario_id)}
                  className="rounded-md bg-zinc-800 px-2 py-1">
                  <Text className="text-xs font-medium text-violet-300">Ver detalhes</Text>
                </Pressable>
              </View>
            )}
            <SlotItem label={item.label} status={status} onPress={() => onPick(item)} />
          </View>
        );
      }}
    />
  );
}
