import { useObservable } from 'observable-hooks';
import { combineLatest, combineLatestWith, debounceTime, map, Observable, switchMap } from 'rxjs';
import { match } from 'ts-pattern';

import { getChartMarkers } from '~/core/chart';
import { Injection, InjectionParams } from '~/core/injection';
import { Meal, MealParams } from '~/core/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick, tickResolution } from '~/core/time';
import ScatterChart from '~/components/scatter-chart';

export type Activity = ({ type: 'meal' } & MealParams) | ({ type: 'injection' } & InjectionParams);

type ActivityFunction = Meal | Injection;

type CombinedChartProps = {
  activities$: Observable<Observable<Activity>[]>;
  startSugar$: Observable<number>;
};

export default function CombinedChart({ activities$, startSugar$ }: CombinedChartProps) {
  const plotInfo$ = useObservable(() =>
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
      combineLatestWith(startSugar$),
      debounceTime(300),
      map(([activities, startSugar]) => {
        const start = Math.min(...activities.map((activity) => activity.startTime));
        const end =
          Math.max(...activities.map((activity) => activity.startTime + activity.duration)) + 30;
        const xs = new Float64Array((end - start) / tickResolution).map((_, i) =>
          incrementTick(start, i)
        );
        const activityPlot = getCombinedSugarPlot(xs, activities, startSugar);
        const markPoint = getChartMarkers(activities);

        return { xs, ys: activityPlot.ys, markPoint };
      })
    )
  );

  return <ScatterChart title={'Combined Plot'} data$={plotInfo$} />;
}
