import { Stack } from 'expo-router';
import { ScreenHeader } from '~/components/screenHeader';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        header: (props) => <ScreenHeader {...props} />,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="insulin"
        options={{
          title: 'Insulin Types',
        }}
      />
      <Stack.Screen
        name="food"
        options={{
          title: 'Meal Types',
        }}
      />
    </Stack>
  );
}
