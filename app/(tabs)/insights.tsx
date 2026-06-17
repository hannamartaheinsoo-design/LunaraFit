import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useTheme, ThemeTokens } from '../../lib/useTheme';
import { Icon } from '../../components/ui/Icon';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getCycleInfo } from '../../lib/cycle';
import { Profile, Workout, CycleDay } from '../../types';
import {
  getPhaseInsights, detectPatterns, getConfidenceLabels, getDisclaimer,
  getCycleStats, CYCLE_AVG, CYCLE_NORMAL_MIN, CYCLE_NORMAL_MAX, PERIOD_NORMAL_MIN, PERIOD_NORMAL_MAX,
  DetectedPattern, TrainingTip,
} from '../../lib/cycleInsights';
import { useTranslation } from '../../lib/LangContext';

// Renders **bold** markers inline inside a Text block
function RichText({ text, style, boldStyle }: { text: string; style?: any; boldStyle?: any }) {
  const T = useTheme();
  const styles = makeStyles(T);
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <Text key={i} style={[style, boldStyle ?? styles.bold]}>{part.slice(2, -2)}</Text>
          : part
      )}
    </Text>
  );
}

function IntensityDot({ level }: { level: TrainingTip['intensity'] }) {
  const T = useTheme();
  const styles = makeStyles(T);
  const { t } = useTranslation();
  const colors = {
    kerge:    Colors.green[400],
    mõõdukas: T.textMuted,
    kõrge:    Colors.blush[400],
  };
  const labels = {
    kerge:    t('ins.intensity.kerge'),
    mõõdukas: t('ins.intensity.mõõdukas'),
    kõrge:    t('ins.intensity.kõrge'),
  };
  return (
    <View style={styles.intensityRow}>
      <View style={[styles.intensityDot, { backgroundColor: colors[level] }]} />
      <Text style={[styles.intensityLbl, { color: colors[level] }]}>{labels[level]}</Text>
    </View>
  );
}

function ConfidenceBadge({ level }: { level: DetectedPattern['confidence'] }) {
  const { lang } = useTranslation();
  const T = useTheme();
  const styles = makeStyles(T);
  const labels = getConfidenceLabels(lang);
  const colors = T.dark ? {
    preliminary: { bg: T.surface2,   txt: T.textMuted  },
    emerging:    { bg: T.skyBg,      txt: Colors.green[200] },
    consistent:  { bg: T.blushBg,    txt: Colors.blush[200] },
  } : {
    preliminary: { bg: T.surface2,  txt: T.textSec  },
    emerging:    { bg: Colors.green[50],  txt: Colors.green[600]  },
    consistent:  { bg: Colors.blush[50],  txt: Colors.blush[600]  },
  };
  const c = colors[level];
  return (
    <View style={[styles.confidenceBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.confidenceTxt, { color: c.txt }]}>
        {labels[level].toUpperCase()}
      </Text>
    </View>
  );
}

type InsightTab = 'body' | 'training' | 'wellbeing' | 'patterns' | 'cycle';

export default function InsightsScreen() {
  const T = useTheme();
  const styles = makeStyles(T);
  const { lang, t } = useTranslation();
  const profile   = useQuery(api.profiles.get);
  const workouts  = useQuery(api.workouts.list) ?? [];
  const cycleDays = useQuery(api.cycleDays.list) ?? [];
  const [openTip, setOpenTip] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InsightTab>('body');

  const ci = getCycleInfo(
    profile?.last_period_date ?? null,
    profile?.cycle_length ?? 28,
    profile?.period_length ?? 5,
  );

  const phaseKey = ci?.phaseKey ?? 'unknown';
  const insight  = getPhaseInsights(lang)[phaseKey];

  const phaseAccent =
    phaseKey === 'menstruation' ? Colors.blush[400] :
    phaseKey === 'follicular'   ? Colors.green[400]  :
    phaseKey === 'ovulation'    ? Colors.green[400]  :
    phaseKey === 'luteal'       ? Colors.blush[400]  : T.textMuted;
  const PC = T.dark ? {
    bg:     T.surface,
    border: T.border,
    text:   T.text,
    sub:    T.textSec,
    accent: phaseAccent,
  } : {
    bg:     insight.colors.bg,
    border: insight.colors.border,
    text:   insight.colors.text,
    sub:    insight.colors.sub,
    accent: insight.colors.accent,
  };
  const patterns    = detectPatterns(workouts, cycleDays, lang);
  const cycleStats  = getCycleStats(profile, cycleDays);
  const DISCLAIMER  = getDisclaimer(lang);
  const hasData  = workouts.length > 0 || cycleDays.length > 0;

  const tabs: { key: InsightTab; label: string }[] = [
    { key: 'body',      label: t('ins.tab.body')      },
    { key: 'training',  label: t('ins.tab.training')  },
    { key: 'wellbeing', label: t('ins.tab.wellbeing') },
    { key: 'cycle',     label: t('ins.tab.cycle')     },
    { key: 'patterns',  label: t('ins.tab.patterns')  },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: T.border }]}>
        <Text style={[styles.heading, { color: T.text }]}>{t('ins.heading')}</Text>
        <Text style={[styles.subheading, { color: T.textMuted }]}>{t('ins.sub')}</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 }}>

        {/* ── Phase Hero ── */}
        <View style={[styles.phaseCard, { backgroundColor: PC.bg, borderColor: PC.border, borderWidth: T.dark ? 1 : 1.5 }]}>
          <View style={styles.phaseCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phaseEye, { color: PC.sub }]}>{t('phase.current')}</Text>
              <Text style={[styles.phaseName, { color: PC.text }]}>{insight.phase}</Text>
              <Text style={[styles.phaseDays, { color: PC.sub }]}>{insight.daysRange}</Text>
            </View>
            {ci && (
              <View style={[styles.phasePill, { borderColor: PC.border, backgroundColor: T.dark ? T.surface2 : undefined }]}>
                <Text style={[styles.phaseDaysN, { color: PC.text }]}>{ci.daysLeft}</Text>
                <Text style={[styles.phaseDaysLbl, { color: PC.sub }]}>{t('phase.daysleft')}</Text>
              </View>
            )}
          </View>
          <View style={[styles.taglineRow, { borderTopColor: PC.border }]}>
            <Text style={[styles.phaseTagline, { color: PC.accent }]}>{insight.tagline}</Text>
          </View>
        </View>

        {/* ── Tab bar — 5 pills, scrollable horizontally ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabBarScroll}
          contentContainerStyle={styles.tabBarContent}
        >
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabPill,
                  { borderColor: T.border, backgroundColor: active ? T.text : T.surface },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabLabel, { color: active ? T.bg : T.textSec }]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ══ BODY TAB ══ */}
        {activeTab === 'body' && (
          <View style={styles.tabContent}>
            {/* Plain text — RichText inline-bold causes web spacing gaps in overview paragraph */}
            {insight.overview ? (
              <Text style={[styles.overviewTxt, { color: T.textSec }]}>
                {insight.overview.replace(/\*\*/g, '')}
              </Text>
            ) : null}

            {/* Hormone chips */}
            {insight.hormoneChips.length > 0 ? (
              <View style={[styles.infoCard, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}>
                <View style={styles.infoCardHeader}>
                  <Icon name="spark" size={13} color={Colors.blush[400]} />
                  <Text style={[styles.infoCardTitle, { color: T.text }]}>{t('ins.hormone')}</Text>
                </View>
                <View style={styles.chipWrap}>
                  {insight.hormoneChips.map((chip, i) => (
                    <View key={i} style={[styles.chip, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}>
                      <Text style={[styles.chipTxt, { color: T.text }]}>{chip}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Energy bar chart — absolute-positioned bars avoid RN-web flex-stretch issue */}
            {insight.energySummary ? (
              <View style={[styles.infoCard, { backgroundColor: T.surface, borderColor: T.border }]}>
                <View style={styles.infoCardHeader}>
                  <Icon name="energized" size={13} color={T.textMuted} />
                  <Text style={[styles.infoCardTitle, { color: T.text }]}>{t('ins.energy')}</Text>
                </View>
                <View style={styles.arcRow}>
                  {[0, 1, 2, 3, 4, 5].map(i => {
                    const e0 = insight.energyArc[0];
                    const e1 = insight.energyArc[1];
                    const level = e0 + (e1 - e0) * (i / 5);
                    const barH = Math.max(5, Math.round(level * 44));
                    return (
                      <View key={i} style={styles.arcBarWrap}>
                        <View style={[styles.arcBar, {
                          height: barH,
                          backgroundColor: phaseAccent,
                          opacity: 0.2 + level * 0.8,
                        }]} />
                      </View>
                    );
                  })}
                </View>
                <View style={styles.arcLabels}>
                  <Text style={[styles.arcLbl, { color: T.textMuted }]}>{t('ins.arc.early')}</Text>
                  <Text style={[styles.arcLbl, { color: T.textMuted }]}>{t('ins.arc.late')}</Text>
                </View>
                <Text style={[styles.arcSummary, { color: T.textSec }]}>{insight.energySummary}</Text>
              </View>
            ) : null}
          </View>
        )}

        {/* ══ TRAINING TAB ══ */}
        {activeTab === 'training' && (() => {
          const intensityColors = {
            kerge:    { bg: T.skyBg,   border: T.skyBorder,   accent: Colors.green[400], label: Colors.green[600] },
            mõõdukas: { bg: T.surface, border: T.border,      accent: T.border2,         label: T.textMuted        },
            kõrge:    { bg: T.blushBg, border: T.blushBorder, accent: Colors.blush[400], label: Colors.blush[600]  },
          };
          return (
            <View style={styles.tabContent}>
              {insight.trainingFocus.length > 0 ? insight.trainingFocus.map((tip, i) => {
                const ic = intensityColors[tip.intensity];
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.tipCard, {
                      backgroundColor: ic.bg,
                      // Explicit per-side borders eliminate the double-border RN-web bug
                      // (borderWidth:1 + borderLeftWidth:3 stacks on web instead of overriding)
                      borderTopWidth: 1,    borderTopColor:    ic.border,
                      borderRightWidth: 1,  borderRightColor:  ic.border,
                      borderBottomWidth: 1, borderBottomColor: ic.border,
                      borderLeftWidth: 3,   borderLeftColor:   ic.accent,
                    }]}
                    activeOpacity={0.8}
                    onPress={() => setOpenTip(openTip === `tip-${i}` ? null : `tip-${i}`)}
                  >
                    <View style={styles.tipHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.tipTitle, { color: T.text }]}>{tip.title}</Text>
                        {openTip !== `tip-${i}` && (
                          <Text style={[styles.tipHint, { color: T.textMuted }]} numberOfLines={2}>
                            {tip.detail.replace(/\*\*/g, '')}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <View style={[styles.intensityPill, { backgroundColor: ic.accent }]}>
                          <Text style={styles.intensityPillTxt}>{tip.intensity === 'kerge' ? t('ins.intensity.kerge') : tip.intensity === 'kõrge' ? t('ins.intensity.kõrge') : t('ins.intensity.mõõdukas')}</Text>
                        </View>
                        <Icon name="chevr" size={13} color={T.border2} />
                      </View>
                    </View>
                    {openTip === `tip-${i}` && (
                      <>
                        <View style={[styles.tipDivider, { borderTopColor: T.border }]} />
                        <RichText
                          text={tip.detail}
                          style={[styles.tipDetail, { color: T.textSec }]}
                          boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }}
                        />
                      </>
                    )}
                  </TouchableOpacity>
                );
              }) : (
                <View style={[styles.emptyCard, { backgroundColor: T.surface2, borderColor: T.border }]}>
                  <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('ins.patterns.empty')}</Text>
                </View>
              )}
            </View>
          );
        })()}

        {/* ══ WELLBEING TAB ══ */}
        {activeTab === 'wellbeing' && (
          <View style={styles.tabContent}>
            {/* Recovery — full-width coloured card */}
            {insight.recoveryNote ? (
              <View style={[styles.infoCard, { backgroundColor: T.skyBg, borderColor: T.skyBorder }]}>
                <View style={styles.infoCardHeader}>
                  <Icon name="moon" size={13} color={Colors.sky[400] ?? T.textMuted} />
                  <Text style={[styles.infoCardTitle, { color: T.text }]}>{t('ins.recovery')}</Text>
                </View>
                <RichText
                  text={insight.recoveryNote}
                  style={[styles.bodyTxt, { color: T.textSec }]}
                  boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }}
                />
              </View>
            ) : null}

            {/* Wellness tips — each as its own mini card with accent stripe */}
            {insight.wellnessTips.length > 0 ? (
              <>
                <View style={styles.wellnessSectionLabel}>
                  <Icon name="leaf" size={12} color={T.textMuted} />
                  <Text style={[styles.wellnessSectionTxt, { color: T.textSec }]}>{t('ins.wellness')}</Text>
                </View>
                {insight.wellnessTips.map((tip, i) => {
                  // 4 equally-weighted tones from different palettes — no alarming pink, no de-emphasised gray
                  const accentColors = [Colors.green[400], Colors.blush[200], Colors.sky[200], Colors.coral[200]];
                  const accent = accentColors[i % accentColors.length];
                  return (
                    <View key={i} style={[styles.wellnessTipCard, {
                      backgroundColor: T.surface,
                      borderTopWidth: 1,    borderTopColor:    T.border,
                      borderRightWidth: 1,  borderRightColor:  T.border,
                      borderBottomWidth: 1, borderBottomColor: T.border,
                      borderLeftWidth: 3,   borderLeftColor:   accent,
                    }]}>
                      <View style={[styles.wellnessBadge, { backgroundColor: accent }]}>
                        <Text style={styles.wellnessBadgeTxt}>{i + 1}</Text>
                      </View>
                      <RichText
                        text={tip}
                        style={[styles.bodyTxt, { color: T.textSec }]}
                        boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }}
                      />
                    </View>
                  );
                })}
              </>
            ) : null}
          </View>
        )}

        {/* ══ CYCLE TAB ══ */}
        {activeTab === 'cycle' && (
          <View style={styles.tabContent}>
            {!cycleStats.hasEnoughData ? (
              <View style={[styles.emptyCard, { backgroundColor: T.surface2, borderColor: T.border }]}>
                <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('ins.cycle.nodata')}</Text>
              </View>
            ) : (
              <>
                {/* ── Cycle & period length vs norms ── */}
                <View style={[styles.infoCard, { backgroundColor: T.surface, borderColor: T.border }]}>
                  <Text style={[styles.infoCardTitle, { color: T.text, marginBottom: 16 }]}>{t('ins.cycle.heading')}</Text>

                  {/* Cycle length */}
                  {cycleStats.cycleLength != null && (() => {
                    const cl = cycleStats.cycleLength;
                    const pct = Math.min(1, Math.max(0, (cl - 18) / (45 - 18)));
                    const statusColor =
                      cycleStats.cycleLengthStatus === 'normal' ? Colors.green[400]
                      : Colors.blush[400];
                    return (
                      <View style={{ marginBottom: 18 }}>
                        <View style={styles.statRow}>
                          <Text style={[styles.statLabel, { color: T.textSec }]}>{t('ins.cycle.length.lbl')}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.statValue, { color: T.text }]}>{cl} {t('ins.cycle.days.unit')}</Text>
                            <View style={[styles.statusPill, { backgroundColor: cycleStats.cycleLengthStatus === 'normal' ? Colors.green[50] : Colors.blush[50], borderColor: statusColor }]}>
                              <Text style={[styles.statusPillTxt, { color: statusColor }]}>
                                {cycleStats.cycleLengthStatus === 'normal' ? t('ins.cycle.normal') : cycleStats.cycleLengthStatus === 'short' ? t('ins.cycle.short') : t('ins.cycle.long')}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.normBar}>
                          <View style={[styles.normBarFill, { width: `${pct * 100}%` as any, backgroundColor: statusColor }]} />
                        </View>
                        <View style={styles.normLabels}>
                          <Text style={[styles.normLbl, { color: T.textMuted }]}>{CYCLE_NORMAL_MIN}d</Text>
                          <Text style={[styles.normLbl, { color: T.textMuted }]}>{t('ins.cycle.avg.label')}: {CYCLE_AVG}d</Text>
                          <Text style={[styles.normLbl, { color: T.textMuted }]}>{CYCLE_NORMAL_MAX}d</Text>
                        </View>
                      </View>
                    );
                  })()}

                  {/* Period length */}
                  {cycleStats.periodLength != null && (() => {
                    const pl = cycleStats.periodLength;
                    const pct = Math.min(1, Math.max(0, (pl - 1) / (9 - 1)));
                    const statusColor =
                      cycleStats.periodLengthStatus === 'normal' ? Colors.green[400]
                      : Colors.blush[400];
                    return (
                      <View>
                        <View style={styles.statRow}>
                          <Text style={[styles.statLabel, { color: T.textSec }]}>{t('ins.cycle.period.lbl')}</Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={[styles.statValue, { color: T.text }]}>{pl} {t('ins.cycle.days.unit')}</Text>
                            <View style={[styles.statusPill, { backgroundColor: cycleStats.periodLengthStatus === 'normal' ? Colors.green[50] : Colors.blush[50], borderColor: statusColor }]}>
                              <Text style={[styles.statusPillTxt, { color: statusColor }]}>
                                {cycleStats.periodLengthStatus === 'normal' ? t('ins.cycle.normal') : cycleStats.periodLengthStatus === 'short' ? t('ins.cycle.short') : t('ins.cycle.long')}
                              </Text>
                            </View>
                          </View>
                        </View>
                        <View style={styles.normBar}>
                          <View style={[styles.normBarFill, { width: `${pct * 100}%` as any, backgroundColor: statusColor }]} />
                        </View>
                        <View style={styles.normLabels}>
                          <Text style={[styles.normLbl, { color: T.textMuted }]}>{PERIOD_NORMAL_MIN}d</Text>
                          <Text style={[styles.normLbl, { color: T.textMuted }]}>{t('ins.cycle.range.label')}: {PERIOD_NORMAL_MIN}–{PERIOD_NORMAL_MAX}d</Text>
                          <Text style={[styles.normLbl, { color: T.textMuted }]}>{PERIOD_NORMAL_MAX}d</Text>
                        </View>
                      </View>
                    );
                  })()}
                </View>

                {/* ── Mood overview ── */}
                {cycleStats.totalLoggedDays >= 5 && (
                  <View style={[styles.infoCard, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}>
                    <View style={styles.infoCardHeader}>
                      <Icon name="smile-good" size={13} color={Colors.blush[400]} />
                      <Text style={[styles.infoCardTitle, { color: T.text }]}>{t('ins.cycle.mood.lbl')}</Text>
                    </View>
                    <View style={styles.moodRow}>
                      {[
                        { label: t('ins.cycle.mood.pos'), pct: cycleStats.moodPositivePct, color: Colors.green[400] },
                        { label: t('ins.cycle.mood.neu'), pct: cycleStats.moodNeutralPct,  color: T.textMuted },
                        { label: t('ins.cycle.mood.neg'), pct: cycleStats.moodNegativePct, color: Colors.blush[400] },
                      ].map(m => (
                        <View key={m.label} style={styles.moodCol}>
                          <Text style={[styles.moodPct, { color: m.color }]}>{m.pct}%</Text>
                          <View style={[styles.moodBar, { backgroundColor: T.border }]}>
                            <View style={[styles.moodBarFill, { height: `${m.pct}%` as any, backgroundColor: m.color }]} />
                          </View>
                          <Text style={[styles.moodLbl, { color: T.textMuted }]}>{m.label}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={[styles.moodSub, { color: T.textMuted }]}>
                      {cycleStats.totalLoggedDays} {t('ins.cycle.mood.days')}
                    </Text>
                  </View>
                )}

                {/* ── Top symptoms all days ── */}
                {cycleStats.topSymptoms.length > 0 && (
                  <View style={[styles.infoCard, { backgroundColor: T.surface, borderColor: T.border }]}>
                    <View style={styles.infoCardHeader}>
                      <Icon name="leaf" size={13} color={T.textMuted} />
                      <View>
                        <Text style={[styles.infoCardTitle, { color: T.text }]}>{t('ins.cycle.symptoms.lbl')}</Text>
                        <Text style={[styles.normLbl, { color: T.textMuted, marginTop: 1 }]}>{t('ins.cycle.symptoms.sub')}</Text>
                      </View>
                    </View>
                    {cycleStats.topSymptoms.map(s => {
                      const pct = cycleStats.topSymptoms[0].count > 0 ? s.count / cycleStats.topSymptoms[0].count : 0;
                      return (
                        <View key={s.name} style={styles.symRow}>
                          <Text style={[styles.symName, { color: T.textSec }]} numberOfLines={1}>{s.name}</Text>
                          <View style={[styles.symTrack, { backgroundColor: T.border }]}>
                            <View style={[styles.symFill, { width: `${pct * 100}%` as any, backgroundColor: Colors.blush[400] }]} />
                          </View>
                          <Text style={[styles.symCount, { color: T.textMuted }]}>{s.count}×</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* ── Period-day symptoms ── */}
                {cycleStats.topPeriodSymptoms.length > 0 && (
                  <View style={[styles.infoCard, { backgroundColor: T.blushBg, borderColor: T.blushBorder }]}>
                    <View style={styles.infoCardHeader}>
                      <Icon name="moon" size={13} color={Colors.blush[400]} />
                      <View>
                        <Text style={[styles.infoCardTitle, { color: T.text }]}>{t('ins.cycle.period.sym')}</Text>
                        <Text style={[styles.normLbl, { color: T.textMuted, marginTop: 1 }]}>{t('ins.cycle.period.sym.sub')}</Text>
                      </View>
                    </View>
                    {cycleStats.topPeriodSymptoms.map(s => {
                      const pct = cycleStats.topPeriodSymptoms[0].count > 0 ? s.count / cycleStats.topPeriodSymptoms[0].count : 0;
                      return (
                        <View key={s.name} style={styles.symRow}>
                          <Text style={[styles.symName, { color: T.textSec }]} numberOfLines={1}>{s.name}</Text>
                          <View style={[styles.symTrack, { backgroundColor: T.blushBorder }]}>
                            <View style={[styles.symFill, { width: `${pct * 100}%` as any, backgroundColor: Colors.blush[600] }]} />
                          </View>
                          <Text style={[styles.symCount, { color: T.textMuted }]}>{s.count}×</Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Research source */}
                <View style={[styles.disclaimer, { backgroundColor: T.surface2, borderColor: T.border, marginTop: 4 }]}>
                  <View style={styles.disclaimerHeader}>
                    <Icon name="lock" size={12} color={T.textMuted} />
                    <Text style={[styles.disclaimerTitle, { color: T.textSec }]}>{t('ins.note')}</Text>
                  </View>
                  <Text style={[styles.disclaimerTxt, { color: T.textMuted }]}>{t('ins.cycle.research')}</Text>
                  <Text style={[styles.disclaimerTxt, { color: T.textMuted, marginTop: 4 }]}>{DISCLAIMER}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* ══ PATTERNS TAB ══ */}
        {activeTab === 'patterns' && (
          <View style={styles.tabContent}>
            {patterns.length > 0 ? patterns.map(p => {
              // Each color tier gets a clearly distinct background + metric box + text
              const cardBg     = T.dark ? T.surface2
                : p.color === 'green' ? Colors.green[50]  : p.color === 'blush' ? Colors.blush[50]  : T.surface2;
              const cardBorder = T.dark ? T.border
                : p.color === 'green' ? Colors.green[200] : p.color === 'blush' ? Colors.blush[200] : T.border;
              const metricBg   = T.dark ? T.surface
                : p.color === 'green' ? Colors.green[100] : p.color === 'blush' ? Colors.blush[100] : T.surface;
              const metricColor = T.dark ? T.text
                : p.color === 'green' ? Colors.green[600] : p.color === 'blush' ? Colors.blush[600] : T.text;
              return (
                <View key={p.id} style={[styles.patternCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
                  <View style={styles.patternRow}>
                    {/* Left: big metric with its own tinted box */}
                    <View style={[styles.patternMetricBox, { backgroundColor: metricBg, borderRightColor: cardBorder }]}>
                      <Text style={[styles.patternMetric, { color: metricColor }]}>{p.metric}</Text>
                    </View>
                    {/* Right: title + subtext + badge */}
                    <View style={styles.patternInfo}>
                      <Text style={[styles.patternTitle, { color: T.text }]}>{p.title}</Text>
                      <Text style={[styles.patternSubtext, { color: T.textMuted }]}>{p.subtext}</Text>
                      <View style={{ marginTop: 8 }}>
                        <ConfidenceBadge level={p.confidence} />
                      </View>
                    </View>
                  </View>
                </View>
              );
            }) : (
              <View style={[styles.emptyCard, { backgroundColor: T.surface2, borderColor: T.border }]}>
                <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('ins.patterns.empty')}</Text>
              </View>
            )}

            {/* Research source + disclaimer — collapsed into one quiet row */}
            <View style={[styles.disclaimer, { backgroundColor: T.surface2, borderColor: T.border, marginTop: 8 }]}>
              <View style={styles.disclaimerHeader}>
                <Icon name="lock" size={12} color={T.textMuted} />
                <Text style={[styles.disclaimerTitle, { color: T.textSec }]}>{t('ins.note')}</Text>
              </View>
              <Text style={[styles.disclaimerTxt, { color: T.textMuted }]}>{DISCLAIMER}</Text>
              {insight.researchContext ? (
                <Text style={[styles.disclaimerTxt, { color: T.textMuted, marginTop: 6, opacity: 0.7 }]}>{insight.researchContext}</Text>
              ) : null}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(T: ThemeTokens) {
  return StyleSheet.create({
  safe:       { flex: 1, backgroundColor: T.bg },
  topBar:     {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: T.border,
  },
  heading:    { fontFamily: Fonts.sansBold, fontSize: 22, color: T.text, letterSpacing: -0.3 },
  subheading: { fontFamily: Fonts.sans, fontSize: 12, color: T.textMuted, marginTop: 2 },
  scroll:     { flex: 1 },
  bold:       { fontFamily: Fonts.sansBold, color: T.text },

  // Phase hero card
  phaseCard: {
    margin: Spacing.xl, marginBottom: 0,
    borderRadius: Radius.md, padding: 20,
    overflow: 'hidden',
  },
  phaseCardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  phaseEye:      { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, opacity: 0.7 },
  phaseName:     { fontFamily: Fonts.sansBold, fontSize: 26, lineHeight: 30, letterSpacing: -0.5 },
  phaseDays:     { fontFamily: Fonts.sans, fontSize: 11, marginTop: 4, opacity: 0.7 },
  phasePill:     {
    alignItems: 'center', borderRadius: Radius.sm,
    paddingHorizontal: 14, paddingVertical: 10, minWidth: 64,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  phaseDaysN:    { fontFamily: Fonts.sansBold, fontSize: 30, lineHeight: 32, textAlign: 'center' },
  phaseDaysLbl:  { fontFamily: Fonts.sans, fontSize: 9, textAlign: 'center', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 },
  taglineRow:    { borderTopWidth: 1, paddingTop: 12, borderTopColor: 'rgba(255,255,255,0.2)' },
  phaseTagline:  { fontFamily: Fonts.sansBold, fontSize: 14, letterSpacing: 0.2 },

  // Tab bar — horizontally scrollable for 5 tabs
  tabBarRow: { flexDirection: 'row', marginTop: 16, paddingHorizontal: Spacing.xl, gap: 6 },
  tabBarScroll:   { flexGrow: 0, marginTop: 16 },
  tabBarContent:  { paddingHorizontal: Spacing.xl, gap: 6, flexDirection: 'row' },
  tabPill: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1,
  },
  tabLabel: { fontFamily: Fonts.sansMedium, fontSize: 12 },

  // Tab content wrapper
  tabContent: { paddingTop: 16 },

  // Overview text (body tab intro)
  overviewTxt: {
    fontFamily: Fonts.sans, fontSize: 14, lineHeight: 22,
    color: T.textSec, marginHorizontal: Spacing.xl, marginBottom: 16,
  },

  // Unified info card (replaces hormoneCard / energyCard / recoveryCard / wellnessCard)
  infoCard: {
    marginHorizontal: Spacing.xl, marginBottom: 12,
    borderRadius: Radius.md, padding: 18,
    borderWidth: 1,
  },
  infoCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  infoCardTitle:  { fontFamily: Fonts.sansBold, fontSize: 14, color: T.text },

  // Chip grid (hormone section)
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip:     { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  chipTxt:  { fontFamily: Fonts.sansMedium, fontSize: 12, color: T.text },

  // Energy bars — absolute-positioned inside relative wrapper to fix RN-web flex-stretch
  arcRow:     { flexDirection: 'row', gap: 5, height: 48, marginBottom: 6 },
  arcBarWrap: { flex: 1, height: 48, position: 'relative' },
  arcBar:     { position: 'absolute', bottom: 0, left: 0, right: 0, borderRadius: 4 },
  arcLabels:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  arcLbl:     { fontFamily: Fonts.sans, fontSize: 10, color: T.textMuted },
  arcSummary: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 20, color: T.textSec },

  // Bullet rows
  bulletRow:  { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  bodyTxt:    { fontFamily: Fonts.sans, fontSize: 14, lineHeight: 22, color: T.textSec, flex: 1 },

  // Training tip cards — borders set explicitly inline to avoid RN-web double-border
  tipCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    borderRadius: Radius.md, padding: 18,
  },
  tipHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  tipTitle:       { fontFamily: Fonts.sansBold, fontSize: 15, color: T.text, marginBottom: 4, letterSpacing: -0.1 },
  tipHint:        { fontFamily: Fonts.sans, fontSize: 13, color: T.textMuted, lineHeight: 19 },
  tipDivider:     { borderTopWidth: 1, marginTop: 14 },
  tipDetail:      { fontFamily: Fonts.sans, fontSize: 14, color: T.textSec, lineHeight: 22, marginTop: 12 },
  intensityPill:  { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  intensityPillTxt: { fontFamily: Fonts.sansBold, fontSize: 9, color: '#fff', letterSpacing: 0.4, textTransform: 'uppercase' },
  // keep these for ConfidenceBadge (still uses intensityRow/Dot internally via old IntensityDot — not used now)
  intensityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  intensityDot: { width: 6, height: 6, borderRadius: 3 },
  intensityLbl: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 0.6 },

  // Wellbeing individual tip cards
  wellnessSectionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: Spacing.xl, marginBottom: 10 },
  wellnessSectionTxt:   { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: T.textSec },
  wellnessTipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    marginHorizontal: Spacing.xl, marginBottom: 8,
    padding: 14, borderRadius: Radius.md,
  },
  wellnessBadge:    { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 },
  wellnessBadgeTxt: { fontFamily: Fonts.sansBold, fontSize: 11, color: '#fff' },

  // Pattern cards — metric-first layout
  patternCard: {
    marginHorizontal: Spacing.xl, marginBottom: 10,
    borderRadius: Radius.md, borderWidth: 1, overflow: 'hidden',
  },
  patternRow:       { flexDirection: 'row', alignItems: 'stretch' },
  patternMetricBox: { width: 80, alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRightWidth: 1 },
  patternMetric:    { fontFamily: Fonts.sansBold, fontSize: 22, letterSpacing: -0.5, textAlign: 'center' },
  patternInfo:      { flex: 1, padding: 14 },
  patternTitle:     { fontFamily: Fonts.sansBold, fontSize: 13, color: T.text, lineHeight: 18, marginBottom: 4 },
  patternSubtext:   { fontFamily: Fonts.sans, fontSize: 12, color: T.textMuted, lineHeight: 17 },
  confidenceBadge:  { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  confidenceTxt:    { fontFamily: Fonts.sansBold, fontSize: 8, letterSpacing: 0.8 },

  // Cycle tab styles
  statRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statLabel:     { fontFamily: Fonts.sansMedium, fontSize: 13, color: T.textSec },
  statValue:     { fontFamily: Fonts.sansBold, fontSize: 15, color: T.text },
  statusPill:    { borderRadius: 8, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  statusPillTxt: { fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 0.3 },
  normBar:       { height: 6, borderRadius: 3, backgroundColor: T.border, marginBottom: 4, overflow: 'hidden' },
  normBarFill:   { height: 6, borderRadius: 3 },
  normLabels:    { flexDirection: 'row', justifyContent: 'space-between' },
  normLbl:       { fontFamily: Fonts.sans, fontSize: 10, color: T.textMuted },

  moodRow:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  moodCol:     { alignItems: 'center', gap: 4 },
  moodPct:     { fontFamily: Fonts.sansBold, fontSize: 20, letterSpacing: -0.5 },
  moodBar:     { width: 32, height: 60, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  moodBarFill: { width: '100%', borderRadius: 6 },
  moodLbl:     { fontFamily: Fonts.sans, fontSize: 11, color: T.textMuted, textAlign: 'center' },
  moodSub:     { fontFamily: Fonts.sans, fontSize: 11, color: T.textMuted, textAlign: 'center', marginTop: 4 },

  symRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  symName:  { fontFamily: Fonts.sans, fontSize: 12, color: T.textSec, width: 90 },
  symTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  symFill:  { height: 6, borderRadius: 3 },
  symCount: { fontFamily: Fonts.sansMedium, fontSize: 11, color: T.textMuted, width: 24, textAlign: 'right' },

  // Empty state
  emptyCard: { marginHorizontal: Spacing.xl, padding: 28, alignItems: 'center', borderRadius: Radius.md, borderWidth: 1 },
  emptyTxt:  { fontFamily: Fonts.sans, fontSize: 14, color: T.textMuted, textAlign: 'center', lineHeight: 21 },

  // Disclaimer (patterns tab — combined with source)
  disclaimer:       { marginHorizontal: Spacing.xl, padding: 14, borderRadius: Radius.sm, borderWidth: 1 },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  disclaimerTitle:  { fontFamily: Fonts.sansBold, fontSize: 11, color: T.textSec, letterSpacing: 0.3 },
  disclaimerTxt:    { fontFamily: Fonts.sans, fontSize: 11, color: T.textMuted, lineHeight: 17 },
  });
}
