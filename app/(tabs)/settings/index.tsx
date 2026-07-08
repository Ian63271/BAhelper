import Ionicons from '@expo/vector-icons/Ionicons';
import Constants from 'expo-constants';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import ScreenContainer from '@/components/ScreenContainer';
import SectionCard from '@/components/SectionCard';
import { colors, spacing } from '@/constants/theme';
import { useDataSync } from '@/context/DataSyncContext';
import { useUserData } from '@/context/UserDataContext';
import { allStudents } from '@/utils/studentUtils';

function confirmAction(title: string, message: string, onConfirm: () => void) {
    if (Platform.OS === 'web') {
        // Alert.alert is a no-op on web
        if (window.confirm(`${title}\n\n${message}`)) onConfirm();
        return;
    }
    Alert.alert(title, message, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onConfirm },
    ]);
}

const syncStatusLabels: Record<string, string> = {
    checking: 'Checking…',
    updated: 'Updated to the latest data.',
    current: 'Already up to date.',
    unreachable: "Couldn't reach the update server.",
    invalid: 'Update server returned unexpected data.',
};

export default function SettingsScreen() {
    const { owned, favorites, settings, updateSettings, clearOwned, clearFavorites } = useUserData();
    const { activeVersion, source, syncedAt, status, refresh, clearDownloaded } = useDataSync();

    return (
        <ScreenContainer>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                contentContainerStyle={{ paddingVertical: spacing.lg }}
            >
                <SectionCard title="Student of the Day">
                    <View style={styles.settingRow}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Include alt versions</Text>
                            <Text style={styles.settingHint}>
                                Allow variants like “Aru (New Year)” to be picked as the daily student.
                            </Text>
                        </View>
                        <Switch
                            value={settings.dailyIncludeAlts}
                            onValueChange={(v) => updateSettings({ dailyIncludeAlts: v })}
                            trackColor={{ true: colors.primary, false: colors.border }}
                            thumbColor="#fff"
                        />
                    </View>
                    <View style={[styles.settingRow, styles.settingRowBorder]}>
                        <View style={styles.settingText}>
                            <Text style={styles.settingLabel}>Daily fan art</Text>
                            <Text style={styles.settingHint}>
                                Show a daily illustration of the student on the home screen, from Safebooru.
                            </Text>
                        </View>
                        <Switch
                            value={settings.showDailyImage}
                            onValueChange={(v) => updateSettings({ showDailyImage: v })}
                            trackColor={{ true: colors.primary, false: colors.border }}
                            thumbColor="#fff"
                        />
                    </View>
                </SectionCard>

                <SectionCard title="Game Data">
                    <View style={styles.settingText}>
                        <Text style={styles.settingLabel}>
                            Data from {new Date(activeVersion).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.settingHint}>
                            {source === 'downloaded'
                                ? `Downloaded update, fetched ${syncedAt ? new Date(syncedAt).toLocaleDateString() : ''}.`
                                : 'Bundled with the app. Updates are fetched automatically at launch.'}
                        </Text>
                    </View>
                    <Pressable style={styles.actionRow} onPress={refresh} disabled={status === 'checking'} testID="check-updates">
                        <Ionicons name="cloud-download-outline" size={18} color={colors.primary} />
                        <Text style={styles.actionText}>Check for updates</Text>
                        {status !== 'idle' && (
                            <Text style={styles.actionStatus} testID="sync-status">
                                {syncStatusLabels[status] ?? ''}
                            </Text>
                        )}
                    </Pressable>
                    {source === 'downloaded' && (
                        <Pressable
                            style={styles.dangerRow}
                            onPress={() =>
                                confirmAction(
                                    'Delete downloaded data?',
                                    'The app will go back to the game data it shipped with.',
                                    clearDownloaded
                                )
                            }
                        >
                            <Ionicons name="trash-outline" size={18} color={colors.danger} />
                            <Text style={styles.dangerText}>Delete downloaded data</Text>
                        </Pressable>
                    )}
                </SectionCard>

                <SectionCard title="Collection">
                    <View style={styles.statsRow}>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>
                                {owned.size}
                                <Text style={styles.statTotal}>/{allStudents.length}</Text>
                            </Text>
                            <Text style={styles.statLabel}>Owned</Text>
                        </View>
                        <View style={styles.stat}>
                            <Text style={styles.statValue}>{favorites.size}</Text>
                            <Text style={styles.statLabel}>Favorites</Text>
                        </View>
                    </View>
                    <Pressable
                        style={styles.dangerRow}
                        onPress={() =>
                            confirmAction('Clear owned students?', 'This removes all owned marks. It cannot be undone.', clearOwned)
                        }
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                        <Text style={styles.dangerText}>Clear owned students</Text>
                    </Pressable>
                    <Pressable
                        style={styles.dangerRow}
                        onPress={() =>
                            confirmAction('Clear favorites?', 'This removes all favorites. It cannot be undone.', clearFavorites)
                        }
                    >
                        <Ionicons name="trash-outline" size={18} color={colors.danger} />
                        <Text style={styles.dangerText}>Clear favorites</Text>
                    </Pressable>
                </SectionCard>

                <SectionCard title="About">
                    <Text style={styles.aboutTitle}>BAhelper</Text>
                    <Text style={styles.aboutText}>
                        Version {Constants.expoConfig?.version ?? '1.0.0'}
                    </Text>
                    <Text style={styles.aboutText}>
                        A fan-made Blue Archive companion: student database, daily drawing prompts, collection tracking
                        and SCHALE tools.
                    </Text>
                    <Text style={styles.aboutCredits}>
                        Student data and images from SchaleDB. Affection EXP data from the Blue Archive wiki. Daily reset
                        is 04:00 JST / 19:00 UTC on both servers. Blue Archive © NEXON Games & Yostar — this app is not
                        affiliated with them.
                    </Text>
                </SectionCard>
            </ScrollView>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    settingText: {
        flex: 1,
    },
    settingRowBorder: {
        borderTopWidth: 1,
        borderTopColor: colors.border,
        marginTop: spacing.md,
        paddingTop: spacing.md,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        marginTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    actionText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    actionStatus: {
        flex: 1,
        textAlign: 'right',
        fontSize: 12,
        color: colors.textSecondary,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    settingHint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.xl,
        marginBottom: spacing.md,
    },
    stat: {
        alignItems: 'flex-start',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.primary,
    },
    statTotal: {
        fontSize: 15,
        color: colors.textMuted,
        fontWeight: '600',
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    dangerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    dangerText: {
        color: colors.danger,
        fontSize: 14,
        fontWeight: '600',
    },
    aboutTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.text,
    },
    aboutText: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
        lineHeight: 19,
    },
    aboutCredits: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: spacing.md,
        lineHeight: 17,
    },
});
