import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '@/constants/theme';
import { Students } from '@/types/students';
import { DailyImagePost, getDailyImage, postPageUrl } from '@/utils/dailyImage';

type Props = {
    student: Students;
    /** BA day number; the pick is stable for the whole day. */
    day: number;
};

// Extreme aspect ratios (tall comic strips, wide banners) get cropped rather
// than dominating the dashboard; the tap-through shows the full post.
function clampAspect(width: number, height: number): number {
    return Math.min(1.6, Math.max(0.75, width / height));
}

export default function DailyImageCard({ student, day }: Props) {
    const [post, setPost] = useState<DailyImagePost | null>(null);
    const [state, setState] = useState<'loading' | 'ready' | 'empty'>('loading');

    useEffect(() => {
        let cancelled = false;
        setState('loading');
        setPost(null);
        getDailyImage(student, day)
            .then((p) => {
                if (cancelled) return;
                setPost(p);
                setState(p ? 'ready' : 'empty');
            })
            .catch(() => {
                // Network failure (or CORS on web): hide the card quietly.
                if (!cancelled) setState('empty');
            });
        return () => {
            cancelled = true;
        };
    }, [student, day]);

    if (state === 'empty') return null;

    if (state === 'loading' || !post) {
        return (
            <View style={[styles.card, styles.loadingCard]} testID="daily-image-loading">
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <Pressable
            onPress={() => Linking.openURL(postPageUrl(post))}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
            testID="daily-image-card"
        >
            <Image
                source={{ uri: post.imageUrl }}
                style={[styles.image, { aspectRatio: clampAspect(post.width, post.height) }]}
                contentFit="cover"
                contentPosition="top center"
                transition={200}
            />
            <View style={styles.footer}>
                <Ionicons name="color-palette-outline" size={14} color={colors.textSecondary} />
                <Text style={styles.footerText} numberOfLines={1}>
                    Daily fan art of {student.name} — tap to view on Safebooru
                </Text>
                <Ionicons name="open-outline" size={14} color={colors.textMuted} />
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        marginHorizontal: spacing.lg,
        marginTop: spacing.sm,
        overflow: 'hidden',
    },
    loadingCard: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    footerText: {
        flex: 1,
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
});
