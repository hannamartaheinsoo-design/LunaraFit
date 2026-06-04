import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors, Fonts, Spacing, Radius } from '../../constants/theme';
import { useTheme } from '../../lib/useTheme';
import { Button } from '../../components/ui/Button';
import { Icon } from '../../components/ui/Icon';
import { SerifTitle, Eyebrow, BodyText } from '../../components/ui/Typography';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { FitnessLevel } from '../../types';
import { useTranslation } from '../../lib/LangContext';

const LEVEL_KEYS: { key: FitnessLevel; titleKey: any; subKey: any; icon: any }[] = [
  { key: 'beginner',     titleKey: 'fitness.lv1.title', subKey: 'fitness.lv1.sub', icon: 'leaf' },
  { key: 'intermediate', titleKey: 'fitness.lv2.title', subKey: 'fitness.lv2.sub', icon: 'wave' },
  { key: 'advanced',     titleKey: 'fitness.lv3.title', subKey: 'fitness.lv3.sub', icon: 'barbell' },
];

export default function FitnessScreen() {
  const T = useTheme();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<FitnessLevel | null>(null);

  const upsertProfile = useMutation(api.profiles.upsert);

  const handleContinue = async () => {
    if (!selected) return;
    await upsertProfile({ fitness_level: selected });
    router.push('/(onboarding)/plan');
  };

  return (
    <ScrollView style={[styles.scroll, { backgroundColor: T.bg }]} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>{t('ob.back')}</Text>
      </TouchableOpacity>

      <Eyebrow>{t('fitness.eyebrow')}</Eyebrow>
      <SerifTitle>{t('fitness.title')}</SerifTitle>
      <BodyText>{t('fitness.body')}</BodyText>

      <View style={styles.stack}>
        {LEVEL_KEYS.map((level) => (
          <TouchableOpacity key={level.key} activeOpacity={0.8} style={[styles.card, selected === level.key && styles.cardSel]} onPress={() => setSelected(level.key)}>
            <View style={[styles.iconWrap, selected === level.key && styles.iconWrapSel]}>
              <Icon name={level.icon} size={22} color={selected === level.key ? Colors.blush[800] : Colors.beige[600]} strokeWidth={1.4} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{t(level.titleKey)}</Text>
              <Text style={styles.cardSub}>{t(level.subKey)}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Button variant="dark" size="lg" fullWidth onPress={handleContinue} disabled={!selected} style={styles.btn}>
        {t('fitness.cta')}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.cream },
  content: { padding: Spacing.xxl, paddingBottom: 60 },
  back: { marginBottom: 20 },
  backText: { fontFamily: Fonts.sansLight, color: Colors.beige[400], fontSize: 14 },
  stack: { gap: 10, marginBottom: 8 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16,
    borderRadius: Radius.lg, borderWidth: 1.5,
    borderColor: Colors.beige[100], backgroundColor: Colors.cream,
  },
  cardSel: { borderColor: Colors.blush[400], backgroundColor: Colors.blush[50] },
  iconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.beige[50], borderWidth: 1, borderColor: Colors.beige[100],
    alignItems: 'center', justifyContent: 'center',
  },
  iconWrapSel: { backgroundColor: Colors.blush[100], borderColor: Colors.blush[200] },
  cardText: { flex: 1 },
  cardTitle: { fontFamily: Fonts.sansSemiBold, fontSize: 14, color: Colors.beige[800], marginBottom: 2 },
  cardSub: { fontFamily: Fonts.sansLight, fontSize: 12, color: Colors.beige[600] },
  btn: { marginTop: 22 },
});
