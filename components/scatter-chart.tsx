import type echarts from 'echarts';
import { EChartsOption } from 'echarts';
import { useObservable } from 'observable-hooks';
import React from 'react';
import { combineLatest, combineLatestWith, map, Observable } from 'rxjs';
import { View, YStack } from 'tamagui';

import EchartComponent from './echart';
import { isDefined } from '~/core/utils';

type LineChartProps = {
  title?: string;
  series: Observable<echarts.SeriesOption | undefined>[];
  dataZoom: Observable<echarts.DataZoomComponentOption[] | undefined>;
};
export default function ScatterChart({ title, series, dataZoom }: LineChartProps) {
  const series$ = useObservable(() => combineLatest(series));

  const options$ = useObservable(() =>
    series$.pipe(
      combineLatestWith(dataZoom),
      map(([series, dataZoom]) => {
        const definedSeries = series.filter(isDefined);
        let maxY = 8;
        for (const s of definedSeries) {
          const data = s.data as Float64Array | undefined;
          if (!data) continue;
          for (let i = 1; i < data.length; i += 2) {
            if (data[i] > maxY) maxY = data[i];
          }
        }

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
          dataZoom,
          series: definedSeries,
        } satisfies EChartsOption;
      })
    )
  );

  return (
    <YStack alignItems="center">
      <View height={250} marginTop={-25}>
        <EchartComponent height={250} options$={options$} />
      </View>
    </YStack>
  );
}
