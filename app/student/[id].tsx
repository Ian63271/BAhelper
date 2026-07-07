import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import { clubLabels } from '@/constants/clubLabels';
import SectionCard from '@/components/SectionCard';
import SkillsSection from '@/components/SkillsSection';
import StatBadge from '@/components/StatBadge';
import StatsSection from '@/components/StatsSection';
import TypePill from '@/components/TypePill';
import {
    adaptationGrades,
    colors,
    radius,
    roleLabels,
    schoolLabels,
    spacing,
} from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { schoolIcons, studentIcons, studentPortraits } from '@/types/imageMap';
import { getAltFamily, studentById } from '@/utils/studentUtils';

const ADAPTATION_META: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Urban', icon: 'business-outline' },
    { label: 'Outdoor', icon: 'partly-sunny-outline' },
    { label: 'Indoor', icon: 'home-outline' },
];

// limited[] holds a per-region status; only 1-3 are meaningful to show.
const LIMITED_LABELS: Record<number, string> = {
    1: 'Limited',
    2: 'Event Reward',
    3: 'Fes Limited',
};

export default function StudentDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { owned, favorites, toggleOwned, toggleFavorite } = useUserData();

    const student = studentById.get(Number(id));

    if (!student) {
        return (
            <ScreenContainer style={styles.missing}>
                <Stack.Screen options={{ title: 'Not found' }} />
                <Text style={styles.missingText}>Student not found.</Text>
            </ScreenContainer>
        );
    }

    const isOwned = owned.has(student.id);
    const isFavorite = favorites.has(student.id);
    const altFamily = getAltFamily(student);
    const limitedLabel = student.limited?.length ? LIMITED_LABELS[student.limited[0]] : undefined;

    return (
        <ScreenContainer>
            <Stack.Screen
                options={{
                    title: student.name,
                    headerRight: () => (
                        <View style={styles.headerActions}>
                            <Pressable testID="favorite-toggle" onPress={() => toggleFavorite(student.id)} hitSlop={8}>
                                <Ionicons
                                    name={isFavorite ? 'heart' : 'heart-outline'}
                                    size={24}
                                    color={isFavorite ? colors.danger : colors.textSecondary}
                                />
                            </Pressable>
                            <Pressable testID="owned-toggle" onPress={() => toggleOwned(student.id)} hitSlop={8}>
                                <Ionicons
                                    name={isOwned ? 'checkmark-circle' : 'checkmark-circle-outline'}
                                    size={24}
                                    color={isOwned ? colors.success : colors.textSecondary}
                                />
                            </Pressable>
                        </View>
                    ),
                }}
            />
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
                <LinearGradient colors={[colors.heroBg, colors.primaryDark]} style={styles.heroWrap}>
                    {schoolIcons[student.school] && (
                        <Image source={schoolIcons[student.school]} style={styles.schoolWatermark} contentFit="contain" />
                    )}
                    <Image
                        source={studentPortraits[student.id]}
                        style={styles.portrait}
                        contentFit="contain"
                        contentPosition="bottom center"
                    />
                </LinearGradient>

                <View style={styles.nameBlock}>
                    <Text style={styles.name}>{student.name}</Text>
                    <Text style={styles.fullName}>{student.fullName}</Text>
                    <View style={styles.badgeRow}>
                        {student.baseStars ? (
                            <View style={styles.starBadge}>
                                <Text style={styles.starText}>{'★'.repeat(student.baseStars)}</Text>
                            </View>
                        ) : null}
                        <TypePill kind="damage" value={student.damageType} />
                        <TypePill kind="armor" value={student.armorType} />
                        {limitedLabel && (
                            <View style={styles.limitedBadge}>
                                <Text style={styles.limitedText}>{limitedLabel}</Text>
                            </View>
                        )}
                    </View>
                </View>

                <SectionCard title="School Life">
                    <View style={styles.badgeGrid}>
                        <StatBadge label="School" value={schoolLabels[student.school] ?? student.school} />
                        <StatBadge label="Club" value={student.club ? clubLabels[student.club] ?? student.club : undefined} />
                        <StatBadge label="Year" value={student.year} />
                        <StatBadge label="Age" value={student.age} />
                        <StatBadge label="Birthday" value={student.birthday} />
                        <StatBadge label="Height" value={student.height} />
                        <StatBadge label="Hobbies" value={student.hobbies} />
                    </View>
                </SectionCard>

                {(student.role || student.position || student.weaponType || student.mood) && (
                    <SectionCard title="Combat">
                        <View style={styles.badgeGrid}>
                            <StatBadge label="Role" value={student.role ? roleLabels[student.role] ?? student.role : undefined} />
                            <StatBadge label="Class" value={student.combatClass === 'Main' ? 'Striker' : student.combatClass === 'Support' ? 'Special' : student.combatClass} />
                            <StatBadge label="Position" value={student.position} />
                            <StatBadge label="Weapon" value={student.weaponType} />
                        </View>
                        {student.mood && student.mood.length === 3 && (
                            <View style={styles.moodRow}>
                                {ADAPTATION_META.map((meta, i) => (
                                    <View key={meta.label} style={styles.moodItem}>
                                        <Ionicons name={meta.icon} size={18} color={colors.textSecondary} />
                                        <Text style={styles.moodLabel}>{meta.label}</Text>
                                        <Text style={styles.moodGrade}>{adaptationGrades[student.mood![i]] ?? '?'}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </SectionCard>
                )}

                <StatsSection student={student} />
                <SkillsSection student={student} />

                {student.profile && (
                    <SectionCard title="Profile">
                        <Text style={styles.profileText}>{student.profile}</Text>
                        {student.newQuote ? <Text style={styles.quote}>“{student.newQuote}”</Text> : null}
                    </SectionCard>
                )}

                {student.weapon?.name && (
                    <SectionCard title={`Unique Weapon · ${student.weaponType ?? ''}`}>
                        <Text style={styles.itemName}>{student.weapon.name}</Text>
                        {student.weapon.desc ? <Text style={styles.itemDesc}>{student.weapon.desc}</Text> : null}
                    </SectionCard>
                )}

                {student.bondGear?.name && (
                    <SectionCard title="Bond Gear">
                        <Text style={styles.itemName}>{student.bondGear.name}</Text>
                        {student.bondGear.desc ? <Text style={styles.itemDesc}>{student.bondGear.desc}</Text> : null}
                    </SectionCard>
                )}

                {altFamily.length > 1 && (
                    <SectionCard title="Other Versions">
                        <View style={styles.altRow}>
                            {altFamily.map((alt) => (
                                <Pressable
                                    key={alt.id}
                                    disabled={alt.id === student.id}
                                    onPress={() => router.replace(`/student/${alt.id}`)}
                                    style={[styles.altItem, alt.id === student.id && styles.altItemCurrent]}
                                >
                                    <Image source={studentIcons[alt.id]} style={styles.altIcon} contentFit="cover" />
                                    <Text style={styles.altName} numberOfLines={2}>
                                        {alt.name}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </SectionCard>
                )}

                <SectionCard title="Credits">
                    <View style={styles.badgeGrid}>
                        <StatBadge label="Illustrator" value={student.illustrator} />
                        <StatBadge label="Designer" value={student.designer} />
                        <StatBadge label="Voice" value={student.voice} />
                    </View>
                </SectionCard>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    missing: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    missingText: {
        color: colors.textSecondary,
        fontSize: 16,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.lg,
        alignItems: 'center',
    },
    heroWrap: {
        height: 340,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
    },
    schoolWatermark: {
        position: 'absolute',
        width: 260,
        height: 260,
        opacity: 0.14,
        alignSelf: 'center',
        top: 40,
    },
    portrait: {
        width: '100%',
        height: 330,
    },
    nameBlock: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
    },
    name: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.text,
    },
    fullName: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        alignItems: 'center',
    },
    starBadge: {
        backgroundColor: colors.accent,
        borderRadius: radius.pill,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    starText: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.text,
    },
    limitedBadge: {
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    limitedText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    moodRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    moodItem: {
        alignItems: 'center',
        gap: 2,
    },
    moodLabel: {
        fontSize: 11,
        color: colors.textMuted,
        fontWeight: '600',
    },
    moodGrade: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.primary,
    },
    profileText: {
        fontSize: 14,
        lineHeight: 21,
        color: colors.text,
    },
    quote: {
        marginTop: spacing.md,
        fontSize: 13,
        fontStyle: 'italic',
        color: colors.textSecondary,
    },
    itemName: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    itemDesc: {
        fontSize: 13,
        lineHeight: 19,
        color: colors.textSecondary,
    },
    altRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    altItem: {
        width: 72,
        alignItems: 'center',
    },
    altItemCurrent: {
        opacity: 0.45,
    },
    altIcon: {
        width: 56,
        height: 56,
        borderRadius: radius.md,
        marginBottom: 4,
    },
    altName: {
        fontSize: 11,
        textAlign: 'center',
        color: colors.textSecondary,
        fontWeight: '600',
    },
});
