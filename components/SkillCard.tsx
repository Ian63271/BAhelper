import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { ReactNode, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import LevelControl from '@/components/LevelControl';
import { buffTagColors, colors, radius, spacing } from '@/constants/theme';
import { skillIcons } from '@/types/imageMap';
import { Skill } from '@/types/students';
import { parseSkillDesc } from '@/utils/skillText';

type Props = {
    skill: Skill;
    typeLabel: string;
    maxLevel: number;
    tintColor: string;
    cost?: number[]; // EX only: cost per skill level
    headerRight?: ReactNode; // hosts the +variant toggle
    testID?: string;
};

export default function SkillCard({
    skill,
    typeLabel,
    maxLevel,
    tintColor,
    cost,
    headerRight,
    testID,
}: Props) {
    const [level, setLevel] = useState(1);
    const iconSource = skillIcons[skill.icon];
    const segments = parseSkillDesc(skill.desc, skill.parameters, level);

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View style={[styles.iconCircle, { backgroundColor: tintColor }]}>
                    {iconSource ? (
                        <Image source={iconSource} style={styles.icon} contentFit="contain" />
                    ) : (
                        <Ionicons name="flash-outline" size={22} color="#fff" />
                    )}
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.typeLabel}>{typeLabel}</Text>
                    <View style={styles.nameRow}>
                        <Text style={styles.name}>{skill.name}</Text>
                        {cost ? (
                            <View style={styles.costPill}>
                                <Text style={styles.costText}>
                                    COST {cost[Math.min(level, cost.length) - 1]}
                                </Text>
                            </View>
                        ) : null}
                    </View>
                </View>
                {headerRight}
            </View>
            <LevelControl
                label="Skill Lv."
                value={level}
                max={maxLevel}
                onChange={setLevel}
                testID={testID ? `${testID}-level` : undefined}
            />
            <Text style={styles.desc}>
                {segments.map((segment, i) =>
                    segment.kind === 'plain' ? (
                        segment.text
                    ) : (
                        <Text
                            key={i}
                            style={[
                                styles.emphasis,
                                {
                                    color:
                                        segment.kind === 'value'
                                            ? colors.primary
                                            : buffTagColors[segment.kind],
                                },
                            ]}>
                            {segment.text}
                        </Text>
                    ),
                )}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        gap: spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconCircle: {
        width: 48,
        height: 48,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 34,
        height: 34,
    },
    headerText: {
        flex: 1,
    },
    typeLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
        marginBottom: 2,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        flexWrap: 'wrap',
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        flexShrink: 1,
    },
    costPill: {
        backgroundColor: colors.primarySoft,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
    },
    costText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.primaryDark,
    },
    desc: {
        fontSize: 14,
        lineHeight: 21,
        color: colors.textSecondary,
    },
    emphasis: {
        fontWeight: '700',
    },
});
