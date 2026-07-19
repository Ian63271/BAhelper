import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import FilterChip from '@/components/FilterChip';
import ScreenContainer from '@/components/ScreenContainer';
import StudentIconTile from '@/components/StudentIconTile';
import {
    armorTypeLabels,
    colors,
    damageTypeColors,
    damageTypeLabels,
    radius,
    roleLabels,
    schoolLabels,
    spacing,
} from '@/constants/theme';
import { useDataSync } from '@/context/DataSyncContext';
import { useUserData } from '@/context/UserDataContext';
import { Students } from '@/types/students';
import {
    allStudents,
    collapseAlts,
    countActiveFilters,
    distinctValues,
    emptyFilters,
    filterStudents,
    RosterFilters,
    SortMode,
    sortModeLabels,
    sortStudents,
} from '@/utils/studentUtils';

const STARS = [1, 2, 3];
const SORT_MODES: SortMode[] = ['default', 'name', 'school', 'stars', 'birthday'];

function toggleValue<T>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function StudentsScreen() {
    const { owned, favorites, toggleOwned, setOwnedMany } = useUserData();
    const { activeVersion } = useDataSync();
    const [filters, setFilters] = useState<RosterFilters>(emptyFilters);
    const [sortMode, setSortMode] = useState<SortMode>('default');
    const [groupAlts, setGroupAlts] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [bulkMode, setBulkMode] = useState(false);

    const patchFilters = (patch: Partial<RosterFilters>) => setFilters((f) => ({ ...f, ...patch }));

    // Chip values derive from the student data, which can be swapped in place
    // by a remote data update — hence the activeVersion dependency.
    const { SCHOOLS, DAMAGE_TYPES, ARMOR_TYPES, ROLES, POSITIONS, WEAPONS } = useMemo(
        () => ({
            SCHOOLS: distinctValues((s) => s.school),
            DAMAGE_TYPES: distinctValues((s) => s.damageType),
            ARMOR_TYPES: distinctValues((s) => s.armorType),
            ROLES: distinctValues((s) => s.role),
            POSITIONS: distinctValues((s) => s.position),
            WEAPONS: distinctValues((s) => s.weaponType),
        }),
        [activeVersion] // eslint-disable-line react-hooks/exhaustive-deps
    );

    const students = useMemo(() => {
        const base = groupAlts ? collapseAlts(allStudents) : allStudents;
        return sortStudents(filterStudents(base, filters, owned, favorites), sortMode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, sortMode, groupAlts, owned, favorites, activeVersion]);

    const activeCount = countActiveFilters(filters);

    const clearShown = () => {
        const apply = () => setOwnedMany(students.map((s) => s.id), false);
        const shownOwned = students.filter((s) => owned.has(s.id)).length;
        if (shownOwned === 0) return;
        const message = `Remove ${shownOwned} student${shownOwned === 1 ? '' : 's'} from your collection?`;
        // RN-web's Alert is a no-op, so fall back to window.confirm there.
        if (Platform.OS === 'web') {
            if (window.confirm(message)) apply();
        } else {
            Alert.alert('Clear shown students', message, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: apply },
            ]);
        }
    };

    const renderTile = useCallback(
        ({ item }: { item: Students }) => (
            <StudentIconTile
                student={item}
                owned={owned.has(item.id)}
                favorite={favorites.has(item.id)}
                testID={`student-tile-${item.id}`}
                onPress={() =>
                    bulkMode ? toggleOwned(item.id) : router.push(`/student/${item.id}`)
                }
                onLongPress={() => toggleOwned(item.id)}
            />
        ),
        [owned, favorites, bulkMode, toggleOwned]
    );

    return (
        <ScreenContainer>
            <View style={styles.toolbar}>
                <View style={styles.searchBox}>
                    <Ionicons name="search" size={18} color={colors.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search students…"
                        placeholderTextColor={colors.textMuted}
                        value={filters.search}
                        onChangeText={(search) => patchFilters({ search })}
                    />
                    {filters.search.length > 0 && (
                        <Pressable onPress={() => patchFilters({ search: '' })}>
                            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </Pressable>
                    )}
                </View>
                <Pressable
                    testID="filter-toggle"
                    onPress={() => setFiltersOpen((v) => !v)}
                    style={[styles.filterButton, (filtersOpen || activeCount > 0) && styles.filterButtonActive]}
                >
                    <Ionicons
                        name="options-outline"
                        size={20}
                        color={filtersOpen || activeCount > 0 ? '#fff' : colors.textSecondary}
                    />
                    {activeCount > 0 && (
                        <View style={styles.filterCount}>
                            <Text style={styles.filterCountText}>{activeCount}</Text>
                        </View>
                    )}
                </Pressable>
                <Pressable
                    testID="bulk-toggle"
                    onPress={() => setBulkMode((v) => !v)}
                    style={[styles.filterButton, bulkMode && styles.bulkButtonActive]}
                >
                    <Ionicons
                        name="checkmark-done-outline"
                        size={20}
                        color={bulkMode ? '#fff' : colors.textSecondary}
                    />
                </Pressable>
            </View>

            {bulkMode && (
                <View style={styles.bulkBar}>
                    <Text style={styles.bulkHint}>Tap tiles to toggle owned</Text>
                    <View style={styles.bulkActions}>
                        <Pressable
                            testID="bulk-own-all"
                            style={styles.bulkAction}
                            onPress={() => setOwnedMany(students.map((s) => s.id), true)}
                        >
                            <Text style={styles.bulkActionText}>Own shown</Text>
                        </Pressable>
                        <Pressable
                            testID="bulk-clear-shown"
                            style={[styles.bulkAction, styles.bulkActionDanger]}
                            onPress={clearShown}
                        >
                            <Text style={[styles.bulkActionText, styles.bulkActionTextDanger]}>
                                Clear shown
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {filtersOpen && (
                <ScrollView style={styles.filterPanel} contentContainerStyle={{ paddingBottom: spacing.md }}>
                    <ChipRow label="Collection">
                        <FilterChip
                            label={`Owned (${owned.size})`}
                            selected={filters.ownedOnly}
                            onPress={() => patchFilters({ ownedOnly: !filters.ownedOnly })}
                            color={colors.success}
                        />
                        <FilterChip
                            label={`Favorites (${favorites.size})`}
                            selected={filters.favoritesOnly}
                            onPress={() => patchFilters({ favoritesOnly: !filters.favoritesOnly })}
                            color={colors.danger}
                        />
                        <FilterChip label="Group alts" selected={groupAlts} onPress={() => setGroupAlts((v) => !v)} />
                    </ChipRow>
                    <ChipRow label="School">
                        {SCHOOLS.map((s) => (
                            <FilterChip
                                key={s}
                                label={schoolLabels[s] ?? s}
                                selected={filters.schools.includes(s)}
                                onPress={() => patchFilters({ schools: toggleValue(filters.schools, s) })}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Damage">
                        {DAMAGE_TYPES.map((t) => (
                            <FilterChip
                                key={t}
                                label={damageTypeLabels[t] ?? t}
                                selected={filters.damageTypes.includes(t)}
                                onPress={() => patchFilters({ damageTypes: toggleValue(filters.damageTypes, t) })}
                                color={damageTypeColors[t]}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Armor">
                        {ARMOR_TYPES.map((t) => (
                            <FilterChip
                                key={t}
                                label={armorTypeLabels[t] ?? t}
                                selected={filters.armorTypes.includes(t)}
                                onPress={() => patchFilters({ armorTypes: toggleValue(filters.armorTypes, t) })}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Role">
                        {ROLES.map((r) => (
                            <FilterChip
                                key={r}
                                label={roleLabels[r] ?? r}
                                selected={filters.roles.includes(r)}
                                onPress={() => patchFilters({ roles: toggleValue(filters.roles, r) })}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Position">
                        {POSITIONS.map((p) => (
                            <FilterChip
                                key={p}
                                label={p}
                                selected={filters.positions.includes(p)}
                                onPress={() => patchFilters({ positions: toggleValue(filters.positions, p) })}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Weapon">
                        {WEAPONS.map((w) => (
                            <FilterChip
                                key={w}
                                label={w}
                                selected={filters.weaponTypes.includes(w)}
                                onPress={() => patchFilters({ weaponTypes: toggleValue(filters.weaponTypes, w) })}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Stars">
                        {STARS.map((n) => (
                            <FilterChip
                                key={n}
                                label={'★'.repeat(n)}
                                selected={filters.stars.includes(n)}
                                onPress={() => patchFilters({ stars: toggleValue(filters.stars, n) })}
                                color={colors.accent}
                            />
                        ))}
                    </ChipRow>
                    <ChipRow label="Sort by">
                        {SORT_MODES.map((m) => (
                            <FilterChip
                                key={m}
                                label={sortModeLabels[m]}
                                selected={sortMode === m}
                                onPress={() => setSortMode(m)}
                            />
                        ))}
                    </ChipRow>
                    {activeCount > 0 && (
                        <Pressable onPress={() => setFilters({ ...emptyFilters, search: filters.search })} style={styles.clearButton}>
                            <Text style={styles.clearButtonText}>Clear all filters</Text>
                        </Pressable>
                    )}
                </ScrollView>
            )}

            <View style={styles.countRow}>
                <Text style={styles.countText}>
                    {students.length} student{students.length === 1 ? '' : 's'}
                </Text>
                <Text style={styles.countHint}>
                    <Ionicons name="checkmark-circle-outline" size={12} color={colors.textMuted} />{' '}
                    {bulkMode ? 'editing collection' : 'long-press to mark owned'} ·{' '}
                    {owned.size}/{allStudents.length} owned
                </Text>
            </View>

            <FlatList
                data={students}
                keyExtractor={(s: Students) => String(s.id)}
                numColumns={4}
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingBottom: spacing.xl }}
                renderItem={renderTile}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="sad-outline" size={40} color={colors.textMuted} />
                        <Text style={styles.emptyText}>No students match these filters.</Text>
                    </View>
                }
            />
        </ScreenContainer>
    );
}

function ChipRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <View style={styles.chipRow}>
            <Text style={styles.chipRowLabel}>{label}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg }}>
                {children}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        height: 44,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: colors.text,
    },
    filterButton: {
        width: 44,
        height: 44,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    bulkButtonActive: {
        backgroundColor: colors.success,
        borderColor: colors.success,
    },
    bulkBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        backgroundColor: colors.primarySoft,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    bulkHint: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primaryDark,
        flexShrink: 1,
    },
    bulkActions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    bulkAction: {
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.success,
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: 5,
    },
    bulkActionDanger: {
        borderColor: colors.danger,
    },
    bulkActionText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.success,
    },
    bulkActionTextDanger: {
        color: colors.danger,
    },
    filterCount: {
        position: 'absolute',
        top: -6,
        right: -6,
        backgroundColor: colors.accent,
        borderRadius: radius.pill,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    filterCountText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.text,
    },
    filterPanel: {
        maxHeight: 320,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    chipRow: {
        marginBottom: spacing.sm,
    },
    chipRowLabel: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        color: colors.textMuted,
        marginHorizontal: spacing.lg,
        marginBottom: 4,
    },
    clearButton: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    clearButtonText: {
        color: colors.danger,
        fontWeight: '700',
        fontSize: 13,
    },
    countRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    countText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
    },
    countHint: {
        fontSize: 11,
        color: colors.textMuted,
    },
    empty: {
        alignItems: 'center',
        padding: spacing.xxl,
        gap: spacing.sm,
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 14,
    },
});
