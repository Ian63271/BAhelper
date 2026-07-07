import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import FilterChip from '@/components/FilterChip';
import LevelControl from '@/components/LevelControl';
import SectionCard from '@/components/SectionCard';
import StatBadge from '@/components/StatBadge';
import { EQUIPMENT_MAX_TIER } from '@/constants/equipmentStats';
import { colors, spacing } from '@/constants/theme';
import { Students } from '@/types/students';
import { studentById } from '@/utils/studentUtils';
import {
    addBuff,
    addEquipmentBuffs,
    BOND_MAX_LEVEL,
    BOND_STAR_CAP,
    calcBondStats,
    calcPotentialStat,
    calcStat,
    calcWeaponStat,
    combineStat,
    POTENTIAL_MAX,
    StatBuffs,
    STUDENT_MAX_LEVEL,
    WEAPON_MAX_STARS,
    weaponMaxLevel,
} from '@/utils/statCalc';

type Props = {
    student: Students;
    // UE grade is owned by the profile screen so the Combat card's terrain
    // row can react to it (UE 3★+ boosts the weapon's adaptation terrain).
    ueStars: number;
    onUeStarsChange: (grade: number) => void;
};

const MAX_STARS = 5;

// Short labels for the stats a bond rank can raise (FavorStatType names).
const bondStatAbbr: Record<string, string> = {
    MaxHP: 'HP',
    AttackPower: 'ATK',
    DefensePower: 'DEF',
    HealPower: 'HEAL',
};

// SchaleDB-style stat breakdown: HP/ATK/DEF/Healing recompute from the chosen
// level, star grade and unique-weapon (UE) grade; the rest are fixed points
// from the data. Blue stars mirror the in-game UE display: picking one implies
// a 5★ character and adds the weapon's flat ATK/HP/Healing bonuses. The
// collapsible advanced area adds gear tiers, bond rank and talent (potential)
// levels; everything funnels through the SchaleDB buff pipeline (combineStat)
// so percent gear multiplies after the weapon/bond/talent flats.
export default function StatsSection({ student, ueStars, onUeStarsChange }: Props) {
    const [level, setLevel] = useState(STUDENT_MAX_LEVEL);
    const [stars, setStars] = useState(() =>
        Math.min(MAX_STARS, Math.max(1, student.baseStars ?? 1)),
    );
    const [weaponLevel, setWeaponLevel] = useState(1);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [equipTiers, setEquipTiers] = useState<number[]>([0, 0, 0]);
    // Bond ranks keyed by student id: the student's own plus one per alt
    // (alts share their bond bonuses across the family).
    const [bondLevels, setBondLevels] = useState<Record<number, number>>({});
    const [potential, setPotential] = useState({ hp: 0, atk: 0, heal: 0 });
    const [useBondGear, setUseBondGear] = useState(false);

    const stats = student.stats;
    if (!stats) return null;

    const minStars = Math.min(MAX_STARS, Math.max(1, student.baseStars ?? 1));
    const hasWeapon = student.weapon?.attack100 !== undefined;
    const effectiveStars = ueStars > 0 ? MAX_STARS : stars;

    const weapon = student.weapon;
    const bondGearStats =
        student.bondGear?.statType?.length && student.bondGear.statValue
            ? { statType: student.bondGear.statType, statValue: student.bondGear.statValue }
            : undefined;

    const selectCharStars = (grade: number) => {
        setStars(grade);
        onUeStarsChange(0);
    };
    const selectUeStars = (grade: number) => {
        setStars(MAX_STARS);
        onUeStarsChange(grade);
        setWeaponLevel(weaponMaxLevel(grade));
    };
    const setEquipTier = (slot: number, tier: number) =>
        setEquipTiers(tiers => tiers.map((t, i) => (i === slot ? tier : t)));
    const bondLevel = (id: number) => bondLevels[id] ?? 1;
    const setBondLevel = (id: number, value: number) =>
        setBondLevels(levels => ({ ...levels, [id]: value }));

    // Alt versions whose bond also buffs this student (SchaleDB FavorAlts);
    // each alt applies its own favor stat table at its own bond rank.
    const bondAlts = (student.hasAlts ?? [])
        .map(id => studentById.get(id))
        .filter(
            (alt): alt is Students =>
                !!alt?.playable && !!alt.favorStatType && !!alt.favorStatValue,
        );

    // Accumulate every flat/percent buff the way SchaleDB's CharacterStats
    // does, then combine per displayed stat.
    const buffs: StatBuffs = {};
    if (ueStars > 0 && weapon) {
        addBuff(buffs, 'AttackPower_Base', calcWeaponStat(weapon.attack1, weapon.attack100, weaponLevel, weapon.growthType));
        addBuff(buffs, 'MaxHP_Base', calcWeaponStat(weapon.maxHP1, weapon.maxHP100, weaponLevel, weapon.growthType));
        addBuff(buffs, 'HealPower_Base', calcWeaponStat(weapon.heal1, weapon.heal100, weaponLevel, weapon.growthType));
    }
    (student.equipment ?? []).forEach((category, i) =>
        addEquipmentBuffs(buffs, category, equipTiers[i] ?? 0),
    );
    if (student.favorStatType && student.favorStatValue) {
        // Own bond is capped by star grade (SchaleDB maxbond); alt bonds aren't.
        const cappedLevel = Math.min(BOND_STAR_CAP[effectiveStars - 1], bondLevel(student.id));
        const bond = calcBondStats(student.favorStatValue, cappedLevel);
        addBuff(buffs, student.favorStatType[0], bond[0]);
        addBuff(buffs, student.favorStatType[1], bond[1]);
    }
    for (const alt of bondAlts) {
        const bond = calcBondStats(alt.favorStatValue!, bondLevel(alt.id));
        addBuff(buffs, alt.favorStatType![0], bond[0]);
        addBuff(buffs, alt.favorStatType![1], bond[1]);
    }
    addBuff(buffs, 'MaxHP_Base', calcPotentialStat(stats.maxHP1, stats.maxHP100, level, potential.hp));
    addBuff(buffs, 'AttackPower_Base', calcPotentialStat(stats.attack1, stats.attack100, level, potential.atk));
    addBuff(buffs, 'HealPower_Base', calcPotentialStat(stats.heal1, stats.heal100, level, potential.heal));
    if (useBondGear && bondGearStats) {
        bondGearStats.statType.forEach((statType, i) =>
            addBuff(buffs, statType, bondGearStats.statValue[i][1]),
        );
    }

    const bondLabel = student.favorStatType
        ? `Bond (${student.favorStatType
              .map(statType => bondStatAbbr[statType] ?? statType)
              .join('/')})`
        : 'Bond';

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
            <Pressable
                testID="stat-advanced-toggle"
                style={styles.advancedToggle}
                onPress={() => setShowAdvanced(!showAdvanced)}>
                <Text style={styles.advancedLabel}>Gear · Bond · Talent</Text>
                <Text style={styles.advancedChevron}>{showAdvanced ? '▾' : '▸'}</Text>
            </Pressable>
            {showAdvanced && (
                <View style={styles.advanced}>
                    {(student.equipment ?? []).map((category, i) => (
                        <LevelControl
                            key={`${category}-${i}`}
                            label={category}
                            value={equipTiers[i] ?? 0}
                            min={0}
                            max={EQUIPMENT_MAX_TIER}
                            valuePrefix="T"
                            onChange={tier => setEquipTier(i, tier)}
                            testID={`equip-${i + 1}`}
                        />
                    ))}
                    {student.favorStatType && student.favorStatValue && (
                        <LevelControl
                            label={bondLabel}
                            value={bondLevel(student.id)}
                            max={BOND_MAX_LEVEL}
                            onChange={value => setBondLevel(student.id, value)}
                            testID="bond-level"
                        />
                    )}
                    {bondAlts.map(alt => (
                        <LevelControl
                            key={alt.id}
                            label={`${alt.name} (${alt.favorStatType!
                                .map(statType => bondStatAbbr[statType] ?? statType)
                                .join('/')})`}
                            value={bondLevel(alt.id)}
                            max={BOND_MAX_LEVEL}
                            onChange={value => setBondLevel(alt.id, value)}
                            testID={`bond-alt-${alt.id}`}
                        />
                    ))}
                    <LevelControl
                        label="Talent HP"
                        value={potential.hp}
                        min={0}
                        max={POTENTIAL_MAX}
                        valuePrefix=""
                        onChange={hp => setPotential(p => ({ ...p, hp }))}
                        testID="potential-hp"
                    />
                    <LevelControl
                        label="Talent ATK"
                        value={potential.atk}
                        min={0}
                        max={POTENTIAL_MAX}
                        valuePrefix=""
                        onChange={atk => setPotential(p => ({ ...p, atk }))}
                        testID="potential-atk"
                    />
                    <LevelControl
                        label="Talent Heal"
                        value={potential.heal}
                        min={0}
                        max={POTENTIAL_MAX}
                        valuePrefix=""
                        onChange={heal => setPotential(p => ({ ...p, heal }))}
                        testID="potential-heal"
                    />
                    {bondGearStats && (
                        <View style={styles.bondGearRow}>
                            <Text style={styles.starLabel}>Bond Gear</Text>
                            <FilterChip
                                label="T2"
                                selected={useBondGear}
                                onPress={() => setUseBondGear(!useBondGear)}
                                testID="bond-gear-toggle"
                            />
                        </View>
                    )}
                </View>
            )}
            <View style={styles.badgeGrid}>
                <StatBadge
                    label="Max HP"
                    value={combineStat(
                        calcStat(stats.maxHP1, stats.maxHP100, level, effectiveStars, 'hp'),
                        buffs,
                        'MaxHP',
                    )}
                />
                <StatBadge
                    label="Attack"
                    value={combineStat(
                        calcStat(stats.attack1, stats.attack100, level, effectiveStars, 'attack'),
                        buffs,
                        'AttackPower',
                    )}
                />
                <StatBadge
                    label="Defense"
                    value={combineStat(
                        calcStat(stats.defense1, stats.defense100, level, effectiveStars, 'defense'),
                        buffs,
                        'DefensePower',
                    )}
                />
                <StatBadge
                    label="Healing"
                    value={combineStat(
                        calcStat(stats.heal1, stats.heal100, level, effectiveStars, 'heal'),
                        buffs,
                        'HealPower',
                    )}
                />
                <StatBadge label="Accuracy" value={combineStat(stats.accuracy, buffs, 'AccuracyPoint')} />
                <StatBadge label="Evasion" value={combineStat(stats.dodge, buffs, 'DodgePoint')} />
                <StatBadge label="Critical" value={combineStat(stats.crit, buffs, 'CriticalPoint')} />
                <StatBadge
                    label="Crit DMG"
                    value={`${combineStat(stats.critDamage, buffs, 'CriticalDamageRate') / 100}%`}
                />
                <StatBadge
                    label="Stability"
                    value={combineStat(stats.stability, buffs, 'StabilityPoint')}
                />
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
    advancedToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingVertical: spacing.xs,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    advancedLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
    },
    advancedChevron: {
        fontSize: 14,
        color: colors.textMuted,
    },
    advanced: {
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    bondGearRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badgeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.md,
    },
});
