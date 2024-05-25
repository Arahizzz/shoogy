import type echarts from 'echarts';

import { InjectionCalculation } from '~/core/calculations/injection';
import { MealCalculation } from '~/core/calculations/meal';
import { incrementTick, tickToTime } from '~/core/time';
import { GlucoseEntry } from '~/core/models/glucoseEntry';
import { SeriesProps } from '~/core/chart/series';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';

export type Axis = number[] | Float64Array;

export type Plot = {
  xs: Axis;
  ys: Axis;
};

export type ActivityFunction = MealCalculation | InjectionCalculation;

export function getChartMarkers(
  activities: (MealCalculation | InjectionCalculation)[]
): NonNullable<echarts.MarkLineComponentOption['data']> {
  return activities.map((activity) => {
    if (activity instanceof MealCalculation) {
      return {
        name: 'Meal',
        xAxis: tickToTime(activity.startTick),
        label: {
          formatter: `${activity.carbsCount}g`,
          distance: 20,
          color: 'orange',
        },
        itemStyle: {
          color: 'orange',
        },
        lineStyle: {
          width: 0,
        },
      };
    } else {
      return {
        name: 'Injection',
        xAxis: tickToTime(activity.startTick),
        label: {
          formatter: `${activity.insulinAmount}U`,
          color: 'blue',
        },
        itemStyle: {
          color: 'blue',
        },
        lineStyle: {
          width: 0,
        },
      };
    }
  });
}

export function calculatePredictionPlot(
  activities: ActivityFunction[],
  startSugar: GlucoseEntry
): SeriesProps {
  if (activities.length === 0) {
    return {
      xs: [],
      ys: [],
      markLineData: [],
    };
  }

  const startTick = startSugar.tick;
  const endTick =
    Math.max(...activities.map((activity) => activity.startTick + activity.durationTicks)) + 3;
  const xs = new Float64Array(endTick - startTick).map((_, i) => incrementTick(startTick, i));
  const activityPlot = getCombinedSugarPlot(xs, activities, startSugar.sugar);
  const markLineData = getChartMarkers(activities);

  return { xs, ys: activityPlot.ys, markLineData };
}
