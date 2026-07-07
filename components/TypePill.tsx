import { StyleSheet, Text, View } from 'react-native';

import {
    armorTypeColors,
    armorTypeLabels,
    colors,
    damageTypeColors,
    damageTypeLabels,
    radius,
} from '@/constants/theme';

type Props = {
    kind: 'damage' | 'armor';
    value?: string;
    small?: boolean;
};

export default function TypePill({ kind, value, small }: Props) {
    if (!value) return null;
    const color = (kind === 'damage' ? damageTypeColors : armorTypeColors)[value] ?? colors.textSecondary;
    const label = (kind === 'damage' ? damageTypeLabels : armorTypeLabels)[value] ?? value;

    return (
        <View style={[styles.pill, { backgroundColor: color }, small && styles.pillSmall]}>
            <Text style={[styles.label, small && styles.labelSmall]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    pill: {
        borderRadius: radius.pill,
        paddingHorizontal: 12,
        paddingVertical: 4,
        alignSelf: 'flex-start',
    },
    pillSmall: {
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    label: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '700',
    },
    labelSmall: {
        fontSize: 11,
    },
});
