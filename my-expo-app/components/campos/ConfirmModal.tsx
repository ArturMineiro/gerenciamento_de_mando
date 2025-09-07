// components/campos/ConfirmModal.tsx
import { Modal, Pressable, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm(): void;
  onCancel(): void;
  loading?: boolean;
};

export default function ConfirmModal({
  visible, title, message,
  confirmText = 'Excluir', cancelText = 'Cancelar',
  onConfirm, onCancel, loading = false,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 max-w-xl rounded-2xl bg-zinc-900 p-4">
          <Text className="mb-2 text-lg font-bold text-white">{title}</Text>
          <Text className="mb-4 text-zinc-300">{message}</Text>

          <View className="flex-row justify-end gap-2">
            <Pressable onPress={onCancel} disabled={loading} className="rounded-xl bg-zinc-700 px-4 py-3">
              <Text className="text-white">{cancelText}</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="rounded-xl bg-rose-600 px-4 py-3 disabled:opacity-50"
            >
              <Text className="font-semibold text-white">{loading ? 'Excluindo...' : confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
