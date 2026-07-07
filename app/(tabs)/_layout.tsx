import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { Platform } from 'react-native';

import { colors } from '@/constants/theme';

export default function TabLayout() {
    // Native tab bar on iOS — gets the system Liquid Glass treatment on iOS 26.
    // Headers come from each tab's own Stack layout (students/tools/settings),
    // so NativeTabs not rendering headers is fine.
    if (Platform.OS === 'ios') {
        return (
            <NativeTabs tintColor={colors.primary}>
                <NativeTabs.Trigger name="index">
                    <Label>Home</Label>
                    <Icon sf={{ default: 'house', selected: 'house.fill' }} />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="students">
                    <Label>Students</Label>
                    <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="tools">
                    <Label>Tools</Label>
                    <Icon sf={{ default: 'wrench.and.screwdriver', selected: 'wrench.and.screwdriver.fill' }} />
                </NativeTabs.Trigger>
                <NativeTabs.Trigger name="settings">
                    <Label>Settings</Label>
                    <Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} />
                </NativeTabs.Trigger>
            </NativeTabs>
        );
    }

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                // Headers are rendered by each tab's own Stack layout.
                headerShown: false,
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
