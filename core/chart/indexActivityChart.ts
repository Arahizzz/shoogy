import { combineLatestWith, map, of, startWith } from 'rxjs';
import {
  indexScreenCurrentSeries,
  indexScreenPrognosisSeries,
  SeriesProps,
} from '~/core/chart/series';
import { calculatePredictionPlot } from '~/core/chart/index';
import { activeProfile$, currentActivities$, currentSugarHistory$ } from '~/core/chart/data';

const dataZoom: echarts.DataZoomComponentOption[] = [
  {
    type: 'inside',
    start: 60,
  },
  {
    type: 'slider',
    start: 60,
  },
];

export function indexActivityChartPipeline() {
  const currentSugarPlot$ = currentSugarHistory$.pipe(
    map((sugars) => {
      return {
        xs: new Float64Array(sugars.length).map((_, i) => sugars[i].tick),
        ys: new Float64Array(sugars.length).map((_, i) => sugars[i].sugar),
        markLineData: [],
      } satisfies SeriesProps;
    }),
    map((data) => indexScreenCurrentSeries(data)),
    startWith(undefined)
  );

  const prognosisPlot$ = currentActivities$.pipe(
    combineLatestWith(currentSugarHistory$, activeProfile$),
    map(([activities, latestSugar, profile]) => {
      return calculatePredictionPlot(activities, latestSugar[latestSugar.length - 1], profile);
    }),
    map((data) => indexScreenPrognosisSeries(data)),
    startWith(undefined)
  );

  return { prognosisPlot$, currentSugarPlot$, dataZoom$: of(dataZoom) };
}
