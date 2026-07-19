import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import FilterChip from '@/components/FilterChip';
import ScreenContainer from '@/components/ScreenContainer';
import SectionCard from '@/components/SectionCard';
import {
    clearTimeToScore,
    formatTime,
    parseTimeInput,
    RAID_DIFFICULTIES,
    RAID_DURATIONS,
    RaidDuration,
    scoreToClearTime,
} from '@/constants/raidScore';
import { colors, radius, spacing } from '@/constants/theme';

export default function RaidScoreScreen() {
    const [duration, setDuration] = useState<RaidDuration>(240);
    const [diffIdx, setDiffIdx] = useState(5); // Insane
    const [timeText, setTimeText] = useState('1:30');
    const [scoreText, setScoreText] = useState('');
    // Which field the user typed in last — the other one is derived from it,
    // so changing boss/difficulty recomputes the derived side only.
    const [source, setSource] = useState<'time' | 'score'>('time');

    const difficulty = RAID_DIFFICULTIES[diffIdx];

    const derived = useMemo(() => {
        if (source === 'time') {
            const secs = parseTimeInput(timeText);
            if (secs === null) return null;
            const score = clearTimeToScore(secs, duration, difficulty);
            if (score === null) return null;
            return { secs, score };
        }
        const score = Number.parseInt(scoreText.replace(/[^0-9]/g, ''), 10);
        if (Number.isNaN(score)) return null;
        return { secs: scoreToClearTime(score, duration, difficulty), score };
    }, [source, timeText, scoreText, duration, difficulty]);

    const impossible = derived !== null && derived.secs < 0;
    const timeValue =
        source === 'time' ? timeText : derived ? formatTime(Math.max(0, derived.secs)) : '';
    const scoreValue =
        source === 'score' ? scoreText : derived ? derived.score.toLocaleString('en-US') : '';
    const selectedDuration = RAID_DURATIONS.find((d) => d.value === duration)!;

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={{ paddingVertical: spacing.lg }}>
                <SectionCard title="Boss & Difficulty">
                    <Text style={styles.fieldLabel}>Battle timer</Text>
                    <View style={styles.chipWrap}>
                        {RAID_DURATIONS.map((d) => (
                            <FilterChip
                                key={d.value}
                                testID={`raid-duration-${d.value}`}
                                label={d.label}
                                selected={d.value === duration}
                                onPress={() => setDuration(d.value)}
                            />
                        ))}
                    </View>
                    <Text style={styles.bossNote}>{selectedDuration.bosses}</Text>
                    <Text style={styles.fieldLabel}>Difficulty</Text>
                    <View style={styles.chipWrap}>
                        {RAID_DIFFICULTIES.map((d, i) => (
                            <FilterChip
                                key={d.name}
                                testID={`raid-diff-${i}`}
                                label={d.name}
                                selected={i === diffIdx}
                                onPress={() => setDiffIdx(i)}
                            />
                        ))}
                    </View>
                </SectionCard>

                <SectionCard title="Convert">
                    <View style={styles.inputRow}>
                        <View style={styles.inputCol}>
                            <Text style={styles.fieldLabel}>Total clear time</Text>
                            <TextInput
                                testID="raid-time-input"
                                style={styles.field}
                                value={timeValue}
                                onChangeText={(t) => {
                                    setTimeText(t);
                                    setSource('time');
                                }}
                                placeholder="1:30"
                                placeholderTextColor={colors.textMuted}
                                selectTextOnFocus
                            />
                        </View>
                        <View style={styles.inputCol}>
                            <Text style={styles.fieldLabel}>Score</Text>
                            <TextInput
                                testID="raid-score-input"
                                style={styles.field}
                                value={scoreValue}
                                onChangeText={(t) => {
                                    setScoreText(t);
                                    setSource('score');
                                }}
                                keyboardType="number-pad"
                                placeholder="27,755,200"
                                placeholderTextColor={colors.textMuted}
                                selectTextOnFocus
                            />
                        </View>
                    </View>

                    {derived === null ? (
                        <Text style={styles.warning}>
                            Enter a clear time (like 95 or 1:35) or a score to convert.
                        </Text>
                    ) : impossible ? (
                        <Text style={styles.warning}>
                            That score is above the maximum possible for this difficulty.
                        </Text>
                    ) : (
                        <View style={styles.totalBox}>
                            <Text style={styles.totalLabel}>
                                {difficulty.name} · clear in {formatTime(derived.secs)}
                            </Text>
                            <Text style={styles.totalValue} testID="raid-result">
                                {derived.score.toLocaleString('en-US')}
                            </Text>
                            <Text style={styles.remaining}>
                                {formatTime(Math.max(0, 3600 - derived.secs))} left on the 60:00 bank
                            </Text>
                        </View>
                    )}
                    <Text style={styles.note}>
                        Clear time is the total battle time summed across every team you field.
                        Formula and constants from Joe&apos;s ba-tools (MIT).
                    </Text>
                </SectionCard>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    fieldLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
        marginBottom: 6,
    },
    chipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: spacing.sm,
        marginBottom: spacing.md,
    },
    bossNote: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: -4,
        marginBottom: spacing.md,
        lineHeight: 17,
    },
    inputRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    inputCol: {
        flex: 1,
    },
    field: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 8,
        paddingHorizontal: 10,
        fontVariant: ['tabular-nums'],
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
    remaining: {
        fontSize: 12,
        color: colors.primaryDark,
        marginTop: 2,
    },
    note: {
        marginTop: spacing.md,
        fontSize: 12,
        color: colors.textMuted,
        lineHeight: 17,
    },
});
