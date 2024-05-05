import { useObservable } from 'observable-hooks';
import { combineLatest, combineLatestWith, debounceTime, map, Observable, switchMap } from 'rxjs';
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
import { throwIfNull } from '~/core/utils';
import { Profile } from '~/core/models/profile';

type ActivityFunction = MealCalculation | InjectionCalculation;

type CombinedChartProps = {
  activities$: Observable<Observable<Activity>[]>;
  startSugar$: Observable<number>;
};

export default function EditActivityChart({ activities$, startSugar$ }: CombinedChartProps) {
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
    startSugar: number,
    profile: Profile
  ) => {
    const startTick = Math.min(...activities.map((activity) => activity.startTick));
    const endTick =
      Math.max(...activities.map((activity) => activity.startTick + activity.durationTicks)) + 6;
    const xs = new Float64Array(endTick - startTick).map((_, i) => incrementTick(startTick, i));
    const activityPlot = getCombinedSugarPlot(xs, activities, startSugar, profile);
    const markLine = getChartMarkers(activities);

    return { xs, ys: activityPlot.ys, markLine };
  };

  // Reactive pipeline
  const profile$ = useObservable(() =>
    db.states.profile_settings.selectedProfileId$.pipe(
      throwIfNull(),
      switchMap((id) => db.profiles.findOne(id).$.pipe(throwIfNull()))
    )
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
      combineLatestWith(startSugar$, profile$),
      map(([activities, startSugar, profile]) => {
        return calculatePlotData(activities, startSugar, profile);
      })
    )
  );

  return <ScatterChart data$={plotInfo$} />;
}
