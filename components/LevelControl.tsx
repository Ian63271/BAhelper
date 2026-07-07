import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
    label: string;
    value: number;
    max: number;
    min?: number;
    onChange: (value: number) => void;
    testID?: string;
};

// Stepper row used for stat level and skill level controls. A stepper (rather
// than a slider) keeps taps precise inside the profile's vertical ScrollView
// on both native and web; MIN/MAX chips cover the common jumps.
export default function LevelControl({ label, value, max, min = 1, onChange, testID }: Props) {
    const setClamped = (next: number) => onChange(Math.min(max, Math.max(min, next)));

    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.controls}>
                {max - min > 10 && (
                    <Pressable
                        testID={testID ? `${testID}-min` : undefined}
                        style={[styles.chip, value === min && styles.chipActive]}
                        onPress={() => setClamped(min)}
                        hitSlop={4}>
                        <Text style={[styles.chipText, value === min && styles.chipTextActive]}>
                            {min}
                        </Text>
                    </Pressable>
                )}
                <Pressable
                    testID={testID ? `${testID}-minus` : undefined}
                    style={[styles.step, value <= min && styles.stepDisabled]}
                    disabled={value <= min}
                    onPress={() => setClamped(value - 1)}
                    hitSlop={4}>
                    <Text style={styles.stepText}>−</Text>
                </Pressable>
                <Text style={styles.value}>
                    Lv. {value}
                    <Text style={styles.valueMax}>/{max}</Text>
                </Text>
                <Pressable
                    testID={testID ? `${testID}-plus` : undefined}
                    style={[styles.step, value >= max && styles.stepDisabled]}
                    disabled={value >= max}
                    onPress={() => setClamped(value + 1)}
                    hitSlop={4}>
                    <Text style={styles.stepText}>+</Text>
                </Pressable>
                <Pressable
                    testID={testID ? `${testID}-max` : undefined}
                    style={[styles.chip, value === max && styles.chipActive]}
                    onPress={() => setClamped(max)}
                    hitSlop={4}>
                    <Text style={[styles.chipText, value === max && styles.chipTextActive]}>
                        MAX
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
        flexShrink: 1,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    step: {
        width: 28,
        height: 28,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepDisabled: {
        opacity: 0.35,
    },
    stepText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        lineHeight: 18,
    },
    value: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        minWidth: 64,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
    },
    valueMax: {
        color: colors.textMuted,
        fontWeight: '600',
    },
    chip: {
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
    },
    chipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    chipTextActive: {
        color: colors.textOnPrimary,
    },
});
