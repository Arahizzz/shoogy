import { Stack } from 'expo-router';
import { HeaderButton, ScreenHeader } from '~/components/screenHeader';
import { $remove, $saveChanges } from './[id]';
import { Save, Trash2 } from '@tamagui/lucide-icons';
import { XStack } from 'tamagui';

export default function InsulinLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <ScreenHeader {...props} />,
      }}>
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
          headerRight: () => (
            <XStack>
              <HeaderButton onPress={() => $remove.next()} icon={<Trash2 color={'red'} />} />
              <HeaderButton onPress={() => $saveChanges.next()} icon={<Save color={'black'} />} />
            </XStack>
          ),
        }}
      />
    </Stack>
  );
}
