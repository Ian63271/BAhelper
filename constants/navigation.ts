import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

import { colors } from '@/constants/theme';

// Shared header styling for every Stack in the app (root stack + per-tab stacks).
export const stackScreenOptions: NativeStackNavigationOptions = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.primary,
    headerTitleStyle: { color: colors.text, fontWeight: '700' },
    headerTitleAlign: 'center',
    headerShadowVisible: false,
    // Chevron-only back button — otherwise iOS labels it with the previous
    // route's name, which for tab screens is the literal "(tabs)" group name.
    headerBackButtonDisplayMode: 'minimal',
    contentStyle: { backgroundColor: colors.background },
};
