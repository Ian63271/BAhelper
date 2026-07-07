import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius } from '@/constants/theme';

type Props = {
    label: string;
    selected: boolean;
    onPress: () => void;
    color?: string; // optional accent (e.g. damage type color) when selected
};

export default function FilterChip({ label, selected, onPress, color }: Props) {
    const activeColor = color ?? colors.primary;
    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.chip,
                selected && { backgroundColor: activeColor, borderColor: activeColor },
            ]}>
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    chip: {
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginRight: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    labelSelected: {
        color: '#fff',
    },
});
