import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="admin_dashboard" />
      <Stack.Screen name="ppe_detection" />
      <Stack.Screen name="manage_zones" />
      <Stack.Screen name="module_list" />
      <Stack.Screen name="create_module" />
      <Stack.Screen name="manage_simulations" />
    </Stack>
  );
}