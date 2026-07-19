import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import LevelControl from '@/components/LevelControl';
import ScreenContainer from '@/components/ScreenContainer';
import SectionCard from '@/components/SectionCard';
import SegmentedTabs from '@/components/SegmentedTabs';
import {
    ACCOUNT_EXP_MAX_LEVEL,
    ACCOUNT_EXP_TO_NEXT,
    CREDITS_PER_EXP,
    EXP_REPORTS,
    STUDENT_EXP_MAX_LEVEL,
    STUDENT_EXP_TO_NEXT,
} from '@/constants/expTables';
import { colors, radius, spacing } from '@/constants/theme';

const MODES = [
    { key: 'student', label: 'Student' },
    { key: 'account', label: 'Account' },
];

function expBetween(table: number[], from: number, to: number): number {
    let total = 0;
    for (let lvl = from; lvl < to; lvl++) total += table[lvl - 1];
    return total;
}

// Greedy top-down mix: big reports first, one extra of the smallest to cover
// the remainder (the game refunds nothing, so this is the least-waste fill).
function reportMix(totalExp: number): { label: string; count: number }[] {
    let remaining = totalExp;
    const mix: { label: string; count: number }[] = [];
    EXP_REPORTS.forEach((report, i) => {
        const isLast = i === EXP_REPORTS.length - 1;
        const count = isLast
            ? Math.ceil(remaining / report.exp)
            : Math.floor(remaining / report.exp);
        if (count > 0) mix.push({ label: report.label, count });
        remaining -= count * report.exp;
    });
    return mix;
}

export default function ExpCalculatorScreen() {
    const [mode, setMode] = useState('student');
    const [studentFrom, setStudentFrom] = useState(1);
    const [studentTo, setStudentTo] = useState(STUDENT_EXP_MAX_LEVEL);
    const [accountFrom, setAccountFrom] = useState(1);
    const [accountTo, setAccountTo] = useState(ACCOUNT_EXP_MAX_LEVEL);
    const [apPerDay, setApPerDay] = useState('500');

    const studentExp = useMemo(
        () => (studentTo > studentFrom ? expBetween(STUDENT_EXP_TO_NEXT, studentFrom, studentTo) : 0),
        [studentFrom, studentTo]
    );
    const accountExp = useMemo(
        () => (accountTo > accountFrom ? expBetween(ACCOUNT_EXP_TO_NEXT, accountFrom, accountTo) : 0),
        [accountFrom, accountTo]
    );
    const mix = useMemo(() => reportMix(studentExp), [studentExp]);
    const apDaily = Number.parseInt(apPerDay.replace(/[^0-9]/g, ''), 10);

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
                <View style={styles.modeBar}>
                    <SegmentedTabs tabs={MODES} active={mode} onChange={setMode} testIDPrefix="exp-mode" />
                </View>

                {mode === 'student' ? (
                    <>
                        <SectionCard title="Student Level">
                            <View style={styles.controls}>
                                <LevelControl
                                    label="Current"
                                    value={studentFrom}
                                    max={STUDENT_EXP_MAX_LEVEL}
                                    onChange={setStudentFrom}
                                    testID="exp-student-from"
                                />
                                <LevelControl
                                    label="Target"
                                    value={studentTo}
                                    max={STUDENT_EXP_MAX_LEVEL}
                                    onChange={setStudentTo}
                                    testID="exp-student-to"
                                />
                            </View>
                            {studentTo <= studentFrom ? (
                                <Text style={styles.warning}>Target level must be higher than the current level.</Text>
                            ) : (
                                <View style={styles.totalBox}>
                                    <Text style={styles.totalLabel}>EXP needed</Text>
                                    <Text style={styles.totalValue} testID="exp-student-total">
                                        {studentExp.toLocaleString()}
                                    </Text>
                                    <Text style={styles.totalSub}>
                                        {(studentExp * CREDITS_PER_EXP).toLocaleString()} credits to apply
                                    </Text>
                                </View>
                            )}
                        </SectionCard>

                        {studentExp > 0 && (
                            <SectionCard title="Reports needed">
                                {mix.map((row, i) => (
                                    <View key={row.label} style={[styles.row, i < mix.length - 1 && styles.rowBorder]}>
                                        <Text style={styles.rowLabel}>{row.label}</Text>
                                        <Text style={styles.rowCount}>× {row.count.toLocaleString()}</Text>
                                    </View>
                                ))}
                                <Text style={styles.note}>
                                    Least-waste mix using the biggest reports first. Credits are charged at{' '}
                                    {CREDITS_PER_EXP} per EXP when applying reports.
                                </Text>
                            </SectionCard>
                        )}
                    </>
                ) : (
                    <SectionCard title="Account Level">
                        <View style={styles.controls}>
                            <LevelControl
                                label="Current"
                                value={accountFrom}
                                max={ACCOUNT_EXP_MAX_LEVEL}
                                onChange={setAccountFrom}
                                testID="exp-account-from"
                            />
                            <LevelControl
                                label="Target"
                                value={accountTo}
                                max={ACCOUNT_EXP_MAX_LEVEL}
                                onChange={setAccountTo}
                                testID="exp-account-to"
                            />
                            <View style={styles.apRow}>
                                <Text style={styles.apLabel}>AP spent per day</Text>
                                <TextInput
                                    testID="exp-ap-input"
                                    style={styles.apField}
                                    keyboardType="number-pad"
                                    value={apPerDay}
                                    onChangeText={setApPerDay}
                                    selectTextOnFocus
                                />
                            </View>
                        </View>
                        {accountTo <= accountFrom ? (
                            <Text style={styles.warning}>Target level must be higher than the current level.</Text>
                        ) : (
                            <View style={styles.totalBox}>
                                <Text style={styles.totalLabel}>EXP needed</Text>
                                <Text style={styles.totalValue} testID="exp-account-total">
                                    {accountExp.toLocaleString()}
                                </Text>
                                {Number.isFinite(apDaily) && apDaily > 0 && (
                                    <Text style={styles.totalSub}>
                                        ≈ {Math.ceil(accountExp / apDaily).toLocaleString()} days at {apDaily} AP/day
                                    </Text>
                                )}
                            </View>
                        )}
                        <Text style={styles.note}>
                            1 AP spent = 1 account EXP. A typical day is ~450 AP from natural regen plus café
                            production and any refreshes.
                        </Text>
                    </SectionCard>
                )}
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    modeBar: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    controls: {
        gap: spacing.md,
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
    totalSub: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.primaryDark,
        marginTop: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    rowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    rowCount: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.primary,
        fontVariant: ['tabular-nums'],
    },
    apRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    apLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
    },
    apField: {
        width: 90,
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 6,
        paddingHorizontal: 10,
        fontVariant: ['tabular-nums'],
    },
    note: {
        marginTop: spacing.md,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 17,
    },
});
