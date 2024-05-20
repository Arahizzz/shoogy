import { Stack } from 'expo-router';

export default function InsulinLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Insulin Types',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Edit Insulin Type',
        }}
      />
    </Stack>
  );
}
