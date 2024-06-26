import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { useObservableState } from 'observable-hooks';
import { Bell, BellOff } from '@tamagui/lucide-icons';
import { Button } from 'tamagui';
import React from 'react';
import { ActivityForm } from '~/app/(app)/(tabs)/activities/edit';
import { notificationPermissionState$ } from '~/core/notifications';

export type ReminderButtonProps = {
  activity$: BehaviorSubject<ActivityForm>;
  color: string;
};

export function ReminderButton({ activity$, color }: ReminderButtonProps) {
  const activity = useObservableState(activity$, activity$.value);

  const toggleReminder = async () => {
    if (!activity.notify && (await firstValueFrom(notificationPermissionState$))) {
      activity$.next({ ...activity, notificationId: undefined, notify: true });
    } else {
      activity$.next({ ...activity, notify: false });
    }
  };

  return (
    <Button
      variant="outlined"
      borderColor={undefined}
      paddingHorizontal={5}
      height={40}
      $xs={{ height: 30 }}
      onPress={toggleReminder}
      icon={
        activity.notify ? <Bell color={color} size="$1" /> : <BellOff color={color} size="$1" />
      }
    />
  );
}
