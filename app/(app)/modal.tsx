import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { Paragraph, Separator, Theme, YStack } from 'tamagui';

export default function ModalScreen() {
  return (
    <Theme name="light">
      <YStack flex={1} alignItems="center" justifyContent="center">
        <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
        <Paragraph>Modal</Paragraph>
        <Separator />
      </YStack>
    </Theme>
  );
}
