import { useObservable } from 'observable-hooks';
import {
  combineLatest,
  combineLatestWith,
  debounceTime,
  filter,
  map,
  Observable,
  switchMap,
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
import { incrementTick, tickResolutionMinutes } from '~/core/time';
import { isDefined, throwIfNull } from '~/core/utils';
import { Profile } from '~/core/models/profile';
import { GlucoseEntry } from '~/core/models/glucoseEntry';
import { editScreenSeries, SeriesProps } from '~/core/chart/series';

type ActivityFunction = MealCalculation | InjectionCalculation;

type CombinedChartProps = {
  activities$: Observable<Observable<Activity>[]>;
};

export default function EditActivityChart({ activities$ }: CombinedChartProps) {
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
  const calculatePlotData = (
    activities: ActivityFunction[],
    startSugar: GlucoseEntry,
    profile: Profile
  ) => {
    const startTick = startSugar.tick;
    const endTick =
      Math.max(...activities.map((activity) => activity.startTick + activity.durationTicks)) + 6;
    const xs = new Float64Array(endTick - startTick).map((_, i) => incrementTick(startTick, i));
    const activityPlot = getCombinedSugarPlot(xs, activities, startSugar.sugar, profile);
    const markLineData = getChartMarkers(activities);

    return { xs, ys: activityPlot.ys, markLineData } satisfies SeriesProps;
  };

  // Reactive pipeline
  const profile$ = useObservable(() =>
    db.states.profile_settings.selectedProfileId$.pipe(
      throwIfNull(),
      switchMap((id) => db.profiles.findOne(id).$.pipe(throwIfNull()))
    )
  );
  const currentSugar$ = useObservable(() =>
    db.glucose_entries
      .findOne({
        sort: [{ date: 'desc' }],
      })
      .$.pipe(filter(isDefined))
  );
  const latestActivities$ = useObservable(() =>
    activities$.pipe(
      map((activities) =>
        activities.map((activity$) =>
          activity$.pipe(switchMap(populateActivity), map(initializeCalculation))
        )
      ),
      switchMap((activities) => combineLatest(activities)),
      debounceTime(300)
    )
  );
  const plotInfo$ = useObservable(() =>
    latestActivities$.pipe(
      combineLatestWith(currentSugar$, profile$),
      map(([activities, startSugar, profile]) => {
        return calculatePlotData(activities, startSugar._data, profile);
      }),
      map((data) => editScreenSeries(data))
    )
  );

  return <ScatterChart series={[plotInfo$]} />;
}
