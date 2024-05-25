import { populateActivities } from '~/core/models/activity';
import {
  combineLatest,
  combineLatestWith,
  debounceTime,
  defaultIfEmpty,
  map,
  Observable,
} from 'rxjs';
import { editScreenSeries } from '~/core/chart/series';
import { calculatePredictionPlot } from '~/core/chart/index';
import { MealCalculation } from '~/core/calculations/meal';
import { InjectionCalculation } from '~/core/calculations/injection';
import { ActivityForm } from '~/app/(app)/(tabs)/activities/edit';
import { activeProfile$ } from '~/core/data/profile';
import { currentSugarValue$ } from '~/core/data/sugar';

export function editActivityChartPipeline(activites$: Observable<ActivityForm>[]) {
  const calculations$ = combineLatest(activites$).pipe(
    defaultIfEmpty([]),
    debounceTime(300),
    map((activities) => activities.filter((a) => !a.toDelete)),
    populateActivities(),
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
