import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { stackScreenOptions } from "@/constants/navigation";
import { UserDataProvider } from "@/context/UserDataContext";

export default function RootLayout() {
  return (
    <UserDataProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={stackScreenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="student/[id]" options={{ title: "Student" }} />
        <Stack.Screen name="tools/roster" options={{ title: "Roster Generator" }} />
        <Stack.Screen name="tools/bond" options={{ title: "Bond XP Calculator" }} />
        <Stack.Screen name="tools/banners" options={{ title: "Banners" }} />
        <Stack.Screen name="tools/inventory" options={{ title: "Inventory Helper" }} />
      </Stack>
    </UserDataProvider>
  );
}
