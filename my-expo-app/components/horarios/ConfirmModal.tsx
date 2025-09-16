// components/horarios/ConfirmModal.tsx
import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

export default function ConfirmModal({
  open,
  title = 'Confirmar',
  message = 'Tem certeza?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  danger,
}: {
  open: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="w-full max-w-md rounded-2xl bg-zinc-950 p-5">
          <Text className="mb-2 text-xl font-bold text-white">{title}</Text>
          <Text className="mb-4 text-zinc-300">{message}</Text>

          <View className="mt-2 flex-row justify-end gap-2">
            <Pressable
              className="rounded-xl bg-zinc-800 px-4 py-2 active:opacity-90"
              onPress={onCancel}>
              <Text className="font-semibold text-white">{cancelText}</Text>
            </Pressable>
            <Pressable
              className={`rounded-xl px-4 py-2 active:opacity-90 ${danger ? 'bg-red-600' : 'bg-emerald-600'}`}
              onPress={onConfirm}>
              <Text className="font-semibold text-white">{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
