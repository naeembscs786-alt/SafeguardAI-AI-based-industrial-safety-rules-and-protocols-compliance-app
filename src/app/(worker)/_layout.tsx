import { Stack } from "expo-router";

export default function WorkerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="worker_dashboard" />
      <Stack.Screen name="ai_assistant" />
      <Stack.Screen name="report_incident" />
      <Stack.Screen name="get_assigned_module" />
      <Stack.Screen name="sos_alerts" />
      <Stack.Screen name="simulations" />
      <Stack.Screen name="risk_zone" />
    </Stack>
  );
}

