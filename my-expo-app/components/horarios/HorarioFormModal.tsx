// components/horarios/HorarioFormModal.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { Horario, HorarioInput } from 'services/horarios';
import { useCreateHorario, useUpdateHorario } from '../../hooks/useHorarios';

function isValidHHMM(v: string) {
  // Aceita 00:00 a 23:59
  if (!/^\d{2}:\d{2}$/.test(v)) return false;
  const [h, m] = v.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function compareTimes(a: string, b: string) {
  const [ha, ma] = a.split(':').map(Number);
  const [hb, mb] = b.split(':').map(Number);
  return ha !== hb ? ha - hb : ma - mb;
}

export default function HorarioFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: Horario | null;
}) {
  const isEdit = !!editing?.id;

  const [inicio, setInicio] = useState(editing?.hora_inicio ?? '');
  const [fim, setFim] = useState(editing?.hora_fim ?? '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInicio(editing?.hora_inicio ?? '');
    setFim(editing?.hora_fim ?? '');
    setError(null);
  }, [editing, open]);

  const canSubmit = useMemo(() => {
    return isValidHHMM(inicio) && isValidHHMM(fim) && compareTimes(inicio, fim) < 0 && !error;
  }, [inicio, fim, error]);

  const { mutate: createMut, isPending: creating } = useCreateHorario({
    onSuccess: () => onClose(),
    onError: (msg) => setError(msg || 'Erro ao criar horário'),
  });

  const { mutate: updateMut, isPending: updating } = useUpdateHorario({
    onSuccess: () => onClose(),
    onError: (msg) => setError(msg || 'Erro ao atualizar horário'),
  });

  const submit = useCallback(() => {
    if (!canSubmit) {
      setError('Preencha horários válidos (ex.: 08:00 a 10:00) e com início < fim.');
      return;
    }
    const payload: HorarioInput = { hora_inicio: inicio, hora_fim: fim };
    if (isEdit && editing?.id) {
      updateMut({ id: editing.id, payload });
    } else {
      createMut(payload);
    }
  }, [canSubmit, inicio, fim, isEdit, editing, createMut, updateMut]);

  const title = isEdit ? 'Editar horário' : 'Novo horário';
  const saving = creating || updating;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 items-center justify-center bg-black/60 p-6">
        <View className="w-full max-w-md rounded-2xl bg-zinc-950 p-5">
          <Text className="mb-2 text-xl font-bold text-white">{title}</Text>
          <Text className="mb-4 text-sm text-zinc-400">
            Formato 24h: <Text className="font-semibold text-zinc-200">HH:mm</Text> (ex.: 08:00)
          </Text>

          <View className="mb-3">
            <Text className="mb-1 text-zinc-300">Hora inicial</Text>
            <TextInput
              value={inicio}
              onChangeText={setInicio}
              placeholder="08:00"
              keyboardType="numeric"
              className="rounded-xl bg-zinc-900 px-3 py-2 text-white"
              maxLength={5}
              autoCapitalize="none"
              inputMode="numeric"
            />
          </View>

          <View className="mb-3">
            <Text className="mb-1 text-zinc-300">Hora final</Text>
            <TextInput
              value={fim}
              onChangeText={setFim}
              placeholder="10:00"
              keyboardType="numeric"
              className="rounded-xl bg-zinc-900 px-3 py-2 text-white"
              maxLength={5}
              autoCapitalize="none"
              inputMode="numeric"
            />
          </View>

          {error ? <Text className="mb-3 text-red-400">{error}</Text> : null}

          <View className="mt-2 flex-row justify-end gap-2">
            <Pressable
              className="rounded-xl bg-zinc-800 px-4 py-2 active:opacity-90"
              onPress={onClose}
              disabled={saving}>
              <Text className="font-semibold text-white">Cancelar</Text>
            </Pressable>
            <Pressable
              className={`rounded-xl px-4 py-2 active:opacity-90 ${canSubmit ? 'bg-emerald-600' : 'bg-emerald-800/50'}`}
              onPress={submit}
              disabled={!canSubmit || saving}>
              <Text className="font-semibold text-white">
                {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar'}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
