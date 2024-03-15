import { Injection } from '~/core/injection';
import { Meal } from '~/core/meal';
import { tickToTime } from '~/core/time';
import type echarts from 'echarts';

export type Axis = number[] | Float64Array;

export type Plot = {
  xs: Axis;
  ys: Axis;
};

export function getChartMarkers(activities: (Meal | Injection)[]): echarts.MarkLineComponentOption {
  return {
    symbol: ['none', 'circle'],
    symbolSize: 7,
    data: activities.map((activity) => {
      if (activity instanceof Meal) {
        return {
          name: 'Meal',
          xAxis: tickToTime(activity.startTime),
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
          xAxis: tickToTime(activity.startTime),
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
    }),
  };
}
