import { CycleInfo, CyclePhase, Lang } from '../types';
import { t } from './i18n';

export function getCycleInfo(
  lastPeriodDate: string | null,
  cycleLength: number,
  periodLength: number,
  targetDate?: Date,
  lang: Lang = 'et',
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

  let phaseKey: CyclePhase;

  if (day <= pl) {
    phaseKey = 'menstruation';
  } else if (day <= ovDay - 2) {
    phaseKey = 'follicular';
  } else if (day <= ovDay + 1) {
    phaseKey = 'ovulation';
  } else {
    phaseKey = 'luteal';
  }

  const phase = t(`phase.${phaseKey}` as any, lang);
  const description = t(`phase.${phaseKey}.desc` as any, lang);

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

export function getPhaseLabel(phaseKey: CyclePhase, lang: Lang = 'et'): string {
  return t(`phase.lbl.${phaseKey}` as any, lang);
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
