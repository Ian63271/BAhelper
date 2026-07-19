import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
    tabs: { key: string; label: string }[];
    active: string;
    onChange: (key: string) => void;
    testIDPrefix?: string; // segment testIDs become `${testIDPrefix}-${key}`
};

// Pill-style segmented control (student profile sub-tabs, EXP calculator modes).
export default function SegmentedTabs({ tabs, active, onChange, testIDPrefix }: Props) {
    return (
        <View style={styles.track}>
            {tabs.map((tab) => {
                const isActive = tab.key === active;
                return (
                    <Pressable
                        key={tab.key}
                        testID={testIDPrefix ? `${testIDPrefix}-${tab.key}` : undefined}
                        style={[styles.segment, isActive && styles.segmentActive]}
                        onPress={() => onChange(tab.key)}
                    >
                        <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    track: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 3,
        gap: 2,
    },
    segment: {
        flex: 1,
        borderRadius: radius.pill,
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    segmentActive: {
        backgroundColor: colors.primary,
    },
    segmentText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    segmentTextActive: {
        color: colors.textOnPrimary,
    },
});
