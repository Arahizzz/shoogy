import { useObservable } from 'observable-hooks';
import {
  combineLatest,
  combineLatestWith,
  debounceTime,
  filter,
  first,
  map,
  Observable,
  startWith,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { match } from 'ts-pattern';

import ScatterChart from '~/components/scatter-chart';
import { getChartMarkers } from '~/core/chart';
import { InjectionCalculation } from '~/core/calculations/injection';
import { MealCalculation } from '~/core/calculations/meal';
import { Activity, PopulatedActivity } from '~/core/models/activity';
import { PopulatedInjection } from '~/core/models/injection';
import { PopulatedMeal } from '~/core/models/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { incrementTick, timeToTick } from '~/core/time';
import { isDefined, throwIfNull } from '~/core/utils';
import { Profile } from '~/core/models/profile';
import { GlucoseEntry } from '~/core/models/glucoseEntry';
import {
  indexScreenCurrentSeries,
  indexScreenPrognosisSeries,
  SeriesProps,
} from '~/core/chart/series';
import { db } from '~/core/db';

type ActivityFunction = MealCalculation | InjectionCalculation;

export default function IndexActivityChart() {
  const populateActivity = (activity: Activity): Observable<PopulatedActivity> => {
    return match(activity)
      .returnType<Observable<PopulatedActivity>>()
      .with({ type: 'meal' }, (meal): Observable<PopulatedMeal> => {
        return db.meal_types.findOne(meal.mealType).$.pipe(
          throwIfNull(),
          map((mealType) => ({ ...meal, mealType }))
        );
      })
      .with({ type: 'insulin' }, (injection): Observable<PopulatedInjection> => {
        return db.insulin_types.findOne(injection.insulinType).$.pipe(
          throwIfNull(),
          map((insulinType) => ({ ...injection, insulinType }))
        );
      })
      .exhaustive();
  };
  const initializeCalculation = (populatedActivity: PopulatedActivity): ActivityFunction => {
    return match(populatedActivity)
      .returnType<ActivityFunction>()
      .with({ type: 'meal' }, (meal) => new MealCalculation(meal))
      .with({ type: 'insulin' }, (injection) => new InjectionCalculation(injection))
      .exhaustive();
  };
  const calculatePrediction = (
    activities: ActivityFunction[],
    startSugar: GlucoseEntry,
    profile: Profile
  ): SeriesProps => {
    console.log(activities, startSugar, profile);
    const startTick = startSugar.tick;
    const endTick =
      Math.max(...activities.map((activity) => activity.startTick + activity.durationTicks)) + 6;
    const xs = new Float64Array(endTick - startTick).map((_, i) => incrementTick(startTick, i));
    const activityPlot = getCombinedSugarPlot(xs, activities, startSugar.sugar, profile);
    const markLineData = getChartMarkers(activities);

    return { xs, ys: activityPlot.ys, markLineData };
  };

  // Reactive pipeline
  const twelveHoursAgo = timer(0, 1000 * 60 * 5).pipe(map(() => Date.now() - 12 * 60 * 60 * 1000));
  const twelveHoursAgoTick = twelveHoursAgo.pipe(map(timeToTick));
  const profile$ = useObservable(() =>
    db.states.profile_settings.selectedProfileId$.pipe(
      throwIfNull(),
      switchMap((id) => db.profiles.findOne(id).$.pipe(throwIfNull()))
    )
  );
  const latestSugar$ = useObservable(
    () =>
      twelveHoursAgo.pipe(
        switchMap(
          (time) =>
            db.glucose_entries.find({
              sort: [{ date: 'asc' }],
              selector: {
                date: { $gt: time },
              },
            }).$
        )
      ),
    []
  ).pipe(filter((a) => a.length > 0));
  const meals$ = useObservable(() =>
    twelveHoursAgoTick.pipe(
      switchMap((tick) => db.meals.find({ selector: { startTick: { $gte: tick } } }).$),
      map((meals) => meals.map((meal) => meal._data))
    )
  );
  const injections$ = useObservable(() =>
    twelveHoursAgoTick.pipe(
      switchMap((tick) => db.injections.find({ selector: { startTick: { $gte: tick } } }).$),
      map((injections) => injections.map((injection) => injection._data))
    )
  );
  const activities$ = useObservable(() => combineLatest([meals$, injections$]));
  const latestActivities$ = useObservable(() =>
    activities$.pipe(
      map((activities) => activities.flat()),
      map((activities) =>
        activities.map((activity) => {
          return populateActivity(activity).pipe(map(initializeCalculation));
        })
      ),
      switchMap((activities) => combineLatest(activities)),
      debounceTime(300)
    )
  );
  const prognosis$ = useObservable(() =>
    latestActivities$.pipe(
      combineLatestWith(latestSugar$, profile$),
      map(([activities, latestSugar, profile]) => {
        return calculatePrediction(activities, latestSugar[latestSugar.length - 1]._data, profile);
      }),
      map((data) => indexScreenPrognosisSeries(data)),
      startWith(undefined)
    )
  );
  const currentSugar$ = useObservable(() =>
    latestSugar$.pipe(
      map((sugars) => {
        return {
          xs: new Float64Array(sugars.length).map((_, i) => sugars[i].tick),
          ys: new Float64Array(sugars.length).map((_, i) => sugars[i].sugar),
          markLineData: [],
        } satisfies SeriesProps;
      }),
      map((data) => indexScreenCurrentSeries(data)),
      startWith(undefined)
    )
  );
  const dataZoom$ = useObservable(() =>
    latestSugar$.pipe(
      filter((sugars) => sugars.length > 0),
      map((sugars) => {
        return [
          {
            type: 'inside',
            start: 60,
          },
          {
            type: 'slider',
            start: 60,
          },
        ] satisfies echarts.DataZoomComponentOption[];
      }),
      first(),
      tap(console.debug)
    )
  );

  return <ScatterChart dataZoom={dataZoom$} series={[currentSugar$, prognosis$]} />;
}
