import { Alert, Platform } from 'react-native';

export async function confirmDelete(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return confirm('Are you sure you want to delete this?');
  } else
    return new Promise<boolean>((res) =>
      Alert.alert(
        'Confirm removal',
        'Are you sure you want to delete this?',
        [
          {
            text: 'Cancel',
            onPress: () => res(false),
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => res(true),
          },
        ],
        { cancelable: true, onDismiss: () => res(false) }
      )
    );
}
