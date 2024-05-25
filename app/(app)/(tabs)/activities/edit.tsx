import { Pizza, Syringe, Trash2 } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useObservable, useObservablePickState } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import React, { useEffect } from 'react';
import { ColorValue } from 'react-native';
import { BehaviorSubject, distinctUntilChanged, firstValueFrom, map, of } from 'rxjs';
import { Button, ScrollView, Stack, styled, XStack, YStack } from 'tamagui';

import EditActivityChart from '~/components/chart/edit-activity-chart';
import NumericInput from '~/components/input/numericInput';
import TimeInput from '~/components/input/timeInput';
import { Activity } from '~/core/models/activity';
import { Injection } from '~/core/models/injection';
import { Meal } from '~/core/models/meal';
import { getCurrentTick } from '~/core/time';
import { db } from '~/core/db';
import type { MangoQuery, RxDocument } from 'rxdb/src/types';
import { cancelActivityNotification, scheduleActivityNotification } from '~/core/notifications';
import { uuidv4 } from '@firebase/util';
import { ValueSelect } from '~/components/input/valueSelect';
import { twelveHoursAgoTick$ } from '~/core/data/time';
import { mealTypesSelect$ } from '~/core/data/profile';

export type ActivityForm = Activity & {
  notify?: boolean;
  toDelete?: boolean;
};

class ActivityStore {
  public activitiesState$ = new BehaviorSubject<BehaviorSubject<ActivityForm>[]>([]);

  async init() {
    const twelveHoursAgoTick = await firstValueFrom(twelveHoursAgoTick$);
    const query: MangoQuery<{ startTick: number }> = {
      selector: {
        startTick: { $gte: twelveHoursAgoTick },
      },
    };
    const meals = await db.meals.find(query).exec();
    const injections = await db.injections.find(query).exec();
    const activities = [...meals, ...injections]
      .sort((a, b) => a.startTick - b.startTick)
      .map(
        (activity) =>
          new BehaviorSubject<ActivityForm>({
            ...activity._data,
            notify: !!activity._data.notificationId,
          })
      );

    this.activitiesState$.next(activities);
  }
  dispose() {
    this.activitiesState$.next([]);
  }

  newActivity(activityProps: Omit<Meal, 'id'> | Omit<Injection, 'id'>) {
    const activity$ = new BehaviorSubject<Activity>({
      id: uuidv4(),
      ...activityProps,
    });
    this.activitiesState$.next([...this.activitiesState$.value, activity$]);
  }
  async saveChanges() {
    for (const a$ of this.activitiesState$.value) {
      const activity = a$.value;
      const collection = activity.type === 'meal' ? db.meals : db.injections;
      const doc = await collection.findOne(activity.id).exec();

      if (activity.toDelete) {
        if (doc) {
          await doc.remove();
          if (doc.notificationId) await cancelActivityNotification(doc);
        }
      } else {
        await this.refreshNotificationState(activity, doc);
        // @ts-ignore
        await collection.upsert(activity);
      }
    }
  }

  private async refreshNotificationState(
    activity: ActivityForm,
    prevDoc: RxDocument<Injection> | RxDocument<Meal> | null
  ) {
    if (
      prevDoc &&
      (prevDoc.notificationId !== activity.notificationId ||
        prevDoc.startTick !== activity.startTick)
    ) {
      await cancelActivityNotification(prevDoc);
      activity.notificationId = undefined;
    }

    if (activity.notify && !activity.notificationId) {
      activity.notificationId = await scheduleActivityNotification(activity);
    }

    activity.notify = undefined;
  }
}

const store = new ActivityStore();

export const onActivitiesEditSave = async () => {
  await store.saveChanges();
  router.back();
};

export default function EditActivityScreen() {
  useEffect(() => {
    store.init().catch(console.error);
    return () => store.dispose();
  }, []);

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <YStack backgroundColor="whitesmoke" alignItems="center">
        <EditActivityChart activities$={store.activitiesState$} />
        <XStack justifyContent="center" gap={10}>
          <Button
            icon={<Pizza />}
            variant="outlined"
            backgroundColor="$orange10Light"
            width={150}
            onPress={() =>
              store.newActivity({
                type: 'meal',
                carbsCount: 30,
                mealType: 'medium-gi',
                startTick: getCurrentTick(),
              })
            }>
            Meal
          </Button>
          <Button
            icon={<Syringe />}
            variant="outlined"
            backgroundColor="$blue10Light"
            width={150}
            onPress={() =>
              store.newActivity({
                type: 'insulin',
                insulinType: 'Apidra',
                insulinAmount: 4,
                startTick: getCurrentTick(),
              })
            }>
            Injection
          </Button>
        </XStack>
        <ActivitiesEdit />
      </YStack>
    </ScrollView>
  );
}

function ActivitiesEdit() {
  const activities = useObservableState(store.activitiesState$, []);

  return (
    <YStack
      alignItems="stretch"
      alignSelf="center"
      marginTop={10}
      marginHorizontal={15}
      maxWidth={600}
      width="90%">
      {activities.map((activity$) => (
        <ActivityEdit key={activity$.value.id.toString()} activity$={activity$} />
      ))}
    </YStack>
  );
}

function ActivityEdit({ activity$ }: { activity$: BehaviorSubject<ActivityForm> }) {
  const { type, toDelete } = useObservablePickState(activity$, activity$.value, 'type', 'toDelete');

  if (toDelete) return <></>;

  return type === 'meal' ? (
    <MealEdit meal$={activity$ as BehaviorSubject<Meal>} />
  ) : (
    <InsulinEdit insulin$={activity$ as BehaviorSubject<Injection>} />
  );
}

function ActivityTimeEdit({
  activity$,
  color,
  fontColor,
}: {
  activity$: BehaviorSubject<Activity>;
  color?: ColorValue;
  fontColor?: ColorValue;
}) {
  return (
    <TimeInput
      color={color}
      fontColor={fontColor}
      id="time"
      initialValue={of(activity$.value.startTick)}
      $changes={{
        next: (startTick: number) => {
          activity$.next({ ...activity$.value, startTick });
        },
      }}
    />
  );
}

function DeleteButton({
  activity$,
  color,
}: {
  activity$: BehaviorSubject<ActivityForm>;
  color: string;
}) {
  const onRemove = () => {
    activity$.next({ ...activity$.value, toDelete: true });
  };

  return (
    <Button
      variant="outlined"
      borderColor={undefined}
      paddingHorizontal={5}
      height={40}
      $xs={{ height: 30 }}
      onPress={onRemove}
      icon={<Trash2 color={color} size="$1" />}
    />
  );
}

function MealEdit({ meal$ }: { meal$: BehaviorSubject<Meal> }) {
  const color = '$orange10Light';
  const fontColor = '$orange8Dark';

  return (
    <ActivityEditCard
      backgroundColor="rgba(237, 95, 0, 0.25)"
      $xs={{
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 5,
      }}>
      <PizzaIcon />
      <XStack justifyContent="space-between">
        <DeleteButton activity$={meal$ as BehaviorSubject<ActivityForm>} color={color} />
        <ActivityTimeEdit
          color={color}
          fontColor={fontColor}
          activity$={meal$ as BehaviorSubject<Activity>}
        />
      </XStack>
      <XStack justifyContent="space-between">
        <MealTypeEdit meal$={meal$} />
        <NumericInput
          color={color}
          fontColor={fontColor}
          id="meal-carbs"
          suffix="g"
          initialValue={meal$.pipe(map((meal) => meal.carbsCount))}
          min={0}
          step={1}
          $changes={{
            next: (carbsCount: number) => {
              const prevMeal = meal$.value;
              meal$.next({ ...prevMeal, carbsCount });
            },
          }}
        />
      </XStack>
    </ActivityEditCard>
  );
}

function MealTypeEdit({ meal$ }: { meal$: BehaviorSubject<Meal> }) {
  const mealType$ = useObservable(() =>
    meal$.pipe(
      map((meal) => meal.mealType),
      distinctUntilChanged()
    )
  );
  const mealOptions$ = useObservable(() => mealTypesSelect$);
  const changeType = (mealType: string) => {
    const prevMeal = meal$.value;
    meal$.next({ ...prevMeal, mealType });
  };

  return <ValueSelect value$={mealType$} options$={mealOptions$} onChange={changeType} />;
}

function InsulinEdit({ insulin$ }: { insulin$: BehaviorSubject<Injection> }) {
  const color = '$blue10Light';
  const fontColor = '$blue8Dark';

  return (
    <ActivityEditCard backgroundColor="rgba(0, 106, 220, 0.25)">
      <SyringeIcon />
      <XStack>
        <DeleteButton activity$={insulin$ as BehaviorSubject<ActivityForm>} color={color} />
        <ActivityTimeEdit
          color={color}
          fontColor={fontColor}
          activity$={insulin$ as BehaviorSubject<Activity>}
        />
      </XStack>
      <XStack>
        <NumericInput
          color={color}
          fontColor={fontColor}
          id="insulin-amount"
          suffix="U"
          initialValue={insulin$.pipe(map((injection) => injection.insulinAmount))}
          min={0}
          step={1}
          $changes={{
            next: (insulinAmount: number) => {
              const prevInjection = insulin$.value;
              insulin$.next({ ...prevInjection, insulinAmount });
            },
          }}
        />
      </XStack>
    </ActivityEditCard>
  );
}

const ActivityEditCard = styled(Stack, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignSelf: 'stretch',
  padding: 10,
  borderRadius: 7,
  marginVertical: 5,
  $sm: {
    paddingHorizontal: 3,
  },
});

const cornerIconPosition = {
  position: 'absolute',
  top: -15,
  left: -10,
  height: 30,
} as const;

const SyringeIcon = () => <Syringe {...cornerIconPosition} color="$blue10Light" />;
const PizzaIcon = () => <Pizza {...cornerIconPosition} color="$orange10Light" />;
