/**
 * LunaraFit — Cycle Insights Library
 *
 * Content is based on peer-reviewed research and guidelines from:
 *   • PubMed / NCBI
 *   • American College of Sports Medicine (ACSM)
 *   • National Strength and Conditioning Association (NSCA)
 *   • Mayo Clinic & Cleveland Clinic
 *   • NHS (UK National Health Service)
 *   • World Health Organization (WHO)
 */

import { CyclePhase, Lang } from '../types';
import { Colors } from '../constants/theme';

export interface PhaseInsight {
  phase: string;
  phaseKey: CyclePhase;
  daysRange: string;
  tagline: string;
  overview: string;
  hormoneContext: string;
  hormoneChips: string[];          // compact chip labels — same info as hormoneContext
  energyPattern: string;
  energySummary: string;           // one-liner for energy arc label
  energyArc: [number, number];     // energy level at start and end of phase, 0–1
  trainingFocus: TrainingTip[];
  recoveryNote: string;
  wellnessTips: string[];
  researchContext: string;
  colors: { bg: string; border: string; text: string; accent: string; sub: string; };
}

export interface TrainingTip {
  title: string;
  detail: string;
  intensity: 'kerge' | 'mõõdukas' | 'kõrge';
}

const PHASE_INSIGHTS_ET: Record<CyclePhase, PhaseInsight> = {
  menstruation: {
    phase: 'Menstruatsioonifaas',
    phaseKey: 'menstruation',
    daysRange: 'Ligikaudu päevad 1–5',
    tagline: 'Puhkus on jõu osa.',
    overview:
      'Tsükkel algab menstruatsiooniga, mil östrogeen ja progesteroon on madalaimal tasemel. ' +
      'Paljud naised märkavad sel perioodil energia- ja meeleolumuutusi — see on täiesti normaalne. ' +
      'Mõõdukas liikumine on enamikul juhtudel ohutu ja võib isegi aidata leevendada ebamugavust.',
    hormoneContext:
      'Östrogeen ja progesteroon on mõlemad madalal. FSH hakkab aeglaselt tõusma, ' +
      'valmistades keha ette järgmiseks faasiks. Mayo Clinic märgib, et hormonaalsed kõikumised võivad ' +
      'mõjutada valu tajumist ja energiataset.',
    hormoneChips: ['Östrogeen ↓ madal', 'Progesteroon ↓ madal', 'FSH tõuseb', 'Krampe võib esineda', 'Meeleolu kõigub', 'Valu tundlikkus ↑'],
    energyPattern:
      'Energia on sageli madalam, eriti esimestel päevadel. See on individuaalne — mõned naised ' +
      'treenivad sel ajal normaalselt, teised vajavad rohkem puhkust. Kuula oma keha.',
    energySummary: 'Sageli madalam — eriti esimesed päevad · mõned treenivad normaalselt',
    energyArc: [0.25, 0.45],
    trainingFocus: [
      {
        title: 'Kerge kardio',
        detail:
          'Kõndimine, kerge ujumine või jooga. Uuringud (ACSM) näitavad, et mõõdukas liikumine ' +
          'võib aidata leevendada menstruatsioonkrampe endorfiinide vabanemise kaudu.',
        intensity: 'kerge',
      },
      {
        title: 'Venitus ja liikuvus',
        detail: 'Jooga ja pilates toetavad liikuvust ilma keha liigselt koormamata.',
        intensity: 'kerge',
      },
      {
        title: 'Jõutreening (kui energiat on)',
        detail:
          'Kui enesetunne lubab, on mõõdukas jõutreening täiesti võimalik. Ära sunni end — ' +
          'intensiivsust saab alati järgmisel nädalal taastada.',
        intensity: 'mõõdukas',
      },
    ],
    recoveryNote:
      'Taastumisaeg võib olla mõnevõrra pikem. Uni on eriti oluline. Rõhuta magneesiumi- ja rauarikast toitu.',
    wellnessTips: [
      'Kuumapadja kasutamine võib aidata leevendada krampe.',
      'Hüdratsioon on oluline — vedelikukaotus võib suureneda.',
      'Rauarikkad toidud (kaunviljad, spinat, punane liha) toetavad taastumist.',
      'Ära häbene vajaduse korral treenimist vahele jätta — puhkus on osa rutiinist.',
    ],
    researchContext:
      'Allikad: ACSM Position Stand; Mayo Clinic (menstruatsioon ja treening); NHS (menstruaaltsükkel ja füüsiline aktiivsus).',
    colors: { bg: Colors.blush[50], border: Colors.blush[100], text: Colors.blush[800], accent: Colors.blush[400], sub: Colors.blush[600] },
  },

  follicular: {
    phase: 'Follikulaarfaas',
    phaseKey: 'follicular',
    daysRange: 'Ligikaudu päevad 6–13',
    tagline: 'Energia tõuseb — kasuta seda.',
    overview:
      'Follikulaarfaasis tõuseb östrogeen järk-järgult. Paljud naised märkavad sel perioodil ' +
      'energia, motivatsiooni ja jõudluse paranemist. Uuringud viitavad, et see võib olla ' +
      'optimaalne aeg intensiivsemaks treenimiseks.',
    hormoneContext:
      'Östrogeen tõuseb progressiivselt. PubMedi uuringud (Sung et al., 2014) viitavad, et ' +
      'östrogeenil võib olla anaboolne efekt. Kortisool on suhteliselt madal, mis toetab paremat taastumist.',
    hormoneChips: ['Östrogeen ↑ tõuseb', 'Kortisool ↓ madal', 'Anaboolne efekt', 'Teravam fookus', 'Kiirem taastumine', 'Neuromuskulaarne jõudlus ↑'],
    energyPattern:
      'Energia kipub olema kõrgem. Motivatsioon treenida võib kasvada. Neuromuskulaarne jõudlus ' +
      'võib paraneda koos östrogeeni tõusuga — kuid varieerub inimeseti oluliselt.',
    energySummary: 'Tõusev — motivatsioon ja jõudlus paranevad koos östrogeeniga',
    energyArc: [0.6, 0.85],
    trainingFocus: [
      {
        title: 'Jõutreening',
        detail:
          'NSCA ja PubMed-uuringute kohaselt võib follikulaarfaas olla soodne aeg raskemaks jõutreeninguks.',
        intensity: 'kõrge',
      },
      {
        title: 'Uute liigutuste õppimine',
        detail:
          'Kognitiivne paindlikkus ja koordinatsioon võivad östrogeeni tõusuga paraneda — hea aeg uusi harjutusi katsetada.',
        intensity: 'mõõdukas',
      },
      {
        title: 'HIIT ja intervalltreening',
        detail: 'Kõrge intensiivsusega intervalltreening sobib hästi perioodideks, mil energia on kõrge.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      'Taastumine on sageli kiirem follikulaarfaasis. Intensiivsemad treeningud järgnevad lihasvalule vähem tõenäoliselt.',
    wellnessTips: [
      'Hea aeg uute eesmärkide seadmiseks — energia ja motivatsioon toetavad seda.',
      'Valkude tarbimine toetab lihaskohandusi intensiivse treeningu perioodil.',
      'Uni on endiselt oluline ka kõrge energiaga perioodil.',
      'Sotsiaalse aktiivsuse suurenemine on sel ajal tavaline — naudi seda.',
    ],
    researchContext:
      'Allikad: Sung et al. (2014, J Strength Cond Res); ACSM guidelines; Elliott-Sale et al. (2021).',
    colors: { bg: Colors.green[50], border: Colors.green[100], text: Colors.green[800], accent: Colors.green[400], sub: Colors.green[600] },
  },

  ovulation: {
    phase: 'Ovulatsioon',
    phaseKey: 'ovulation',
    daysRange: 'Ligikaudu päevad 12–16',
    tagline: 'Energiatipp — uued rekordid ootavad.',
    overview:
      'Ovulatsiooni ajal saavutab östrogeen tsükli kõrgeima taseme. Paljud naised märkavad suurimat ' +
      'energiat, enesekindlust ja füüsilist jõudlust just selles faasis.',
    hormoneContext:
      'Östrogeeni tipp ja LH tõus. Testosterooni tase võib veidi tõusta. Oluline märkus: uuringud ' +
      '(Hewett et al.) viitavad, et östrogeeni kõrge tase võib mõjutada sidemete lõtvust — ' +
      'pöörake tähelepanu tehnikale.',
    hormoneChips: ['Östrogeen ↑ tipp', 'LH tõus', 'Testosteroon ↑ veidi', 'Enesekindlus ↑', 'Sidemed lõtvamad', 'Tehnika eriti oluline'],
    energyPattern:
      'Energia on tsükli tipphetkel. Paljud naised kogevad suuremat enesekindlust, ' +
      'selgemat mõtlemist ja paremat füüsilist jõudlust.',
    energySummary: 'Tsükli kõrgeim — suurim enesekindlus, selgeim mõtlemine, parim jõudlus',
    energyArc: [0.9, 1.0],
    trainingFocus: [
      {
        title: 'Isiklikud rekordid',
        detail:
          'Energia- ja hormonaalsed tingimused on optimaalsed. Proovi kõige raskemaid seeriad ' +
          'või pikimaid distantse — kuid säilita hea tehnika.',
        intensity: 'kõrge',
      },
      {
        title: 'Plüomeetria ja hüpped',
        detail:
          'Kõrge jõudlusega liigutused sobivad. Pane tähele: mõned uuringud viitavad suurenenud ' +
          'põlvevigastuste riskile kõrge östrogeeni perioodil — soojendus on eriti oluline.',
        intensity: 'kõrge',
      },
      {
        title: 'Kardio ja vastupidavus',
        detail: 'VO₂max võib sel ajal olla kõrgeim — hea aeg pikemate jooksutrennide jaoks.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      'Taastumine on hea. Kuigi energia on kõrge, ära unusta taastumise tähtsust. ' +
      'Liigne kurnamine võib põhjustada ülekoormust järgmises faasis.',
    wellnessTips: [
      'Soojendus on alati oluline, kuid eriti ovulatsiooniperioodil.',
      'Hea aeg sotsiaalseks aktiivsuseks ja meeskondlikeks spordialadeks.',
      'Jälgi kehatemperatuuri — see võib veidi tõusta.',
      'Hüdratsioon toetab tulemuslikkust.',
    ],
    researchContext:
      'Allikad: Hewett et al. (2007, Am J Sports Med); Janse de Jonge (2003); Cleveland Clinic.',
    colors: { bg: Colors.green[50], border: Colors.green[200], text: Colors.green[800], accent: Colors.green[400], sub: Colors.green[600] },
  },

  luteal: {
    phase: 'Luteaalfaas',
    phaseKey: 'luteal',
    daysRange: 'Ligikaudu päevad 15–28',
    tagline: 'Kuula oma keha — taastumine on samuti progress.',
    overview:
      'Luteaalfaasis tõuseb progesteroon. Tsükli lõpu poole langevad nii östrogeen kui progesteroon, ' +
      'mis võib põhjustada erinevaid sümptomeid. See faas on pikk — umbes 14 päeva.',
    hormoneContext:
      'Progesteroon on domineeriv. See tõstab kehatemperatuuri (~0.2–0.5°C), kiirendab ainevahetust ' +
      'ja võib mõjutada hingamist. Östrogeeni langus tsükli lõpus on seotud PMS-sümptomitega (Mayo Clinic).',
    hormoneChips: ['Progesteroon ↑ domineeriv', '+0.2–0.5°C kehatemp', 'Ainevahetus kiirem', 'Kardio raskem', 'Östrogeen ↓ lõpus', 'Puhitus · isud · meeleolu ↓'],
    energyPattern:
      'Energia varieerub. Varajases luteaalfaasis võib olla veel hea energia, kuid hilises luteaalfaasis ' +
      'kogevad paljud naised väsimust ja aeglasemat taastumist.',
    energySummary: 'Varieeruv — alguses tugev · lõpus väsimus ja aeglasem taastumine',
    energyArc: [0.65, 0.3],
    trainingFocus: [
      {
        title: 'Mõõdukas jõutreening',
        detail:
          'Varajases luteaalfaasis on jõutreening täiesti sobiv. Hilises faasis võib olla mõistlik ' +
          'vähendada mahtu ja intensiivsust — see on strateegiline, mitte nõrkus.',
        intensity: 'mõõdukas',
      },
      {
        title: 'Vastupidavustreening',
        detail:
          'Kõrgem kehatemperatuur võib vähendada vastupidavusjõudlust. Hüdratsioon on eriti oluline.',
        intensity: 'mõõdukas',
      },
      {
        title: 'Jooga, venitus ja taastav treening',
        detail:
          'Eriti hilises luteaalfaasis on taastav treening väärtuslik. Kuula kehast tulevaid signaale.',
        intensity: 'kerge',
      },
    ],
    recoveryNote:
      'Taastumine võib olla aeglasem, eriti tsükli lõpu poole. Uni võib olla häiritud. ' +
      'Puhkus ja uni on sel ajal eriti olulised.',
    wellnessTips: [
      'Magneerium võib aidata leevendada PMS-sümptomeid.',
      'Komplekssüsivesikud ja valgurikkad toidud aitavad stabiliseerida veresuhkrut.',
      'Stressi juhtimine on oluline — kortisool ja progesteroon koos võivad suurendada väsimust.',
      'Isud on tavalised — proovi rahuldada neid toitvate valikutega.',
      'Kehatemperatuuri tõus on normaalne — väldi ülekuumenemist intensiivsel treeningul.',
    ],
    researchContext:
      'Allikad: Janse de Jonge (2003, Sports Med); Mayo Clinic; NHS; WHO.',
    colors: { bg: Colors.beige[50], border: Colors.beige[100], text: Colors.beige[800], accent: Colors.beige[600], sub: Colors.beige[500] },
  },

  unknown: {
    phase: 'Faas teadmata',
    phaseKey: 'unknown',
    daysRange: '—',
    tagline: 'Lisa tsükliandmed, et näha isiklikke mustreid.',
    overview:
      'Tsükliandmete lisamisel saad isikupärastatud ülevaateid, mis põhinevad sinu logitud andmetel.',
    hormoneContext: '',
    hormoneChips: [],
    energyPattern: '',
    energySummary: '',
    energyArc: [0.5, 0.5],
    trainingFocus: [],
    recoveryNote: '',
    wellnessTips: [],
    researchContext: '',
    colors: { bg: Colors.beige[50], border: Colors.beige[100], text: Colors.beige[800], accent: Colors.beige[400], sub: Colors.beige[400] },
  },
};

const PHASE_INSIGHTS_EN: Record<CyclePhase, PhaseInsight> = {
  menstruation: {
    phase: 'Menstrual phase',
    phaseKey: 'menstruation',
    daysRange: 'Approximately days 1–5',
    tagline: 'Rest is part of strength.',
    overview:
      'Estrogen and progesterone are at their **lowest point** — this is why energy, mood and pain tolerance shift. ' +
      'Moderate movement is safe and can help, but **rest is equally valid.**',
    hormoneContext:
      '**Estrogen and progesterone** are at their lowest. **FSH** begins rising to prepare your next cycle. ' +
      'These hormonal dips drive cramps, fatigue and mood shifts — **biology, not weakness.**',
    hormoneChips: ['Estrogen ↓ low', 'Progesterone ↓ low', 'FSH rising', 'Cramps likely', 'Mood may shift', 'Pain sensitivity ↑'],
    energyPattern:
      '**Energy is often lower**, especially in the first days. Some women train normally, others need more rest — **both are fine.**',
    energySummary: 'Often lower — especially first days · both rest and training are valid',
    energyArc: [0.25, 0.45],
    trainingFocus: [
      {
        title: 'Light cardio',
        detail: 'Walking, gentle swimming or yoga. **Endorphins from movement** can ease cramps.',
        intensity: 'kerge',
      },
      {
        title: 'Stretching & mobility',
        detail: 'Yoga and pilates support mobility **without overtaxing the body.**',
        intensity: 'kerge',
      },
      {
        title: 'Strength (if energy allows)',
        detail: '**Moderate strength training is fine** if you feel up to it. Don\'t force it — intensity recovers fast next week.',
        intensity: 'mõõdukas',
      },
    ],
    recoveryNote:
      '**Recovery may be slightly slower.** Prioritise sleep and focus on **magnesium- and iron-rich foods.**',
    wellnessTips: [
      '**Heat helps** — a hot water bottle can ease cramps quickly.',
      '**Drink more** — fluid loss increases during your period.',
      '**Iron-rich foods** (legumes, spinach, red meat) replace what\'s lost.',
      '**Skipping a workout is fine** — rest is part of the plan, not a setback.',
    ],
    researchContext:
      'Sources: ACSM Position Stand; Mayo Clinic; NHS.',
    colors: { bg: Colors.blush[50], border: Colors.blush[100], text: Colors.blush[800], accent: Colors.blush[400], sub: Colors.blush[600] },
  },

  follicular: {
    phase: 'Follicular phase',
    phaseKey: 'follicular',
    daysRange: 'Approximately days 6–13',
    tagline: 'Energy is rising — use it.',
    overview:
      'Estrogen rises and many women notice **better energy, motivation and performance.** ' +
      'Research suggests this is an **optimal window for harder training.**',
    hormoneContext:
      '**Estrogen** is climbing — making you feel sharper, stronger and more driven. It may also have a mild **muscle-building effect.** ' +
      '**Cortisol** is relatively low, so your body **recovers better** between sessions.',
    hormoneChips: ['Estrogen ↑ rising', 'Cortisol ↓ low', 'Muscle-building effect', 'Sharper focus', 'Faster recovery', 'Neuromuscular output ↑'],
    energyPattern:
      '**Energy tends to be higher** and motivation to train increases. Neuromuscular performance may improve with rising estrogen.',
    energySummary: 'Rising — motivation and performance improve with estrogen',
    energyArc: [0.6, 0.85],
    trainingFocus: [
      {
        title: 'Strength training',
        detail: 'The follicular phase is a **favorable time for heavier strength work** — your body adapts well.',
        intensity: 'kõrge',
      },
      {
        title: 'Learning new movements',
        detail: 'Coordination and focus improve with rising estrogen — **try something new.**',
        intensity: 'mõõdukas',
      },
      {
        title: 'HIIT & intervals',
        detail: '**High energy + good recovery** = ideal conditions for intense cardio.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      '**Recovery is faster** right now. Harder sessions are less likely to leave you sore for days.',
    wellnessTips: [
      '**Set new goals** — motivation is at its natural high.',
      '**Eat more protein** to support muscle adaptations from harder training.',
      '**Protect your sleep** — even when energy is high, sleep drives adaptation.',
      '**Social energy is higher** — lean into it.',
    ],
    researchContext:
      'Sources: Sung et al. (2014, J Strength Cond Res); ACSM guidelines; Elliott-Sale et al. (2021).',
    colors: { bg: Colors.green[50], border: Colors.green[100], text: Colors.green[800], accent: Colors.green[400], sub: Colors.green[600] },
  },

  ovulation: {
    phase: 'Ovulation',
    phaseKey: 'ovulation',
    daysRange: 'Approximately days 12–16',
    tagline: 'Energy peak — new records await.',
    overview:
      'Estrogen is at its **highest point of the cycle.** Most women feel their **greatest energy, confidence and physical output** right now.',
    hormoneContext:
      '**Estrogen** peaks and **LH** surges to trigger ovulation. **Testosterone** rises slightly — boosting drive and confidence. ' +
      'High estrogen can make **ligaments slightly looser**, so warm-up and technique **matter more than ever.**',
    hormoneChips: ['Estrogen ↑ peak', 'LH surge', 'Testosterone ↑ slightly', 'Confidence ↑', 'Ligaments looser', 'Technique matters more'],
    energyPattern:
      '**Energy is at its peak** — confidence is high, thinking feels clearer, and **physical output improves.**',
    energySummary: 'Cycle peak — highest confidence, clearest thinking, best output',
    energyArc: [0.9, 1.0],
    trainingFocus: [
      {
        title: 'Personal records',
        detail: 'Hormonal conditions are optimal. Go for your **heaviest sets or longest distances** — but keep good form.',
        intensity: 'kõrge',
      },
      {
        title: 'Plyometrics & jumping',
        detail: 'High-performance movements suit this phase. **Warm up well** — knee injury risk can be higher with elevated estrogen.',
        intensity: 'kõrge',
      },
      {
        title: 'Cardio & endurance',
        detail: '**VO₂max is near its peak** — ideal for longer runs or intense cardio.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      '**Recovery is good.** Still, don\'t skip it — **excessive fatigue now can compound in the luteal phase.**',
    wellnessTips: [
      '**Never skip the warm-up** — joints are slightly more vulnerable right now.',
      '**Team sports & social training** — your confidence and energy make this ideal.',
      '**Slight temperature rise** around ovulation is normal.',
      '**Stay hydrated** when pushing hard — don\'t wait for thirst.',
    ],
    researchContext:
      'Sources: Hewett et al. (2007, Am J Sports Med); Janse de Jonge (2003); Cleveland Clinic.',
    colors: { bg: Colors.green[50], border: Colors.green[200], text: Colors.green[800], accent: Colors.green[400], sub: Colors.green[600] },
  },

  luteal: {
    phase: 'Luteal phase',
    phaseKey: 'luteal',
    daysRange: 'Approximately days 15–28',
    tagline: 'Listen to your body — recovery is progress too.',
    overview:
      '**Progesterone rises** and energy may shift. As the cycle ends, both hormones drop — **driving PMS symptoms.** ' +
      'How you feel can change a lot across these ~14 days.',
    hormoneContext:
      '**Progesterone** raises body temperature slightly (~0.5°C), speeds metabolism and makes cardio feel harder. ' +
      'Toward the end, both hormones drop — causing **mood dips, bloating and cravings. Normal and temporary.**',
    hormoneChips: ['Progesterone ↑ dominant', '+0.5°C body temp', 'Metabolism faster', 'Cardio feels harder', 'Estrogen ↓ late', 'Mood dips · bloating · cravings'],
    energyPattern:
      '**Energy varies.** Early in this phase you may feel strong. Later, **fatigue and slower recovery** are common — cardio may feel harder too.',
    energySummary: 'Varies — strong early · fatigue and slower recovery build late',
    energyArc: [0.65, 0.3],
    trainingFocus: [
      {
        title: 'Moderate strength',
        detail: 'Strength training is fine early on. Later, **reduce volume and intensity** — **strategic, not weak.**',
        intensity: 'mõõdukas',
      },
      {
        title: 'Endurance training',
        detail: '**Higher body temp** can reduce endurance performance — **hydration is key.**',
        intensity: 'mõõdukas',
      },
      {
        title: 'Yoga & restorative',
        detail: 'Especially in the **late luteal phase**, restorative work is valuable. **Follow your body\'s signals.**',
        intensity: 'kerge',
      },
    ],
    recoveryNote:
      '**Recovery is slower**, especially in the second half. Sleep may be disrupted — **prioritise rest over pushing through.**',
    wellnessTips: [
      '**Magnesium** can ease cramps and mood dips.',
      '**Complex carbs + protein** stabilise blood sugar and curb cravings.',
      '**Manage stress** — cortisol and progesterone together amplify fatigue.',
      '**Cravings are real** — your metabolism is higher. Feed them well.',
    ],
    researchContext:
      'Sources: Janse de Jonge (2003, Sports Med); Mayo Clinic; NHS; WHO.',
    colors: { bg: Colors.beige[50], border: Colors.beige[100], text: Colors.beige[800], accent: Colors.beige[600], sub: Colors.beige[500] },
  },

  unknown: {
    phase: 'Phase unknown',
    phaseKey: 'unknown',
    daysRange: '—',
    tagline: 'Add cycle data to see your personal patterns.',
    overview: 'Adding cycle data gives you personalised insights based on your own logged data.',
    hormoneContext: '',
    hormoneChips: [],
    energyPattern: '',
    energySummary: '',
    energyArc: [0.5, 0.5],
    trainingFocus: [],
    recoveryNote: '',
    wellnessTips: [],
    researchContext: '',
    colors: { bg: Colors.beige[50], border: Colors.beige[100], text: Colors.beige[800], accent: Colors.beige[400], sub: Colors.beige[400] },
  },
};

export function getPhaseInsights(lang: Lang = 'et'): Record<CyclePhase, PhaseInsight> {
  return lang === 'en' ? PHASE_INSIGHTS_EN : PHASE_INSIGHTS_ET;
}

// Keep backward-compat export (defaults to Estonian)
export const PHASE_INSIGHTS = PHASE_INSIGHTS_ET;

// ─── Pattern Analysis ─────────────────────────────────────────────────────────

export interface DetectedPattern {
  id: string;
  type: 'strength' | 'energy' | 'mood' | 'recovery' | 'general';
  title: string;
  body: string;
  metric: string;   // large callout number/value shown prominently
  subtext: string;  // one short context line below the title
  confidence: 'preliminary' | 'emerging' | 'consistent';
  color: 'blush' | 'green' | 'beige';
}

export function detectPatterns(
  workouts: { phase: string; exercises: { weight_kg: number; reps: number; sets: number }[] }[],
  cycleDays: { date: string; mood: string | null; symptoms: string[] }[],
  lang: Lang = 'et',
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const isEn = lang === 'en';

  const phaseAvgWeight: Record<string, number[]> = {};
  workouts.forEach(w => {
    if (!phaseAvgWeight[w.phase]) phaseAvgWeight[w.phase] = [];
    w.exercises.forEach(e => { if (e.weight_kg > 0) phaseAvgWeight[w.phase].push(e.weight_kg); });
  });

  const avgFor = (phase: string) => {
    const vals = phaseAvgWeight[phase] ?? [];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const follAvg = avgFor('follicular');
  const lutAvg  = avgFor('luteal');

  if (follAvg > 0 && lutAvg > 0 &&
      workouts.filter(w => w.phase === 'follicular').length >= 2 &&
      workouts.filter(w => w.phase === 'luteal').length >= 2) {
    const diff = ((follAvg - lutAvg) / lutAvg) * 100;
    const abs = Math.abs(Math.round(diff));
    const wCount = workouts.length;
    const confidence = wCount >= 8 ? 'consistent' : wCount >= 4 ? 'emerging' : 'preliminary';
    const stronger = diff >= 0
      ? (isEn ? 'follicular phase' : 'follikulaarfaasis')
      : (isEn ? 'luteal phase' : 'luteaalfaasis');
    patterns.push({
      id: 'strength-phase',
      type: 'strength',
      title: isEn
        ? `Stronger in the ${stronger}`
        : `Tugevam ${stronger}`,
      body: isEn
        ? `Based on your ${wCount} logged workouts, average weights in the ${stronger} are ~${abs}% higher. ` +
          `This aligns with research suggesting hormonal changes may influence performance — but individual variation is large. ` +
          `${confidence === 'preliminary' ? 'Log more workouts to make the pattern clearer.' : ''}`
        : `Sinu ${wCount} logitud treeningkorra põhjal on keskmised tõsteraskused ${stronger} ~${abs}% kõrgemad. ` +
          `${confidence === 'preliminary' ? 'Logi rohkem treeninguid, et muster selgemaks muutuks.' : ''}`,
      metric: `${diff >= 0 ? '+' : '−'}${abs}%`,
      subtext: isEn
        ? `avg weight · ${wCount} workouts logged`
        : `keskmine raskus · ${wCount} treeningkorda`,
      confidence,
      color: diff >= 0 ? 'green' : 'beige',
    });
  }

  const phaseCounts: Record<string, number> = {};
  workouts.forEach(w => { phaseCounts[w.phase] = (phaseCounts[w.phase] ?? 0) + 1; });
  const maxPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
  if (maxPhase && workouts.length >= 4) {
    const labelMapEt: Record<string, string> = { follicular: 'follikulaarfaasis', luteal: 'luteaalfaasis', menstruation: 'menstruatsioonifaasis', ovulation: 'ovulatsiooni ajal' };
    const labelMapEn: Record<string, string> = { follicular: 'the follicular phase', luteal: 'the luteal phase', menstruation: 'the menstrual phase', ovulation: 'ovulation' };
    const lbl = isEn ? (labelMapEn[maxPhase[0]] ?? maxPhase[0]) : (labelMapEt[maxPhase[0]] ?? maxPhase[0]);
    patterns.push({
      id: 'workout-frequency',
      type: 'general',
      title: isEn ? `Most active in ${lbl}` : `Kõige aktiivsem ${lbl}`,
      body: isEn
        ? `${maxPhase[1]} workouts during ${lbl} — your most active phase. This may reflect energy changes or simply your schedule — both are normal.`
        : `Kokku ${maxPhase[1]} treeningkorda ${lbl} — see on sinu kõige aktiivsem faas.`,
      metric: `${maxPhase[1]}`,
      subtext: isEn ? 'workouts · your most active phase' : 'treeningkorda · kõige aktiivsem faas',
      confidence: 'emerging',
      color: 'beige',
    });
  }

  const positiveMoods = ['good', 'great', 'energized'];
  const goodMoodDays  = cycleDays.filter(d => positiveMoods.includes(d.mood ?? '')).length;
  const totalMoodDays = cycleDays.filter(d => d.mood).length;

  if (totalMoodDays >= 5) {
    const pct = Math.round((goodMoodDays / totalMoodDays) * 100);
    patterns.push({
      id: 'mood-overall',
      type: 'mood',
      title: isEn ? 'Days with good or great mood' : 'Hea või suurepärase tujuga päevad',
      body: isEn
        ? `Over ${totalMoodDays} days, you rated your mood positively ${goodMoodDays} times. Tracking mood alongside cycle data helps identify personal patterns over time.`
        : `${totalMoodDays} päeva jooksul hindasid sa tuju ${goodMoodDays} korral positiivselt.`,
      metric: `${pct}%`,
      subtext: isEn
        ? `${goodMoodDays} of ${totalMoodDays} logged days`
        : `${goodMoodDays} / ${totalMoodDays} logitud päevast`,
      confidence: totalMoodDays >= 10 ? 'emerging' : 'preliminary',
      color: pct >= 60 ? 'green' : 'beige',
    });
  }

  const highEnergyDays = cycleDays.filter(d => d.symptoms?.some(s => ['energiline','täis energiat','energetic','full of energy'].includes(s))).length;
  const lowEnergyDays  = cycleDays.filter(d => d.symptoms?.some(s => ['kurnatud','väsinud','drained','tired'].includes(s))).length;

  if (highEnergyDays + lowEnergyDays >= 5) {
    const dominantHigh = highEnergyDays > lowEnergyDays;
    patterns.push({
      id: 'energy-pattern',
      type: 'energy',
      title: isEn
        ? (dominantHigh ? 'Energy tends to be high' : 'Energy tends to be lower')
        : (dominantHigh ? 'Energia kipub olema kõrge' : 'Energia kipub olema madalam'),
      body: isEn
        ? `${highEnergyDays} days of high energy logged, ${lowEnergyDays} days of low energy. Tracking energy across your cycle helps plan intense workouts for high-energy periods.`
        : `${highEnergyDays} päeval logisid kõrget energiat, ${lowEnergyDays} päeval madalat.`,
      metric: dominantHigh ? `${highEnergyDays}↑` : `${lowEnergyDays}↓`,
      subtext: isEn
        ? `${highEnergyDays} high · ${lowEnergyDays} low energy days`
        : `${highEnergyDays} kõrge · ${lowEnergyDays} madal energiapäeva`,
      confidence: 'preliminary',
      color: dominantHigh ? 'green' : 'beige',
    });
  }

  return patterns;
}

// ── Cycle Analysis ─────────────────────────────────────────────────────────

export interface CycleStats {
  cycleLength: number | null;
  periodLength: number | null;
  cycleLengthStatus: 'short' | 'normal' | 'long';
  periodLengthStatus: 'short' | 'normal' | 'long';
  topSymptoms: { name: string; count: number }[];
  topPeriodSymptoms: { name: string; count: number }[];
  moodPositivePct: number;
  moodNeutralPct: number;
  moodNegativePct: number;
  totalLoggedDays: number;
  totalPeriodDays: number;
  hasEnoughData: boolean;
}

// Population norms from Apple Women's Health Study (165,668 cycles), FIGO/ACOG, NHS
const CYCLE_AVG = 28.7;
const CYCLE_NORMAL_MIN = 24;
const CYCLE_NORMAL_MAX = 38;
const PERIOD_NORMAL_MIN = 2;
const PERIOD_NORMAL_MAX = 7;

export function getCycleStats(
  profile: { cycle_length?: number | null; period_length?: number | null } | null | undefined,
  cycleDays: { date: string; period: boolean; mood: string | null; symptoms: string[] }[],
): CycleStats {
  const cycleLength  = profile?.cycle_length  ?? null;
  const periodLength = profile?.period_length ?? null;

  const cycleLengthStatus: CycleStats['cycleLengthStatus'] =
    cycleLength == null ? 'normal'
    : cycleLength < CYCLE_NORMAL_MIN  ? 'short'
    : cycleLength > CYCLE_NORMAL_MAX  ? 'long'
    : 'normal';

  const periodLengthStatus: CycleStats['periodLengthStatus'] =
    periodLength == null ? 'normal'
    : periodLength < PERIOD_NORMAL_MIN ? 'short'
    : periodLength > PERIOD_NORMAL_MAX ? 'long'
    : 'normal';

  // Symptom frequency across all days
  const symCount: Record<string, number> = {};
  cycleDays.forEach(d => {
    (d.symptoms ?? []).forEach(s => { if (s) symCount[s] = (symCount[s] ?? 0) + 1; });
  });
  const topSymptoms = Object.entries(symCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // Symptom frequency on period days only
  const periodDays = cycleDays.filter(d => d.period);
  const pSymCount: Record<string, number> = {};
  periodDays.forEach(d => {
    (d.symptoms ?? []).forEach(s => { if (s) pSymCount[s] = (pSymCount[s] ?? 0) + 1; });
  });
  const topPeriodSymptoms = Object.entries(pSymCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Mood breakdown
  const moodDays = cycleDays.filter(d => d.mood);
  const pos = moodDays.filter(d => ['good', 'great', 'energized'].includes(d.mood!)).length;
  const neg = moodDays.filter(d => d.mood === 'bad').length;
  const neu = moodDays.length - pos - neg;
  const total = moodDays.length || 1;

  return {
    cycleLength,
    periodLength,
    cycleLengthStatus,
    periodLengthStatus,
    topSymptoms,
    topPeriodSymptoms,
    moodPositivePct: Math.round((pos / total) * 100),
    moodNeutralPct:  Math.round((neu / total) * 100),
    moodNegativePct: Math.round((neg / total) * 100),
    totalLoggedDays: cycleDays.length,
    totalPeriodDays: periodDays.length,
    hasEnoughData: cycleDays.length >= 3,
  };
}

export { CYCLE_AVG, CYCLE_NORMAL_MIN, CYCLE_NORMAL_MAX, PERIOD_NORMAL_MIN, PERIOD_NORMAL_MAX };

export const CONFIDENCE_LABELS_ET = { preliminary: 'Esialgne tähelepanek', emerging: 'Kasvav muster', consistent: 'Järjepidev muster' };
export const CONFIDENCE_LABELS_EN = { preliminary: 'Early observation', emerging: 'Emerging pattern', consistent: 'Consistent pattern' };
export const CONFIDENCE_LABELS = CONFIDENCE_LABELS_ET;

export function getConfidenceLabels(lang: Lang = 'et') {
  return lang === 'en' ? CONFIDENCE_LABELS_EN : CONFIDENCE_LABELS_ET;
}

export const DISCLAIMER_ET =
  'Need ülevaated põhinevad sinu isiklikel logitud andmetel ja üldistel teadusuuringutel. ' +
  'Need on informatiivsed mustrid, mitte meditsiiniline diagnoos. Iga inimene on erinev. ' +
  'Tervisemurede korral konsulteeri palun arstiga.';

export const DISCLAIMER_EN =
  'These insights are based on your personal logged data and general research on the menstrual cycle and training. ' +
  'They are informational patterns, not medical diagnoses. Everyone is different. ' +
  'Please consult a healthcare professional for any health concerns.';

export const DISCLAIMER = DISCLAIMER_ET;

export function getDisclaimer(lang: Lang = 'et') {
  return lang === 'en' ? DISCLAIMER_EN : DISCLAIMER_ET;
}
