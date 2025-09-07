import { FlatList, View, ActivityIndicator, Text } from 'react-native';
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
};

export default function SlotList({
  slots, domingo, campoId, busyByHorarioId, isPastSlot, loadingAny, isFetching, onPick,
}: Props) {
  if (loadingAny) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
        <Text className="mt-2 text-zinc-400">
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

        const status: 'available' | 'busy' | 'disabled' =
          isBusy ? 'busy' : disabled ? 'disabled' : 'available';

        return <SlotItem label={item.label} status={status} onPress={() => onPick(item)} />;
      }}
    />
  );
}
