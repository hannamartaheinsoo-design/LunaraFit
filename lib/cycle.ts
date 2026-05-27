import { CycleInfo, CyclePhase } from '../types';

export function getCycleInfo(
  lastPeriodDate: string | null,
  cycleLength: number,
  periodLength: number,
  targetDate?: Date,
): CycleInfo | null {
  if (!lastPeriodDate) return null;

  const cl = cycleLength || 28;
  const pl = periodLength || 5;
  const last = new Date(lastPeriodDate);
  const tgt = targetDate ?? new Date();

  const diff = Math.floor((tgt.getTime() - last.getTime()) / 86400000);
  const day = ((diff % cl) + cl) % cl + 1;
  const daysLeft = cl - day + 1;
  const ovDay = Math.floor(cl / 2);

  let phase: string;
  let phaseKey: CyclePhase;
  let description: string;

  if (day <= pl) {
    phase = 'Menstruatsioonifaas';
    phaseKey = 'menstruation';
    description = 'Puhkus ja kerge liikumine on õige valik.';
  } else if (day <= ovDay - 2) {
    phase = 'Follikulaarfaas';
    phaseKey = 'follicular';
    description = 'Energia tõuseb — hea aeg raskemalt treenida.';
  } else if (day <= ovDay + 1) {
    phase = 'Ovulatsioon';
    phaseKey = 'ovulation';
    description = 'Energiatipp — ideaalne uute rekordite püstitamiseks.';
  } else {
    phase = 'Luteaalfaas';
    phaseKey = 'luteal';
    description = 'Madalam intensiivsus on tark — puhkus on osa rutiinist.';
  }

  return { day, daysLeft, phase, phaseKey, description, cycleLength: cl };
}

export function getPhaseKey(
  date: string,
  lastPeriodDate: string | null,
  cycleLength: number,
  periodLength: number,
): CyclePhase {
  const info = getCycleInfo(lastPeriodDate, cycleLength, periodLength, new Date(date));
  return info?.phaseKey ?? 'unknown';
}

export const PHASE_LABELS: Record<CyclePhase, string> = {
  follicular: 'Follikulaarfaas',
  luteal: 'Luteaalfaas',
  menstruation: 'Menstruatsioonifaas',
  ovulation: 'Ovulatsioon',
  unknown: '—',
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
