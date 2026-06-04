import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Card, InsightCard } from '../../components/ui/Card';
import { Icon } from '../../components/ui/Icon';
import { getCycleInfo, getPhaseLabel } from '../../lib/cycle';
import { useTranslation } from '../../lib/LangContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

type PhaseKey = 'menstruation' | 'follicular' | 'ovulation' | 'luteal';

const PHASE_COLORS: Record<PhaseKey, string> = {
  menstruation: Colors.blush[400],
  follicular:   Colors.green[400],
  ovulation:    Colors.coral[400],
  luteal:       '#9B8EC4',
};

const PHASE_BG: Record<PhaseKey, string> = {
  menstruation: Colors.blush[50],
  follicular:   Colors.green[50],
  ovulation:    Colors.coral[50],
  luteal:       '#F3F0FA',
};

const PHASE_BORDER: Record<PhaseKey, string> = {
  menstruation: Colors.blush[100],
  follicular:   Colors.green[100],
  ovulation:    Colors.coral[100],
  luteal:       '#E8E0F5',
};

const TRAINING_RECS: Record<PhaseKey, { en: string; et: string; sub_en: string; sub_et: string; icon: string }> = {
  menstruation: {
    en: 'Focus on recovery & mobility today.',
    et: 'Keskendu taastumisele ja liikuvusele.',
    sub_en: 'Light movement supports your body right now.',
    sub_et: 'Kerge liikumine toetab sinu keha praegu.',
    icon: '🌿',
  },
  follicular: {
    en: 'Great day for strength training.',
    et: 'Suurepärane päev jõutreeninguks.',
    sub_en: 'Energy is rising — push your limits.',
    sub_et: 'Energia kasvab — küsi enda käest rohkem.',
    icon: '💪',
  },
  ovulation: {
    en: 'Peak performance — go for it.',
    et: 'Tipptase — anna kõik!',
    sub_en: 'Your strongest window of the cycle.',
    sub_et: 'Sinu tsükli tugevaim periood.',
    icon: '⚡',
  },
  luteal: {
    en: 'Moderate cardio is recommended.',
    et: 'Soovitatav on mõõdukas kardio.',
    sub_en: 'Steady effort, no need to push hard.',
    sub_et: 'Ühtlane tempo, liigselt ei pea pingutama.',
    icon: '🫧',
  },
};

const WELLNESS_OPTS = {
  mood:   ['😔', '😐', '🙂', '😊', '🤩'],
  energy: ['🪫', '😴', '⚡', '🔥'],
  stress: ['😌', '😕', '😤', '😰'],
  sleep:  ['😴', '💤', '🌙', '✨'],
} as const;

type WellnessKey = keyof typeof WELLNESS_OPTS;

const WEEKLY_GOAL = 4;

export default function HomeScreen() {
  const T = useTheme();
  const { lang, t, tArr } = useTranslation();
  const profile = useQuery(api.profiles.get);
  const workouts = useQuery(api.workouts.list) ?? [];
  const now = new Date();

  const [wellness, setWellness] = useState<Record<WellnessKey, number | null>>({
    mood: null, energy: null, stress: null, sleep: null,
  });

  const ci = getCycleInfo(
    profile?.last_period_date ?? null,
    profile?.cycle_length ?? 28,
    profile?.period_length ?? 5,
  );

  const phase = ci?.phase as PhaseKey | null ?? null;
  const phaseKey: PhaseKey = phase ?? 'follicular';

  const d7 = new Date(now.getTime() - 7 * 86400000);
  const recentCount = workouts.filter((w) => new Date(w.date) >= d7).length;
  const daysUntilPeriod = ci ? ci.cycleLength - ci.day + 1 : null;

  const workoutDates = new Set(workouts.map((w: any) => w.date));
  let streak = 0;
  for (let i = 0; ; i++) {
    const ds = new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10);
    if (workoutDates.has(ds)) { streak++; } else if (i === 0) { break; } else { break; }
  }

  const prMap: Record<string, number> = {};
  workouts.forEach((w: any) => {
    w.exercises?.forEach((e: any) => {
      if (e.weight_kg > 0 && (!prMap[e.name] || e.weight_kg > prMap[e.name])) {
        prMap[e.name] = e.weight_kg;
      }
    });
  });
  const prCount = Object.keys(prMap).length;

  const insight = (() => {
    if (workouts.length === 0) return null;
    if (phase === 'follicular' && workouts.length >= 3) {
      return lang === 'en'
        ? 'You tend to perform best during your follicular phase.'
        : 'Sa treenid tõhusaimalt follikulaarfaasis.';
    }
    if (streak >= 3) {
      return lang === 'en'
        ? `You're on a ${streak}-day streak. Keep the momentum going.`
        : `Sul on ${streak}-päevane seeria. Hoia tempot!`;
    }
    if (prCount > 0) {
      return lang === 'en'
        ? `You're tracking ${prCount} exercise${prCount !== 1 ? 's' : ''} with personal bests.`
        : `Sul on ${prCount} harjutuse isiklik rekord.`;
    }
    return lang === 'en'
      ? 'Keep logging to unlock personalized insights.'
      : 'Jätka logimist, et avada isiklikud ülevaated.';
  })();

  const DAYS = tArr('home.days');
  const MONTHS = tArr('home.months');
  const rec = phase ? TRAINING_RECS[phase] : null;
  const phaseColor = phase ? PHASE_COLORS[phaseKey] : Colors.blush[400];

  const toggleWellness = (key: WellnessKey, i: number) =>
    setWellness(w => ({ ...w, [key]: w[key] === i ? null : i }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: T.border }]}>
        <Text style={[styles.logo, { color: T.textMuted }]}>
          <Text style={styles.logoAccent}>Lunara</Text>Fit
        </Text>
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={[styles.avatarText, { color: Colors.blush[T.dark ? 200 : 800] }]}>
            {profile?.name?.[0]?.toUpperCase() ?? '?'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={[styles.dateLbl, { color: T.textMuted }]}>
            {DAYS[now.getDay()]}, {now.getDate()}. {MONTHS[now.getMonth()]}
          </Text>
          <Text style={[styles.greetingName, { color: T.text }]}>
            {t('home.greet')} <Text style={styles.nameAccent}>{profile?.name || t('home.noname')}.</Text>
          </Text>
        </View>

        {/* Training Recommendation */}
        <View style={[
          styles.trainingCard,
          {
            backgroundColor: phase ? PHASE_BG[phaseKey] : T.surface,
            borderColor: phase ? PHASE_BORDER[phaseKey] : T.border,
          },
        ]}>
          <Text style={[styles.eyebrow, { color: phaseColor, marginBottom: 10 }]}>
            {t('home.training.eye')}
          </Text>
          {rec ? (
            <>
              <Text style={styles.recIcon}>{rec.icon}</Text>
              <Text style={[styles.recTitle, { color: T.text }]}>
                {lang === 'en' ? rec.en : rec.et}
              </Text>
              <Text style={[styles.recSub, { color: T.textSec }]}>
                {lang === 'en' ? rec.sub_en : rec.sub_et}
              </Text>
              <View style={styles.recBadges}>
                <View style={[styles.badge, { backgroundColor: phaseColor + '1A', borderColor: phaseColor + '44' }]}>
                  <Text style={[styles.badgeTxt, { color: phaseColor }]}>
                    {getPhaseLabel(phaseKey, lang)}
                  </Text>
                </View>
                {ci && (
                  <View style={[styles.badge, { backgroundColor: T.surface, borderColor: T.border }]}>
                    <Text style={[styles.badgeTxt, { color: T.textSec }]}>
                      {t('home.cycleday')} {ci.day}
                    </Text>
                  </View>
                )}
              </View>
            </>
          ) : (
            <Text style={[styles.recNoCycle, { color: T.textSec }]}>
              {t('home.training.nocycle')}
            </Text>
          )}
        </View>

        {/* Wellness Check-In */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.eyebrow, { color: T.textMuted, marginBottom: 16 }]}>
            {t('home.checkin.eye')}
          </Text>
          {(['mood', 'energy', 'stress', 'sleep'] as WellnessKey[]).map((key, ri) => (
            <View key={key} style={[styles.wellnessRow, ri === 3 ? {} : styles.wellnessRowGap]}>
              <Text style={[styles.wellnessLbl, { color: T.textSec }]}>{t(`home.checkin.${key}`)}</Text>
              <View style={styles.emojiRow}>
                {(WELLNESS_OPTS[key] as readonly string[]).map((emoji, i) => {
                  const active = wellness[key] === i;
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[
                        styles.emojiChip,
                        {
                          backgroundColor: active ? phaseColor + '1A' : T.surface2,
                          borderColor: active ? phaseColor : T.border,
                          borderWidth: active ? 1.5 : 1,
                        },
                      ]}
                      onPress={() => toggleWellness(key, i)}
                    >
                      <Text style={styles.emojiTxt}>{emoji}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </Card>

        {/* Progress */}
        <Card style={styles.sectionCard}>
          <Text style={[styles.eyebrow, { color: T.textMuted, marginBottom: 16 }]}>
            {t('home.progress.eye')}
          </Text>
          <View style={styles.progressGrid}>
            <View style={[styles.progressTile, { backgroundColor: T.surface2, borderColor: T.border }]}>
              <Text style={[styles.progressVal, { color: T.text }]}>{recentCount}</Text>
              <Text style={[styles.progressLbl, { color: T.textMuted }]}>{t('home.progress.thisweek')}</Text>
            </View>
            <View style={[
              styles.progressTile,
              { backgroundColor: streak > 0 ? Colors.green[50] : T.surface2, borderColor: streak > 0 ? Colors.green[100] : T.border },
            ]}>
              <Text style={[styles.progressVal, { color: streak > 0 ? Colors.green[T.dark ? 200 : 600] : T.text }]}>
                {streak > 0 ? streak : '—'}
              </Text>
              <Text style={[styles.progressLbl, { color: streak > 0 ? Colors.green[T.dark ? 200 : 600] : T.textMuted }]}>
                {t('home.progress.streak')}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.progressTile, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}
              onPress={() => router.push('/(tabs)/cycle')}
            >
              <Text style={[styles.progressVal, { color: Colors.blush[T.dark ? 200 : 700] }]}>
                {daysUntilPeriod ?? '—'}
              </Text>
              <Text style={[styles.progressLbl, { color: Colors.blush[400] }]}>{t('home.stat.period')}</Text>
            </TouchableOpacity>
            <View style={[styles.progressTile, { backgroundColor: T.surface2, borderColor: T.border }]}>
              <Text style={[styles.progressVal, { color: T.text }]}>{prCount > 0 ? prCount : '—'}</Text>
              <Text style={[styles.progressLbl, { color: T.textMuted }]}>{t('home.progress.prs')}</Text>
            </View>
          </View>
          <View style={styles.goalRow}>
            <View style={styles.goalLabelRow}>
              <Text style={[styles.goalLbl, { color: T.textSec }]}>{t('home.progress.goal')}</Text>
              <Text style={[styles.goalLbl, { color: T.textMuted }]}>{recentCount} / {WEEKLY_GOAL}</Text>
            </View>
            <View style={[styles.goalTrack, { backgroundColor: T.border }]}>
              <View style={[
                styles.goalFill,
                {
                  width: `${Math.min(100, (recentCount / WEEKLY_GOAL) * 100)}%` as any,
                  backgroundColor: phaseColor,
                },
              ]} />
            </View>
          </View>
        </Card>

        {/* Personal Insight */}
        {insight && (
          <InsightCard variant="green" style={styles.insightCard}>
            <View style={styles.insightEyeRow}>
              <Icon name="spark" size={10} color={Colors.green[T.dark ? 200 : 600]} />
              <Text style={[styles.eyebrow, { color: Colors.green[T.dark ? 200 : 600] }]}>
                {t('home.insight.eye')}
              </Text>
            </View>
            <Text style={[styles.insightTxt, { color: T.text }]}>{insight}</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/insights')} style={styles.insightLink}>
              <Text style={[styles.insightLinkTxt, { color: Colors.green[T.dark ? 200 : 600] }]}>
                {lang === 'en' ? 'Full analysis →' : 'Täielik analüüs →'}
              </Text>
            </TouchableOpacity>
          </InsightCard>
        )}

        {/* Quick Actions */}
        <View style={styles.quickSection}>
          <Text style={[styles.eyebrow, { color: T.textMuted, paddingHorizontal: Spacing.xl, marginBottom: 12 }]}>
            {t('home.quick.eye')}
          </Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: Colors.beige[800] }]}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <Text style={[styles.quickBtnTxt, { color: '#FFFFFF' }]}>{t('home.quick.start')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: Colors.blush[400] }]}
              onPress={() => router.push('/(tabs)/cycle')}
            >
              <Text style={[styles.quickBtnTxt, { color: '#FFFFFF' }]}>{t('home.quick.period')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border }]}
              onPress={() => router.push('/(tabs)/workouts')}
            >
              <Text style={[styles.quickBtnTxt, { color: T.text }]}>{t('home.quick.addweight')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: T.surface2, borderWidth: 1, borderColor: T.border }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={[styles.quickBtnTxt, { color: T.text }]}>{t('home.quick.measure')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  logo: { fontFamily: Fonts.serifItalic, fontSize: 19 },
  logoAccent: { fontFamily: Fonts.serif, color: Colors.blush[400] },
  avatar: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: Fonts.serifSemiBold, fontSize: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 4 },

  greeting: { paddingHorizontal: Spacing.xl, paddingTop: 8, paddingBottom: 18 },
  dateLbl: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  greetingName: { fontFamily: Fonts.serifSemiBold, fontSize: 30, lineHeight: 33 },
  nameAccent: { fontFamily: Fonts.serifSemiBoldItalic, color: Colors.blush[400] },

  eyebrow: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' },

  // Training recommendation
  trainingCard: {
    marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    borderRadius: Radius.xl, padding: 20, borderWidth: 1.5,
  },
  recIcon: { fontSize: 34, marginBottom: 8 },
  recTitle: { fontFamily: Fonts.serifSemiBold, fontSize: 23, lineHeight: 28, marginBottom: 6 },
  recSub: { fontFamily: Fonts.sansLight, fontSize: 13, lineHeight: 19, marginBottom: 16 },
  recBadges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  badgeTxt: { fontFamily: Fonts.sansMedium, fontSize: 11 },
  recNoCycle: { fontFamily: Fonts.sansLight, fontSize: 14, lineHeight: 20, marginTop: 8 },

  sectionCard: { marginBottom: Spacing.md },

  // Wellness check-in
  wellnessRow: { flexDirection: 'row', alignItems: 'center' },
  wellnessRowGap: { marginBottom: 10 },
  wellnessLbl: { fontFamily: Fonts.sansMedium, fontSize: 12, width: 54 },
  emojiRow: { flexDirection: 'row', gap: 6, flex: 1 },
  emojiChip: {
    width: 38, height: 38, borderRadius: Radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  emojiTxt: { fontSize: 18 },

  // Progress grid
  progressGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  progressTile: {
    width: '47.5%', borderRadius: Radius.lg, padding: 14,
    borderWidth: 1, alignItems: 'center',
  },
  progressVal: { fontFamily: Fonts.serifSemiBold, fontSize: 28, lineHeight: 30, marginBottom: 4 },
  progressLbl: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.8, textTransform: 'uppercase', textAlign: 'center' },

  goalRow: { gap: 7 },
  goalLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  goalLbl: { fontFamily: Fonts.sansMedium, fontSize: 11 },
  goalTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  goalFill: { height: '100%', borderRadius: 3 },

  // Personal Insight
  insightCard: { marginBottom: Spacing.md },
  insightEyeRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  insightTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 14, lineHeight: 21 },
  insightLink: { marginTop: 10, alignSelf: 'flex-end' },
  insightLinkTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 12 },

  // Quick Actions
  quickSection: { marginBottom: Spacing.md },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: Spacing.xl },
  quickBtn: {
    width: '47.5%', paddingVertical: 18, borderRadius: Radius.xl,
    alignItems: 'center', justifyContent: 'center',
  },
  quickBtnTxt: { fontFamily: Fonts.sansSemiBold, fontSize: 14 },
});
