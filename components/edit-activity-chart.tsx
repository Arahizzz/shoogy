import { useObservable } from 'observable-hooks';
import { combineLatest, combineLatestWith, debounceTime, map, Observable, switchMap } from 'rxjs';
import { match } from 'ts-pattern';

import ScatterChart from '~/components/scatter-chart';
import { getChartMarkers } from '~/core/chart';
import { Injection, InjectionParams } from '~/core/injection';
import { Meal, MealParams } from '~/core/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { incrementTick, tickResolution } from '~/core/time';
import { useDb } from '~/core/db';
import { throwIfNull } from '~/core/utils';

export type Activity = ({ type: 'meal' } & MealParams) | ({ type: 'injection' } & InjectionParams);

type ActivityFunction = Meal | Injection;

type CombinedChartProps = {
  activities$: Observable<Observable<Activity>[]>;
  startSugar$: Observable<number>;
};

export default function EditActivityChart({ activities$, startSugar$ }: CombinedChartProps) {
  const db = useDb();
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
          activity$.pipe(
            map((activity) => {
              return match(activity)
                .returnType<ActivityFunction>()
                .with({ type: 'meal' }, (meal) => new Meal(meal))
                .with({ type: 'injection' }, (injection) => new Injection(injection))
                .exhaustive();
            })
          )
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
        const start = Math.min(...activities.map((activity) => activity.startTime));
        const end =
          Math.max(...activities.map((activity) => activity.startTime + activity.duration)) + 30;
        const xs = new Float64Array((end - start) / tickResolution).map((_, i) =>
          incrementTick(start, i)
        );
        const activityPlot = getCombinedSugarPlot(xs, activities, startSugar, profile);
        const markLine = getChartMarkers(activities);

        return { xs, ys: activityPlot.ys, markLine };
      })
    )
  );

  return <ScatterChart data$={plotInfo$} />;
}
