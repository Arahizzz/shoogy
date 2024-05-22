import { Activity, populateActivity } from '~/core/models/activity';
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
import { initializeCalculation } from '~/core/calculations';
import { calculatePredictionPlot } from '~/core/chart/index';
import { activeProfile$, currentSugarValue$ } from '~/core/chart/data';

export function editActivityChartPipeline(activites$: Observable<Activity>[]) {
  const calculations$ = combineLatest(activites$).pipe(
    defaultIfEmpty([]),
    debounceTime(300),
    switchMap((activities) => Promise.all(activities.map(populateActivity))),
    map((activities) => activities.map(initializeCalculation))
  );

  return calculations$.pipe(
    combineLatestWith(currentSugarValue$, activeProfile$),
    map(([activities, startSugar, profile]) => {
      return calculatePredictionPlot(activities, startSugar, profile);
    }),
    map((data) => editScreenSeries(data))
  );
}
