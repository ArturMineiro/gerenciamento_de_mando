// components/reservas/ReservaDetalhesModal.tsx
import { Modal, View, Text, Pressable } from 'react-native';
import dayjs from 'dayjs';

type Reserva = any; // tipar conforme seu backend se quiser

type Props = {
  visible: boolean;
  reserva?: Reserva | null;
  onClose(): void;
};

export default function ReservaDetalhesModal({ visible, reserva, onClose }: Props) {
  const dataStr = reserva?.data ? dayjs(reserva.data).format('DD/MM/YYYY') : '';
  const campoNome = reserva?.campo?.nome ?? reserva?.campo_nome ?? '—';
  const clienteNome = reserva?.cliente?.nome ?? reserva?.cliente_nome ?? '—';
  const clienteTelefone = reserva?.cliente?.telefone ?? reserva?.cliente_telefone ?? '—';
  const horario = reserva?.horario
    ? `${String(reserva.horario?.hora_inicio).slice(0, 5)} - ${String(reserva.horario?.hora_fim).slice(0, 5)}`
    : (reserva?.hora_label ?? '—');

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 rounded-2xl bg-zinc-900 p-4">
          <Text className="mb-3 text-xl font-bold text-white">Detalhes da reserva</Text>

          <Text className="mb-1 text-zinc-300">
            Data: <Text className="text-white">{dataStr}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            Horário: <Text className="text-white">{horario}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            Campo: <Text className="text-white">{campoNome}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            Cliente: <Text className="text-white">{clienteNome}</Text>
          </Text>
          <Text className="mb-4 text-zinc-300">
            Telefone: <Text className="text-white">{clienteTelefone}</Text>
          </Text>

          <View className="flex-row justify-end">
            <Pressable onPress={onClose} className="rounded-xl bg-zinc-700 px-4 py-3">
              <Text className="text-white">Fechar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
