// utils/datetime.ts
import dayjs, { Dayjs } from 'dayjs';

export type Slot = { label: string; inicio: string; fim: string; horario_id?: number };

export function buildSlots(startHour = 7, endHour = 23, step = 2): Slot[] {
  const slots: Slot[] = [];
  for (let h = startHour; h < endHour; h += step) {
    const inicio = `${String(h).padStart(2, '0')}:00`;
    const fim = `${String(h + step).padStart(2, '0')}:00`;
    slots.push({ label: `${inicio} - ${fim}`, inicio, fim });
  }
  return slots;
}

// 👉 Formata para 'YYYY-MM-DD' (útil para chamadas de API e comparações)
export function fmt(d: Date | string | Dayjs): string {
  return dayjs(d).format('YYYY-MM-DD');
}

// 👉 Retorna true se a data cair em domingo
export function isSunday(d: Date | string | Dayjs): boolean {
  return dayjs(d).day() === 0; // 0 = domingo no dayjs
}
