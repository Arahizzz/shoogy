import { useObservable, useSubscription } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import { useEffect, useState } from 'react';
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
  tap,
} from 'rxjs';
import { Button, XStack, YStack } from 'tamagui';
import { match, P } from 'ts-pattern';

import LineChart from '~/components/line-chart';
import { getChartMarkers } from '~/core/chart';
import { Apidra, Injection } from '~/core/injection';
import { Meal } from '~/core/meal';
import { linkNext } from '~/core/rxjs';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick } from '~/core/time';
import NumericInput from '~/components/numeric-input';

type Activity =
  | {
      id: string;
      type: 'meal';
      options: Meal;
    }
  | {
      id: string;
      type: 'injection';
      options: Injection;
    };

const mapActivity = (activity: Meal | Injection): Activity =>
  match(activity)
    .returnType<Activity>()
    .with(P.instanceOf(Meal), (meal) => ({
      id: crypto.randomUUID(),
      type: 'meal',
      options: meal as Meal,
    }))
    .with(P.instanceOf(Injection), (injection) => ({
      id: crypto.randomUUID(),
      type: 'injection',
      options: injection,
    }))
    .exhaustive();

class ActivityStore {
  private activities = new BehaviorSubject<BehaviorSubject<Activity>[]>([]);
  public startSugar = new BehaviorSubject(0);
  public activities$ = this.activities.pipe(switchMap((activities) => combineLatest(activities)));
  public plotInfo$ = this.activities$.pipe(
    combineLatestWith(this.startSugar),
    debounceTime(300),
    map(([activities, startSugar]) => {
      const xs = new Float64Array(60).map((_, i) => incrementTick(tick, i));
      const influences = activities.map((activity) => activity.options);
      const activityPlot = getCombinedSugarPlot(xs, influences, startSugar);
      const markPoint = getChartMarkers(influences);

      return { xs, ys: activityPlot.ys, markPoint };
    })
  );

  init(activities: Observable<(Meal | Injection)[]>, sugar: Observable<number>) {
    activities
      .pipe(
        first(),
        map((activities) =>
          activities.map((activity) => new BehaviorSubject(mapActivity(activity)))
        )
      )
      .subscribe(linkNext(this.activities));
    sugar.pipe(first()).subscribe(linkNext(this.startSugar));
  }
  dispose() {
    this.activities.next([]);
    this.startSugar.next(0);
  }
  newActivity(activity: Meal | Injection) {
    this.activities.next([...this.activities.value, new BehaviorSubject(mapActivity(activity))]);
  }
  removeActivity(id: string) {
    this.activities.next(this.activities.value.filter((activity$) => activity$.value.id !== id));
  }
}

const store = new ActivityStore();

// Data for the chart
const tick = getCurrentTick();
const pasta = new Meal(100, 40, incrementTick(tick, 3));
const injection1 = new Injection(Apidra, 4, tick);
const injection2 = new Injection(Apidra, 5, incrementTick(tick, 7));
const injection3 = new Injection(Apidra, 1, incrementTick(tick, 15));

export default function EditActivityScreen() {
  useEffect(() => {
    store.init(of([pasta, injection1, injection2, injection3]), of(5));
    return () => store.dispose();
  }, []);

  return (
    <YStack alignItems="center">
      <ActivityChart />
      <StartSugarEdit />
      <Button onPress={() => store.newActivity(new Injection(Apidra, 3, getCurrentTick()))}>
        Add Injection
      </Button>
    </YStack>
  );
}
function ActivityChart() {
  return <LineChart data$={store.plotInfo$} title="Sugar Influence" />;
}

function StartSugarEdit() {
  return (
    <NumericInput
      id={'start-sugar'}
      initialValue={of(5)}
      min={0}
      step={0.1}
      $changes={linkNext(store.startSugar)}
    />
  );
}
