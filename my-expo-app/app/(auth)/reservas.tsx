import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import dayjs from 'dayjs';
import { Stack } from 'expo-router';

import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

import { Calendar } from 'react-native-calendars';

import CampoPicker from '../../components/CampoPicker';
import DateNav from '../../components/reservas/DateNav';
import Legend from '../../components/reservas/Legend';
import SlotList from '../../components/reservas/SlotList';
import ReservaModal from '../../components/reservas/ReservaModal';
import ReservaDetalhesModal from '../../components/reservas/ReservaDetalhesModal';

import { useReservaCalendar } from '../../hooks/reservas/useReservaCalendar';
import { useQuickReserva } from '../../hooks/reservas/useQuickReserva';

export default function ReservasCalendarScreen() {
  const {
    campoId,
    setCampoId,
    campoSel,
    selectedDate,
    dateStr,
    domingo,
    slots,
    busyByHorarioId,
    isPastSlot,
    loadingAny,
    semHorarios,
    isFetching,
    goPrevDay,
    goNextDay,
    goToDate,
    reservaByHorarioId,
  } = useReservaCalendar();

  const {
    showModal,
    pendingSlot,
    openReserveModal,
    closeModal,
    confirmReserva,
    clienteCpfCnpj,
    setClienteCpfCnpj,
    clienteNome,
    setClienteNome,
    clienteTelefone,
    setClienteTelefone,
    saving,
  } = useQuickReserva({ campoId, selectedDate, dateStr, isPastSlot, domingo });

  // modais
  const [showCalendar, setShowCalendar] = useState(false);
  const [detalheOpen, setDetalheOpen] = useState(false);
  const [reservaSelecionada, setReservaSelecionada] = useState<any | null>(null);

  // marca a data atual no calendário
  const marked = {
    [dayjs(selectedDate).format('YYYY-MM-DD')]: {
      selected: true,
      selectedColor: '#7c3aed',
    },
  };

  function openDetalhesByHorarioId(horarioId?: number) {
    if (!horarioId) return;
    const r = reservaByHorarioId.get(horarioId);
    if (r) {
      setReservaSelecionada(r);
      setDetalheOpen(true);
    }
  }

  return (
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      {/* Header */}
      <Stack.Screen
        options={{
          title: 'Agenda de Reservas',
          headerShown: true,
          headerStyle: { backgroundColor: '#09090b' },
          headerTintColor: '#fff',
        }}
      />
      <Text className="mb-3 text-2xl font-extrabold text-white">Reservas</Text>

      {/* Campo */}
      <CampoPicker value={campoId} onSelect={setCampoId} />
      {campoSel && <Text className="mt-2 text-zinc-400">Selecionado: {campoSel.nome}</Text>}

      {/* Navegação de datas + botão calendário */}
      <View className="mb-2 mt-3 flex-row flex-wrap items-center justify-between gap-y-2">
        <DateNav date={selectedDate} onPrev={goPrevDay} onNext={goNextDay} />
        <Pressable
          onPress={() => setShowCalendar(true)}
          className="rounded-lg bg-violet-600 px-3 py-2">
          <Text className="font-semibold text-white">Selecionar data</Text>
        </Pressable>
      </View>

      {/* Avisos */}
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

      <Legend />

      {/* Lista de slots (responsiva por padrão) */}
      <View className="flex-1">
        <SlotList
          slots={slots}
          domingo={domingo}
          campoId={campoId}
          busyByHorarioId={busyByHorarioId}
          isPastSlot={isPastSlot}
          loadingAny={loadingAny}
          isFetching={isFetching}
          onPick={openReserveModal}
          onOpenDetails={openDetalhesByHorarioId}
        />
      </View>

      {/* Modal de criar/confirmar reserva */}
      <ReservaModal
        visible={showModal}
        date={selectedDate}
        slotLabel={pendingSlot?.label}
        clienteNome={clienteNome}
        setClienteNome={setClienteNome}
        clienteTelefone={clienteTelefone}
        setClienteTelefone={setClienteTelefone}
        clienteCpfCnpj={clienteCpfCnpj}
        setClienteCpfCnpj={setClienteCpfCnpj}
        onCancel={closeModal}
        onConfirm={confirmReserva}
        saving={saving}
      />

      {/* Modal do calendário — INDEPENDENTE do de detalhes */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}>
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="w-11/12 max-w-xl rounded-2xl bg-zinc-900 p-4">
            <Text className="mb-2 text-lg font-semibold text-white">Escolha a data</Text>

            <Calendar
              initialDate={dayjs(selectedDate).format('YYYY-MM-DD')}
              markedDates={marked}
              theme={{
                calendarBackground: '#18181b',
                textSectionTitleColor: '#c4c4c5',
                dayTextColor: '#fff',
                monthTextColor: '#fff',
                arrowColor: '#a78bfa',
                selectedDayTextColor: '#fff',
                todayTextColor: '#a78bfa',
              }}
              onDayPress={(day) => {
                const d = dayjs(day.dateString).toDate();
                goToDate(d);
                setShowCalendar(false);
              }}
            />

            <View className="mt-3 flex-row justify-end">
              <Pressable
                onPress={() => setShowCalendar(false)}
                className="rounded-lg bg-zinc-700 px-3 py-2">
                <Text className="text-white">Fechar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalhes — FORA do modal do calendário */}
      <ReservaDetalhesModal
        visible={detalheOpen}
        reserva={reservaSelecionada}
        onClose={() => setDetalheOpen(false)}
      />
    </View>
  );
}
