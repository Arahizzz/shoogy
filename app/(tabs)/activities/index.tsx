import { Link } from 'expo-router';
import { Button, YStack } from 'tamagui';

export default function CombinedScreen() {
  return (
    <YStack alignItems="center">
      <Link href="/(tabs)/activities/edit" asChild>
        <Button maxWidth="250px">New Activity</Button>
      </Link>
    </YStack>
  );
}
