import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SectionCard from '@/components/SectionCard';
import ScreenContainer from '@/components/ScreenContainer';
import TypePill from '@/components/TypePill';
import { colors, radius, schoolLabels, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { schoolIcons, studentIcons, studentPortraits } from '@/types/imageMap';
import {
  allStudents,
  collapseAlts,
  getBADayNumber,
  getDailyStudent,
  getNextResetDate,
  getUpcomingBirthdays,
} from '@/utils/studentUtils';

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { favorites, settings } = useUserData();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Recompute only when the BA day flips, not on every tick.
  const baDay = getBADayNumber(now);
  const dailyStudent = useMemo(() => {
    const pool = settings.dailyIncludeAlts ? allStudents : collapseAlts(allStudents);
    return getDailyStudent(pool, now);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baDay, settings.dailyIncludeAlts]);

  const birthdays = useMemo(() => getUpcomingBirthdays(now, 8), [baDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const msToReset = getNextResetDate(now).getTime() - now.getTime();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
        <LinearGradient
          colors={[colors.heroBg, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <Text style={styles.heroTitle}>BAhelper</Text>
          <Text style={styles.heroSubtitle}>
            {now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
          <View style={styles.resetChip}>
            <Ionicons name="time-outline" size={14} color={colors.accent} />
            <Text style={styles.resetText}>Daily reset in {formatCountdown(msToReset)}</Text>
          </View>
        </LinearGradient>

        <Text style={styles.sectionHeading}>Student of the Day</Text>
        {dailyStudent && (
          <Pressable
            onPress={() => router.push(`/student/${dailyStudent.id}`)}
            style={({ pressed }) => [styles.sotdCard, pressed && { opacity: 0.85 }]}
          >
            <Image
              source={studentPortraits[dailyStudent.id]}
              style={styles.sotdPortrait}
              contentFit="cover"
              contentPosition="top center"
            />
            <View style={styles.sotdInfo}>
              <View style={styles.schoolRow}>
                {schoolIcons[dailyStudent.school] && (
                  <Image source={schoolIcons[dailyStudent.school]} style={styles.schoolIconDark} contentFit="contain" />
                )}
                <Text style={styles.sotdSchool}>{schoolLabels[dailyStudent.school] ?? dailyStudent.school}</Text>
              </View>
              <Text style={styles.sotdName}>{dailyStudent.name}</Text>
              <Text style={styles.sotdFullName}>{dailyStudent.fullName}</Text>
              <View style={styles.pillRow}>
                <TypePill kind="damage" value={dailyStudent.damageType} small />
                <TypePill kind="armor" value={dailyStudent.armorType} small />
              </View>
              <View style={styles.drawHint}>
                <Ionicons name="brush-outline" size={14} color={colors.primary} />
                <Text style={styles.drawHintText}>Today&apos;s drawing prompt — tap for full profile</Text>
              </View>
            </View>
          </Pressable>
        )}

        <Text style={styles.sectionHeading}>Upcoming Birthdays</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        >
          {birthdays.map((b) => {
            const rep = b.students[0];
            const isFav = b.students.some((s) => favorites.has(s.id));
            return (
              <Pressable
                key={rep.id}
                onPress={() => router.push(`/student/${rep.id}`)}
                style={[styles.bdayCard, isFav && styles.bdayCardFav]}
              >
                {isFav && (
                  <View style={styles.bdayFavBadge}>
                    <Ionicons name="heart" size={11} color="#fff" />
                  </View>
                )}
                <Image source={studentIcons[rep.id]} style={styles.bdayIcon} contentFit="cover" />
                <Text style={styles.bdayName} numberOfLines={1}>
                  {rep.name.split(' (')[0]}
                </Text>
                <Text style={styles.bdayDate}>{rep.birthday}</Text>
                <Text style={[styles.bdayIn, b.daysUntil === 0 && styles.bdayToday]}>
                  {b.daysUntil === 0 ? 'Today! 🎉' : `in ${b.daysUntil}d`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <SectionCard>
          <QuickLink icon="people-outline" label="Browse all students" onPress={() => router.push('/students')} />
          <QuickLink icon="dice-outline" label="Generate a SCHALE roster" onPress={() => router.push('/tools/roster')} />
          <QuickLink icon="calculator-outline" label="Bond XP calculator" onPress={() => router.push('/tools/bond')} last />
        </SectionCard>
      </ScrollView>
    </ScreenContainer>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  last?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quickLink, !last && styles.quickLinkBorder, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={styles.quickLinkLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    marginBottom: spacing.md,
  },
  heroTitle: {
    color: colors.heroText,
    fontSize: 28,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#B8CCE4',
    fontSize: 14,
    marginTop: 2,
  },
  resetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  resetText: {
    color: colors.heroText,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sotdCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: spacing.lg,
    overflow: 'hidden',
  },
  sotdPortrait: {
    width: 130,
    height: 190,
  },
  sotdInfo: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  schoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  schoolIconDark: {
    width: 18,
    height: 18,
    tintColor: colors.textSecondary,
  },
  sotdSchool: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sotdName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  sotdFullName: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: spacing.sm,
  },
  drawHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  drawHintText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 1,
  },
  bdayCard: {
    width: 108,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    padding: spacing.md,
    marginRight: spacing.sm,
  },
  bdayCardFav: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },
  bdayFavBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.danger,
    borderRadius: radius.pill,
    padding: 3,
    zIndex: 1,
  },
  bdayIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    marginBottom: 6,
  },
  bdayName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  bdayDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  bdayIn: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 3,
  },
  bdayToday: {
    color: colors.danger,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  quickLinkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickLinkLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
});
