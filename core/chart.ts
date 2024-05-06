import type echarts from 'echarts';

import { InjectionCalculation } from '~/core/injectionCalculation';
import { MealCalculation } from '~/core/mealCalculation';
import { tickToTime } from '~/core/time';

export type Axis = number[] | Float64Array;

export type Plot = {
  xs: Axis;
  ys: Axis;
};

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
          color: 'hsl(24, 100%, 46.5%)',
        },
        itemStyle: {
          color: 'hsl(24, 100%, 46.5%)',
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
          color: 'hsl(208, 100%, 47.3%)',
        },
        itemStyle: {
          color: 'hsl(208, 100%, 47.3%)',
        },
        lineStyle: {
          width: 0,
        },
      };
    }
  });
}
