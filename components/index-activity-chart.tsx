import { useObservable } from 'observable-hooks';
import {
  combineLatest,
  combineLatestAll,
  combineLatestWith,
  concatAll,
  debounceTime,
  filter,
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
import { useDb } from '~/core/db';
import { InjectionCalculation } from '~/core/injectionCalculation';
import { MealCalculation } from '~/core/mealCalculation';
import { Activity, PopulatedActivity } from '~/core/models/activity';
import { PopulatedInjection } from '~/core/models/injection';
import { PopulatedMeal } from '~/core/models/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { incrementTick, timeToTick } from '~/core/time';
import { throwIfNull } from '~/core/utils';
import { Profile } from '~/core/models/profile';
import { GlucoseEntry } from '~/core/models/glucoseEntry';
import { prognosisSeries } from '~/core/chart/series';

type ActivityFunction = MealCalculation | InjectionCalculation;

export default function IndexActivityChart() {
  const db = useDb();

  const populateActivity = (activity: Activity): Observable<PopulatedActivity> => {
    return match(activity)
      .returnType<Observable<PopulatedActivity>>()
      .with({ type: 'meal' }, (meal): Observable<PopulatedMeal> => {
        return db.meal_types.findOne(meal.mealType).$.pipe(
          throwIfNull(),
          map((mealType) => ({ ...meal, mealType }))
        );
      })
      .with({ type: 'injection' }, (injection): Observable<PopulatedInjection> => {
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
      .with({ type: 'injection' }, (injection) => new InjectionCalculation(injection))
      .exhaustive();
  };
  const calculatePrediction = (
    activities: ActivityFunction[],
    startSugar: GlucoseEntry,
    profile: Profile
  ) => {
    console.log(activities, startSugar, profile);
    const startTick = startSugar.tick;
    const endTick =
      Math.max(...activities.map((activity) => activity.startTick + activity.durationTicks)) + 6;
    const xs = new Float64Array(endTick - startTick).map((_, i) => incrementTick(startTick, i));
    const activityPlot = getCombinedSugarPlot(xs, activities, startSugar.sugar, profile);
    const markLine = getChartMarkers(activities);

    return { xs, ys: activityPlot.ys, markLine };
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
      map((data) => prognosisSeries(data)),
      startWith(undefined)
    )
  );
  const currentSugar$ = useObservable(() =>
    latestSugar$.pipe(
      map((sugars) => {
        return {
          xs: new Float64Array(sugars.length).map((_, i) => sugars[i].tick),
          ys: new Float64Array(sugars.length).map((_, i) => sugars[i].sugar),
        };
      }),
      map((data) => prognosisSeries(data)),
      startWith(undefined)
    )
  );

  return <ScatterChart series={[currentSugar$, prognosis$]} />;
}
