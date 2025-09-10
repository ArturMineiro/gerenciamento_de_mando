// components/reservas/ReservaDetalhesModal.tsx
import { Modal, View, Text, Pressable } from 'react-native';
import dayjs from 'dayjs';
import { maskCpfCnpj, maskPhone } from '../../utils/mask'; // <- conferir nome do arquivo
import type { Reserva } from '../../services/reservas';

type Props = {
  visible: boolean;
  reserva?: Reserva | null;
  onClose(): void;
};

function formatHorario(h?: Reserva['horario']): string {
  if (!h) return '—';
  const ini = h.hora_inicio ?? '';
  const fim = h.hora_fim ?? '';
  if (ini && fim) return `${ini} - ${fim}`;
  if (ini) return ini;
  if (fim) return fim;
  return '—';
}

export default function ReservaDetalhesModal({ visible, reserva, onClose }: Props) {
  const dataStr = reserva?.data ? dayjs(reserva.data).format('DD/MM/YYYY') : '—';
  const campoNome = reserva?.campo?.nome ?? '—';
  const clienteNome = reserva?.cliente?.nome ?? '—';

  const telRaw = reserva?.cliente?.telefone ?? '';
  const clienteTelefone = telRaw ? (maskPhone?.(String(telRaw)) ?? String(telRaw)) : '—';

  const cpfRaw = reserva?.cliente?.cpf_cnpj ?? '';
  const cpf_cnpj = cpfRaw ? (maskCpfCnpj?.(String(cpfRaw)) ?? String(cpfRaw)) : '—';

  const horarioStr = formatHorario(reserva?.horario);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 rounded-2xl bg-zinc-900 p-4">
          <Text className="mb-3 text-xl font-bold text-white">Detalhes da reserva</Text>

          <Text className="mb-1 text-zinc-300">
            Data: <Text className="text-white">{dataStr}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            Horário: <Text className="text-white">{horarioStr}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            Campo: <Text className="text-white">{campoNome}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            Cliente: <Text className="text-white">{clienteNome}</Text>
          </Text>
          <Text className="mb-1 text-zinc-300">
            CPF/CNPJ: <Text className="text-white">{cpf_cnpj}</Text>
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
