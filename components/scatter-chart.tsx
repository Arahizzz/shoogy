import { EChartsOption, MarkPointComponentOption } from 'echarts';
import type echarts from 'echarts';
import { MarkLineOption } from 'echarts/types/dist/shared';
import { useObservable } from 'observable-hooks';
import React from 'react';
import { map, Observable } from 'rxjs';
import { H5, View, YStack } from 'tamagui';

import EchartComponent from './echart';

import { HIGH_SUGAR, LOW_SUGAR } from '~/core/constants';
import { tickToTime } from '~/core/time';

type LineChartProps = {
  title?: string;
  data$: Observable<{
    xs: number[] | Float64Array;
    ys: number[] | Float64Array;
    markLine?: echarts.MarkLineComponentOption;
  }>;
};
export default function ScatterChart({ title, data$ }: LineChartProps) {
  const options$ = useObservable(() =>
    data$.pipe(
      map(({ xs, ys, markLine }) => {
        const data = new Float64Array(xs.length * 2);
        for (let i = 0; i < xs.length; i++) {
          data[i * 2] = tickToTime(xs[i]);
          data[i * 2 + 1] = ys[i];
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
            // max: 15,
            max: Math.max(8, Math.round(Math.max(...ys) + 2)),
          },
          series: [
            {
              data,
              dimensions: ['time', 'value'],
              type: 'scatter',
              markLine,
              markPoint: {
                data: [
                  {
                    type: 'max',
                    name: 'max',
                    label: {
                      formatter: ({ value }) => {
                        return (value as number).toFixed(1);
                      },
                      color: 'white',
                    },
                  },
                  {
                    type: 'min',
                    name: 'min',
                    label: {
                      formatter: ({ value }) => {
                        return (value as number).toFixed(1);
                      },
                      offset: [0, 10],
                      color: 'white',
                    },
                    symbolRotate: 180,
                  },
                ],
              },
              symbolSize: 4,
              itemStyle: {
                color: ({ data }) => {
                  const y = (data as number[])[1];
                  if (y < LOW_SUGAR) return 'red';
                  if (y > HIGH_SUGAR) return 'orange';
                  return 'CadetBlue';
                },
              },
            },
          ],
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
