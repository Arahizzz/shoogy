import { Pizza, Syringe, Trash2 } from '@tamagui/lucide-icons';
import { useObservablePickState } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import React, { useEffect } from 'react';
import { ColorValue } from 'react-native';
import { BehaviorSubject, first, map, Observable, of } from 'rxjs';
import { Button, ScrollView, Stack, styled, XStack, YStack } from 'tamagui';

import EditActivityChart, { Activity } from '~/components/edit-activity-chart';
import NumericInput from '~/components/numeric-input';
import TimeInput from '~/components/time-input';
import { Apidra } from '~/core/injection';
import { linkNext } from '~/core/rxjs';
import { getCurrentTick, incrementTick } from '~/core/time';

type ActivityState = Activity & { id: number };

class ActivityStore {
  private counter = 0;
  public activitiesState$ = new BehaviorSubject<BehaviorSubject<ActivityState>[]>([]);
  public startSugar$ = new BehaviorSubject(0);

  init(activities: Observable<ActivityState[]>, sugar: Observable<number>) {
    activities
      .pipe(
        first(),
        map((activities) => activities.map((activity) => new BehaviorSubject(activity)))
      )
      .subscribe(linkNext(this.activitiesState$));
    sugar.pipe(first()).subscribe(linkNext(this.startSugar$));
  }
  dispose() {
    this.activitiesState$.next([]);
    this.startSugar$.next(0);
    this.counter = 0;
  }

  newActivity(activityProps: Activity) {
    const activity$ = new BehaviorSubject<ActivityState>({
      id: --this.counter,
      ...activityProps,
    });
    this.activitiesState$.next([...this.activitiesState$.value, activity$]);
  }
  removeActivity(id: number) {
    this.activitiesState$.next(
      this.activitiesState$.value.filter((activity$) => activity$.value.id !== id)
    );
  }
}

const store = new ActivityStore();

// Data for the chart
const tick = getCurrentTick();
const pasta: ActivityState = {
  id: 0,
  type: 'meal',
  carbsCount: 100,
  carbsAbsorptionRatePerHr: 40,
  startTime: incrementTick(tick, 3),
};
const injection1: ActivityState = {
  id: 1,
  type: 'injection',
  activity: Apidra,
  insulinAmount: 4,
  startTime: tick,
};
const injection2: ActivityState = {
  id: 2,
  type: 'injection',
  activity: Apidra,
  insulinAmount: 5,
  startTime: incrementTick(tick, 7),
};
const injection3: ActivityState = {
  id: 3,
  type: 'injection',
  activity: Apidra,
  insulinAmount: 1,
  startTime: incrementTick(tick, 15),
};

export default function EditActivityScreen() {
  useEffect(() => {
    store.init(of([pasta, injection1, injection2, injection3]), of(5));
    return () => store.dispose();
  }, []);

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <YStack backgroundColor="whitesmoke" alignItems="center">
        <EditActivityChart activities$={store.activitiesState$} startSugar$={store.startSugar$} />
        <XStack justifyContent="center" gap={10}>
          {/*<StartSugarEdit />*/}
          <Button
            icon={<Pizza />}
            variant="outlined"
            backgroundColor="$orange10Light"
            width={150}
            onPress={() =>
              store.newActivity({
                type: 'meal',
                carbsCount: 0,
                carbsAbsorptionRatePerHr: 30,
                startTime: getCurrentTick(),
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
                type: 'injection',
                activity: Apidra,
                insulinAmount: 0,
                startTime: getCurrentTick(),
              })
            }>
            Injection
          </Button>
        </XStack>
      </YStack>
      <ActivitiesEdit />
    </ScrollView>
  );
}

function StartSugarEdit() {
  return (
    <NumericInput
      id="start-sugar"
      initialValue={of(5)}
      min={0}
      step={0.1}
      $changes={linkNext(store.startSugar$)}
    />
  );
}

function ActivitiesEdit() {
  const activities = useObservableState(store.activitiesState$);

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

function ActivityEdit({ activity$ }: { activity$: BehaviorSubject<ActivityState> }) {
  const { type } = useObservablePickState(activity$, activity$.value, 'type');

  return type === 'meal' ? (
    <MealEdit meal$={activity$ as BehaviorSubject<ActivityState & { type: 'meal' }>} />
  ) : (
    <InsulinEdit insulin$={activity$ as BehaviorSubject<ActivityState & { type: 'injection' }>} />
  );
}

function ActivityTimeEdit({
  activity$,
  color,
  fontColor,
}: {
  activity$: BehaviorSubject<ActivityState>;
  color?: ColorValue;
  fontColor?: ColorValue;
}) {
  return (
    <TimeInput
      color={color}
      fontColor={fontColor}
      id="time"
      initialValue={of(activity$.value.startTime)}
      $changes={{
        next: (startTime: number) => {
          activity$.next({ ...activity$.value, startTime });
        },
      }}
    />
  );
}

function DeleteButton({ id, color }: { id: number; color?: string }) {
  return (
    <Button
      variant="outlined"
      borderColor={undefined}
      paddingHorizontal={5}
      height={40}
      $xs={{ height: 30 }}
      onPress={() => store.removeActivity(id)}
      icon={<Trash2 color={color} size="$1" />}
    />
  );
}

function MealEdit({ meal$ }: { meal$: BehaviorSubject<ActivityState & { type: 'meal' }> }) {
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
        <DeleteButton id={meal$.value.id} color={color} />
        <ActivityTimeEdit
          color={color}
          fontColor={fontColor}
          activity$={meal$ as BehaviorSubject<ActivityState>}
        />
      </XStack>
      <XStack justifyContent="space-between">
        <NumericInput
          color={color}
          fontColor={fontColor}
          id="meal-carbs-absorption-rate"
          suffix="ᵍ⁄ₕ"
          initialValue={meal$.pipe(map((meal) => meal.carbsAbsorptionRatePerHr))}
          min={0}
          step={1}
          $changes={{
            next: (carbsAbsorptionRatePerHr: number) => {
              const prevMeal = meal$.value;
              meal$.next({ ...prevMeal, carbsAbsorptionRatePerHr });
            },
          }}
        />
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

function InsulinEdit({
  insulin$,
}: {
  insulin$: BehaviorSubject<ActivityState & { type: 'injection' }>;
}) {
  const color = '$blue10Light';
  const fontColor = '$blue8Dark';

  return (
    <ActivityEditCard backgroundColor="rgba(0, 106, 220, 0.25)">
      <SyringeIcon />
      <XStack>
        <DeleteButton id={insulin$.value.id} color={color} />
        <ActivityTimeEdit
          color={color}
          fontColor={fontColor}
          activity$={insulin$ as BehaviorSubject<ActivityState>}
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

const SyringeIcon = () => <Syringe {...cornerIconPosition} color={'$blue10Light'} />;
const PizzaIcon = () => <Pizza {...cornerIconPosition} color={'$orange10Light'} />;
