import { throwError } from 'rxjs';
import { Activity } from '~/core/models/activity';

const err = new Error('Notifications are currently not supported on the web.');

export const notificationPermissionState$ = throwError(() => err);

export async function scheduleActivityNotification(activity: Activity) {
  throw err;
}

export async function cancelActivityNotification(activity: Activity) {
  throw err;
}
