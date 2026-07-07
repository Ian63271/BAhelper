import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/constants/navigation';

export default function ToolsLayout() {
    return (
        <Stack screenOptions={stackScreenOptions}>
            <Stack.Screen name="index" options={{ title: 'Tools' }} />
        </Stack>
    );
}
