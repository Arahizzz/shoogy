import React from 'react';
import { H5, View, YStack } from 'tamagui';

import EchartComponent from './echart';

import { tickToTime } from '~/core/time';
import { map, Observable } from 'rxjs';
import { EChartsOption, MarkPointComponentOption } from 'echarts';
import { useObservable } from 'observable-hooks';

type LineChartProps = {
  title: string;
  data$: Observable<{
    xs: number[] | Float64Array;
    ys: number[] | Float64Array;
    markPoint?: MarkPointComponentOption;
  }>;
};
export default function ScatterChart({ title, data$ }: LineChartProps) {
  const options$ = useObservable(() =>
    data$.pipe(
      map(({ xs, ys, markPoint }) => {
        const data = new Float64Array(xs.length * 2);
        for (let i = 0; i < xs.length; i++) {
          data[i * 2] = tickToTime(xs[i]);
          data[i * 2 + 1] = ys[i];
        }

        return {
          xAxis: {
            type: 'time',
          },
          yAxis: {
            min: 0,
            max: 15,
            // max: Math.max(10, Math.round(Math.max(...ys) + 3)),
          },
          series: [
            {
              data,
              dimensions: ['time', 'value'],
              type: 'scatter',
              markPoint,
              symbolSize: 7,
            },
          ],
        } satisfies EChartsOption;
      })
    )
  );

  return (
    <YStack alignItems="center">
      <H5 color="black">{title}</H5>
      <View height={250}>
        <EchartComponent options$={options$} />
      </View>
    </YStack>
  );
}
