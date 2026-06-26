import { Stack } from "expo-router";

export default function OfficerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="officer_dashboard" />
      <Stack.Screen name="sos_logs" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}