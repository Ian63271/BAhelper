import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

import { colors } from "@/constants/theme";

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                headerStyle: {
                    backgroundColor: colors.surface,
                },
                headerShadowVisible: false,
                headerTintColor: colors.text,
                headerTitleStyle: { fontWeight: '700' },
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    headerShown: false,
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="students"
                options={{
                    title: 'Students',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'people-sharp' : 'people-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="tools"
                options={{
                    title: 'Tools',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'construct' : 'construct-outline'} color={color} size={24} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24} />
                    ),
                }}
            />
        </Tabs>
    );
}
