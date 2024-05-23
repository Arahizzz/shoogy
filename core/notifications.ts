import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { defer, map, shareReplay } from 'rxjs';
import { Activity } from '~/core/models/activity';
import { tickToTime } from '~/core/time';

async function ensureNotificationPermissions() {
  if (Platform.OS === 'ios') {
    // IOS
    await notifee.requestPermission({
      alert: true,
      criticalAlert: true,
      sound: true,
      badge: false,
    });
  } else if (Platform.OS === 'android') {
    // Android
    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      badge: false,
      sound: 'default',
      bypassDnd: true,
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
    });
  }
}

export const notificationPermissionState$ = defer(() => ensureNotificationPermissions()).pipe(
  map(() => true),
  shareReplay(1)
);

export async function scheduleActivityNotification(activity: Activity) {
  // Create a time-based trigger
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: tickToTime(activity.startTick),
  };
  // Schedule a notification
  return await notifee.createTriggerNotification(
    {
      title: activity.type === 'meal' ? 'Time to eat!' : 'Time for injection!',
      body:
        activity.type === 'meal'
          ? `Eat ${activity.carbsCount}g at ${tickToTime(activity.startTick).toLocaleString()}`
          : `Inject ${activity.insulinAmount}U at ${tickToTime(activity.startTick).toLocaleString()}`,
      android: {
        channelId: 'default',
      },
      ios: {
        critical: true,
      },
    },
    trigger
  );
}

export async function cancelActivityNotification(activity: Activity) {
  if (!activity.notificationId) return;
  // Cancel a notification
  await notifee.cancelNotification(activity.notificationId);
}
