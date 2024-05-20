import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Meal Types',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Edit Meal Type',
        }}
      />
    </Stack>
  );
}
