import { Activity, populateInjection, populateMeal } from '~/core/models/activity';
import {
  combineLatest,
  combineLatestWith,
  debounceTime,
  defaultIfEmpty,
  map,
  Observable,
  switchMap,
} from 'rxjs';
import { editScreenSeries } from '~/core/chart/series';
import { calculatePredictionPlot } from '~/core/chart/index';
import { activeProfile$, currentSugarValue$ } from '~/core/calculations/data';
import { MealCalculation } from '~/core/calculations/meal';
import { InjectionCalculation } from '~/core/calculations/injection';

export function editActivityChartPipeline(activites$: Observable<Activity>[]) {
  const calculations$ = combineLatest(activites$).pipe(
    defaultIfEmpty([]),
    debounceTime(300),
    switchMap((activities) =>
      Promise.all(
        activities.map((a) => (a.type === 'meal' ? populateMeal(a) : populateInjection(a)))
      )
    ),
    combineLatestWith(activeProfile$),
    map(([activities, profile]) =>
      activities.map((a) =>
        a.type === 'meal' ? new MealCalculation(a, profile) : new InjectionCalculation(a, profile)
      )
    )
  );

  return calculations$.pipe(
    combineLatestWith(currentSugarValue$),
    map(([activities, startSugar]) => {
      return calculatePredictionPlot(activities, startSugar);
    }),
    map((data) => editScreenSeries(data))
  );
}
