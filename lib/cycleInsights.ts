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
  energyPattern: string;
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
    energyPattern:
      'Energia on sageli madalam, eriti esimestel päevadel. See on individuaalne — mõned naised ' +
      'treenivad sel ajal normaalselt, teised vajavad rohkem puhkust. Kuula oma keha.',
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
    energyPattern:
      'Energia kipub olema kõrgem. Motivatsioon treenida võib kasvada. Neuromuskulaarne jõudlus ' +
      'võib paraneda koos östrogeeni tõusuga — kuid varieerub inimeseti oluliselt.',
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
    energyPattern:
      'Energia on tsükli tipphetkel. Paljud naised kogevad suuremat enesekindlust, ' +
      'selgemat mõtlemist ja paremat füüsilist jõudlust.',
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
    energyPattern:
      'Energia varieerub. Varajases luteaalfaasis võib olla veel hea energia, kuid hilises luteaalfaasis ' +
      'kogevad paljud naised väsimust ja aeglasemat taastumist.',
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
    energyPattern: '',
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
      'The cycle begins with menstruation, when estrogen and progesterone are at their lowest. ' +
      'Many women notice energy and mood changes during this time — this is completely normal. ' +
      'Moderate movement is generally safe and may even help relieve discomfort.',
    hormoneContext:
      'Both estrogen and progesterone are low. FSH begins to rise slowly, preparing the body for the next phase. ' +
      'Mayo Clinic notes that hormonal fluctuations can affect pain perception and energy levels.',
    energyPattern:
      'Energy is often lower, especially in the first days. This is individual — some women train normally, ' +
      'others need more rest. Listen to your body.',
    trainingFocus: [
      {
        title: 'Light cardio',
        detail:
          'Walking, gentle swimming or yoga. Research (ACSM) shows moderate movement may help ' +
          'relieve menstrual cramps through endorphin release.',
        intensity: 'kerge',
      },
      {
        title: 'Stretching & mobility',
        detail: 'Yoga and pilates support mobility without overtaxing the body.',
        intensity: 'kerge',
      },
      {
        title: 'Strength training (if energy allows)',
        detail:
          'If you feel up to it, moderate strength training is perfectly fine. Don\'t force it — ' +
          'intensity can always be increased next week.',
        intensity: 'mõõdukas',
      },
    ],
    recoveryNote:
      'Recovery time may be slightly longer. Sleep is especially important. Focus on magnesium- and iron-rich foods.',
    wellnessTips: [
      'A hot water bottle can help relieve cramps.',
      'Hydration matters — fluid loss may increase.',
      'Iron-rich foods (legumes, spinach, red meat) support recovery.',
      'Don\'t feel guilty about skipping a workout — rest is part of the routine.',
    ],
    researchContext:
      'Sources: ACSM Position Stand; Mayo Clinic (menstruation and exercise); NHS (menstrual cycle and physical activity).',
    colors: { bg: Colors.blush[50], border: Colors.blush[100], text: Colors.blush[800], accent: Colors.blush[400], sub: Colors.blush[600] },
  },

  follicular: {
    phase: 'Follicular phase',
    phaseKey: 'follicular',
    daysRange: 'Approximately days 6–13',
    tagline: 'Energy is rising — use it.',
    overview:
      'In the follicular phase, estrogen rises gradually as the ovary prepares a dominant follicle. ' +
      'Many women notice improved energy, motivation and performance during this time. ' +
      'Research suggests this may be an optimal time for more intense training.',
    hormoneContext:
      'Estrogen rises progressively. PubMed studies (Sung et al., 2014) suggest estrogen may have an anabolic effect. ' +
      'Cortisol is relatively low, which may support better recovery.',
    energyPattern:
      'Energy tends to be higher. Motivation to train may increase. Neuromuscular performance may improve ' +
      'with rising estrogen — though this varies significantly between individuals.',
    trainingFocus: [
      {
        title: 'Strength training',
        detail:
          'According to NSCA and PubMed studies, the follicular phase may be a favorable time for heavier strength work.',
        intensity: 'kõrge',
      },
      {
        title: 'Learning new movements',
        detail:
          'Cognitive flexibility and coordination may improve with rising estrogen — a good time to try new exercises.',
        intensity: 'mõõdukas',
      },
      {
        title: 'HIIT & interval training',
        detail: 'High-intensity interval training suits periods when energy is high and recovery is good.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      'Recovery is often faster in the follicular phase. Harder sessions are less likely to result in prolonged soreness.',
    wellnessTips: [
      'A good time to set new goals — energy and motivation support this.',
      'Protein intake supports muscle adaptations during intense training.',
      'Sleep is still important even during high-energy periods.',
      'Increased social drive is common during this phase — enjoy it.',
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
      'During ovulation, estrogen reaches its highest point in the cycle. Many women experience ' +
      'their greatest energy, confidence and physical performance right in this phase.',
    hormoneContext:
      'Estrogen peak and LH surge. Testosterone may also rise slightly. Important note: research ' +
      '(Hewett et al.) suggests high estrogen may affect ligament laxity — pay attention to technique.',
    energyPattern:
      'Energy is at its peak. Many women feel greater confidence, clearer thinking and better physical output.',
    trainingFocus: [
      {
        title: 'Personal records',
        detail:
          'Energy and hormonal conditions are optimal. Try your heaviest sets or longest distances — but keep good form.',
        intensity: 'kõrge',
      },
      {
        title: 'Plyometrics & jumping',
        detail:
          'High-performance movements suit this phase. Note: some research points to increased knee injury risk ' +
          'during high estrogen — thorough warm-up is especially important.',
        intensity: 'kõrge',
      },
      {
        title: 'Cardio & endurance',
        detail: 'VO₂max may be at its highest — a great time for longer runs or intense cardio sessions.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      'Recovery is good. Even with high energy, don\'t neglect recovery. Excessive fatigue now can lead to overload in the next phase.',
    wellnessTips: [
      'Warm-up is always important, especially during ovulation due to ligament sensitivity.',
      'A great time for social activities and team sports.',
      'Your body temperature may rise slightly — this is normal.',
      'Hydration supports performance.',
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
      'In the luteal phase, progesterone rises to prepare the body for a possible pregnancy. ' +
      'As the cycle nears its end, both estrogen and progesterone drop, which can cause various symptoms. ' +
      'This phase is long — about 14 days — and conditions shift considerably throughout it.',
    hormoneContext:
      'Progesterone dominates. It raises body temperature (~0.2–0.5°C), speeds up metabolism and may affect breathing. ' +
      'The drop in estrogen toward the end of the cycle is linked to mood changes and PMS symptoms (Mayo Clinic).',
    energyPattern:
      'Energy varies. Early in the luteal phase energy may still be good, but in the late luteal phase ' +
      'many women experience fatigue and slower recovery. Cardiovascular performance may be lower due to higher body temperature.',
    trainingFocus: [
      {
        title: 'Moderate strength training',
        detail:
          'Early in the luteal phase, strength training is perfectly fine. Later on, it may be smart to ' +
          'reduce volume and intensity — this is strategic, not weakness.',
        intensity: 'mõõdukas',
      },
      {
        title: 'Endurance training',
        detail:
          'Higher body temperature may reduce endurance performance — hydration is especially important.',
        intensity: 'mõõdukas',
      },
      {
        title: 'Yoga, stretching & restorative training',
        detail:
          'Especially in the late luteal phase, restorative training is valuable. Listen to signals from your body.',
        intensity: 'kerge',
      },
    ],
    recoveryNote:
      'Recovery may be slower, especially towards the end of the cycle. Sleep may be disrupted. ' +
      'Rest and sleep are especially important during this phase.',
    wellnessTips: [
      'Magnesium may help ease PMS symptoms.',
      'Complex carbohydrates and protein-rich foods help stabilise blood sugar.',
      'Stress management matters — cortisol and progesterone together can increase fatigue.',
      'Cravings are common — try to satisfy them with nourishing choices rather than feeling guilty.',
      'A rise in body temperature is normal — avoid overheating during intense training.',
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
    energyPattern: '',
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
        ? `Workouts feel stronger in the ${stronger}`
        : `Treeningud tunduvad ${stronger} tugevamad`,
      body: isEn
        ? `Based on your ${wCount} logged workouts, average weights in the ${stronger} are ~${abs}% higher. ` +
          `This aligns with research suggesting hormonal changes may influence performance — but individual variation is large. ` +
          `${confidence === 'preliminary' ? 'Log more workouts to make the pattern clearer.' : ''}`
        : `Sinu ${wCount} logitud treeningkorra põhjal on keskmised tõsteraskused ${stronger} ~${abs}% kõrgemad. ` +
          `${confidence === 'preliminary' ? 'Logi rohkem treeninguid, et muster selgemaks muutuks.' : ''}`,
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
      title: isEn ? `Most workouts logged during ${lbl}` : `Kõige rohkem treeninguid ${lbl}`,
      body: isEn
        ? `${maxPhase[1]} workouts during ${lbl} — your most active phase. This may reflect energy changes or simply your schedule — both are normal.`
        : `Kokku ${maxPhase[1]} treeningkorda ${lbl} — see on sinu kõige aktiivsem faas.`,
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
      title: isEn
        ? `${pct}% of logged days with good or great mood`
        : `${pct}% logitud päevadest hea või suurepärane tuju`,
      body: isEn
        ? `Over ${totalMoodDays} days, you rated your mood positively ${goodMoodDays} times. Tracking mood alongside cycle data helps identify personal patterns over time.`
        : `${totalMoodDays} päeva jooksul hindasid sa tuju ${goodMoodDays} korral positiivselt.`,
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
      confidence: 'preliminary',
      color: dominantHigh ? 'green' : 'beige',
    });
  }

  return patterns;
}

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
