import { ExerciseTemplate, ExerciseField } from '../types';

// ─── Categories ───────────────────────────────────────────────────────────────
// UI categories — simplified for the picker
export const CATEGORIES: { id: string; label: string; icon: string; dbCategories?: string[] }[] = [
  { id: 'all',       label: 'Kõik',              icon: 'spark'   },
  { id: 'chest',     label: 'Rind',              icon: 'barbell' },
  { id: 'back',      label: 'Selg',              icon: 'barbell' },
  { id: 'shoulders', label: 'Õlad',              icon: 'barbell' },
  { id: 'biceps',    label: 'Biitseps',          icon: 'barbell' },
  { id: 'triceps',   label: 'Triitseps',         icon: 'barbell' },
  { id: 'legs',      label: 'Jalad',             icon: 'barbell' },
  { id: 'glutes',    label: 'Tuharad',           icon: 'barbell' },
  { id: 'core',      label: 'Kesk­keha',         icon: 'barbell' },
  // Cardio group — covers all movement/endurance categories
  {
    id: 'cardio-all', label: 'Kardio',           icon: 'wave',
    dbCategories: ['cardio','running','walking','cycling','swimming','hiit'],
  },
  { id: 'fullbody',  label: 'Kogu keha',         icon: 'barbell',
    dbCategories: ['fullbody','functional'],
  },
  // Mind-body group
  {
    id: 'mindBody',   label: 'Jooga & Venitus',  icon: 'leaf',
    dbCategories: ['yoga','pilates','mobility','stretching'],
  },
];

// Map a UI category id to the list of db category ids it covers
export function getCategoryDbIds(uiId: string): string[] | null {
  if (uiId === 'all') return null;
  const cat = CATEGORIES.find(c => c.id === uiId);
  if (!cat) return [uiId];
  return cat.dbCategories ?? [uiId];
}

// Find the best display label for a db category
export function getCategoryLabel(dbCat: string): string {
  // direct match
  const direct = CATEGORIES.find(c => c.id === dbCat);
  if (direct) return direct.label;
  // group match
  const group = CATEGORIES.find(c => c.dbCategories?.includes(dbCat));
  if (group) return group.label;
  return dbCat;
}

const S:   ExerciseField[] = ['sets', 'reps', 'weight'];
const SR:  ExerciseField[] = ['sets', 'reps'];
const SRD: ExerciseField[] = ['sets', 'reps', 'duration']; // bodyweight/HIIT: reps + optional seconds
const CD:  ExerciseField[] = ['duration', 'distance'];
const DUR: ExerciseField[] = ['duration'];

// ─── Exercise Database ─────────────────────────────────────────────────────────
export const EXERCISE_DB: ExerciseTemplate[] = [

  // ── CHEST ──────────────────────────────────────────────────────────────────
  { id: 'bench-press',          name: 'Bench Press',                category: 'chest',     popularity: 10, fields: S   },
  { id: 'incline-bench-press',  name: 'Incline Bench Press',        category: 'chest',     popularity: 9,  fields: S   },
  { id: 'decline-bench-press',  name: 'Decline Bench Press',        category: 'chest',     popularity: 7,  fields: S   },
  { id: 'db-bench-press',       name: 'Dumbbell Bench Press',       category: 'chest',     popularity: 9,  fields: S   },
  { id: 'incline-db-press',     name: 'Incline Dumbbell Press',     category: 'chest',     popularity: 8,  fields: S   },
  { id: 'db-flyes',             name: 'Dumbbell Flyes',             category: 'chest',     popularity: 7,  fields: S   },
  { id: 'cable-crossover',      name: 'Cable Crossover',            category: 'chest',     popularity: 7,  fields: S   },
  { id: 'cable-chest-fly',      name: 'Cable Chest Fly',            category: 'chest',     popularity: 7,  fields: S   },
  { id: 'chest-dip',            name: 'Chest Dip',                  category: 'chest',     popularity: 7,  fields: SR  },
  { id: 'push-up',              name: 'Push-Up',                    category: 'chest',     popularity: 10, fields: SR  },
  { id: 'wide-push-up',         name: 'Wide Push-Up',               category: 'chest',     popularity: 6,  fields: SR  },
  { id: 'diamond-push-up',      name: 'Diamond Push-Up',            category: 'chest',     popularity: 6,  fields: SR  },
  { id: 'machine-chest-press',  name: 'Machine Chest Press',        category: 'chest',     popularity: 8,  fields: S   },
  { id: 'pec-deck',             name: 'Pec Deck',                   category: 'chest',     popularity: 7,  fields: S   },
  { id: 'dumbbell-pullover',    name: 'Dumbbell Pullover',          category: 'chest',     popularity: 6,  fields: S   },

  // ── BACK ───────────────────────────────────────────────────────────────────
  { id: 'pull-up',              name: 'Pull-Up',                    category: 'back',      popularity: 10, fields: SR  },
  { id: 'chin-up',              name: 'Chin-Up',                    category: 'back',      popularity: 9,  fields: SR  },
  { id: 'lat-pulldown',         name: 'Lat Pulldown',               category: 'back',      popularity: 10, fields: S   },
  { id: 'seated-cable-row',     name: 'Seated Cable Row',           category: 'back',      popularity: 9,  fields: S   },
  { id: 'bent-over-row',        name: 'Bent-Over Barbell Row',      category: 'back',      popularity: 9,  fields: S   },
  { id: 'db-row',               name: 'Dumbbell Row',               category: 'back',      popularity: 9,  fields: S   },
  { id: 't-bar-row',            name: 'T-Bar Row',                  category: 'back',      popularity: 7,  fields: S   },
  { id: 'face-pull',            name: 'Face Pull',                  category: 'back',      popularity: 8,  fields: S   },
  { id: 'deadlift',             name: 'Deadlift',                   category: 'back',      popularity: 10, fields: S   },
  { id: 'romanian-deadlift',    name: 'Romanian Deadlift',          category: 'back',      popularity: 9,  fields: S   },
  { id: 'sumo-deadlift',        name: 'Sumo Deadlift',              category: 'back',      popularity: 7,  fields: S   },
  { id: 'cable-row-single',     name: 'Single-Arm Cable Row',       category: 'back',      popularity: 7,  fields: S   },
  { id: 'inverted-row',         name: 'Inverted Row',               category: 'back',      popularity: 6,  fields: SR  },
  { id: 'chest-supported-row',  name: 'Chest-Supported Row',        category: 'back',      popularity: 6,  fields: S   },
  { id: 'back-extension',       name: 'Back Extension',             category: 'back',      popularity: 7,  fields: SR  },
  { id: 'good-morning',         name: 'Good Morning',               category: 'back',      popularity: 6,  fields: S   },

  // ── SHOULDERS ─────────────────────────────────────────────────────────────
  { id: 'overhead-press',       name: 'Overhead Press',             category: 'shoulders', popularity: 10, fields: S   },
  { id: 'db-shoulder-press',    name: 'Dumbbell Shoulder Press',    category: 'shoulders', popularity: 9,  fields: S   },
  { id: 'arnold-press',         name: 'Arnold Press',               category: 'shoulders', popularity: 8,  fields: S   },
  { id: 'lateral-raise',        name: 'Lateral Raise',              category: 'shoulders', popularity: 9,  fields: S   },
  { id: 'front-raise',          name: 'Front Raise',                category: 'shoulders', popularity: 7,  fields: S   },
  { id: 'rear-delt-fly',        name: 'Rear Delt Fly',              category: 'shoulders', popularity: 8,  fields: S   },
  { id: 'upright-row',          name: 'Upright Row',                category: 'shoulders', popularity: 7,  fields: S   },
  { id: 'cable-lateral-raise',  name: 'Cable Lateral Raise',        category: 'shoulders', popularity: 7,  fields: S   },
  { id: 'machine-shoulder',     name: 'Machine Shoulder Press',     category: 'shoulders', popularity: 7,  fields: S   },
  { id: 'band-pull-apart',      name: 'Band Pull-Apart',            category: 'shoulders', popularity: 6,  fields: SR  },
  { id: 'shrug',                name: 'Barbell Shrug',              category: 'shoulders', popularity: 7,  fields: S   },
  { id: 'db-shrug',             name: 'Dumbbell Shrug',             category: 'shoulders', popularity: 6,  fields: S   },

  // ── BICEPS ────────────────────────────────────────────────────────────────
  { id: 'barbell-curl',         name: 'Barbell Curl',               category: 'biceps',    popularity: 10, fields: S   },
  { id: 'db-curl',              name: 'Dumbbell Curl',              category: 'biceps',    popularity: 10, fields: S   },
  { id: 'hammer-curl',          name: 'Hammer Curl',                category: 'biceps',    popularity: 9,  fields: S   },
  { id: 'preacher-curl',        name: 'Preacher Curl',              category: 'biceps',    popularity: 8,  fields: S   },
  { id: 'concentration-curl',   name: 'Concentration Curl',         category: 'biceps',    popularity: 8,  fields: S   },
  { id: 'cable-curl',           name: 'Cable Curl',                 category: 'biceps',    popularity: 8,  fields: S   },
  { id: 'incline-db-curl',      name: 'Incline Dumbbell Curl',      category: 'biceps',    popularity: 7,  fields: S   },
  { id: 'spider-curl',          name: 'Spider Curl',                category: 'biceps',    popularity: 6,  fields: S   },
  { id: 'zottman-curl',         name: 'Zottman Curl',               category: 'biceps',    popularity: 5,  fields: S   },
  { id: 'cable-hammer-curl',    name: 'Cable Hammer Curl',          category: 'biceps',    popularity: 6,  fields: S   },

  // ── TRICEPS ───────────────────────────────────────────────────────────────
  { id: 'triceps-pushdown',     name: 'Triceps Pushdown',           category: 'triceps',   popularity: 10, fields: S   },
  { id: 'skull-crusher',        name: 'Skull Crusher',              category: 'triceps',   popularity: 9,  fields: S   },
  { id: 'close-grip-bench',     name: 'Close-Grip Bench Press',     category: 'triceps',   popularity: 8,  fields: S   },
  { id: 'overhead-tri-ext',     name: 'Overhead Triceps Extension', category: 'triceps',   popularity: 8,  fields: S   },
  { id: 'db-kickback',          name: 'Dumbbell Kickback',          category: 'triceps',   popularity: 7,  fields: S   },
  { id: 'bench-dip',            name: 'Bench Dip',                  category: 'triceps',   popularity: 7,  fields: SR  },
  { id: 'rope-pushdown',        name: 'Rope Pushdown',              category: 'triceps',   popularity: 8,  fields: S   },
  { id: 'cable-overhead-ext',   name: 'Cable Overhead Extension',   category: 'triceps',   popularity: 7,  fields: S   },
  { id: 'tate-press',           name: 'Tate Press',                 category: 'triceps',   popularity: 5,  fields: S   },

  // ── LEGS ──────────────────────────────────────────────────────────────────
  { id: 'squat',                name: 'Squat',                      category: 'legs',      popularity: 10, fields: S   },
  { id: 'front-squat',          name: 'Front Squat',                category: 'legs',      popularity: 8,  fields: S   },
  { id: 'bulgarian-split-squat',name: 'Bulgarian Split Squat',      category: 'legs',      popularity: 9,  fields: S   },
  { id: 'goblet-squat',         name: 'Goblet Squat',               category: 'legs',      popularity: 8,  fields: S   },
  { id: 'smith-machine-squat',  name: 'Smith Machine Squat',        category: 'legs',      popularity: 8,  fields: S   },
  { id: 'leg-press',            name: 'Leg Press',                  category: 'legs',      popularity: 10, fields: S   },
  { id: 'hack-squat',           name: 'Hack Squat',                 category: 'legs',      popularity: 7,  fields: S   },
  { id: 'leg-extension',        name: 'Leg Extension',              category: 'legs',      popularity: 9,  fields: S   },
  { id: 'leg-curl',             name: 'Leg Curl',                   category: 'legs',      popularity: 9,  fields: S   },
  { id: 'stiff-leg-deadlift',   name: 'Stiff-Leg Deadlift',         category: 'legs',      popularity: 7,  fields: S   },
  { id: 'lunge',                name: 'Lunge',                      category: 'legs',      popularity: 9,  fields: S   },
  { id: 'walking-lunge',        name: 'Walking Lunge',              category: 'legs',      popularity: 8,  fields: S   },
  { id: 'reverse-lunge',        name: 'Reverse Lunge',              category: 'legs',      popularity: 7,  fields: S   },
  { id: 'step-up',              name: 'Step-Up',                    category: 'legs',      popularity: 7,  fields: S   },
  { id: 'box-jump',             name: 'Box Jump',                   category: 'legs',      popularity: 8,  fields: SR  },
  { id: 'calf-raise',           name: 'Calf Raise',                 category: 'legs',      popularity: 9,  fields: S   },
  { id: 'seated-calf-raise',    name: 'Seated Calf Raise',          category: 'legs',      popularity: 7,  fields: S   },
  { id: 'nordic-curl',          name: 'Nordic Hamstring Curl',      category: 'legs',      popularity: 7,  fields: SR  },
  { id: 'leg-abduction',        name: 'Leg Abduction Machine',      category: 'legs',      popularity: 7,  fields: S   },
  { id: 'leg-adduction',        name: 'Leg Adduction Machine',      category: 'legs',      popularity: 7,  fields: S   },
  { id: 'single-leg-press',     name: 'Single-Leg Press',           category: 'legs',      popularity: 6,  fields: S   },
  { id: 'sissy-squat',          name: 'Sissy Squat',                category: 'legs',      popularity: 5,  fields: SR  },

  // ── GLUTES ────────────────────────────────────────────────────────────────
  { id: 'hip-thrust',           name: 'Hip Thrust',                 category: 'glutes',    popularity: 10, fields: S   },
  { id: 'barbell-hip-thrust',   name: 'Barbell Hip Thrust',         category: 'glutes',    popularity: 9,  fields: S   },
  { id: 'single-leg-hip-thrust',name: 'Single-Leg Hip Thrust',      category: 'glutes',    popularity: 7,  fields: SR  },
  { id: 'glute-bridge',         name: 'Glute Bridge',               category: 'glutes',    popularity: 8,  fields: SR  },
  { id: 'donkey-kick',          name: 'Donkey Kick',                category: 'glutes',    popularity: 7,  fields: SR  },
  { id: 'fire-hydrant',         name: 'Fire Hydrant',               category: 'glutes',    popularity: 7,  fields: SR  },
  { id: 'cable-kickback',       name: 'Cable Kickback',             category: 'glutes',    popularity: 7,  fields: S   },
  { id: 'hip-abduction',        name: 'Hip Abduction Machine',      category: 'glutes',    popularity: 8,  fields: S   },
  { id: 'banded-walk',          name: 'Banded Walk',                category: 'glutes',    popularity: 6,  fields: SR  },
  { id: 'sumo-squat',           name: 'Sumo Squat',                 category: 'glutes',    popularity: 7,  fields: S   },
  { id: 'cable-pull-through',   name: 'Cable Pull Through',         category: 'glutes',    popularity: 6,  fields: S   },
  { id: 'reverse-hyper',        name: 'Reverse Hyperextension',     category: 'glutes',    popularity: 6,  fields: S   },
  { id: 'hip-airplane',         name: 'Hip Airplane',               category: 'glutes',    popularity: 5,  fields: SR  },

  // ── CORE ──────────────────────────────────────────────────────────────────
  { id: 'plank',                name: 'Plank',                      category: 'core',      popularity: 10, fields: DUR },
  { id: 'side-plank',           name: 'Side Plank',                 category: 'core',      popularity: 9,  fields: DUR },
  { id: 'crunch',               name: 'Crunch',                     category: 'core',      popularity: 9,  fields: SR  },
  { id: 'bicycle-crunch',       name: 'Bicycle Crunch',             category: 'core',      popularity: 8,  fields: SR  },
  { id: 'russian-twist',        name: 'Russian Twist',              category: 'core',      popularity: 8,  fields: S   },
  { id: 'mountain-climber',     name: 'Mountain Climber',           category: 'core',      popularity: 8,  fields: SRD },
  { id: 'hanging-leg-raise',    name: 'Hanging Leg Raise',          category: 'core',      popularity: 8,  fields: SR  },
  { id: 'ab-wheel',             name: 'Ab Wheel Rollout',           category: 'core',      popularity: 7,  fields: SR  },
  { id: 'dead-bug',             name: 'Dead Bug',                   category: 'core',      popularity: 7,  fields: SR  },
  { id: 'bird-dog',             name: 'Bird Dog',                   category: 'core',      popularity: 7,  fields: SR  },
  { id: 'hollow-hold',          name: 'Hollow Body Hold',           category: 'core',      popularity: 6,  fields: DUR },
  { id: 'v-up',                 name: 'V-Up',                       category: 'core',      popularity: 7,  fields: SR  },
  { id: 'flutter-kicks',        name: 'Flutter Kicks',              category: 'core',      popularity: 7,  fields: SR  },
  { id: 'pallof-press',         name: 'Pallof Press',               category: 'core',      popularity: 6,  fields: S   },
  { id: 'cable-woodchop',       name: 'Cable Woodchop',             category: 'core',      popularity: 6,  fields: S   },
  { id: 'plank-shoulder-tap',   name: 'Plank Shoulder Tap',         category: 'core',      popularity: 6,  fields: SR  },
  { id: 'dragon-flag',          name: 'Dragon Flag',                category: 'core',      popularity: 5,  fields: SR  },
  { id: 'l-sit',                name: 'L-Sit',                      category: 'core',      popularity: 5,  fields: DUR },

  // ── FULL BODY ─────────────────────────────────────────────────────────────
  { id: 'burpee',               name: 'Burpee',                     category: 'fullbody',  popularity: 9,  fields: SR  },
  { id: 'kettlebell-swing',     name: 'Kettlebell Swing',           category: 'fullbody',  popularity: 9,  fields: S   },
  { id: 'turkish-get-up',       name: 'Turkish Get-Up',             category: 'fullbody',  popularity: 7,  fields: S   },
  { id: 'clean-and-press',      name: 'Clean and Press',            category: 'fullbody',  popularity: 7,  fields: S   },
  { id: 'thruster',             name: 'Thruster',                   category: 'fullbody',  popularity: 7,  fields: S   },
  { id: 'snatch',               name: 'Snatch',                     category: 'fullbody',  popularity: 6,  fields: S   },
  { id: 'power-clean',          name: 'Power Clean',                category: 'fullbody',  popularity: 6,  fields: S   },
  { id: 'man-maker',            name: 'Man Maker',                  category: 'fullbody',  popularity: 5,  fields: S   },
  { id: 'devil-press',          name: 'Devil Press',                category: 'fullbody',  popularity: 6,  fields: S   },
  { id: 'barbell-complex',      name: 'Barbell Complex',            category: 'fullbody',  popularity: 5,  fields: S   },
  { id: 'dip',                  name: 'Dip',                        category: 'fullbody',  popularity: 8,  fields: SR  },
  { id: 'muscle-up',            name: 'Muscle-Up',                  category: 'fullbody',  popularity: 6,  fields: SR  },
  { id: 'handstand-push-up',    name: 'Handstand Push-Up',          category: 'fullbody',  popularity: 5,  fields: SR  },
  { id: 'pistol-squat',         name: 'Pistol Squat',               category: 'fullbody',  popularity: 6,  fields: SR  },

  // ── CARDIO ────────────────────────────────────────────────────────────────
  { id: 'treadmill',            name: 'Treadmill',                  category: 'cardio',    popularity: 9,  fields: CD  },
  { id: 'elliptical',           name: 'Elliptical',                 category: 'cardio',    popularity: 8,  fields: CD  },
  { id: 'rowing-machine',       name: 'Rowing Machine',             category: 'cardio',    popularity: 8,  fields: CD  },
  { id: 'stair-climber',        name: 'Stair Climber',              category: 'cardio',    popularity: 7,  fields: DUR },
  { id: 'jump-rope',            name: 'Jump Rope',                  category: 'cardio',    popularity: 8,  fields: DUR },
  { id: 'jumping-jacks',        name: 'Jumping Jacks',              category: 'cardio',    popularity: 7,  fields: SR  },
  { id: 'assault-bike',         name: 'Assault Bike',               category: 'cardio',    popularity: 7,  fields: DUR },
  { id: 'ski-erg',              name: 'Ski Erg',                    category: 'cardio',    popularity: 6,  fields: CD  },
  { id: 'stationary-bike',      name: 'Stationary Bike',            category: 'cardio',    popularity: 8,  fields: CD  },

  // ── RUNNING ───────────────────────────────────────────────────────────────
  { id: 'running',              name: 'Running',                    category: 'running',   popularity: 10, fields: CD  },
  { id: 'treadmill-running',    name: 'Treadmill Running',          category: 'running',   popularity: 9,  fields: CD  },
  { id: 'interval-running',     name: 'Interval Running',           category: 'running',   popularity: 8,  fields: CD  },
  { id: 'trail-running',        name: 'Trail Running',              category: 'running',   popularity: 7,  fields: CD  },
  { id: 'easy-run',             name: 'Easy Run',                   category: 'running',   popularity: 8,  fields: CD  },
  { id: 'tempo-run',            name: 'Tempo Run',                  category: 'running',   popularity: 7,  fields: CD  },
  { id: 'long-run',             name: 'Long Run',                   category: 'running',   popularity: 7,  fields: CD  },
  { id: 'sprint',               name: 'Sprint',                     category: 'running',   popularity: 8,  fields: CD  },
  { id: 'fartlek',              name: 'Fartlek Run',                category: 'running',   popularity: 5,  fields: CD  },
  { id: 'track-run',            name: 'Track Run',                  category: 'running',   popularity: 6,  fields: CD  },

  // ── WALKING ───────────────────────────────────────────────────────────────
  { id: 'walking',              name: 'Walking',                    category: 'walking',   popularity: 10, fields: CD  },
  { id: 'brisk-walking',        name: 'Brisk Walking',              category: 'walking',   popularity: 9,  fields: CD  },
  { id: 'treadmill-walking',    name: 'Treadmill Walking',          category: 'walking',   popularity: 8,  fields: CD  },
  { id: 'incline-walking',      name: 'Incline Walking',            category: 'walking',   popularity: 8,  fields: CD  },
  { id: 'nordic-walking',       name: 'Nordic Walking',             category: 'walking',   popularity: 5,  fields: CD  },
  { id: 'hike',                 name: 'Hiking',                     category: 'walking',   popularity: 7,  fields: CD  },

  // ── CYCLING ───────────────────────────────────────────────────────────────
  { id: 'cycling',              name: 'Cycling',                    category: 'cycling',   popularity: 9,  fields: CD  },
  { id: 'indoor-cycling',       name: 'Indoor Cycling (Spin)',      category: 'cycling',   popularity: 9,  fields: CD  },
  { id: 'road-cycling',         name: 'Road Cycling',               category: 'cycling',   popularity: 7,  fields: CD  },
  { id: 'mountain-biking',      name: 'Mountain Biking',            category: 'cycling',   popularity: 6,  fields: CD  },

  // ── SWIMMING ──────────────────────────────────────────────────────────────
  { id: 'swimming',             name: 'Swimming',                   category: 'swimming',  popularity: 8,  fields: CD  },
  { id: 'freestyle',            name: 'Freestyle',                  category: 'swimming',  popularity: 7,  fields: CD  },
  { id: 'backstroke',           name: 'Backstroke',                 category: 'swimming',  popularity: 6,  fields: CD  },
  { id: 'breaststroke',         name: 'Breaststroke',               category: 'swimming',  popularity: 6,  fields: CD  },
  { id: 'butterfly',            name: 'Butterfly',                  category: 'swimming',  popularity: 5,  fields: CD  },
  { id: 'open-water-swim',      name: 'Open Water Swimming',        category: 'swimming',  popularity: 5,  fields: CD  },
  { id: 'water-aerobics',       name: 'Water Aerobics',             category: 'swimming',  popularity: 5,  fields: DUR },

  // ── YOGA ──────────────────────────────────────────────────────────────────
  { id: 'sun-salutation',       name: 'Sun Salutation',             category: 'yoga',      popularity: 8,  fields: DUR },
  { id: 'vinyasa-flow',         name: 'Vinyasa Flow',               category: 'yoga',      popularity: 8,  fields: DUR },
  { id: 'hatha-yoga',           name: 'Hatha Yoga',                 category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'yin-yoga',             name: 'Yin Yoga',                   category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'power-yoga',           name: 'Power Yoga',                 category: 'yoga',      popularity: 6,  fields: DUR },
  { id: 'restorative-yoga',     name: 'Restorative Yoga',           category: 'yoga',      popularity: 6,  fields: DUR },
  { id: 'warrior-i',            name: 'Warrior I',                  category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'warrior-ii',           name: 'Warrior II',                 category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'downward-dog',         name: 'Downward Dog',               category: 'yoga',      popularity: 8,  fields: DUR },
  { id: 'pigeon-pose',          name: 'Pigeon Pose',                category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'tree-pose',            name: 'Tree Pose',                  category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'chair-pose',           name: 'Chair Pose',                 category: 'yoga',      popularity: 6,  fields: DUR },
  { id: 'boat-pose',            name: 'Boat Pose',                  category: 'yoga',      popularity: 6,  fields: DUR },
  { id: 'bridge-pose',          name: 'Bridge Pose',                category: 'yoga',      popularity: 7,  fields: DUR },
  { id: 'ashtanga-yoga',        name: 'Ashtanga Yoga',              category: 'yoga',      popularity: 5,  fields: DUR },

  // ── PILATES ───────────────────────────────────────────────────────────────
  { id: 'mat-pilates',          name: 'Mat Pilates',                category: 'pilates',   popularity: 7,  fields: DUR },
  { id: 'reformer-pilates',     name: 'Reformer Pilates',           category: 'pilates',   popularity: 7,  fields: DUR },
  { id: 'pilates-hundred',      name: 'The Hundred',                category: 'pilates',   popularity: 6,  fields: SR  },
  { id: 'roll-up',              name: 'Roll Up',                    category: 'pilates',   popularity: 6,  fields: SR  },
  { id: 'single-leg-stretch',   name: 'Single Leg Stretch',         category: 'pilates',   popularity: 6,  fields: SR  },
  { id: 'double-leg-stretch',   name: 'Double Leg Stretch',         category: 'pilates',   popularity: 6,  fields: SR  },
  { id: 'teaser',               name: 'Teaser',                     category: 'pilates',   popularity: 5,  fields: SR  },
  { id: 'side-kick-series',     name: 'Side Kick Series',           category: 'pilates',   popularity: 5,  fields: SR  },
  { id: 'swan-dive',            name: 'Swan Dive',                  category: 'pilates',   popularity: 5,  fields: SR  },
  { id: 'pilates-circles',      name: 'Leg Circles',                category: 'pilates',   popularity: 5,  fields: SR  },
  { id: 'criss-cross',          name: 'Criss Cross',                category: 'pilates',   popularity: 6,  fields: SR  },
  { id: 'spine-stretch',        name: 'Spine Stretch',              category: 'pilates',   popularity: 5,  fields: SR  },

  // ── MOBILITY ──────────────────────────────────────────────────────────────
  { id: 'hip-90-90',            name: 'Hip 90/90 Stretch',          category: 'mobility',  popularity: 8,  fields: DUR },
  { id: 'worlds-greatest',      name: "World's Greatest Stretch",   category: 'mobility',  popularity: 8,  fields: SR  },
  { id: 'thoracic-rotation',    name: 'Thoracic Rotation',          category: 'mobility',  popularity: 7,  fields: SR  },
  { id: 'ankle-circles',        name: 'Ankle Circles',              category: 'mobility',  popularity: 7,  fields: SR  },
  { id: 'couch-stretch',        name: 'Couch Stretch',              category: 'mobility',  popularity: 7,  fields: DUR },
  { id: 'cat-cow',              name: 'Cat-Cow',                    category: 'mobility',  popularity: 8,  fields: SR  },
  { id: 'childs-pose',          name: "Child's Pose",               category: 'mobility',  popularity: 8,  fields: DUR },
  { id: 'hip-circles',          name: 'Hip Circles',                category: 'mobility',  popularity: 6,  fields: SR  },
  { id: 'spine-rotation',       name: 'Spine Rotation',             category: 'mobility',  popularity: 6,  fields: SR  },
  { id: 'shoulder-dislocates',  name: 'Shoulder Dislocates',        category: 'mobility',  popularity: 6,  fields: SR  },
  { id: 'thoracic-extension',   name: 'Thoracic Extension',         category: 'mobility',  popularity: 6,  fields: DUR },
  { id: 'ankle-mobility',       name: 'Ankle Mobility Drill',       category: 'mobility',  popularity: 6,  fields: SR  },
  { id: 'hip-opener',           name: 'Hip Opener Sequence',        category: 'mobility',  popularity: 6,  fields: DUR },

  // ── STRETCHING ────────────────────────────────────────────────────────────
  { id: 'quad-stretch',         name: 'Quad Stretch',               category: 'stretching',popularity: 8,  fields: DUR },
  { id: 'hamstring-stretch',    name: 'Hamstring Stretch',          category: 'stretching',popularity: 8,  fields: DUR },
  { id: 'calf-stretch',         name: 'Calf Stretch',               category: 'stretching',popularity: 7,  fields: DUR },
  { id: 'hip-flexor-stretch',   name: 'Hip Flexor Stretch',         category: 'stretching',popularity: 8,  fields: DUR },
  { id: 'shoulder-stretch',     name: 'Shoulder Stretch',           category: 'stretching',popularity: 7,  fields: DUR },
  { id: 'triceps-stretch',      name: 'Triceps Stretch',            category: 'stretching',popularity: 6,  fields: DUR },
  { id: 'chest-stretch',        name: 'Chest Stretch',              category: 'stretching',popularity: 7,  fields: DUR },
  { id: 'lat-stretch',          name: 'Lat Stretch',                category: 'stretching',popularity: 6,  fields: DUR },
  { id: 'neck-rolls',           name: 'Neck Rolls',                 category: 'stretching',popularity: 6,  fields: DUR },
  { id: 'spinal-twist',         name: 'Spinal Twist',               category: 'stretching',popularity: 7,  fields: DUR },
  { id: 'piriformis-stretch',   name: 'Piriformis Stretch',         category: 'stretching',popularity: 6,  fields: DUR },
  { id: 'it-band-stretch',      name: 'IT Band Stretch',            category: 'stretching',popularity: 6,  fields: DUR },
  { id: 'figure-four',          name: 'Figure Four Stretch',        category: 'stretching',popularity: 7,  fields: DUR },
  { id: 'standing-fold',        name: 'Standing Forward Fold',      category: 'stretching',popularity: 7,  fields: DUR },
  { id: 'doorframe-chest',      name: 'Doorframe Chest Stretch',    category: 'stretching',popularity: 6,  fields: DUR },
  { id: 'cross-body-shoulder',  name: 'Cross-Body Shoulder Stretch',category: 'stretching',popularity: 6,  fields: DUR },

  // ── HIIT ──────────────────────────────────────────────────────────────────
  { id: 'jump-squat',           name: 'Jump Squat',                 category: 'hiit',      popularity: 8,  fields: SR  },
  { id: 'high-knees',           name: 'High Knees',                 category: 'hiit',      popularity: 8,  fields: SRD },
  { id: 'burpee-hiit',          name: 'Burpee (HIIT)',              category: 'hiit',      popularity: 9,  fields: SRD },
  { id: 'push-up-row',          name: 'Push-Up to Row',             category: 'hiit',      popularity: 6,  fields: SRD },
  { id: 'plank-jack',           name: 'Plank Jack',                 category: 'hiit',      popularity: 7,  fields: SRD },
  { id: 'lateral-bound',        name: 'Lateral Bound',              category: 'hiit',      popularity: 6,  fields: SRD },
  { id: 'jump-lunge',           name: 'Jump Lunge',                 category: 'hiit',      popularity: 7,  fields: SRD },
  { id: 'spiderman-push-up',    name: 'Spiderman Push-Up',          category: 'hiit',      popularity: 6,  fields: SRD },
  { id: 'tabata-squat',         name: 'Tabata',                     category: 'hiit',      popularity: 7,  fields: DUR },
  { id: 'battle-ropes',         name: 'Battle Ropes',               category: 'hiit',      popularity: 7,  fields: DUR },
  { id: 'sprint-intervals',     name: 'Sprint Intervals',           category: 'hiit',      popularity: 7,  fields: CD  },
  { id: 'tuck-jump',            name: 'Tuck Jump',                  category: 'hiit',      popularity: 6,  fields: SR  },
  { id: 'squat-thrust',         name: 'Squat Thrust',               category: 'hiit',      popularity: 6,  fields: SR  },
  { id: 'box-jump-hiit',        name: 'Box Jump (HIIT)',            category: 'hiit',      popularity: 8,  fields: SR  },

  // ── FUNCTIONAL ────────────────────────────────────────────────────────────
  { id: 'kettlebell-clean',     name: 'Kettlebell Clean',           category: 'functional',popularity: 6,  fields: S   },
  { id: 'kettlebell-press',     name: 'Kettlebell Press',           category: 'functional',popularity: 7,  fields: S   },
  { id: 'sled-push',            name: 'Sled Push',                  category: 'functional',popularity: 7,  fields: CD  },
  { id: 'sled-pull',            name: 'Sled Pull',                  category: 'functional',popularity: 5,  fields: CD  },
  { id: 'medicine-ball-slam',   name: 'Medicine Ball Slam',         category: 'functional',popularity: 7,  fields: SR  },
  { id: 'farmers-walk',         name: "Farmer's Walk",              category: 'functional',popularity: 8,  fields: CD  },
  { id: 'single-leg-deadlift',  name: 'Single-Leg Deadlift',        category: 'functional',popularity: 7,  fields: S   },
  { id: 'wall-ball',            name: 'Wall Ball',                  category: 'functional',popularity: 7,  fields: S   },
  { id: 'ring-row',             name: 'Ring Row',                   category: 'functional',popularity: 6,  fields: SR  },
  { id: 'landmine-press',       name: 'Landmine Press',             category: 'functional',popularity: 6,  fields: S   },
  { id: 'band-monster-walk',    name: 'Band Monster Walk',          category: 'functional',popularity: 6,  fields: SR  },
  { id: 'sandbag-carry',        name: 'Sandbag Carry',              category: 'functional',popularity: 5,  fields: CD  },
  { id: 'rope-climb',           name: 'Rope Climb',                 category: 'functional',popularity: 5,  fields: SR  },
  { id: 'tire-flip',            name: 'Tire Flip',                  category: 'functional',popularity: 5,  fields: SR  },
];

// ─── Custom Exercises Storage ─────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CUSTOM_EXERCISES_KEY = 'lf_custom_exercises';
export const RECENT_EXERCISES_KEY = 'lf_recent_exercises';

export async function getCustomExercises(): Promise<ExerciseTemplate[]> {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_EXERCISES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveCustomExercise(ex: ExerciseTemplate): Promise<void> {
  const existing = await getCustomExercises();
  const idx = existing.findIndex(e => e.id === ex.id);
  const updated = idx >= 0 ? existing.map((e, i) => i === idx ? ex : e) : [...existing, ex];
  await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(updated));
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const existing = await getCustomExercises();
  await AsyncStorage.setItem(CUSTOM_EXERCISES_KEY, JSON.stringify(existing.filter(e => e.id !== id)));
}

export async function getRecentExerciseIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_EXERCISES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function recordRecentExercise(id: string): Promise<void> {
  const existing = await getRecentExerciseIds();
  const updated = [id, ...existing.filter(e => e !== id)].slice(0, 20);
  await AsyncStorage.setItem(RECENT_EXERCISES_KEY, JSON.stringify(updated));
}

export async function getAllExercises(): Promise<ExerciseTemplate[]> {
  const custom = await getCustomExercises();
  return [...EXERCISE_DB, ...custom];
}
