import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import SectionCard from '@/components/SectionCard';
import { BOND_MAX_LEVEL, BOND_SOURCES, BOND_XP_TO_NEXT } from '@/constants/bondXp';
import { colors, radius, spacing } from '@/constants/theme';

function clampLevel(value: number): number {
    if (Number.isNaN(value)) return 1;
    return Math.min(BOND_MAX_LEVEL, Math.max(1, Math.floor(value)));
}

function xpBetween(from: number, to: number): number {
    let total = 0;
    for (let lvl = from; lvl < to; lvl++) total += BOND_XP_TO_NEXT[lvl - 1];
    return total;
}

export default function BondCalculatorScreen() {
    const [from, setFrom] = useState(1);
    const [to, setTo] = useState(20);

    const total = useMemo(() => (to > from ? xpBetween(from, to) : 0), [from, to]);

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
                <SectionCard title="Relationship Rank">
                    <View style={styles.levelRow}>
                        <LevelInput label="Current" value={from} onChange={(v) => setFrom(clampLevel(v))} />
                        <Ionicons name="arrow-forward" size={22} color={colors.textMuted} style={{ marginTop: 18 }} />
                        <LevelInput label="Target" value={to} onChange={(v) => setTo(clampLevel(v))} />
                    </View>
                    {to <= from ? (
                        <Text style={styles.warning}>Target rank must be higher than the current rank.</Text>
                    ) : (
                        <View style={styles.totalBox}>
                            <Text style={styles.totalLabel}>EXP needed</Text>
                            <Text style={styles.totalValue}>{total.toLocaleString()}</Text>
                        </View>
                    )}
                </SectionCard>

                {to > from && (
                    <SectionCard title="That's equivalent to…">
                        {BOND_SOURCES.map((source, i) => (
                            <View
                                key={source.label}
                                style={[styles.sourceRow, i < BOND_SOURCES.length - 1 && styles.sourceRowBorder]}
                            >
                                <Text style={styles.sourceLabel}>{source.label}</Text>
                                <Text style={styles.sourceXp}>{source.xp} XP</Text>
                                <Text style={styles.sourceCount}>× {Math.ceil(total / source.xp).toLocaleString()}</Text>
                            </View>
                        ))}
                        <Text style={styles.note}>
                            Ranks above 20 need the student&apos;s memorial lobby (L2D) and bond gear to unlock. EXP values
                            from the Blue Archive wiki affection table.
                        </Text>
                    </SectionCard>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

function LevelInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <View style={styles.levelInput}>
            <Text style={styles.levelLabel}>{label}</Text>
            <View style={styles.stepperRow}>
                <Pressable onPress={() => onChange(value - 1)} style={styles.stepButton} hitSlop={4}>
                    <Ionicons name="remove" size={18} color={colors.primary} />
                </Pressable>
                <TextInput
                    style={styles.levelField}
                    keyboardType="number-pad"
                    value={String(value)}
                    onChangeText={(t) => onChange(parseInt(t, 10))}
                    selectTextOnFocus
                />
                <Pressable onPress={() => onChange(value + 1)} style={styles.stepButton} hitSlop={4}>
                    <Ionicons name="add" size={18} color={colors.primary} />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    levelRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    levelInput: {
        flex: 1,
        alignItems: 'center',
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textSecondary,
        marginBottom: 6,
    },
    stepperRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    stepButton: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelField: {
        width: 72, // fixed: on web, number inputs otherwise take a huge intrinsic width

        textAlign: 'center',
        fontSize: 22,
        fontWeight: '800',
        color: colors.text,
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 6,
        paddingHorizontal: 10,
    },
    warning: {
        marginTop: spacing.md,
        color: colors.danger,
        fontSize: 13,
        textAlign: 'center',
    },
    totalBox: {
        marginTop: spacing.lg,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primaryDark,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    totalValue: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.primaryDark,
        fontVariant: ['tabular-nums'],
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    sourceRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sourceLabel: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    sourceXp: {
        fontSize: 12,
        color: colors.textMuted,
        marginRight: spacing.lg,
    },
    sourceCount: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.primary,
        fontVariant: ['tabular-nums'],
        minWidth: 64,
        textAlign: 'right',
    },
    note: {
        marginTop: spacing.md,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 17,
    },
});
