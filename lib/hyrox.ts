import { ExerciseTemplate, ExerciseSet, Exercise } from '../types';
import type { Lang } from '../types';

// ─── Official HYROX Race Structure ────────────────────────────────────────────
// 8 × (1 km Run + 1 Station) in fixed order

// ─── Official weights by division ─────────────────────────────────────────────
// Source: HYROX official rulebook
// Doubles/Relay use the same weights as the open category for that gender.
// Pro uses the same weights as Open (Pro is a competitive standard, not a weight class).
// This app is women-first; "Doubles" and "Relay" without gender default to Women's weights.

export interface DivisionWeights {
  sledPush: number;       // total kg including sled
  sledPull: number;       // total kg including sled
  farmersCarry: number;   // kg per hand (kettlebell)
  sandbagLunge: number;   // kg (sandbag)
  wallBall: number;       // kg (medicine ball)
  wallBallHeight: string; // target height
}

export const DIVISION_WEIGHTS: Record<string, DivisionWeights> = {
  Women: {
    sledPush: 102, sledPull: 68,
    farmersCarry: 16, sandbagLunge: 10,
    wallBall: 4, wallBallHeight: '9 ft / 2.7 m',
  },
  Men: {
    sledPush: 152, sledPull: 103,
    farmersCarry: 24, sandbagLunge: 20,
    wallBall: 6, wallBallHeight: '10 ft / 3 m',
  },
  Doubles: {
    // Mixed Doubles use Men's weights; Women's Doubles use Women's weights.
    // Since this app targets women, default to Women's weights for Doubles.
    sledPush: 102, sledPull: 68,
    farmersCarry: 16, sandbagLunge: 10,
    wallBall: 4, wallBallHeight: '9 ft / 2.7 m',
  },
  Relay: {
    sledPush: 102, sledPull: 68,
    farmersCarry: 16, sandbagLunge: 10,
    wallBall: 4, wallBallHeight: '9 ft / 2.7 m',
  },
  Pro: {
    // Pro Women use the same weights as Open Women
    sledPush: 102, sledPull: 68,
    farmersCarry: 16, sandbagLunge: 10,
    wallBall: 4, wallBallHeight: '9 ft / 2.7 m',
  },
};

// Returns the weight spec for a station given the current division
export function getStationWeight(stationId: string, division = 'Women'): number | undefined {
  const w = DIVISION_WEIGHTS[division] ?? DIVISION_WEIGHTS.Women;
  switch (stationId) {
    case 'hyrox-sled-push':     return w.sledPush;
    case 'hyrox-sled-pull':     return w.sledPull;
    case 'hyrox-farmers-carry': return w.farmersCarry;
    case 'hyrox-sandbag-lunge': return w.sandbagLunge;
    case 'hyrox-wall-ball':     return w.wallBall;
    default:                    return undefined;
  }
}

export interface HyroxStation {
  id: string;
  name: string;
  target: string;           // "1 km", "1000 m", etc.
  fields: ExerciseTemplate['fields'];
  tips: { et: string; en: string };
  // weightNote: human-readable tip shown in SetLogger
  weightNote?: (division: string) => string;
}

export const HYROX_STATIONS: HyroxStation[] = [
  {
    id: 'hyrox-skierg',
    name: 'SkiErg',
    target: '1000 m',
    fields: ['duration', 'distance'],
    tips: {
      et: 'Püsi ühtlasel tempos. Venita käed täielikult üles.',
      en: "Keep a steady pace. Extend arms fully overhead.",
    },
  },
  {
    id: 'hyrox-sled-push',
    name: 'Sled Push',
    target: '50 m',
    fields: ['duration', 'distance', 'weight'],
    tips: {
      et: 'Hoia selg sirge, lükka säärtega.',
      en: 'Keep back flat, drive with legs.',
    },
    weightNote: (div) => {
      const w = DIVISION_WEIGHTS[div] ?? DIVISION_WEIGHTS.Women;
      return `${div}: ${w.sledPush} kg (sh kelk / incl. sled)`;
    },
  },
  {
    id: 'hyrox-sled-pull',
    name: 'Sled Pull',
    target: '50 m',
    fields: ['duration', 'distance', 'weight'],
    tips: {
      et: 'Köis käte vahel. Tõmba kiire kõnniga.',
      en: 'Rope between legs. Pull with a quick walk.',
    },
    weightNote: (div) => {
      const w = DIVISION_WEIGHTS[div] ?? DIVISION_WEIGHTS.Women;
      return `${div}: ${w.sledPull} kg (sh kelk / incl. sled)`;
    },
  },
  {
    id: 'hyrox-burpee-broad',
    name: 'Burpee Broad Jump',
    target: '80 m',
    fields: ['duration', 'distance'],
    tips: {
      et: 'Iga hüpe läheb edasi. Ära kuku samale kohale tagasi.',
      en: "Each jump moves forward. Don't land back in the same spot.",
    },
  },
  {
    id: 'hyrox-row',
    name: 'Rowing',
    target: '1000 m',
    fields: ['duration', 'distance'],
    tips: {
      et: 'Alusta aeglasemalt ja tõsta tempo lõpus. Jälgi tempot/500m.',
      en: 'Start conservative and push the last 200 m. Watch split time.',
    },
  },
  {
    id: 'hyrox-farmers-carry',
    name: "Farmer's Carry",
    target: '200 m',
    fields: ['duration', 'distance', 'weight'],
    tips: {
      et: 'Kanna kettlebelle külgedel. Hoia õlad all.',
      en: 'Kettlebells at sides. Keep shoulders down.',
    },
    weightNote: (div) => {
      const w = DIVISION_WEIGHTS[div] ?? DIVISION_WEIGHTS.Women;
      return `${div}: 2 × ${w.farmersCarry} kg`;
    },
  },
  {
    id: 'hyrox-sandbag-lunge',
    name: 'Sandbag Lunge',
    target: '100 m',
    fields: ['duration', 'distance', 'weight'],
    tips: {
      et: 'Kott õlal. Põlv ei puutu maad.',
      en: "Bag on shoulder. Knee doesn't touch ground.",
    },
    weightNote: (div) => {
      const w = DIVISION_WEIGHTS[div] ?? DIVISION_WEIGHTS.Women;
      return `${div}: ${w.sandbagLunge} kg`;
    },
  },
  {
    id: 'hyrox-wall-ball',
    name: 'Wall Ball',
    target: '100 reps',
    fields: ['reps', 'weight'],
    tips: {
      et: 'Squat alla, viska üles sihtmärgile.',
      en: 'Squat down, throw up to the target.',
    },
    weightNote: (div) => {
      const w = DIVISION_WEIGHTS[div] ?? DIVISION_WEIGHTS.Women;
      return `${div}: ${w.wallBall} kg · target ${w.wallBallHeight}`;
    },
  },
];

// The full race: 8 runs + 8 stations interleaved
export interface HyroxRaceStation {
  order: number;
  type: 'run' | 'station';
  station?: HyroxStation;
  label: string;
}

export function getHyroxRaceOrder(): HyroxRaceStation[] {
  const result: HyroxRaceStation[] = [];
  for (let i = 0; i < HYROX_STATIONS.length; i++) {
    result.push({ order: result.length, type: 'run', label: 'Run 1 km' });
    result.push({ order: result.length, type: 'station', station: HYROX_STATIONS[i], label: HYROX_STATIONS[i].name });
  }
  return result;
}

// LoggedExercise shape for the workout builder
export interface LoggedExercise {
  template: ExerciseTemplate;
  sets: ExerciseSet[];
}

export function getHyroxTemplate(division = 'Women'): LoggedExercise[] {
  const exercises: LoggedExercise[] = [];
  for (const station of HYROX_STATIONS) {
    // Run leg before each station
    exercises.push({
      template: {
        id: 'hyrox-run', name: 'Run (1 km)',
        category: 'hyrox', popularity: 10,
        fields: ['duration', 'distance'],
      },
      sets: [{ distance_km: 1 }],
    });
    // Station — look up the correct weight for this division
    const weight = getStationWeight(station.id, division);
    exercises.push({
      template: {
        id: station.id,
        name: station.name,
        category: 'hyrox',
        popularity: 10,
        fields: station.fields,
      },
      sets: weight != null ? [{ weight_kg: weight }] : [{}],
    });
  }
  return exercises;
}

// ─── Time Formatting ───────────────────────────────────────────────────────────

export function formatSimTime(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return '—';
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  if (h === 0) return `${m} min`;
  return `${h}h ${m > 0 ? `${m} min` : ''}`.trim();
}

export function formatPace(minPerKm: number): string {
  if (!minPerKm || minPerKm <= 0) return '—';
  const m = Math.floor(minPerKm);
  const s = Math.round((minPerKm - m) * 60);
  return `${m}:${s.toString().padStart(2, '0')} /km`;
}

export function calcHyroxTotalTime(exercises: Exercise[]): number {
  return exercises.reduce((sum, ex) => {
    if (ex.logged_sets?.length) {
      return sum + ex.logged_sets.reduce((s, set) => s + (set.duration_min ?? 0), 0);
    }
    return sum + (ex.duration_min ?? 0);
  }, 0);
}

// ─── Station Analysis ──────────────────────────────────────────────────────────

export interface StationResult {
  id: string;
  name: string;
  duration_min: number;
  weight_kg?: number;
  distance_km?: number;
  reps?: number;
}

export function extractStationResults(exercises: Exercise[]): StationResult[] {
  return exercises
    .filter(ex => ex.category === 'hyrox' && ex.exercise_id !== 'hyrox-run')
    .map(ex => {
      const set = ex.logged_sets?.[0] ?? {};
      return {
        id: ex.exercise_id ?? ex.name,
        name: ex.name,
        duration_min: ex.logged_sets?.reduce((s, x) => s + (x.duration_min ?? 0), 0) ?? ex.duration_min ?? 0,
        weight_kg: set.weight_kg,
        distance_km: set.distance_km,
        reps: set.reps,
      };
    });
}

// ─── Smart Insights ────────────────────────────────────────────────────────────

interface WorkoutLike {
  name: string;
  date: string;
  phase: string;
  exercises: Exercise[];
}

export function getHyroxInsights(hyroxWorkouts: WorkoutLike[], lang: Lang): string[] {
  if (hyroxWorkouts.length < 2) {
    return lang === 'en'
      ? ['Complete at least 2 HYROX simulations to see smart insights.']
      : ['Tee vähemalt 2 HYROX simulatsiooni, et näha nutikaid tähelepanekuid.'];
  }

  const insights: string[] = [];
  const sorted = [...hyroxWorkouts].sort((a, b) => a.date.localeCompare(b.date));

  // ── Overall time trend
  const times = sorted.map(w => calcHyroxTotalTime(w.exercises)).filter(t => t > 0);
  if (times.length >= 2) {
    const first = times[0];
    const last  = times[times.length - 1];
    const diff  = Math.abs(first - last);
    if (last < first) {
      insights.push(lang === 'en'
        ? `Your simulation time improved by ${Math.round(diff)} minutes. Keep going! 💪`
        : `Sinu simulatsiooniaeg paranes ${Math.round(diff)} minutit. Nii hoiad! 💪`);
    }
  }

  // ── Station comparison: first vs last workout
  const stationsFirst = extractStationResults(sorted[0].exercises);
  const stationsLast  = extractStationResults(sorted[sorted.length - 1].exercises);

  const improved: string[] = [];
  const declined: string[] = [];

  for (const last of stationsLast) {
    const first = stationsFirst.find(s => s.id === last.id || s.name === last.name);
    if (!first || first.duration_min <= 0 || last.duration_min <= 0) continue;
    if (last.duration_min < first.duration_min) improved.push(last.name);
    if (last.duration_min > first.duration_min * 1.05) declined.push(last.name);
  }

  if (improved.length > 0) {
    insights.push(lang === 'en'
      ? `Getting faster: ${improved.join(', ')} ✓`
      : `Kiiremaks muutunud: ${improved.join(', ')} ✓`);
  }

  // ── Weakest stations (slowest vs target)
  const TARGET_STATION_MIN: Record<string, number> = {
    'hyrox-skierg': 5.5, 'hyrox-sled-push': 3.5, 'hyrox-sled-pull': 3.5,
    'hyrox-burpee-broad': 7, 'hyrox-row': 4.5, 'hyrox-farmers-carry': 3,
    'hyrox-sandbag-lunge': 6, 'hyrox-wall-ball': 8,
  };
  const latestStations = extractStationResults(sorted[sorted.length - 1].exercises);
  const weakest = latestStations
    .filter(s => {
      const target = TARGET_STATION_MIN[s.id];
      return target && s.duration_min > target * 1.15;
    })
    .sort((a, b) => {
      const ta = TARGET_STATION_MIN[a.id] ?? 999;
      const tb = TARGET_STATION_MIN[b.id] ?? 999;
      return (b.duration_min / tb) - (a.duration_min / ta);
    });

  if (weakest.length > 0) {
    insights.push(lang === 'en'
      ? `Focus area: ${weakest.slice(0, 2).map(s => s.name).join(' and ')}.`
      : `Arenguala: ${weakest.slice(0, 2).map(s => s.name).join(' ja ')}.`);
  }

  // ── Strongest station
  const strongest = latestStations
    .filter(s => {
      const target = TARGET_STATION_MIN[s.id];
      return target && s.duration_min > 0 && s.duration_min <= target * 0.95;
    });

  if (strongest.length > 0) {
    insights.push(lang === 'en'
      ? `Strongest station: ${strongest[0].name} 🏆`
      : `Tugevaim jaam: ${strongest[0].name} 🏆`);
  }

  // ── Cycle phase connection
  const goodPhases = sorted
    .filter(w => {
      const t = calcHyroxTotalTime(w.exercises);
      return t > 0 && t <= Math.min(...times) * 1.05;
    })
    .map(w => w.phase)
    .filter(Boolean);

  if (goodPhases.length > 0) {
    insights.push(lang === 'en'
      ? 'Your performance may vary with your cycle phase — notice your patterns.'
      : 'Sinu sooritusvõime võib tsüklifa asiga muutuda — märka oma mustreid.');
  }

  // ── General tips
  insights.push(lang === 'en'
    ? 'Tip: your run pace is key — try not to go out too fast on Run 1.'
    : 'Nipp: jooksutempo on võtmetegur — ära mine esimesel kilomeetril liiga kiiresti.');

  return insights;
}

// ─── Training Plans ────────────────────────────────────────────────────────────

export type PlanDuration = 4 | 8 | 12;
export type SessionIntensity = 'recovery' | 'base' | 'moderate' | 'hard' | 'race';

export interface PlanSession {
  day: string;
  type: string;
  description: { et: string; en: string };
  duration_min: number;
  intensity: SessionIntensity;
}

export interface PlanWeek {
  week: number;
  theme: { et: string; en: string };
  sessions: PlanSession[];
}

export interface TrainingPlan {
  id: string;
  name: { et: string; en: string };
  weeks: PlanDuration;
  sessionsPerWeek: number;
  focus: { et: string; en: string };
  weeklyStructure: PlanWeek[];
}

function makePlan4(): TrainingPlan {
  return {
    id: '4w',
    name: { et: '4-nädalane alus', en: '4-Week Foundation' },
    weeks: 4,
    sessionsPerWeek: 3,
    focus: { et: 'Tutvumine HYROX harjutustega, aeroobne alus', en: 'Learn HYROX movements, build aerobic base' },
    weeklyStructure: [
      {
        week: 1,
        theme: { et: 'Orienteerumine', en: 'Orientation' },
        sessions: [
          { day: 'Mon', type: 'Run + SkiErg', description: { et: '3 km kerge jooks + 500 m SkiErg tehnika', en: '3 km easy run + 500 m SkiErg technique' }, duration_min: 40, intensity: 'base' },
          { day: 'Wed', type: 'Station Intro', description: { et: 'Tutvumine: kelgu tõuk/tõmme, Farmer\'s Carry, Wall Ball', en: 'Intro: sled push/pull, Farmer\'s Carry, Wall Ball' }, duration_min: 50, intensity: 'base' },
          { day: 'Fri', type: 'Long Run', description: { et: '5 km aeglane jooks', en: '5 km easy long run' }, duration_min: 35, intensity: 'base' },
        ],
      },
      {
        week: 2,
        theme: { et: 'Maht', en: 'Volume' },
        sessions: [
          { day: 'Mon', type: 'Run + Row', description: { et: '4 km jooks + 750 m aerutamine', en: '4 km run + 750 m rowing' }, duration_min: 45, intensity: 'base' },
          { day: 'Wed', type: 'HYROX Stations', description: { et: 'Kõik 8 jaama × 1 ring, madal tempo', en: 'All 8 stations × 1 round, easy pace' }, duration_min: 60, intensity: 'moderate' },
          { day: 'Sat', type: 'Interval Run', description: { et: '4 × 1 km, puhkus 2 min vahel', en: '4 × 1 km, 2 min rest between' }, duration_min: 35, intensity: 'moderate' },
        ],
      },
      {
        week: 3,
        theme: { et: 'Spetsiifika', en: 'Specificity' },
        sessions: [
          { day: 'Tue', type: 'Sled + Burpee', description: { et: '3 × 50 m kelgu tõuk + 3 × 20 m Burpee hüpped', en: '3 × 50 m sled push + 3 × 20 m burpee broad jumps' }, duration_min: 45, intensity: 'hard' },
          { day: 'Thu', type: 'Run + SkiErg + Row', description: { et: '5 km jooks + 500 m SkiErg + 500 m aer', en: '5 km run + 500 m SkiErg + 500 m row' }, duration_min: 55, intensity: 'moderate' },
          { day: 'Sat', type: 'Half Sim', description: { et: 'Poolsimulatsiooon (esimesed 4 jaama)', en: 'Half simulation (first 4 stations)' }, duration_min: 50, intensity: 'hard' },
        ],
      },
      {
        week: 4,
        theme: { et: 'Taastumine + test', en: 'Recovery + Test' },
        sessions: [
          { day: 'Mon', type: 'Easy Run', description: { et: '3 km kerge jooks', en: '3 km easy recovery run' }, duration_min: 25, intensity: 'recovery' },
          { day: 'Wed', type: 'Station Flush', description: { et: 'Kõik jaamad, kerge tempo, tehnikale rõhk', en: 'All stations, easy pace, focus on technique' }, duration_min: 40, intensity: 'recovery' },
          { day: 'Sat', type: 'Full Simulation', description: { et: 'Täissimulatsiooon — võta aeg ja hinda arengut!', en: 'Full simulation — time yourself and see your progress!' }, duration_min: 90, intensity: 'race' },
        ],
      },
    ],
  };
}

function makePlan8(): TrainingPlan {
  const base4 = makePlan4();
  const buildWeeks: PlanWeek[] = [
    {
      week: 5,
      theme: { et: 'Jõud + kiirus', en: 'Strength + Speed' },
      sessions: [
        { day: 'Mon', type: 'Tempo Run', description: { et: '6 km + viimased 2 km tempos', en: '6 km with last 2 km at race pace' }, duration_min: 45, intensity: 'hard' },
        { day: 'Wed', type: 'Sled + Carry', description: { et: '5 × 50 m kelgu tõuk + 3 × 50 m Farmer\'s Carry', en: '5 × 50 m sled push + 3 × 50 m Farmer\'s Carry' }, duration_min: 55, intensity: 'hard' },
        { day: 'Fri', type: 'SkiErg + Row', description: { et: '3 × 500 m SkiErg + 3 × 500 m aer', en: '3 × 500 m SkiErg + 3 × 500 m row' }, duration_min: 45, intensity: 'moderate' },
        { day: 'Sun', type: 'Long Run', description: { et: '8–10 km aeglane jooks', en: '8–10 km easy long run' }, duration_min: 60, intensity: 'base' },
      ],
    },
    {
      week: 6,
      theme: { et: 'Kestvus', en: 'Endurance' },
      sessions: [
        { day: 'Tue', type: 'Wall Ball + Lunge', description: { et: '4 × 25 Wall Ball + 2 × 50 m Sandbag Lunge', en: '4 × 25 Wall Ball + 2 × 50 m Sandbag Lunge' }, duration_min: 50, intensity: 'hard' },
        { day: 'Thu', type: 'Run + Stations', description: { et: '3 km jooks + 4 jaama kiirel tempos', en: '3 km run + 4 stations at race pace' }, duration_min: 55, intensity: 'hard' },
        { day: 'Sat', type: 'Full Sim', description: { et: 'Täissimulatsiooon nr 2', en: 'Full simulation #2' }, duration_min: 90, intensity: 'race' },
      ],
    },
    {
      week: 7,
      theme: { et: 'Tippkoormus', en: 'Peak Load' },
      sessions: [
        { day: 'Mon', type: 'Interval Run', description: { et: '6 × 1 km, puhkus 90 sek', en: '6 × 1 km, 90 sec rest' }, duration_min: 50, intensity: 'hard' },
        { day: 'Wed', type: 'All Stations Hard', description: { et: 'Kõik 8 jaama, võistlustempo', en: 'All 8 stations at race pace' }, duration_min: 65, intensity: 'hard' },
        { day: 'Fri', type: 'Recovery Run', description: { et: '4 km kerge jooks', en: '4 km easy run' }, duration_min: 30, intensity: 'recovery' },
      ],
    },
    {
      week: 8,
      theme: { et: 'Lühendamine', en: 'Taper' },
      sessions: [
        { day: 'Mon', type: 'Easy Run', description: { et: '3 km kerge', en: '3 km easy' }, duration_min: 25, intensity: 'recovery' },
        { day: 'Wed', type: 'Strides + Stations', description: { et: 'Kerged kiirused + jaama kordused', en: 'Easy strides + station run-throughs' }, duration_min: 35, intensity: 'base' },
        { day: 'Sat', type: 'Race / Final Sim', description: { et: 'VÕISTLUS või lõplik simulatsioon', en: 'RACE or final simulation' }, duration_min: 90, intensity: 'race' },
      ],
    },
  ];
  return {
    id: '8w',
    name: { et: '8-nädalane ehitus', en: '8-Week Build' },
    weeks: 8,
    sessionsPerWeek: 4,
    focus: { et: 'Jõu ja kestvuse kombineerimine, esimene täissimulatsiooon', en: 'Combine strength and endurance, first full simulation' },
    weeklyStructure: [...base4.weeklyStructure, ...buildWeeks],
  };
}

function makePlan12(): TrainingPlan {
  const base8 = makePlan8();
  const peakWeeks: PlanWeek[] = [
    { week: 9,  theme: { et: 'Võimsuse ehitus', en: 'Power Build' },   sessions: [
      { day: 'Mon', type: 'Tempo Run', description: { et: '8 km + 3 km võistlustempol', en: '8 km + 3 km race pace' }, duration_min: 55, intensity: 'hard' },
      { day: 'Tue', type: 'Heavy Sled', description: { et: '6 × 50 m kelgu tõuk lisaraskusega', en: '6 × 50 m sled push with extra weight' }, duration_min: 40, intensity: 'hard' },
      { day: 'Thu', type: 'SkiErg + Row Race', description: { et: '1000 m SkiErg võistlustempol + 1000 m aer', en: '1000 m SkiErg race pace + 1000 m row' }, duration_min: 25, intensity: 'hard' },
      { day: 'Sat', type: 'Long Run', description: { et: '12 km aeglane jooks', en: '12 km easy long run' }, duration_min: 70, intensity: 'base' },
    ]},
    { week: 10, theme: { et: 'Simulatsioon + analüüs', en: 'Sim + Analysis' }, sessions: [
      { day: 'Mon', type: 'Recovery', description: { et: 'Kerge jooks, venitamine', en: 'Easy run, stretching' }, duration_min: 30, intensity: 'recovery' },
      { day: 'Wed', type: 'Station Speed Work', description: { et: 'Kõik jaamad kiirel tempos × 2', en: 'All stations fast × 2' }, duration_min: 60, intensity: 'hard' },
      { day: 'Sat', type: 'Full Sim + Debrief', description: { et: 'Täissimulatsiooon + kirjuta tulemused üles', en: 'Full simulation + log all station times' }, duration_min: 90, intensity: 'race' },
    ]},
    { week: 11, theme: { et: 'Nõrkade jaamade fookus', en: 'Weak Station Focus' }, sessions: [
      { day: 'Mon', type: 'Run Intervals', description: { et: '8 × 800 m, puhkus 60 sek', en: '8 × 800 m, 60 sec rest' }, duration_min: 55, intensity: 'hard' },
      { day: 'Wed', type: 'Weakness Work', description: { et: 'Sinu 2 nõimat jaama × 4 seeriat', en: 'Your 2 weakest stations × 4 sets each' }, duration_min: 45, intensity: 'hard' },
      { day: 'Fri', type: 'Easy', description: { et: 'Kerge jooks + rullimine', en: 'Easy run + foam rolling' }, duration_min: 30, intensity: 'recovery' },
    ]},
    { week: 12, theme: { et: 'Lühendamine + võistlus', en: 'Taper + Race' }, sessions: [
      { day: 'Mon', type: 'Easy Run', description: { et: '3 km väga kerge', en: '3 km very easy' }, duration_min: 20, intensity: 'recovery' },
      { day: 'Wed', type: 'Activation', description: { et: 'Lühikesed jaama kordused, tunne raskused', en: 'Short station run-throughs, feel the weights' }, duration_min: 25, intensity: 'base' },
      { day: 'Sat', type: '🏁 RACE DAY', description: { et: 'HYROX VÕISTLUS — anna kõik!', en: 'HYROX RACE — give everything!' }, duration_min: 95, intensity: 'race' },
    ]},
  ];
  return {
    id: '12w',
    name: { et: '12-nädalane tipptreening', en: '12-Week Peak Training' },
    weeks: 12,
    sessionsPerWeek: 4,
    focus: { et: 'Täielik võistluseks ettevalmistus, nõrkuste parandamine', en: 'Full race preparation, eliminate weaknesses' },
    weeklyStructure: [...base8.weeklyStructure, ...peakWeeks],
  };
}

export const TRAINING_PLANS: TrainingPlan[] = [makePlan4(), makePlan8(), makePlan12()];

// ─── Division defaults ────────────────────────────────────────────────────────

export const HYROX_DIVISIONS = ['Women', 'Men', 'Doubles', 'Relay', 'Pro'] as const;
export type HyroxDivision = typeof HYROX_DIVISIONS[number];

export const DIVISION_TARGET_MINUTES: Record<HyroxDivision, number> = {
  Women: 90,
  Men:   75,
  Doubles: 80,
  Relay: 70,
  Pro:   60,
};

// ─── Personalized Plan ────────────────────────────────────────────────────────

export interface PersonalizedPlan {
  plan: TrainingPlan;
  weeksUntilRace: number | null;   // null = no date set
  currentWeekIndex: number;        // 0-based index into weeklyStructure
  thisWeek: PlanWeek;
  focusAreas: string[];            // names of weak stations to highlight
  countdownLabel: { et: string; en: string };
  planStartLabel: { et: string; en: string };
}

export function generatePersonalizedPlan(
  competitionDate: string | undefined,
  goalMinutes: number | undefined,
  currentSimMinutes: number | undefined,
  weakestStationIds: string[] | undefined,
  lang: Lang,
): PersonalizedPlan | null {
  if (!goalMinutes) return null;

  // ── Pick plan duration based on weeks until race ───────────────────────────
  let weeksUntilRace: number | null = null;
  if (competitionDate) {
    const now  = new Date();
    const race = new Date(competitionDate);
    weeksUntilRace = Math.max(0, Math.round((race.getTime() - now.getTime()) / (7 * 86400000)));
  }

  let plan: TrainingPlan;
  if (weeksUntilRace !== null) {
    if (weeksUntilRace <= 5)       plan = TRAINING_PLANS[0]; // 4-week
    else if (weeksUntilRace <= 9)  plan = TRAINING_PLANS[1]; // 8-week
    else                           plan = TRAINING_PLANS[2]; // 12-week
  } else {
    // No date — pick by gap between current sim and goal
    const gap = (currentSimMinutes ?? 0) - goalMinutes;
    if (gap <= 5)       plan = TRAINING_PLANS[0];
    else if (gap <= 15) plan = TRAINING_PLANS[1];
    else                plan = TRAINING_PLANS[2];
  }

  // ── Which week of the plan are we in? ─────────────────────────────────────
  // If race date known: count back from it. Otherwise start from week 1.
  let currentWeekIndex = 0;
  if (weeksUntilRace !== null) {
    const weeksInPlan = plan.weeks;
    currentWeekIndex = Math.max(0, Math.min(weeksInPlan - 1, weeksInPlan - weeksUntilRace));
  }
  const thisWeek = plan.weeklyStructure[currentWeekIndex] ?? plan.weeklyStructure[0];

  // ── Weak station names ────────────────────────────────────────────────────
  const stationNameMap: Record<string, string> = {
    'hyrox-skierg':        'SkiErg',
    'hyrox-sled-push':     'Sled Push',
    'hyrox-sled-pull':     'Sled Pull',
    'hyrox-burpee-broad':  'Burpee Broad Jump',
    'hyrox-row':           'Rowing',
    'hyrox-farmers-carry': "Farmer's Carry",
    'hyrox-sandbag-lunge': 'Sandbag Lunge',
    'hyrox-wall-ball':     'Wall Ball',
  };
  const focusAreas = (weakestStationIds ?? []).map(id => stationNameMap[id] ?? id).slice(0, 3);

  // ── Countdown label ────────────────────────────────────────────────────────
  const countdownLabel = weeksUntilRace !== null
    ? {
        et: weeksUntilRace === 0
          ? 'Võistluspäev on täna! 🏁'
          : weeksUntilRace === 1
            ? '1 nädal võistluseni'
            : `${weeksUntilRace} nädalat võistluseni`,
        en: weeksUntilRace === 0
          ? 'Race day is today! 🏁'
          : weeksUntilRace === 1
            ? '1 week until race'
            : `${weeksUntilRace} weeks until race`,
      }
    : { et: 'Kuupäev pole seatud', en: 'No race date set' };

  const planStartLabel = {
    et: `${lang === 'et' ? (plan.name.et) : plan.name.en} · nädal ${currentWeekIndex + 1}/${plan.weeks}`,
    en: `${plan.name.en} · week ${currentWeekIndex + 1}/${plan.weeks}`,
  };

  return { plan, weeksUntilRace, currentWeekIndex, thisWeek, focusAreas, countdownLabel, planStartLabel };
}
