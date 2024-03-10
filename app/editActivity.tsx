import { useObservableState } from 'observable-hooks/src';
import React, { useEffect } from 'react';
import {
  BehaviorSubject,
  combineLatest,
  combineLatestWith,
  debounceTime,
  first,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { Adapt, Button, ScrollView, Select, Sheet, XGroup, XStack, YStack } from 'tamagui';
import { match, P } from 'ts-pattern';

import ScatterChart from '~/components/scatter-chart';
import { getChartMarkers } from '~/core/chart';
import { Apidra, Injection, InjectionParams } from '~/core/injection';
import { Meal, MealParams } from '~/core/meal';
import { linkNext } from '~/core/rxjs';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick } from '~/core/time';
import NumericInput from '~/components/numeric-input';
import { ChevronDown, Delete } from '@tamagui/lucide-icons';
import CombinedChart, { Activity } from '~/components/combined-chart';

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
      <YStack backgroundColor={'whitesmoke'} alignItems="center">
        <CombinedChart activities$={store.activitiesState$} startSugar$={store.startSugar$} />
        <XStack>
          <StartSugarEdit />
          <Button
            onPress={() =>
              store.newActivity({
                type: 'injection',
                activity: Apidra,
                insulinAmount: 3,
                startTime: getCurrentTick(),
              })
            }>
            Add Activity
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
      id={'start-sugar'}
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
    <YStack alignItems={'flex-start'}>
      {activities.map((activity$) => (
        <ActivityEdit key={activity$.value.id.toString()} activity$={activity$} />
      ))}
    </YStack>
  );
}

function ActivityEdit({ activity$ }: { activity$: BehaviorSubject<ActivityState> }) {
  const editor = useObservableState(() =>
    activity$.pipe(
      map((activity) => {
        return match(activity.type)
          .returnType<React.JSX.Element>()
          .with('meal', () => (
            <MealEdit
              key={activity.id}
              meal$={activity$ as unknown as BehaviorSubject<MealParams>}
            />
          ))
          .with('injection', () => (
            <InsulinEdit
              key={activity.id}
              insulin$={activity$ as unknown as BehaviorSubject<InjectionParams>}
            />
          ))
          .exhaustive();
      })
    )
  );

  return (
    <XGroup marginVertical={5}>
      <ActivityTimeEdit activity$={activity$} />
      <ActivityTypeSelector activity$={activity$} />
      {editor}
      <DeleteButton activity$={activity$} />
    </XGroup>
  );
}

function ActivityTimeEdit({ activity$ }: { activity$: BehaviorSubject<ActivityState> }) {
  const activity = useObservableState(activity$);

  return (
    <NumericInput
      id={'time'}
      initialValue={of(activity.startTime)}
      step={1}
      $changes={{
        next: (startTime: number) => {
          activity$.next({ ...activity, startTime });
        },
      }}
    />
  );
}

function DeleteButton({ activity$ }: { activity$: BehaviorSubject<ActivityState> }) {
  const activity = useObservableState(activity$);
  return (
    <Button
      backgroundColor={'red'}
      onPress={() => store.removeActivity(activity.id)}
      icon={<Delete color={'white'} />}></Button>
  );
}

function ActivityTypeSelector({ activity$ }: { activity$: BehaviorSubject<ActivityState> }) {
  const activity = useObservableState(activity$);

  const changeType = (type: 'meal' | 'injection') => {
    const newActivity = match(type)
      .returnType<ActivityState>()
      .with('meal', () => ({
        id: activity.id,
        type: 'meal',
        carbsCount: 100,
        carbsAbsorptionRatePerHr: 40,
        startTime: getCurrentTick(),
      }))
      .with('injection', () => ({
        id: activity.id,
        type: 'injection',
        activity: Apidra,
        insulinAmount: 5,
        startTime: getCurrentTick(),
      }))
      .exhaustive();

    console.log('newActivity', newActivity);

    activity$.next(newActivity);
  };

  return (
    <Select value={activity.type} onValueChange={changeType}>
      <Select.Trigger
        height={40}
        width={85}
        fontSize={15}
        paddingVertical={0}
        backgroundColor={'whitesmoke'}
        iconAfter={<ChevronDown color={'black'} />}>
        <Select.Value placeholder="Something" />
      </Select.Trigger>
      <Adapt platform="touch">
        <Sheet
          native
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.Viewport>
          <Select.Item value={'meal'} index={0}>
            <Select.ItemText>🥞</Select.ItemText>
          </Select.Item>
          <Select.Item value={'injection'} index={1}>
            <Select.ItemText>💉</Select.ItemText>
          </Select.Item>
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}

function MealEdit({ meal$ }: { meal$: BehaviorSubject<MealParams> }) {
  return (
    <XGroup>
      <NumericInput
        id={'meal-carbs'}
        suffix={'g'}
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
      <NumericInput
        id={'meal-carbs-absorption-rate'}
        suffix={'g/h'}
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
    </XGroup>
  );
}

function InsulinEdit({ insulin$ }: { insulin$: BehaviorSubject<InjectionParams> }) {
  return (
    <XGroup>
      <NumericInput
        id={'insulin-amount'}
        suffix={'U'}
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
    </XGroup>
  );
}
