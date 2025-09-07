import { Modal, View, Text, TextInput, Pressable } from 'react-native';
import dayjs from 'dayjs';

type Props = {
  visible: boolean;
  date: Date;
  slotLabel?: string;
  clienteNome: string;
  setClienteNome(v: string): void;
  clienteTelefone: string;
  setClienteTelefone(v: string): void;
  onCancel(): void;
  onConfirm(): void;
  saving: boolean;
};

export default function ReservaModal({
  visible, date, slotLabel,
  clienteNome, setClienteNome,
  clienteTelefone, setClienteTelefone,
  onCancel, onConfirm, saving,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-end bg-black/40">
        <View className="w-full rounded-t-2xl bg-zinc-900 p-4">
          <Text className="mb-3 text-xl font-bold text-white">Confirmar reserva</Text>
          <Text className="mb-4 text-zinc-300">
            {dayjs(date).format('DD/MM/YYYY')} • {slotLabel ?? ''}
          </Text>

          <Text className="mb-1 text-zinc-400">Nome do cliente</Text>
          <TextInput
            value={clienteNome}
            onChangeText={setClienteNome}
            placeholder="Ex.: João Silva"
            placeholderTextColor="#a1a1aa"
            className="mb-3 rounded-xl bg-zinc-800 px-3 py-3 text-white"
          />

          <Text className="mb-1 text-zinc-400">Telefone (opcional)</Text>
          <TextInput
            value={clienteTelefone}
            onChangeText={setClienteTelefone}
            placeholder="(21) 90000-0000"
            placeholderTextColor="#a1a1aa"
            keyboardType="phone-pad"
            className="mb-4 rounded-xl bg-zinc-800 px-3 py-3 text-white"
          />

          <View className="flex-row justify-end gap-2">
            <Pressable onPress={onCancel} className="rounded-xl bg-zinc-700 px-4 py-3">
              <Text className="text-white">Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirm} disabled={saving} className="rounded-xl bg-emerald-600 px-4 py-3">
              <Text className="font-semibold text-white">{saving ? 'Salvando...' : 'Reservar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
