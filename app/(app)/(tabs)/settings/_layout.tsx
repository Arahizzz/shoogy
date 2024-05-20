import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="insulin"
        options={{
          title: 'Insulin Types',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="food"
        options={{
          title: 'Meal Types',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
