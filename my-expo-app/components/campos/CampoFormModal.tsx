// components/campos/CampoFormModal.tsx
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';
import type { Campo } from 'services/campos-service';

type Props = {
  visible: boolean;
  initial?: Partial<Campo> | null;
  onClose(): void;
  onSubmit(payload: { nome: string }): void;
  saving?: boolean;
};

export default function CampoFormModal({ visible, initial, onClose, onSubmit, saving }: Props) {
  const [nome, setNome] = useState(initial?.nome ?? '');

  useEffect(() => {
    setNome(initial?.nome ?? '');
  }, [initial]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/60">
        <View className="w-11/12 max-w-xl rounded-2xl bg-zinc-900 p-4">
          <Text className="mb-3 text-xl font-bold text-white">
            {initial?.id ? 'Editar campo' : 'Novo campo'}
          </Text>

          <Text className="mb-1 text-zinc-400">Nome</Text>
          <TextInput
            value={nome}
            onChangeText={setNome}
            placeholder="Ex.: Campo 1"
            placeholderTextColor="#a1a1aa"
            className="mb-4 rounded-xl bg-zinc-800 px-3 py-3 text-white"
          />

          <View className="flex-row justify-end gap-2">
            <Pressable onPress={onClose} className="rounded-xl bg-zinc-700 px-4 py-3">
              <Text className="text-white">Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={() => onSubmit({ nome })}
              disabled={saving || !nome.trim()}
              className="rounded-xl bg-emerald-600 px-4 py-3 disabled:opacity-50"
            >
              <Text className="font-semibold text-white">{saving ? 'Salvando...' : 'Salvar'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
