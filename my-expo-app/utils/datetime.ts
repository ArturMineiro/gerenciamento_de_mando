import dayjs from 'dayjs';

export const fmt = (d: string | Date) => dayjs(d).format('YYYY-MM-DD');
export const pad = (n: number) => String(n).padStart(2, '0');
export const isSunday = (d: dayjs.Dayjs | Date | string) => dayjs(d).day() === 0;

export type Slot = {
  label: string;   // "09:00 - 11:00"
  inicio: string;  // "09:00"
  fim: string;     // "11:00"
  horario_id?: number;
};

export function buildSlots(opts?: { start?: number; end?: number; step?: number }): Slot[] {
  const start = opts?.start ?? 9;
  const end   = opts?.end ?? 23;
  const step  = opts?.step ?? 2;

  const out: Slot[] = [];
  for (let h = start; h < end; h += step) {
    const ini = `${pad(h)}:00`;
    const fim = `${pad(h + step)}:00`;
    out.push({ label: `${ini} - ${fim}`, inicio: ini, fim });
  }
  return out;
}
