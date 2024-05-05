import type echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { useObservable } from 'observable-hooks';
import React from 'react';
import { combineLatest, filter, map, Observable } from 'rxjs';
import { View, YStack } from 'tamagui';

import EchartComponent from './echart';
import { isDefined } from '~/core/utils';

type LineChartProps = {
  title?: string;
  series: Observable<echarts.SeriesOption | undefined>[];
};
export default function ScatterChart({ title, series }: LineChartProps) {
  const series$ = useObservable(() => combineLatest(series));

  const options$ = useObservable(() =>
    series$.pipe(
      map((series) => {
        series = series.filter(isDefined);
        const maxY = Math.ceil(
          series
            .flatMap((s) => [...(s.data as Float64Array)])
            .reduce((acc, s, i) => {
              if (i % 2 === 0) return acc;
              return Math.max(acc, s);
            }, 8)
        );

        return {
          title: {
            text: title,
          },
          xAxis: {
            type: 'time',
          },
          yAxis: {
            min: 0,
            max: maxY,
          },
          series,
        } satisfies EChartsOption;
      })
    )
  );

  return (
    <YStack alignItems="center">
      <View height={225} marginTop={-25}>
        <EchartComponent height={250} options$={options$} />
      </View>
    </YStack>
  );
}
