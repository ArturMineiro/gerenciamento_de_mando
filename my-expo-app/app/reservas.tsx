import { View, Text } from 'react-native';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
dayjs.locale('pt-br');

import CampoPicker from '../components/CampoPicker';
import DateNav from '../components/reservas/DateNav';
import Legend from '../components/reservas/Legend';
import SlotList from '../components/reservas/SlotList';
import ReservaModal from '../components/reservas/ReservaModal';

import { useReservaCalendar } from '../hooks/useReservaCalendar';
import { useQuickReserva } from '../hooks/useQuickReserva';

export default function ReservasCalendarScreen() {
  const {
    campoId, setCampoId, campoSel,
    selectedDate, dateStr,
    domingo, slots, busyByHorarioId, isPastSlot,
    loadingAny, semHorarios, isFetching,
    goPrevDay, goNextDay,
  } = useReservaCalendar();

  const {
    showModal, pendingSlot, openReserveModal, closeModal, confirmReserva,
    clienteNome, setClienteNome, clienteTelefone, setClienteTelefone, saving,
  } = useQuickReserva({ campoId, selectedDate, dateStr, isPastSlot, domingo });

  return (
    <View className="flex-1 bg-zinc-900 px-4 py-4">
      <Text className="mb-3 text-2xl font-extrabold text-white">Reservas</Text>

      <CampoPicker value={campoId} onSelect={setCampoId} />
      {campoSel && <Text className="mt-2 text-zinc-400">Selecionado: {campoSel.nome}</Text>}

      <DateNav date={selectedDate} onPrev={goPrevDay} onNext={goNextDay} />

      {domingo && (
        <View className="mb-3 rounded-lg border border-amber-500 bg-amber-500/20 p-2">
          <Text className="text-amber-300">Domingo indisponível para reservas.</Text>
        </View>
      )}

      {semHorarios && (
        <View className="mb-3 rounded-lg border border-rose-500 bg-rose-500/20 p-2">
          <Text className="text-rose-300">
            Você ainda não cadastrou horários (09–11, 11–13, ..., 21–23). Cadastre-os para liberar os slots.
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
    </View>
  );
}
