// hooks/useReservaCalendar.ts
import { useEffect, useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

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

  // ---------- slots ----------
  const normalize = (s?: string) =>
    s ? dayjs(s, ['HH:mm:ss', 'H:mm:ss', 'HH:mm', 'H:mm'], true).format('HH:mm') : '';

  const slots: Slot[] = useMemo(() => {
    const list = horariosData?.data;
    if (list?.length) {
      // monta a grade vinda do backend
      return list
        .map((h: any) => {
          const inicio = normalize(h.hora_inicio);
          const fim = normalize(h.hora_fim);
          return {
            label: `${inicio} - ${fim}`,
            inicio,
            fim,
            horario_id: h.id,
          } as Slot;
        })
        .sort((a, b) => a.inicio.localeCompare(b.inicio));
    }
    // fallback fixo (inclui 07–09)
    return buildSlots(7, 23, 2);
  }, [horariosData]);

  // reservas do dia indexadas por horario_id (para "Ver detalhes")
  const reservaByHorarioId = useMemo(() => {
    const map = new Map<number, any>();
    reservasDia?.data?.forEach((r: any) => {
      if (r?.horario_id && r?.status !== 'cancelado') map.set(r.horario_id, r);
    });
    return map;
  }, [reservasDia]);

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
      const now = dayjs();
      const end = dayjs(`${fmt(selectedDate)} ${slot.fim}:00`);
      return now.isAfter(end);
    },
    [isToday, selectedDate]
  );

  const domingo = isSunday(selectedDate);
  const loadingAny = loadingHorarios || loadingReservas;
  const semHorarios = !loadingHorarios && !(horariosData?.data?.length ?? 0);

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

  const goToDate = useCallback((date: Date, opts?: { allowSunday?: boolean }) => {
    let d = dayjs(date);
    if (!opts?.allowSunday && isSunday(d)) d = d.add(1, 'day');
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
    reservaByHorarioId,
    isPastSlot,
    loadingAny,
    semHorarios,
    isFetching,
    goPrevDay,
    goNextDay,
    goToDate,
  };
}
