import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Icon } from '../../components/ui/Icon';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { getCycleInfo } from '../../lib/cycle';
import { Profile, Workout, CycleDay } from '../../types';
import {
  getPhaseInsights, detectPatterns, getConfidenceLabels, getDisclaimer,
  DetectedPattern, TrainingTip,
} from '../../lib/cycleInsights';
import { useTranslation } from '../../lib/LangContext';

// Renders **bold** markers inline inside a Text block
function RichText({ text, style, boldStyle }: { text: string; style?: any; boldStyle?: any }) {
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
  const { t } = useTranslation();
  const colors = {
    kerge:    Colors.green[400],
    mõõdukas: Colors.beige[400],
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
  const labels = getConfidenceLabels(lang);
  const colors = {
    preliminary: { bg: Colors.beige[50],  txt: Colors.beige[600]  },
    emerging:    { bg: Colors.green[50],  txt: Colors.green[700]  },
    consistent:  { bg: Colors.blush[50],  txt: Colors.blush[700]  },
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

export default function InsightsScreen() {
  const T = useTheme();
  const { lang, t } = useTranslation();
  const profile   = useQuery(api.profiles.get);
  const workouts  = useQuery(api.workouts.list) ?? [];
  const cycleDays = useQuery(api.cycleDays.list) ?? [];
  const [openTip, setOpenTip] = useState<string | null>(null);

  const ci = getCycleInfo(
    profile?.last_period_date ?? null,
    profile?.cycle_length ?? 28,
    profile?.period_length ?? 5,
  );

  const phaseKey = ci?.phaseKey ?? 'unknown';
  const insight  = getPhaseInsights(lang)[phaseKey];
  const patterns = detectPatterns(workouts, cycleDays, lang);
  const CONFIDENCE_LABELS = getConfidenceLabels(lang);
  const DISCLAIMER = getDisclaimer(lang);

  const hasData  = workouts.length > 0 || cycleDays.length > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: T.bg }]} edges={['top']}>
      <View style={[styles.topBar, { borderBottomColor: T.border }]}>
        <View>
          <Text style={[styles.heading, { color: T.text }]}>{t('ins.heading')}</Text>
          <Text style={[styles.subheading, { color: T.textMuted }]}>{t('ins.sub')}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 48 }}>

        {/* ── Current Phase Hero ── */}
        <View style={[styles.phaseCard, { backgroundColor: insight.colors.bg, borderColor: insight.colors.border }]}>
          <View style={styles.phaseCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.phaseEye, { color: insight.colors.sub }]}>{t('phase.current')}</Text>
              <Text style={[styles.phaseName, { color: insight.colors.text }]}>{insight.phase}</Text>
              <Text style={[styles.phaseDays, { color: insight.colors.sub }]}>{insight.daysRange}</Text>
            </View>
            {ci && (
              <View style={[styles.phasePill, { borderColor: insight.colors.border }]}>
                <Text style={[styles.phaseDaysN, { color: insight.colors.text }]}>{ci.daysLeft}</Text>
                <Text style={[styles.phaseDaysLbl, { color: insight.colors.sub }]}>{t('phase.daysleft')}</Text>
              </View>
            )}
          </View>
          <View style={[styles.taglineRow, { borderTopColor: insight.colors.border }]}>
            <Text style={[styles.phaseTagline, { color: insight.colors.accent }]}>
              {insight.tagline}
            </Text>
          </View>
          {insight.overview ? (
            <RichText
              text={insight.overview}
              style={[styles.phaseOverview, { color: insight.colors.sub }]}
              boldStyle={{ fontFamily: Fonts.sansBold, color: insight.colors.text }}
            />
          ) : null}
        </View>

        {/* ── Hormone Context ── */}
        {insight.hormoneContext ? (
          <>
            <View style={styles.sectionRow}>
              <Icon name="spark" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.hormone')}</Text>
            </View>
            <View style={[styles.hormoneCard, { backgroundColor: T.blushBg, borderColor: T.blushBorder, borderLeftColor: Colors.blush[400] }]}>
              {insight.hormoneContext.split('. ').filter(Boolean).map((sentence, i, arr) => (
                <View key={i} style={[styles.hormoneRow, { borderBottomColor: T.blushBorder }, i === arr.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <View style={styles.hormoneDot} />
                  <RichText text={sentence.endsWith('.') ? sentence : sentence + '.'} style={[styles.infoTxt, { color: T.textSec }]} boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }} />
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* ── Energy Pattern ── */}
        {insight.energyPattern ? (
          <>
            <View style={styles.sectionRow}>
              <Icon name="energized" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.energy')}</Text>
            </View>
            <View style={[styles.energyCard, { backgroundColor: T.surface2, borderColor: T.border, borderLeftColor: T.border2 }]}>
              <RichText text={insight.energyPattern} style={[styles.energyTxt, { color: T.textSec }]} boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }} />
            </View>
          </>
        ) : null}

        {/* ── Training Recommendations ── */}
        {insight.trainingFocus.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Icon name="barbell" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.training')}</Text>
            </View>
            {insight.trainingFocus.map((tip, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.tipCard, { backgroundColor: T.surface, borderColor: T.border, borderLeftColor: T.border }]}
                activeOpacity={0.8}
                onPress={() => setOpenTip(openTip === `tip-${i}` ? null : `tip-${i}`)}
              >
                <View style={styles.tipHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.tipTitle, { color: T.text }]}>{tip.title}</Text>
                    {openTip !== `tip-${i}` && (
                      <Text style={[styles.tipHint, { color: T.textMuted }]} numberOfLines={1}>{tip.detail.replace(/\*\*/g, '')}</Text>
                    )}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <IntensityDot level={tip.intensity} />
                    <Icon name="chevr" size={13} color={T.border2} />
                  </View>
                </View>
                {openTip === `tip-${i}` && (
                  <RichText text={tip.detail} style={[styles.tipDetail, { color: T.textSec, borderTopColor: T.border }]} boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }} />
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : null}

        {/* ── Recovery Note ── */}
        {insight.recoveryNote ? (
          <>
            <View style={styles.sectionRow}>
              <Icon name="moon" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.recovery')}</Text>
            </View>
            <View style={[styles.recoveryCard, { backgroundColor: T.skyBg, borderColor: T.skyBorder, borderLeftColor: Colors.sky[400] }]}>
              <RichText text={insight.recoveryNote} style={[styles.infoTxt, { color: T.textSec }]} boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }} />
            </View>
          </>
        ) : null}

        {/* ── Wellness Tips ── */}
        {insight.wellnessTips.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Icon name="leaf" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.wellness')}</Text>
            </View>
            <View style={[styles.wellnessCard, { backgroundColor: T.surface, borderColor: T.border }]}>
              {insight.wellnessTips.map((tip, i) => (
                <View key={i} style={[styles.wellnessRow, { borderBottomColor: T.border }, i === insight.wellnessTips.length - 1 && { borderBottomWidth: 0 }]}>
                  <Text style={[styles.wellnessNum, { backgroundColor: T.text, color: T.bg }]}>{i + 1}</Text>
                  <RichText text={tip} style={[styles.wellnessTxt, { color: T.textSec }]} boldStyle={{ fontFamily: Fonts.sansBold, color: T.text }} />
                </View>
              ))}
            </View>
          </>
        ) : null}

        {/* ── Personal Patterns ── */}
        {patterns.length > 0 ? (
          <>
            <View style={styles.sectionRow}>
              <Icon name="eye" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.patterns')}</Text>
            </View>
            {patterns.map(p => (
              <View key={p.id} style={[
                styles.patternCard,
                { backgroundColor: T.surface2, borderColor: T.border, borderLeftColor: T.border2 },
                p.color === 'green' && { backgroundColor: T.skyBg, borderColor: T.skyBorder, borderLeftColor: Colors.green[400] },
                p.color === 'blush' && { backgroundColor: T.blushBg, borderColor: T.blushBorder, borderLeftColor: Colors.blush[400] },
              ]}>
                <View style={styles.patternHeader}>
                  <Text style={[styles.patternTitle, { color: T.text }]}>{p.title}</Text>
                  <ConfidenceBadge level={p.confidence} />
                </View>
                <Text style={[styles.patternBody, { color: T.textSec }]}>{p.body}</Text>
              </View>
            ))}
          </>
        ) : hasData ? null : (
          <>
            <View style={styles.sectionRow}>
              <Icon name="eye" size={12} color={T.textMuted} />
              <Text style={[styles.sectionLbl, { color: T.textSec }]}>{t('ins.patterns')}</Text>
            </View>
            <View style={[styles.emptyPatterns, { backgroundColor: T.surface2, borderColor: T.border }]}>
              <Text style={[styles.emptyTxt, { color: T.textMuted }]}>{t('ins.patterns.empty')}</Text>
            </View>
          </>
        )}

        {/* ── Research Source ── */}
        {insight.researchContext ? (
          <View style={[styles.sourceCard, { backgroundColor: T.surface2, borderColor: T.border }]}>
            <Icon name="eye" size={11} color={T.textMuted} />
            <Text style={[styles.sourceTxt, { color: T.textMuted }]}>{insight.researchContext}</Text>
          </View>
        ) : null}

        {/* ── Disclaimer ── */}
        <View style={[styles.disclaimer, { backgroundColor: T.surface2, borderColor: T.border2 }]}>
          <View style={styles.disclaimerHeader}>
            <Icon name="lock" size={13} color={T.textMuted} />
            <Text style={[styles.disclaimerTitle, { color: T.textSec }]}>{t('ins.note')}</Text>
          </View>
          <Text style={[styles.disclaimerTxt, { color: T.textMuted }]}>{DISCLAIMER}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: Colors.cream },
  topBar:     {
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.md, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[100],
  },
  heading:    { fontFamily: Fonts.sansBold, fontSize: 22, color: Colors.beige[800], letterSpacing: -0.3 },
  subheading: { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[400], marginTop: 2 },
  scroll:     { flex: 1 },

  // Phase card — dark & bold
  phaseCard: {
    margin: Spacing.xl, marginBottom: 8,
    borderRadius: Radius.md, padding: 20,
    borderWidth: 0,
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
  taglineRow:    { borderTopWidth: 1, paddingTop: 12, marginBottom: 10, borderTopColor: 'rgba(255,255,255,0.2)' },
  phaseTagline:  { fontFamily: Fonts.sansBold, fontSize: 14, letterSpacing: 0.2 },
  phaseOverview: { fontFamily: Fonts.sans, fontSize: 13, lineHeight: 21, marginTop: 2, opacity: 0.85 },

  // Section label
  sectionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.xl, marginBottom: 8, marginTop: 18,
  },
  sectionLbl: {
    fontFamily: Fonts.sansBold, fontSize: 10, letterSpacing: 1.6,
    textTransform: 'uppercase', color: Colors.beige[600],
  },

  // Info cards
  infoTxt: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[700], lineHeight: 21, flex: 1 },
  bold:    { fontFamily: Fonts.sansBold, color: Colors.beige[800] },

  // Hormone card — sentence-by-sentence
  hormoneCard: {
    marginHorizontal: Spacing.xl, marginBottom: 4,
    backgroundColor: Colors.blush[50], borderRadius: Radius.md,
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 4,
    borderWidth: 1, borderColor: Colors.blush[100],
    borderLeftWidth: 3, borderLeftColor: Colors.blush[400],
  },
  hormoneRow: {
    flexDirection: 'row', gap: 10, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: Colors.blush[100], alignItems: 'flex-start',
  },
  hormoneDot: { width: 6, height: 6, borderRadius: 2, backgroundColor: Colors.blush[400], marginTop: 8, flexShrink: 0 },

  // Energy card
  energyCard: {
    marginHorizontal: Spacing.xl, marginBottom: 4,
    backgroundColor: Colors.beige[50], borderRadius: Radius.md,
    padding: 16, borderWidth: 1, borderColor: Colors.beige[100],
    borderLeftWidth: 3, borderLeftColor: Colors.beige[400],
  },
  energyTxt: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[700], lineHeight: 21 },

  // Recovery card
  recoveryCard: {
    marginHorizontal: Spacing.xl, marginBottom: 4,
    backgroundColor: Colors.sky[50], borderRadius: Radius.md,
    padding: 16, borderWidth: 1, borderColor: Colors.sky[100],
    borderLeftWidth: 3, borderLeftColor: Colors.sky[400],
  },

  // Training tip cards
  tipCard: {
    marginHorizontal: Spacing.xl, marginBottom: 6,
    backgroundColor: Colors.cream, borderRadius: Radius.md,
    padding: 16, borderWidth: 1, borderColor: Colors.beige[100],
    borderLeftWidth: 3, borderLeftColor: Colors.beige[200],
  },
  tipHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  tipTitle:   { fontFamily: Fonts.sansBold, fontSize: 14, color: Colors.beige[800], marginBottom: 3, letterSpacing: -0.1 },
  tipHint:    { fontFamily: Fonts.sans, fontSize: 11, color: Colors.beige[400], lineHeight: 16 },
  tipDetail:  { fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[600], lineHeight: 20, marginTop: 12,
                paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.beige[100] },
  intensityRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  intensityDot: { width: 5, height: 5, borderRadius: 2 },
  intensityLbl: { fontFamily: Fonts.sansBold, fontSize: 9, letterSpacing: 0.6 },

  // Wellness
  wellnessCard: {
    marginHorizontal: Spacing.xl, marginBottom: 4,
    backgroundColor: Colors.cream, borderRadius: Radius.md,
    paddingHorizontal: 16, borderWidth: 1, borderColor: Colors.beige[100],
  },
  wellnessRow: {
    flexDirection: 'row', gap: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.beige[100], alignItems: 'flex-start',
  },
  wellnessNum: {
    width: 20, height: 20, borderRadius: 4,
    backgroundColor: Colors.beige[800], textAlign: 'center', lineHeight: 20,
    fontFamily: Fonts.sansBold, fontSize: 10, color: Colors.cream, flexShrink: 0,
  },
  wellnessTxt: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[700], lineHeight: 20, flex: 1 },

  // Pattern cards
  patternCard: {
    marginHorizontal: Spacing.xl, marginBottom: 8,
    backgroundColor: Colors.beige[50], borderRadius: Radius.sm,
    padding: 14, borderWidth: 1, borderColor: Colors.beige[100],
    borderLeftWidth: 3, borderLeftColor: Colors.beige[400],
  },
  patternGreen: {
    backgroundColor: Colors.green[50], borderColor: Colors.green[100],
    borderLeftColor: Colors.green[400],
  },
  patternBlush: {
    backgroundColor: Colors.blush[50], borderColor: Colors.blush[100],
    borderLeftColor: Colors.blush[400],
  },
  patternHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 },
  patternTitle:  { fontFamily: Fonts.sansBold, fontSize: 13, color: Colors.beige[800], flex: 1 },
  patternBody:   { fontFamily: Fonts.sans, fontSize: 12, color: Colors.beige[600], lineHeight: 18 },
  confidenceBadge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  confidenceTxt:   { fontFamily: Fonts.sansBold, fontSize: 8, letterSpacing: 0.8 },

  emptyPatterns: {
    marginHorizontal: Spacing.xl, padding: 20, alignItems: 'center',
    backgroundColor: Colors.beige[50], borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.beige[100],
  },
  emptyTxt: { fontFamily: Fonts.sans, fontSize: 13, color: Colors.beige[400], textAlign: 'center', lineHeight: 20 },

  // Source & disclaimer
  sourceCard: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    marginHorizontal: Spacing.xl, marginTop: 8, marginBottom: 4,
    padding: 12, backgroundColor: Colors.beige[50],
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.beige[100],
  },
  sourceTxt: { fontFamily: Fonts.sans, fontSize: 10, color: Colors.beige[500], lineHeight: 16, flex: 1 },

  disclaimer: {
    marginHorizontal: Spacing.xl, marginTop: 8,
    padding: 14, backgroundColor: Colors.beige[50],
    borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.beige[200],
  },
  disclaimerHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  disclaimerTitle:  { fontFamily: Fonts.sansBold, fontSize: 11, color: Colors.beige[600], letterSpacing: 0.3 },
  disclaimerTxt:    { fontFamily: Fonts.sans, fontSize: 11, color: Colors.beige[500], lineHeight: 17 },
});
