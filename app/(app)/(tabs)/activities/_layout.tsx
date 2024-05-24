import { Stack } from 'expo-router';
import { Check } from '@tamagui/lucide-icons';
import { HeaderButton, ScreenHeader } from '~/components/screenHeader';
import { onActivitiesEditSave } from './edit';

export default function ActivitiesLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <ScreenHeader {...props} />,
      }}>
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
          headerRight: () => (
            <HeaderButton onPress={onActivitiesEditSave} icon={<Check color={'black'} />} />
          ),
        }}
      />
    </Stack>
  );
}
