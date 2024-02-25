import { Injection } from '~/core/injection';
import { Meal } from '~/core/meal';
import { tickToTime } from '~/core/time';

export type Axis = number[] | Float64Array;

export type Plot = {
  xs: Axis;
  ys: Axis;
};

export function getChartMarkers(
  activities: (Meal | Injection)[]
): echarts.MarkPointComponentOption {
  return {
    data: activities.map((activity) => {
      if (activity instanceof Meal) {
        return {
          name: 'Meal',
          coord: [tickToTime(activity.startTime), 2],
          value: `${activity.carbsCount}g`,
          itemStyle: {
            color: 'yellow',
          },
          symbol: 'square',
          symbolSize: 35,
        };
      } else {
        return {
          name: 'Injection',
          coord: [tickToTime(activity.startTime), 10],
          value: `${activity.insulinAmount}U`,
          itemStyle: {
            color: 'blue',
          },
          symbol: 'circle',
          symbolSize: 35,
        };
      }
    }),
  };
}
