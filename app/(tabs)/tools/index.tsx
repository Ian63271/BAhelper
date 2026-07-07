import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import { colors, radius, spacing } from '@/constants/theme';

const TOOLS: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    route: string;
}[] = [
    {
        icon: 'dice-outline',
        title: 'SCHALE Roster Generator',
        description: 'Draft a random squad of 10 students — lock the ones you like and reroll the rest.',
        route: '/tools/roster',
    },
    {
        icon: 'heart-circle-outline',
        title: 'Bond XP Calculator',
        description: 'How many headpats and gifts to reach a target relationship rank.',
        route: '/tools/bond',
    },
    {
        icon: 'sparkles-outline',
        title: 'Banners',
        description: 'Current Global banners plus upcoming ones predicted from the JP schedule.',
        route: '/tools/banners',
    },
];

export default function ToolsScreen() {
    return (
        <ScreenContainer style={styles.container}>
            {TOOLS.map((tool) => (
                <Pressable
                    key={tool.route}
                    onPress={() => router.push(tool.route as any)}
                    style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
                >
                    <View style={styles.iconWrap}>
                        <Ionicons name={tool.icon} size={26} color={colors.primary} />
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>{tool.title}</Text>
                        <Text style={styles.cardDescription}>{tool.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </Pressable>
            ))}
            <Text style={styles.moreSoon}>More tools coming soon…</Text>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: spacing.lg,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    iconWrap: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBody: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    cardDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2,
    },
    moreSoon: {
        textAlign: 'center',
        color: colors.textMuted,
        fontSize: 13,
        marginTop: spacing.md,
    },
});
