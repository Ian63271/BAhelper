import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/constants/theme';

type Props = {
    label: string;
    theme?: 'primary';
    icon?: keyof typeof FontAwesome.glyphMap;
    onPress?: () => void;
};

export default function Button({ label, theme, icon, onPress }: Props) {
    if (theme === 'primary') {
        return (
            <View style={styles.buttonContainer}>
                <Pressable
                    style={({ pressed }) => [styles.button, styles.primaryButton, pressed && styles.pressed]}
                    onPress={onPress}>
                    {icon && <FontAwesome name={icon} size={18} color={colors.textOnPrimary} style={styles.buttonIcon} />}
                    <Text style={[styles.buttonLabel, { color: colors.textOnPrimary }]}>{label}</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View style={styles.buttonContainer}>
            <Pressable
                style={({ pressed }) => [styles.button, styles.defaultButton, pressed && styles.pressed]}
                onPress={onPress}>
                {icon && <FontAwesome name={icon} size={18} color={colors.text} style={styles.buttonIcon} />}
                <Text style={[styles.buttonLabel, { color: colors.text }]}>{label}</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        borderRadius: radius.md,
        minHeight: 48,
        paddingHorizontal: 20,
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    defaultButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
    },
    pressed: {
        opacity: 0.75,
    },
    buttonLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonIcon: {
        paddingRight: 8,
    },
});
