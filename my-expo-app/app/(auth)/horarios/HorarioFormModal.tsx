// components/horarios/HorarioFormModal.tsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import type { Horario, HorarioInput } from 'services/horarios';
import { useCreateHorario, useUpdateHorario } from '.../../hooks/useHorarios';

// ---- Helpers de máscara/validação ----
function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function onlyDigits(s: string) {
  return s.replace(/\D+/g, '');
}

// Máscara durante a digitação: 0..23:0..59 (não “quebra” enquanto digita)
function maskHHMMTyping(input: string) {
  const d = onlyDigits(input).slice(0, 4); // máx 4 dígitos
  if (d.length <= 2) return d; // "0", "08"
  return `${d.slice(0, 2)}:${d.slice(2)}`; // "08:3", "08:30"
}

// Normaliza no blur: clampa 00–23 e 00–59 e garante 5 chars
function normalizeHHMM(s: string): string {
  const m = s.match(/^(\d{1,2}):?(\d{1,2})?$/) || s.match(/^(\d{1,2})(\d{1,2})$/);
  if (!m) return '';
  const h = parseInt(m[1] ?? '0', 10);
  const mi = parseInt(m[2] ?? '0', 10);
  const hh = Math.max(0, Math.min(23, isNaN(h) ? 0 : h));
  const mm = Math.max(0, Math.min(59, isNaN(mi) ? 0 : mi));
  return `${pad2(hh)}:${pad2(mm)}`;
}

function isValidHHMM(s: string) {
  if (!/^\d{2}:\d{2}$/.test(s)) return false;
  const [h, m] = s.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
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

  const [inicio, setInicio] = useState('08:00');
  const [fim, setFim] = useState('10:00');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setInicio(editing.hora_inicio ?? '08:00');
      setFim(editing.hora_fim ?? '10:00');
    } else {
      setInicio('08:00');
      setFim('10:00');
    }
    setError(null);
  }, [editing, open]);

  const canSubmit = useMemo(() => {
    if (!isValidHHMM(inicio) || !isValidHHMM(fim)) return false;
    return inicio < fim; // strings “HH:mm” comparam corretamente
  }, [inicio, fim]);

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
            Digite os horários com máscara HH:mm (ex.: 08:00). Aceita 00–23:00–59.
          </Text>

          {/* Campos com máscara */}
          <View className="gap-3">
            <View>
              <Text className="mb-1 text-zinc-300">Início</Text>
              <TextInput
                value={inicio}
                onChangeText={(t) => setInicio(maskHHMMTyping(t))}
                onBlur={() => setInicio(normalizeHHMM(inicio))}
                placeholder="08:00"
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={5}
                className="rounded-xl bg-zinc-900 px-3 py-2 text-white"
              />
            </View>

            <View>
              <Text className="mb-1 text-zinc-300">Fim</Text>
              <TextInput
                value={fim}
                onChangeText={(t) => setFim(maskHHMMTyping(t))}
                onBlur={() => setFim(normalizeHHMM(fim))}
                placeholder="10:00"
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={5}
                className="rounded-xl bg-zinc-900 px-3 py-2 text-white"
              />
            </View>
          </View>

          {/* Resumo e validação */}
          <View className="mt-4 rounded-xl bg-zinc-900 p-3">
            <Text className="font-semibold text-zinc-200">
              {isValidHHMM(inicio) ? inicio : '??:??'} — {isValidHHMM(fim) ? fim : '??:??'}
            </Text>
            {!canSubmit ? (
              <Text className="mt-1 text-sm text-red-400">
                Verifique os horários e garanta que o final é depois do inicial.
              </Text>
            ) : null}
          </View>

          {error ? <Text className="mt-2 text-red-400">{error}</Text> : null}

          <View className="mt-4 flex-row justify-end gap-2">
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
