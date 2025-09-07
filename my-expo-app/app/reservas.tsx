import { View, Text, Pressable, Modal } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');
import React, { useState } from 'react'; // ✅ adicione o useState aqui

import { Calendar } from 'react-native-calendars';

import CampoPicker from '../components/CampoPicker';
import DateNav from '../components/reservas/DateNav';
import Legend from '../components/reservas/Legend';
import SlotList from '../components/reservas/SlotList';
import ReservaModal from '../components/reservas/ReservaModal';

import { useReservaCalendar } from '../hooks/useReservaCalendar';
import { useQuickReserva } from '../hooks/useQuickReserva';

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
    goToDate, // << garantir que veio do hook
  } = useReservaCalendar();

  const {
    showModal,
    pendingSlot,
    openReserveModal,
    closeModal,
    confirmReserva,
    clienteNome,
    setClienteNome,
    clienteTelefone,
    setClienteTelefone,
    saving,
  } = useQuickReserva({ campoId, selectedDate, dateStr, isPastSlot, domingo });

  // estado do modal do calendário

  const [showCalendar, setShowCalendar] = useState(false);

  // datas marcadas (marca o dia atual selecionado)
  const marked = {
    [dayjs(selectedDate).format('YYYY-MM-DD')]: {
      selected: true,
      selectedColor: '#7c3aed', // roxinho (opcional)
    },
  };

  return (
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      <Text className="mb-3 text-2xl font-extrabold text-white">Reservas</Text>

      <CampoPicker value={campoId} onSelect={setCampoId} />
      {campoSel && <Text className="mt-2 text-zinc-400">Selecionado: {campoSel.nome}</Text>}

      <View className="mb-2 mt-3 flex-row items-center justify-between">
        <DateNav date={selectedDate} onPrev={goPrevDay} onNext={goNextDay} />
        <Pressable
          onPress={() => setShowCalendar(true)}
          className="ml-3 rounded-lg bg-violet-600 px-3 py-2">
          <Text className="font-semibold text-white">Selecionar data</Text>
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

      <Legend />

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
        />
      </View>

      <ReservaModal
        visible={showModal}
        date={selectedDate}
        slotLabel={pendingSlot?.label}
        clienteNome={clienteNome}
        setClienteNome={setClienteNome}
        clienteTelefone={clienteTelefone}
        setClienteTelefone={setClienteTelefone}
        onCancel={closeModal}
        onConfirm={confirmReserva}
        saving={saving}
      />

      {/* MODAL DO CALENDÁRIO */}
      <Modal
        visible={showCalendar}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalendar(false)}>
        <View className="flex-1 items-center justify-center bg-black/60">
          <View className="w-11/12 rounded-2xl bg-zinc-900 p-4">
            <Text className="mb-2 text-lg font-semibold text-white">Escolha a data</Text>

            <Calendar
              // mostra a mesma data selecionada
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
              // opcional: desabilitar domingos (se quiser impedir seleção)
              // dayComponent={({ date, state, marking }) => {
              //   const isSunday = dayjs(date.dateString).day() === 0;
              //   const disabled = isSunday;
              //   return (
              //     <Text style={{ color: disabled ? '#555' : state === 'disabled' ? '#555' : '#fff' }}>
              //       {date.day}
              //     </Text>
              //   );
              // }}
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
    </View>
  );
}
