/**
 * LunaraFit — Cycle Insights Library
 *
 * Content is based on peer-reviewed research and guidelines from:
 *   • PubMed / NCBI (indexed research literature)
 *   • American College of Sports Medicine (ACSM)
 *   • National Strength and Conditioning Association (NSCA)
 *   • Mayo Clinic & Cleveland Clinic (patient education)
 *   • NHS (UK National Health Service)
 *   • World Health Organization (WHO)
 *
 * Important disclaimers embedded throughout:
 *   — Individual variation is significant; these are population-level tendencies.
 *   — Hormonal contraception alters these patterns.
 *   — This is not medical advice. Always consult a healthcare professional.
 */

import { CyclePhase } from '../types';
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
  colors: {
    bg: string; border: string; text: string; accent: string; sub: string;
  };
}

export interface TrainingTip {
  title: string;
  detail: string;
  intensity: 'kerge' | 'mõõdukas' | 'kõrge';
}

export const PHASE_INSIGHTS: Record<CyclePhase, PhaseInsight> = {

  // ── Menstrual Phase ──────────────────────────────────────────────────────
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
      'Östrogeen ja progesteroon on mõlemad madalal. FSH (folliikuleid stimuleeriv hormoon) hakkab aeglaselt tõusma, ' +
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
        detail:
          'Jooga ja pilates on populaarsed valikud. Need toetavad liikuvust ilma keha liigselt koormamata.',
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
      'Taastumisaeg võib olla mõnevõrra pikem. Uni on eriti oluline — mõned uuringud viitavad, ' +
      'et une kvaliteet võib menstruatsiooni ajal varieeruda. Rõhuta magneesiumi- ja rauarikast toitu.',
    wellnessTips: [
      'Soojad kombikatsioonid (kuumapadja kasutamine) võivad aidata leevendada krampe.',
      'Hüdratsioon on oluline — vedelikukaotus võib suureneda.',
      'Rauarikkad toidud (kaunviljad, spinat, punane liha) toetavad taastumist.',
      'Ära häbene vajaduse korral treenimist vahele jätta — puhkus on osa rutiinist.',
    ],
    researchContext:
      'Allikad: ACSM Position Stand (kehalist aktiivsust menstruatsiooni ajal peetakse ohutuks); ' +
      'Mayo Clinic (menstruatsioon ja treening); NHS (menstruaaltsükkel ja füüsiline aktiivsus).',
    colors: {
      bg: Colors.blush[50],
      border: Colors.blush[100],
      text: Colors.blush[800],
      accent: Colors.blush[400],
      sub: Colors.blush[600],
    },
  },

  // ── Follicular Phase ─────────────────────────────────────────────────────
  follicular: {
    phase: 'Follikulaarfaas',
    phaseKey: 'follicular',
    daysRange: 'Ligikaudu päevad 6–13',
    tagline: 'Energia tõuseb — kasuta seda.',
    overview:
      'Follikulaarfaasis tõuseb östrogeen järk-järgult, kuna munasari valmistab ette domineerivat folliikulit. ' +
      'Paljud naised märkavad sel perioodil energia, motivatsiooni ja jõudluse paranemist. ' +
      'Uuringud viitavad, et see võib olla optimaalne aeg intensiivsemaks treenimiseks.',
    hormoneContext:
      'Östrogeen tõuseb progressiivselt. PubMedi uuringud (nt Sung et al., 2014) viitavad, et ' +
      'östrogeenil võib olla anaboolne (lihaseid ehitav) efekt. Kortisool (stressihormoon) on suhteliselt madal, ' +
      'mis võib toetada paremat taastumist.',
    energyPattern:
      'Energia kipub olema kõrgem kui menstruatsioonifaasis. Motivatsioon treenida võib kasvada. ' +
      'Uuringud näitavad, et neuromuskulaarne jõudlus võib paraneda koos östrogeeni tõusuga — ' +
      'kuid see varieerub inimeseti oluliselt.',
    trainingFocus: [
      {
        title: 'Jõutreening',
        detail:
          'NSCA ja mitmete PubMed-uuringute kohaselt võib follikulaarfaas olla soodne aeg ' +
          'raskemaks jõutreeninguks. Suurendades koormust järk-järgult, võid märgata paremaid tulemusi.',
        intensity: 'kõrge',
      },
      {
        title: 'Uute liigutuste õppimine',
        detail:
          'Uuringud viitavad, et kognitiivne paindlikkus ja koordinatsioon võivad östrogeeni ' +
          'tõusuga paraneda — hea aeg uusi harjutusi katsetada.',
        intensity: 'mõõdukas',
      },
      {
        title: 'HIIT ja intervalltreening',
        detail:
          'Kõrge intensiivsusega intervalltreening sobib hästi perioodideks, mil energia on kõrge ' +
          'ja taastumisvõime hea.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      'Taastumine on sageli kiirem follikulaarfaasis. Kasuta seda — intensiivsemad treeningud ' +
      'järgnevad lihasvalule vähem tõenäoliselt. Siiski — ära ignoreeri keha signaale.',
    wellnessTips: [
      'Hea aeg uute eesmärkide seadmiseks — energia ja motivatsioon toetavad seda.',
      'Valkude tarbimine toetab lihaskohandusi, eriti intensiivse treeningu perioodil.',
      'Uni on endiselt oluline — isegi kõrge energiaga perioodil.',
      'Sotsiaalse aktiivsuse suurenemine on sel ajal tavaline — naudi seda.',
    ],
    researchContext:
      'Allikad: Sung et al. (2014, J Strength Cond Res) — lihase jõud ja menstruaaltsükkel; ' +
      'ACSM guidelines; Elliott-Sale et al. (2021) — süstemaatiline ülevaade östrogeeni mõjust spordijõudlusele.',
    colors: {
      bg: Colors.green[50],
      border: Colors.green[100],
      text: Colors.green[800],
      accent: Colors.green[400],
      sub: Colors.green[600],
    },
  },

  // ── Ovulation ────────────────────────────────────────────────────────────
  ovulation: {
    phase: 'Ovulatsioon',
    phaseKey: 'ovulation',
    daysRange: 'Ligikaudu päevad 12–16',
    tagline: 'Energiatipp — uued rekordid ootavad.',
    overview:
      'Ovulatsiooni ajal saavutab östrogeen tsükli kõrgeima taseme ja toimub LH (luteiniseeriv hormoon) ' +
      'tõus, mis käivitab ovulatsiooni. Paljud naised märkavad suurimat energiat, enesekindlust ja füüsilist jõudlust ' +
      'just selles faasis.',
    hormoneContext:
      'Östrogeeni tipp ja LH tõus. Testosterooni tase võib samuti veidi tõusta, mis võib toetada lihasjõudu. ' +
      'Oluline märkus: uuringud (Hewett et al., Mayo Clinic) viitavad, et östrogeeni kõrge tase võib ' +
      'mõjutada sidemete lõtvust — eriti ACL (eesmine ristatisidem). Pöörake tähelepanu tehnikale.',
    energyPattern:
      'Energia on tsükli tipphetkel. Paljud naised kogevad suuremat enesekindlust, ' +
      'selgemat mõtlemist ja paremat füüsilist jõudlust. See on hea aeg isiklike rekordite katsetamiseks.',
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
          'põlve- ja hüppeliigesvigastuste riskile kõrge östrogeeni perioodil — soojendus on eriti oluline.',
        intensity: 'kõrge',
      },
      {
        title: 'Kardio ja vastupidavus',
        detail:
          'VO₂max (maksimaalne hapnikutarbimine) võib sel ajal olla kõrgeim — hea aeg ' +
          'pikemate jooksutrennide või intensiivsete kardiotrennide jaoks.',
        intensity: 'kõrge',
      },
    ],
    recoveryNote:
      'Taastumine on hea. Kuigi energia on kõrge, ära unusta taastumise tähtsust. ' +
      'Liigne kurnamine kõrge energia perioodil võib põhjustada ülekoormust järgmises faasis.',
    wellnessTips: [
      'Soojendus on alati oluline, kuid eriti ovulatsiooniperioodil sideme-elastsuse tõttu.',
      'Hea aeg sotsiaalseks aktiivsuseks ja meeskondlikeks spordialadeks.',
      'Jälgi kehatemperatuuri — see võib veidi tõusta, mis on normaalne.',
      'Hüdratsioon toetab tulemuslikkust.',
    ],
    researchContext:
      'Allikad: Hewett et al. (2007, Am J Sports Med) — östrogeen ja ACL-vigastuse risk; ' +
      'Janse de Jonge (2003) — hormoonide mõju spordijõudlusele; Cleveland Clinic — ovulatsioon ja energia.',
    colors: {
      bg: Colors.green[50],
      border: Colors.green[200],
      text: Colors.green[800],
      accent: Colors.green[400],
      sub: Colors.green[600],
    },
  },

  // ── Luteal Phase ─────────────────────────────────────────────────────────
  luteal: {
    phase: 'Luteaalfaas',
    phaseKey: 'luteal',
    daysRange: 'Ligikaudu päevad 15–28',
    tagline: 'Kuula oma keha — taastumine on samuti progress.',
    overview:
      'Luteaalfaasis tõuseb progesteroon, mis valmistab keha ette võimalikuks raseduseks. ' +
      'Tsükli lõpu poole langevad nii östrogeen kui progesteroon, mis võib põhjustada erinevaid ' +
      'sümptomeid. See faas on pikk — umbes 14 päeva — ja selle jooksul muutuvad tingimused märkimisväärselt.',
    hormoneContext:
      'Progesteroon on domineeriv. See hormoon tõstab kehatemperatuuri (basaaltemperatuur tõuseb ~0.2–0.5°C), ' +
      'kiirendab ainevahetust ja võib mõjutada hingamist (CO₂ tundlikkus suureneb). ' +
      'Östrogeeni langus tsükli lõpus on seotud meeleolumuutuste ja PMS-sümptomitega (Mayo Clinic).',
    energyPattern:
      'Energia varieerub. Varajases luteaalfaasis võib olla veel hea energia, kuid hilises luteaalfaasis ' +
      'kogevad paljud naised väsimust, raskust treenida ja aeglasemat taastumist. ' +
      'Uuringud näitavad, et kardiovaskulaarne jõudlus võib olla madalam kõrgema kehatemperatuuri tõttu.',
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
          'Uuringud (Janse de Jonge, 2003) näitavad, et kõrgem kehatemperatuur luteaalfaasis ' +
          'võib vähendada vastupidavusjõudlust. Välditreening on soojaga keerulisem — ' +
          'hüdratsioon on eriti oluline.',
        intensity: 'mõõdukas',
      },
      {
        title: 'Jooga, venitus ja taastav treening',
        detail:
          'Eriti hilises luteaalfaasis on taastav treening väärtuslik. NHS soovitab kuulata ' +
          'kehast tulevaid signaale ja kohandada koormust vastavalt.',
        intensity: 'kerge',
      },
    ],
    recoveryNote:
      'Taastumine võib olla aeglasem, eriti tsükli lõpu poole. Uni võib olla häiritud — ' +
      'uuringud (NSF - National Sleep Foundation) viitavad, et progesteroon mõjutab une arhitektuuri. ' +
      'Puhkus ja uni on sel ajal eriti olulised.',
    wellnessTips: [
      'Magneerium võib aidata leevendada PMS-sümptomeid (uuringud on paljulubavad, kuid mittetõenduspõhised).',
      'Komplekssüsivesikud ja valgurikkad toidud aitavad stabiliseerida veresuhkrut.',
      'Stressi juhtimine on oluline — kortisool ja progesteroon koos võivad suurendada väsimust.',
      'Isud on tavalised — proovi rahuldada neid toitvate valikutega, mitte tundma ennast halvasti.',
      'Kehatemperatuuri tõus on normaalne — väldi ülekuumenemist intensiivsel treeningul.',
    ],
    researchContext:
      'Allikad: Janse de Jonge (2003, Sports Med) — tsükli mõju vastupidavusjõudlusele; ' +
      'Mayo Clinic — premenstruaalne sündroom; NHS — menstruaaltsükkel ja tervis; ' +
      'WHO — naiste reproduktiivtervis.',
    colors: {
      bg: Colors.beige[50],
      border: Colors.beige[100],
      text: Colors.beige[800],
      accent: Colors.beige[600],
      sub: Colors.beige[500],
    },
  },

  unknown: {
    phase: 'Faas teadmata',
    phaseKey: 'unknown',
    daysRange: '—',
    tagline: 'Lisa tsükliandmed, et näha isiklikke mustreid.',
    overview:
      'Tsükliandmete lisamisel saad isikupärastatud ülevaateid, mis põhinevad sinu logitud andmetel ' +
      'ja teadusuuringutel menstruaaltsükli ning treeningu seose kohta.',
    hormoneContext: '',
    energyPattern: '',
    trainingFocus: [],
    recoveryNote: '',
    wellnessTips: [],
    researchContext: '',
    colors: {
      bg: Colors.beige[50],
      border: Colors.beige[100],
      text: Colors.beige[800],
      accent: Colors.beige[400],
      sub: Colors.beige[400],
    },
  },
};

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
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // ── Strength pattern by phase ────────────────────────────────────────────
  const phaseAvgWeight: Record<string, number[]> = {};
  workouts.forEach(w => {
    if (!phaseAvgWeight[w.phase]) phaseAvgWeight[w.phase] = [];
    w.exercises.forEach(e => {
      if (e.weight_kg > 0) phaseAvgWeight[w.phase].push(e.weight_kg);
    });
  });

  const avgFor = (phase: string) => {
    const vals = phaseAvgWeight[phase] ?? [];
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const follAvg = avgFor('follicular');
  const lutAvg  = avgFor('luteal');
  const menAvg  = avgFor('menstruation');

  if (follAvg > 0 && lutAvg > 0 && workouts.filter(w => w.phase === 'follicular').length >= 2
      && workouts.filter(w => w.phase === 'luteal').length >= 2) {
    const diff = ((follAvg - lutAvg) / lutAvg) * 100;
    const stronger = diff >= 0 ? 'follikulaarfaasis' : 'luteaalfaasis';
    const abs = Math.abs(Math.round(diff));
    const wCount = workouts.length;
    const confidence = wCount >= 8 ? 'consistent' : wCount >= 4 ? 'emerging' : 'preliminary';
    patterns.push({
      id: 'strength-phase',
      type: 'strength',
      title: `Treeningud tunduvad ${stronger} tugevamad`,
      body:
        `Sinu ${wCount} logitud treeningkorra põhjal on keskmised tõsteraskused ` +
        `${stronger} ~${abs}% kõrgemad. See ühtib teaduskirjandusega, mis viitab ` +
        `hormonaalsete muutuste võimalikule mõjule jõudlusele — kuid individuaalne ` +
        `variatsioon on suur. ${confidence === 'preliminary' ? 'Logi rohkem treeninguid, et muster selgemaks muutuks.' : ''}`,
      confidence,
      color: diff >= 0 ? 'green' : 'beige',
    });
  }

  // ── Workout count pattern ────────────────────────────────────────────────
  const phaseCounts: Record<string, number> = {};
  workouts.forEach(w => { phaseCounts[w.phase] = (phaseCounts[w.phase] ?? 0) + 1; });
  const maxPhase = Object.entries(phaseCounts).sort((a, b) => b[1] - a[1])[0];
  if (maxPhase && workouts.length >= 4) {
    const labelMap: Record<string, string> = {
      follicular: 'follikulaarfaasis', luteal: 'luteaalfaasis',
      menstruation: 'menstruatsioonifaasis', ovulation: 'ovulatsiooni ajal',
    };
    patterns.push({
      id: 'workout-frequency',
      type: 'general',
      title: `Kõige rohkem treeninguid ${labelMap[maxPhase[0]] ?? maxPhase[0]}`,
      body:
        `Kokku ${maxPhase[1]} treeningkorda ${labelMap[maxPhase[0]] ?? maxPhase[0]} — ` +
        `see on sinu kõige aktiivsem faas. See võib peegeldada energia muutusi ` +
        `või lihtsalt ajakava — mõlemad on normaalsed.`,
      confidence: 'emerging',
      color: 'beige',
    });
  }

  // ── Mood pattern ─────────────────────────────────────────────────────────
  const positiveMoods = ['good', 'great', 'energized'];
  const moodByPhase: Record<string, { pos: number; total: number }> = {};

  // We'd need phase data for cycle days — simplified version
  const goodMoodDays = cycleDays.filter(d => positiveMoods.includes(d.mood ?? '')).length;
  const totalMoodDays = cycleDays.filter(d => d.mood).length;

  if (totalMoodDays >= 5) {
    const pct = Math.round((goodMoodDays / totalMoodDays) * 100);
    patterns.push({
      id: 'mood-overall',
      type: 'mood',
      title: `${pct}% logitud päevadest hea või suurepärane tuju`,
      body:
        `${totalMoodDays} päeva jooksul hindasid sa tuju ${goodMoodDays} korral positiivselt. ` +
        `Meeleolu jälgimine koos tsükliandmetega aitab tuvastada isiklikke mustreid aja jooksul.`,
      confidence: totalMoodDays >= 10 ? 'emerging' : 'preliminary',
      color: pct >= 60 ? 'green' : 'beige',
    });
  }

  // ── Energy pattern from symptoms ─────────────────────────────────────────
  const highEnergyDays = cycleDays.filter(d =>
    d.symptoms?.some(s => s === 'energiline' || s === 'täis energiat')
  ).length;
  const lowEnergyDays = cycleDays.filter(d =>
    d.symptoms?.some(s => s === 'kurnatud' || s === 'väsinud')
  ).length;

  if (highEnergyDays + lowEnergyDays >= 5) {
    const dominantEnergy = highEnergyDays > lowEnergyDays ? 'kõrge' : 'madal';
    patterns.push({
      id: 'energy-pattern',
      type: 'energy',
      title: dominantEnergy === 'kõrge'
        ? 'Energia kipub olema kõrge'
        : 'Energia kipub olema madalam',
      body:
        `${highEnergyDays} päeval logisid kõrget energiat, ${lowEnergyDays} päeval madalat. ` +
        `Energia jälgimine tsükli vältel aitab planeerida intensiivsemaid treeninguid ` +
        `energiakõrge perioodidesse.`,
      confidence: 'preliminary',
      color: dominantEnergy === 'kõrge' ? 'green' : 'beige',
    });
  }

  return patterns;
}

export const CONFIDENCE_LABELS = {
  preliminary: 'Esialgne tähelepanek',
  emerging: 'Kasvav muster',
  consistent: 'Järjepidev muster',
};

export const DISCLAIMER =
  'Need ülevaated põhinevad sinu isiklikel logitud andmetel ja üldistel ' +
  'teadusuuringutel menstruaaltsükli ja treeningu kohta. Need on informatiivsed ' +
  'mustrid, mitte meditsiiniline diagnoos. Iga inimene on erinev — ' +
  'hormonaalne kontratseptsioon, PCOS, endometrioos ja teised seisundid muudavad neid mustreid. ' +
  'Tervisemurede korral konsulteeri palun arstiga.';
