import { Image } from 'expo-image';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { equipmentIcons } from '@/types/imageMap';

type Props = {
    category: string; // gear slot category, e.g. 'Hat' — keys equipmentIcons
    value: number; // 0 = nothing equipped
    max: number;
    onChange: (tier: number) => void;
    testID?: string;
};

// SchaleDB-style gear picker: the row shows the currently equipped item's
// icon and tier, tapping it opens a T0–T10 list with the actual item art.
// A dropdown (rather than a stepper) keeps the advanced area compact — gear
// is usually set once to T7/T9, not nudged one tier at a time.
export default function GearTierControl({ category, value, max, onChange, testID }: Props) {
    const [open, setOpen] = useState(false);

    const select = (tier: number) => {
        onChange(tier);
        setOpen(false);
    };

    const iconFor = (tier: number) =>
        tier > 0 ? equipmentIcons[`${category}_T${tier}`] : undefined;

    const renderIcon = (tier: number, size: number) => {
        const source = iconFor(tier);
        return (
            <View style={[styles.iconCircle, { width: size, height: size }]}>
                {source ? (
                    <Image source={source} style={styles.iconImage} contentFit="contain" />
                ) : (
                    <Text style={styles.emptyText}>EMPTY</Text>
                )}
            </View>
        );
    };

    return (
        <View style={styles.row}>
            <Text style={styles.label}>{category}</Text>
            <Pressable
                testID={testID}
                style={styles.trigger}
                onPress={() => setOpen(true)}
                hitSlop={4}>
                {renderIcon(value, 30)}
                <Text style={styles.triggerText}>T{value}</Text>
                <Text style={styles.triggerChevron}>▾</Text>
            </Pressable>
            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
                        <Text style={styles.sheetTitle}>{category}</Text>
                        <ScrollView>
                            {Array.from({ length: max + 1 }, (_, tier) => (
                                <Pressable
                                    key={tier}
                                    testID={testID ? `${testID}-tier-${tier}` : undefined}
                                    style={[styles.option, tier === value && styles.optionSelected]}
                                    onPress={() => select(tier)}>
                                    {renderIcon(tier, 40)}
                                    <Text
                                        style={[
                                            styles.optionText,
                                            tier === value && styles.optionTextSelected,
                                        ]}>
                                        T{tier}
                                    </Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>
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
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceAlt,
        paddingVertical: 3,
        paddingLeft: 4,
        paddingRight: spacing.sm,
    },
    triggerText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        fontVariant: ['tabular-nums'],
    },
    triggerChevron: {
        fontSize: 11,
        color: colors.textMuted,
    },
    iconCircle: {
        borderRadius: radius.pill,
        backgroundColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    iconImage: {
        width: '86%',
        height: '86%',
    },
    emptyText: {
        fontSize: 7,
        fontWeight: '800',
        fontStyle: 'italic',
        color: colors.textSecondary,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(27, 42, 65, 0.45)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
    },
    sheet: {
        width: 220,
        maxHeight: '75%',
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        paddingVertical: spacing.sm,
    },
    sheetTitle: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
        textAlign: 'center',
        paddingBottom: spacing.xs,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        marginBottom: spacing.xs,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 6,
        paddingHorizontal: spacing.lg,
    },
    optionSelected: {
        backgroundColor: colors.primarySoft,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        fontVariant: ['tabular-nums'],
    },
    optionTextSelected: {
        color: colors.primary,
    },
});
