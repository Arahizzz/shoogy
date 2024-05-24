import { Stack } from 'expo-router';
import { HeaderButton, ScreenHeader } from '~/components/screenHeader';
import { XStack } from 'tamagui';
import { $remove, $saveChanges } from './[id]';
import { Save, Trash, Trash2 } from '@tamagui/lucide-icons';

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        header: (props) => <ScreenHeader {...props} />,
      }}>
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
