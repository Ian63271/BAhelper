import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { colors } from "@/constants/theme";
import { UserDataProvider } from "@/context/UserDataContext";

export default function RootLayout() {
  return (
    <UserDataProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text, fontWeight: "700" },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="student/[id]" options={{ title: "Student" }} />
        <Stack.Screen name="tools/roster" options={{ title: "Roster Generator" }} />
        <Stack.Screen name="tools/bond" options={{ title: "Bond XP Calculator" }} />
      </Stack>
    </UserDataProvider>
  );
}
