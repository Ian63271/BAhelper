import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import LevelControl from '@/components/LevelControl';
import SectionCard from '@/components/SectionCard';
import StatBadge from '@/components/StatBadge';
import { colors, spacing } from '@/constants/theme';
import { Students } from '@/types/students';
import {
    calcStat,
    calcWeaponStat,
    STUDENT_MAX_LEVEL,
    WEAPON_MAX_STARS,
    weaponMaxLevel,
} from '@/utils/statCalc';

type Props = {
    student: Students;
};

const MAX_STARS = 5;

// SchaleDB-style stat breakdown: HP/ATK/DEF/Healing recompute from the chosen
// level, star grade and unique-weapon (UE) grade; the rest are fixed points
// from the data. Blue stars mirror the in-game UE display: picking one implies
// a 5★ character and adds the weapon's flat ATK/HP/Healing bonuses.
export default function StatsSection({ student }: Props) {
    const [level, setLevel] = useState(STUDENT_MAX_LEVEL);
    const [stars, setStars] = useState(() =>
        Math.min(MAX_STARS, Math.max(1, student.baseStars ?? 1)),
    );
    const [ueStars, setUeStars] = useState(0);
    const [weaponLevel, setWeaponLevel] = useState(1);

    const stats = student.stats;
    if (!stats) return null;

    const minStars = Math.min(MAX_STARS, Math.max(1, student.baseStars ?? 1));
    const hasWeapon = student.weapon?.attack100 !== undefined;
    const effectiveStars = ueStars > 0 ? MAX_STARS : stars;

    const weapon = student.weapon;
    const weaponBonus = (stat1?: number, stat100?: number) =>
        ueStars > 0 ? calcWeaponStat(stat1, stat100, weaponLevel, weapon?.growthType) : 0;

    const selectCharStars = (grade: number) => {
        setStars(grade);
        setUeStars(0);
    };
    const selectUeStars = (grade: number) => {
        setStars(MAX_STARS);
        setUeStars(grade);
        setWeaponLevel(weaponMaxLevel(grade));
    };

    return (
        <SectionCard title="Stats">
            <LevelControl
                label="Level"
                value={level}
                max={STUDENT_MAX_LEVEL}
                onChange={setLevel}
                testID="stat-level"
            />
            <View style={styles.starRow}>
                <Text style={styles.starLabel}>Stars</Text>
                <View style={styles.stars}>
                    {Array.from({ length: MAX_STARS }, (_, i) => {
                        const grade = i + 1;
                        const reachable = grade >= minStars;
                        return (
                            <Pressable
                                key={grade}
                                testID={`stat-star-${grade}`}
                                disabled={!reachable}
                                onPress={() => selectCharStars(grade)}
                                hitSlop={4}>
                                <Text
                                    style={[
                                        styles.star,
                                        grade <= effectiveStars ? styles.starOn : styles.starOff,
                                        !reachable && styles.starLocked,
                                    ]}>
                                    ★
                                </Text>
                            </Pressable>
                        );
                    })}
                    {hasWeapon && (
                        <View style={styles.ueGroup}>
                            {Array.from({ length: WEAPON_MAX_STARS }, (_, i) => {
                                const grade = i + 1;
                                return (
                                    <Pressable
                                        key={grade}
                                        testID={`stat-ue-star-${grade}`}
                                        onPress={() => selectUeStars(grade)}
                                        hitSlop={4}>
                                        <Text
                                            style={[
                                                styles.star,
                                                grade <= ueStars ? styles.ueOn : styles.starOff,
                                            ]}>
                                            ★
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    )}
                </View>
            </View>
            {ueStars > 0 && (
                <View style={styles.weaponRow}>
                    <LevelControl
                        label="Weapon Lv."
                        value={weaponLevel}
                        max={weaponMaxLevel(ueStars)}
                        onChange={setWeaponLevel}
                        testID="weapon-level"
                    />
                </View>
            )}
            <View style={styles.badgeGrid}>
                <StatBadge
                    label="Max HP"
                    value={
                        calcStat(stats.maxHP1, stats.maxHP100, level, effectiveStars, 'hp') +
                        weaponBonus(weapon?.maxHP1, weapon?.maxHP100)
                    }
                />
                <StatBadge
                    label="Attack"
                    value={
                        calcStat(stats.attack1, stats.attack100, level, effectiveStars, 'attack') +
                        weaponBonus(weapon?.attack1, weapon?.attack100)
                    }
                />
                <StatBadge
                    label="Defense"
                    value={calcStat(stats.defense1, stats.defense100, level, effectiveStars, 'defense')}
                />
                <StatBadge
                    label="Healing"
                    value={
                        calcStat(stats.heal1, stats.heal100, level, effectiveStars, 'heal') +
                        weaponBonus(weapon?.heal1, weapon?.heal100)
                    }
                />
                <StatBadge label="Accuracy" value={stats.accuracy} />
                <StatBadge label="Evasion" value={stats.dodge} />
                <StatBadge label="Critical" value={stats.crit} />
                <StatBadge label="Crit DMG" value={`${stats.critDamage / 100}%`} />
                <StatBadge label="Stability" value={stats.stability} />
                <StatBadge label="Range" value={stats.range} />
                <StatBadge
                    label="Ammo"
                    value={stats.ammoCount ? `${stats.ammoCount} (${stats.ammoCost})` : undefined}
                />
                <StatBadge label="Cost Recovery" value={stats.regenCost} />
            </View>
        </SectionCard>
    );
}

const styles = StyleSheet.create({
    starRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.sm,
    },
    starLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
    },
    stars: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    ueGroup: {
        flexDirection: 'row',
        gap: spacing.xs,
        marginLeft: spacing.sm,
        paddingLeft: spacing.sm,
        borderLeftWidth: 1,
        borderLeftColor: colors.border,
    },
    star: {
        fontSize: 24,
        lineHeight: 28,
    },
    starOn: {
        color: colors.accent,
    },
    ueOn: {
        color: colors.primary,
    },
    starOff: {
        color: colors.border,
    },
    starLocked: {
        opacity: 0.4,
    },
    weaponRow: {
        marginTop: spacing.sm,
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
});
