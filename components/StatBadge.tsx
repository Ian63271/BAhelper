import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';

type Props = {
    label: string;
    value?: string | number;
};

// Small "label over value" block used in stat grids on the detail page.
export default function StatBadge({ label, value }: Props) {
    if (value === undefined || value === null || value === '') return null;
    return (
        <View style={styles.badge}>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.value}>{String(value)}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        backgroundColor: colors.surfaceAlt,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minWidth: 90,
        flexGrow: 1,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        color: colors.textMuted,
        marginBottom: 2,
    },
    value: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
});
