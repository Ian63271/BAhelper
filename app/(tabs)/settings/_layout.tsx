import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/constants/navigation';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={stackScreenOptions}>
            <Stack.Screen name="index" options={{ title: 'Settings' }} />
        </Stack>
    );
}
