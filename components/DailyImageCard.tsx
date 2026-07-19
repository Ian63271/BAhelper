import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Linking, Pressable, StyleSheet, Text, View } from 'react-native';

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
    // 'empty' = the day's lookup found no art (cached, final); 'error' = the
    // fetch itself failed, worth retrying — both render as a hidden card.
    const [state, setState] = useState<'loading' | 'ready' | 'empty' | 'error'>('loading');
    const [attempt, setAttempt] = useState(0);

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
            .catch((e: unknown) => {
                // Network failure (or CORS on web): hide the card quietly,
                // but leave a trace in the dev log — "HTTP 403" = blocked,
                // "Aborted" = 12s timeout, "Network request failed" = no route.
                console.warn(`[daily-image] fetch failed: ${e instanceof Error ? e.message : String(e)}`);
                if (!cancelled) setState('error');
            });
        return () => {
            cancelled = true;
        };
    }, [student, day, attempt]);

    // A transient failure would otherwise blank the card for the whole
    // session (the tab navigator keeps this screen mounted, so the effect
    // never re-runs). Retry after a failure whenever the screen regains
    // focus or the app returns to the foreground — via a ref so the focus
    // callback stays stable and an in-focus failure can't retry-loop.
    const stateRef = useRef(state);
    stateRef.current = state;
    const retryIfFailed = useCallback(() => {
        if (stateRef.current === 'error') setAttempt((a) => a + 1);
    }, []);

    useFocusEffect(retryIfFailed);

    useEffect(() => {
        const sub = AppState.addEventListener('change', (s) => {
            if (s === 'active') retryIfFailed();
        });
        return () => sub.remove();
    }, [retryIfFailed]);

    if (state === 'empty' || state === 'error') return null;

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
