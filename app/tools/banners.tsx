import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import { colors, radius, spacing } from '@/constants/theme';
import { studentIcons } from '@/types/imageMap';
import {
  BannerGroup,
  bannerCountdownLabel,
  bannerData,
  bannerTypeLabels,
  formatBannerRange,
  getBannerGroups,
  isSpecialBannerType,
} from '@/utils/bannerUtils';

const typeBadgeColors: Record<string, { bg: string; fg: string }> = {
  LimitedGacha: { bg: colors.accent, fg: colors.text },
  FesGacha: { bg: '#9431A5', fg: '#fff' },
  SelectPickupGacha: { bg: colors.primarySoft, fg: colors.primaryDark },
  SelectPickupLimitedGacha: { bg: colors.accent, fg: colors.text },
  SelectPickupFesGacha: { bg: '#9431A5', fg: '#fff' },
};

export default function BannersScreen() {
  const groups = useMemo(() => getBannerGroups(), []);
  const current = groups.filter((g) => g.status === 'current');
  const upcoming = groups.filter((g) => g.status === 'upcoming');
  const predicted = groups.filter((g) => g.status === 'predicted');

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }} testID="banners-page">
        {current.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Running now</Text>
            {current.map((g) => (
              <BannerCard key={g.key} group={g} />
            ))}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Up next — confirmed</Text>
            {upcoming.map((g) => (
              <BannerCard key={g.key} group={g} />
            ))}
          </>
        )}

        {predicted.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Predicted from the JP schedule</Text>
            <Text style={styles.sectionNote}>
              JP banners that haven&apos;t reached Global yet, shifted by the current JP→Global gap (
              {Math.round(bannerData.offsetDays)} days). Estimates only — Global reorders and merges banners.
            </Text>
            {predicted.map((g) => (
              <BannerCard key={g.key} group={g} />
            ))}
          </>
        )}

        <Text style={styles.footer}>
          Banner history from bluearchive.wiki · data as of{' '}
          {new Date(bannerData.generatedAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function BannerCard({ group }: { group: BannerGroup }) {
  const predicted = group.status === 'predicted';
  const badge = typeBadgeColors[group.type];
  return (
    <View style={[styles.card, predicted && styles.cardPredicted]}>
      <View style={styles.headerRow}>
        {isSpecialBannerType(group.type) && badge && (
          <View style={[styles.typeBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.typeBadgeText, { color: badge.fg }]}>
              {bannerTypeLabels[group.type] ?? group.type}
            </Text>
          </View>
        )}
        {group.allRerun && (
          <View style={styles.rerunChip}>
            <Text style={styles.rerunChipText}>Rerun</Text>
          </View>
        )}
        {predicted && (
          <View style={styles.estChip} testID="predicted-tag">
            <Text style={styles.estChipText}>est.</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <Text style={[styles.countdown, predicted && styles.countdownMuted]}>{bannerCountdownLabel(group)}</Text>
      </View>

      <View style={styles.iconRow}>
        {group.students.map((s) => (
          <Pressable
            key={s.name}
            disabled={s.id === null || !studentIcons[s.id]}
            onPress={() => s.id !== null && router.push(`/student/${s.id}`)}
            style={({ pressed }) => [styles.iconWrap, pressed && { opacity: 0.7 }]}
          >
            {s.id !== null && studentIcons[s.id] ? (
              <Image source={studentIcons[s.id]} style={styles.icon} contentFit="cover" />
            ) : (
              <View style={[styles.icon, styles.iconFallback]}>
                <Text style={styles.iconFallbackText}>{s.name.slice(0, 2)}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <Text style={styles.names} numberOfLines={2}>
        {group.students.map((s) => s.name).join(' · ')}
      </Text>
      <Text style={styles.dates}>
        {predicted ? '~' : ''}
        {formatBannerRange(group.start, group.end)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionNote: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPredicted: {
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    backgroundColor: colors.surfaceAlt,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  typeBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  rerunChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rerunChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  estChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.textMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  estChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
  },
  countdown: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  countdownMuted: {
    color: colors.textSecondary,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconWrap: {
    borderRadius: radius.md,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
  },
  iconFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconFallbackText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  names: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  dates: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  footer: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
    marginHorizontal: spacing.lg,
    lineHeight: 17,
  },
});
