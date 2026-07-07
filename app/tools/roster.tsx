import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import Button from '@/components/Button';
import FilterChip from '@/components/FilterChip';
import ScreenContainer from '@/components/ScreenContainer';
import { colors, radius, spacing } from '@/constants/theme';
import { useUserData } from '@/context/UserDataContext';
import { studentIcons } from '@/types/imageMap';
import { Students } from '@/types/students';
import { allStudents, getBaseName } from '@/utils/studentUtils';

const ROSTER_SIZE = 10;
const STRIKER_SLOTS = 6; // balanced mode: 6 strikers + 4 specials

function shuffle<T>(list: T[]): T[] {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function RosterGeneratorScreen() {
    const { owned } = useUserData();
    const [slots, setSlots] = useState<(Students | null)[]>(Array(ROSTER_SIZE).fill(null));
    const [locked, setLocked] = useState<boolean[]>(Array(ROSTER_SIZE).fill(false));
    const [ownedOnly, setOwnedOnly] = useState(false);
    const [balanced, setBalanced] = useState(true);

    const generate = useCallback(
        (keepLocked: boolean) => {
            setSlots((prev) => {
                const next: (Students | null)[] = prev.map((s, i) => (keepLocked && locked[i] ? s : null));
                const usedNames = new Set(
                    next.filter((s): s is Students => s !== null).map((s) => getBaseName(s))
                );

                const basePool = ownedOnly ? allStudents.filter((s) => owned.has(s.id)) : allStudents;

                const fill = (indices: number[], pool: Students[]) => {
                    const candidates = shuffle(pool.filter((s) => !usedNames.has(getBaseName(s))));
                    for (const i of indices) {
                        if (next[i] !== null) continue;
                        const pick = candidates.find((s) => !usedNames.has(getBaseName(s)));
                        if (!pick) break;
                        next[i] = pick;
                        usedNames.add(getBaseName(pick));
                    }
                };

                if (balanced) {
                    const strikerIdx = [...Array(STRIKER_SLOTS).keys()];
                    const specialIdx = [...Array(ROSTER_SIZE - STRIKER_SLOTS).keys()].map((i) => i + STRIKER_SLOTS);
                    fill(strikerIdx, basePool.filter((s) => s.combatClass === 'Main'));
                    fill(specialIdx, basePool.filter((s) => s.combatClass === 'Support'));
                } else {
                    fill([...Array(ROSTER_SIZE).keys()], basePool);
                }
                return next;
            });
        },
        [locked, ownedOnly, balanced, owned]
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => generate(false), []);

    const rerollOne = (index: number) => {
        setSlots((prev) => {
            const usedNames = new Set(
                prev.filter((s, i): s is Students => s !== null && i !== index).map((s) => getBaseName(s))
            );
            let pool = ownedOnly ? allStudents.filter((s) => owned.has(s.id)) : allStudents;
            if (balanced) {
                pool = pool.filter((s) => s.combatClass === (index < STRIKER_SLOTS ? 'Main' : 'Support'));
            }
            const candidates = pool.filter(
                (s) => !usedNames.has(getBaseName(s)) && s.id !== prev[index]?.id
            );
            if (candidates.length === 0) return prev;
            const next = [...prev];
            next[index] = candidates[Math.floor(Math.random() * candidates.length)];
            return next;
        });
    };

    const toggleLock = (index: number) => {
        setLocked((prev) => prev.map((v, i) => (i === index ? !v : v)));
    };

    const ownedPoolTooSmall = ownedOnly && owned.size < ROSTER_SIZE;

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
                <View style={styles.optionsRow}>
                    <FilterChip
                        label={`Owned only (${owned.size})`}
                        selected={ownedOnly}
                        onPress={() => setOwnedOnly((v) => !v)}
                        color={colors.success}
                    />
                    <FilterChip
                        label="6 Strikers + 4 Specials"
                        selected={balanced}
                        onPress={() => setBalanced((v) => !v)}
                    />
                </View>
                {ownedPoolTooSmall && (
                    <Text style={styles.warning}>
                        You have fewer than {ROSTER_SIZE} owned students — some slots will stay empty.
                    </Text>
                )}

                <View style={styles.grid}>
                    {slots.map((student, i) => (
                        <View key={i} style={styles.slot}>
                            {balanced && (
                                <Text style={styles.slotClass}>{i < STRIKER_SLOTS ? 'STRIKER' : 'SPECIAL'}</Text>
                            )}
                            {student ? (
                                <Pressable onPress={() => router.push(`/student/${student.id}`)} style={styles.slotBody}>
                                    <Image source={studentIcons[student.id]} style={styles.slotIcon} contentFit="cover" />
                                    <Text style={styles.slotName} numberOfLines={2}>
                                        {student.name}
                                    </Text>
                                </Pressable>
                            ) : (
                                <View style={[styles.slotBody, styles.slotEmpty]}>
                                    <Ionicons name="help" size={28} color={colors.textMuted} />
                                </View>
                            )}
                            <View style={styles.slotActions}>
                                <Pressable onPress={() => toggleLock(i)} hitSlop={6}>
                                    <Ionicons
                                        name={locked[i] ? 'lock-closed' : 'lock-open-outline'}
                                        size={18}
                                        color={locked[i] ? colors.accent : colors.textMuted}
                                    />
                                </Pressable>
                                <Pressable onPress={() => rerollOne(i)} hitSlop={6} disabled={locked[i]}>
                                    <Ionicons name="refresh" size={18} color={locked[i] ? colors.border : colors.primary} />
                                </Pressable>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={styles.footer}>
                    <Button theme="primary" icon="random" label="Reroll unlocked" onPress={() => generate(true)} />
                </View>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    optionsRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.sm,
    },
    warning: {
        color: colors.danger,
        fontSize: 13,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
    },
    slot: {
        width: '30%',
        margin: '1.5%',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    slotClass: {
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 0.8,
        color: colors.textMuted,
        marginBottom: 4,
    },
    slotBody: {
        alignItems: 'center',
    },
    slotEmpty: {
        width: 60,
        height: 60,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceAlt,
        justifyContent: 'center',
    },
    slotIcon: {
        width: 60,
        height: 60,
        borderRadius: radius.md,
    },
    slotName: {
        fontSize: 11,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
        marginTop: 4,
        minHeight: 28,
    },
    slotActions: {
        flexDirection: 'row',
        gap: spacing.lg,
        marginTop: spacing.xs,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        marginTop: spacing.lg,
    },
});
