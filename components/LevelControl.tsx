import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
    label: string;
    icon?: any; // optional image shown before the label (e.g. a student icon)
    value: number;
    max: number;
    min?: number;
    valuePrefix?: string; // e.g. 'T' for gear tiers; defaults to 'Lv. '
    onChange: (value: number) => void;
    testID?: string;
};

// Stepper row used for stat level and skill level controls. A stepper (rather
// than a slider) keeps taps precise inside the profile's vertical ScrollView
// on both native and web; MIN/MAX chips cover the common jumps.
export default function LevelControl({
    label,
    icon,
    value,
    max,
    min = 1,
    valuePrefix = 'Lv. ',
    onChange,
    testID,
}: Props) {
    // Draft holds the in-progress text while the value input is focused so the
    // user can clear/retype freely; the clamped commit happens on blur/submit.
    const [draft, setDraft] = useState<string | null>(null);

    const setClamped = (next: number) => onChange(Math.min(max, Math.max(min, next)));

    const commitDraft = () => {
        if (draft !== null) {
            const parsed = parseInt(draft, 10);
            if (!Number.isNaN(parsed)) setClamped(parsed);
        }
        setDraft(null);
    };

    return (
        <View style={styles.row}>
            <View style={styles.labelGroup}>
                {icon !== undefined && (
                    <Image source={icon} style={styles.labelIcon} contentFit="cover" />
                )}
                <Text style={styles.label}>{label}</Text>
            </View>
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
                <View style={styles.value}>
                    {valuePrefix !== '' && <Text style={styles.valueText}>{valuePrefix}</Text>}
                    <TextInput
                        testID={testID ? `${testID}-input` : undefined}
                        style={styles.valueInput}
                        keyboardType="number-pad"
                        value={draft ?? String(value)}
                        onFocus={() => setDraft(String(value))}
                        onChangeText={(t) => setDraft(t.replace(/[^0-9]/g, ''))}
                        onBlur={commitDraft}
                        onSubmitEditing={commitDraft}
                        selectTextOnFocus
                    />
                    <Text style={styles.valueMax}>/{max}</Text>
                </View>
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
    labelGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flexShrink: 1,
    },
    labelIcon: {
        width: 26,
        height: 26,
        borderRadius: radius.pill,
        backgroundColor: colors.border,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 64,
    },
    valueText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        fontVariant: ['tabular-nums'],
    },
    valueInput: {
        width: 40, // fixed: on web, number inputs otherwise take a huge intrinsic width
        paddingVertical: 2,
        paddingHorizontal: 0,
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center',
        fontVariant: ['tabular-nums'],
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    valueMax: {
        fontSize: 14,
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
