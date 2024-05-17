import { Stack } from 'expo-router';

export default function ActivitiesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Activities',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Edit Activities',
        }}
      />
    </Stack>
  );
}
