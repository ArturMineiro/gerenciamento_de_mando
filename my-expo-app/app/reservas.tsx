import { useMemo, useState, useEffect } from 'react';
import { View, Text, Pressable, FlatList, ActivityIndicator, Modal, TextInput } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

import CampoPicker from '../components/CampoPicker';

import { useCampo, useCampos } from 'hooks/useCampos';
import { useHorarios } from 'hooks/useHorarios';
import { useReservas, useCreateReserva } from 'hooks/useReservas';
import { useCreateCliente } from 'hooks/useClientes';

dayjs.locale('pt-br');

// utils
const fmt = (d: string | Date) => dayjs(d).format('YYYY-MM-DD');
const isSunday = (d: dayjs.Dayjs) => d.day() === 0;
const pad = (n: number) => String(n).padStart(2, '0');

type Slot = {
  label: string; // "09:00 - 11:00"
  inicio: string; // "09:00"
  fim: string; // "11:00"
  horario_id?: number;
};

function buildTwoHourSlots(): Slot[] {
  // 09:00→23:00 => [09-11], [11-13], ..., [21-23]
  const start = 9;
  const end = 23;
  const slots: Slot[] = [];
  for (let h = start; h < end; h += 2) {
    const ini = `${pad(h)}:00`;
    const fim = `${pad(h + 2)}:00`;
    slots.push({ label: `${ini} - ${fim}`, inicio: ini, fim });
  }
  return slots;
}

export default function ReservasCalendarScreen() {
  // ---------------- estado base ----------------
  const [campoId, setCampoId] = useState<number | undefined>();
  const { data: campoSel } = useCampo(campoId);

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs();
    return isSunday(today) ? today.add(1, 'day').toDate() : today.toDate();
  });
  const dateStr = fmt(selectedDate);

  // ---------------- dados remotos ----------------
  const { data: camposData } = useCampos({ page: 1, per_page: 50 });
  const { data: horariosData, isLoading: loadingHorarios } = useHorarios({ per_page: 200 });

  const {
    data: reservasDia,
    isLoading: loadingReservas,
    isFetching,
  } = useReservas({
    data: dateStr,
    campo_id: campoId,
    per_page: 200,
    page: 1,
  });

  // selecionar primeiro campo quando carregar
  useEffect(() => {
    if (!campoId && camposData?.data?.length) setCampoId(camposData.data[0].id);
  }, [campoId, camposData]);

  // ---------------- slots e disponibilidade ----------------
  const baseSlots = useMemo(() => buildTwoHourSlots(), []);

  // (inicio,fim) -> horario_id
  const horarioMap = useMemo(() => {
    const map = new Map<string, number>();
    const toHM = (s: string) => (s?.length >= 5 ? s.slice(0, 5) : s); // "11:00:00" -> "11:00"
    horariosData?.data.forEach((h) => {
      const ini = toHM(h.hora_inicio);
      const fim = toHM(h.hora_fim);
      map.set(`${ini}-${fim}`, h.id);
    });
    return map;
  }, [horariosData]);

  // slots com horario_id preenchido (se existir correspondente no banco)
  const slots = useMemo<Slot[]>(() => {
    return baseSlots.map((s) => ({
      ...s,
      horario_id: horarioMap.get(`${s.inicio}-${s.fim}`),
    }));
  }, [baseSlots, horarioMap]);

  // ocupado se houver reserva nesse horario_id com status != 'cancelado'
  const busyByHorarioId = useMemo(() => {
    const set = new Set<number>();
    reservasDia?.data.forEach((r) => {
      if (r.horario_id && r.status !== 'cancelado') {
        set.add(r.horario_id);
      }
    });
    return set;
  }, [reservasDia]);

  // (opcional) slots passados no mesmo dia ficam indisponíveis
  const now = dayjs();
  const isToday = dayjs(selectedDate).isSame(now, 'day');

  function isPastSlot(slot: Slot) {
    if (!isToday) return false;
    const slotEnd = dayjs(`${fmt(selectedDate)} ${slot.fim}:00`);
    return now.isAfter(slotEnd);
  }

  // ---------------- criar reserva (cliente rápido) ----------------
  const [showModal, setShowModal] = useState(false);
  const [pendingSlot, setPendingSlot] = useState<Slot | null>(null);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteTelefone, setClienteTelefone] = useState('');

  const createCliente = useCreateCliente({ onError: (m) => alert(m) });
  const createReserva = useCreateReserva({ onError: (m) => alert(m) });

  function openReserveModal(slot: Slot) {
    setPendingSlot(slot);
    setClienteNome('');
    setClienteTelefone('');
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setPendingSlot(null);
    setClienteNome('');
    setClienteTelefone('');
  }

  // navegação de dias (pula domingo)
  function goPrevDay() {
    let prev = dayjs(selectedDate).subtract(1, 'day');
    if (isSunday(prev)) prev = prev.subtract(1, 'day');
    setSelectedDate(prev.toDate());
  }
  function goNextDay() {
    let next = dayjs(selectedDate).add(1, 'day');
    if (isSunday(next)) next = next.add(1, 'day');
    setSelectedDate(next.toDate());
  }

  async function confirmReserva() {
    if (!campoId) return alert('Selecione um campo.');
    if (isSunday(dayjs(selectedDate))) return alert('Domingo indisponível.');
    if (!pendingSlot?.horario_id) return alert('Não há horário cadastrado para esse intervalo.');
    if (isPastSlot(pendingSlot)) return alert('Horário já passou.');
    if (!clienteNome.trim()) return alert('Informe o nome do cliente.');

    // 1) cria cliente
    createCliente.mutate(
      {
        cpf_cnpj: `TEMP-${Date.now()}`, // ajuste se quiser
        nome: clienteNome.trim(),
        telefone: clienteTelefone.trim() || null,
        email: null,
      },
      {
        onSuccess: (cliente) => {
          // 2) cria reserva
          createReserva.mutate(
            {
              campo_id: campoId,
              cliente_id: cliente.id,
              horario_id: pendingSlot.horario_id!,
              data: dateStr,
              status: 'reservado',
            },
            { onSuccess: closeModal }
          );
        },
      }
    );
  }

  const domingo = isSunday(dayjs(selectedDate));
  const loadingAny = loadingHorarios || loadingReservas;
  const semHorarios = !loadingHorarios && !horariosData?.data?.length;

  return (
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      {/* Header */}
      <Text className="mb-3 text-2xl font-extrabold text-white">Reservas</Text>

      {/* Campo */}
      <CampoPicker value={campoId} onSelect={setCampoId} />
      {campoSel && <Text className="mt-2 text-zinc-400">Selecionado: {campoSel.nome}</Text>}

      {/* Data */}
      <View className="mb-3 mt-3 flex-row items-center justify-between">
        <Pressable onPress={goPrevDay} className="rounded-lg bg-zinc-800 px-3 py-2">
          <Text className="text-white">{'← Dia anterior'}</Text>
        </Pressable>
        <Text className="text-lg font-semibold text-white">
          {dayjs(selectedDate).format('dddd, DD [de] MMMM')}
        </Text>
        <Pressable onPress={goNextDay} className="rounded-lg bg-zinc-800 px-3 py-2">
          <Text className="text-white">{'Próximo dia →'}</Text>
        </Pressable>
      </View>

      {domingo && (
        <View className="mb-3 rounded-lg border border-amber-500 bg-amber-500/20 p-2">
          <Text className="text-amber-300">Domingo indisponível para reservas.</Text>
        </View>
      )}

      {semHorarios && (
        <View className="mb-3 rounded-lg border border-rose-500 bg-rose-500/20 p-2">
          <Text className="text-rose-300">
            Você ainda não cadastrou horários (09–11, 11–13, ..., 21–23). Cadastre-os para liberar
            os slots.
          </Text>
        </View>
      )}

      {/* Legenda */}
      <View className="mb-2 flex-row flex-wrap gap-2">
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full bg-emerald-500" />
          <Text className="text-xs text-zinc-400">Disponível</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full bg-red-500" />
          <Text className="text-xs text-zinc-400">Reservado/Concluído</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-3 w-3 rounded-full bg-zinc-700" />
          <Text className="text-xs text-zinc-400">Sem horário cadastrado / Passado</Text>
        </View>
      </View>

      {/* Grade */}
      <View className="flex-1">
        {loadingAny ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
            <Text className="mt-2 text-zinc-400">
              Carregando {isFetching ? '(atualizando...)' : '...'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={slots} // já vem com horario_id (ou undefined)
            keyExtractor={(s) => s.label}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              const isBusy = item.horario_id ? busyByHorarioId.has(item.horario_id) : false;
              const past = isPastSlot(item);
              const disabled = domingo || !campoId || !item.horario_id || past;

              const containerCls = isBusy
                ? 'border border-red-500 bg-red-500/20'
                : disabled
                  ? 'border border-zinc-700 bg-zinc-800/50'
                  : 'border border-emerald-500 bg-emerald-500/20';

              const statusText = isBusy ? 'Indisponível' : disabled ? 'Indisponível' : 'Disponível';

              const statusCls = isBusy
                ? 'text-red-300'
                : disabled
                  ? 'text-zinc-400'
                  : 'text-emerald-300';

              return (
                <Pressable
                  disabled={disabled || isBusy}
                  onPress={() => openReserveModal(item)}
                  className={[
                    'mb-2 flex-row items-center justify-between rounded-xl px-4 py-4',
                    containerCls,
                  ].join(' ')}>
                  <Text className="text-base text-white">{item.label}</Text>
                  <Text className={['text-sm font-semibold', statusCls].join(' ')}>
                    {statusText}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {/* Modal reservar */}
      <Modal visible={!!showModal} animationType="slide" transparent onRequestClose={closeModal}>
        <View className="flex-1 items-center justify-end bg-black/40">
          <View className="w-full rounded-t-2xl bg-zinc-900 p-4">
            <Text className="mb-3 text-xl font-bold text-white">Confirmar reserva</Text>
            <Text className="mb-4 text-zinc-300">
              {dayjs(selectedDate).format('DD/MM/YYYY')} • {pendingSlot?.label ?? ''}
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
              <Pressable onPress={closeModal} className="rounded-xl bg-zinc-700 px-4 py-3">
                <Text className="text-white">Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={createCliente.isPending || createReserva.isPending}
                onPress={confirmReserva}
                className="rounded-xl bg-emerald-600 px-4 py-3">
                <Text className="font-semibold text-white">
                  {createCliente.isPending || createReserva.isPending ? 'Salvando...' : 'Reservar'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
