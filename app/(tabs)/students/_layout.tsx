import { Stack } from 'expo-router';

import { stackScreenOptions } from '@/constants/navigation';

export default function StudentsLayout() {
    return (
        <Stack screenOptions={stackScreenOptions}>
            <Stack.Screen name="index" options={{ title: 'Students' }} />
        </Stack>
    );
}
