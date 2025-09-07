import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useCampo, useCampos } from './useCampos';
import { useHorarios } from './useHorarios';
import { useReservas } from './useReservas';
import { buildSlots, fmt, isSunday, Slot } from '../utils/datetime';

export function useReservaCalendar() {
  const [campoId, setCampoId] = useState<number | undefined>();
  const { data: camposData } = useCampos({ page: 1, per_page: 50 });
  const { data: campoSel } = useCampo(campoId);
  const { data: horariosData, isLoading: loadingHorarios } = useHorarios({ per_page: 200 });

  // Data inicial: se hoje for domingo, começa na segunda
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = dayjs();
    return isSunday(today) ? today.add(1, 'day').toDate() : today.toDate();
  });
  const dateStr = fmt(selectedDate);

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

  useEffect(() => {
    if (!campoId && camposData?.data?.length) setCampoId(camposData.data[0].id);
  }, [campoId, camposData]);

  const baseSlots = useMemo(() => buildSlots(), []);
  const horarioMap = useMemo(() => {
    const map = new Map<string, number>();
    const toHM = (s: string) => (s?.length >= 5 ? s.slice(0, 5) : s);
    horariosData?.data?.forEach((h: any) => {
      map.set(`${toHM(h.hora_inicio)}-${toHM(h.hora_fim)}`, h.id);
    });
    return map;
  }, [horariosData]);

  const slots: Slot[] = useMemo(
    () => baseSlots.map((s) => ({ ...s, horario_id: horarioMap.get(`${s.inicio}-${s.fim}`) })),
    [baseSlots, horarioMap]
  );

  const busyByHorarioId = useMemo(() => {
    const set = new Set<number>();
    reservasDia?.data?.forEach((r: any) => {
      if (r.horario_id && r.status !== 'cancelado') set.add(r.horario_id);
    });
    return set;
  }, [reservasDia]);

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day');

  const isPastSlot = useCallback(
    (slot: Slot) => {
      if (!isToday) return false;
      const now = dayjs(); // calcula no momento da checagem
      const end = dayjs(`${fmt(selectedDate)} ${slot.fim}:00`);
      return now.isAfter(end);
    },
    [isToday, selectedDate]
  );

  const domingo = isSunday(selectedDate);
  const loadingAny = loadingHorarios || loadingReservas;
  const semHorarios = !loadingHorarios && !horariosData?.data?.length;

  const goPrevDay = useCallback(() => {
    let prev = dayjs(selectedDate).subtract(1, 'day');
    if (isSunday(prev)) prev = prev.subtract(1, 'day');
    setSelectedDate(prev.toDate());
  }, [selectedDate]);

  const goNextDay = useCallback(() => {
    let next = dayjs(selectedDate).add(1, 'day');
    if (isSunday(next)) next = next.add(1, 'day');
    setSelectedDate(next.toDate());
  }, [selectedDate]);

  // 👉 NOVO: ir direto para uma data específica (evitando domingo por padrão)
  const goToDate = useCallback((date: Date, opts?: { allowSunday?: boolean }) => {
    let d = dayjs(date);
    if (!opts?.allowSunday && isSunday(d)) {
      // regra: se caiu num domingo, avança para segunda
      d = d.add(1, 'day');
    }
    setSelectedDate(d.toDate());
  }, []);

  return {
    campoId,
    setCampoId,
    campoSel,
    selectedDate,
    setSelectedDate,
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
    goToDate, // <-- exporta para a tela abrir o calendário e saltar de uma vez
  };
}
