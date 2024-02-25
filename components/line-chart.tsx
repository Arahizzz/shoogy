import React from 'react';
import { H5, YStack } from 'tamagui';

import EchartComponent from './echart';

import { tickToTime } from '~/core/time';

type LineChartProps = {
  xs: number[] | Float64Array;
  ys: number[] | Float64Array;
  title: string;
  markPoint?: echarts.MarkPointComponentOption;
};
export default function LineChart({ xs, ys, title, markPoint }: LineChartProps) {
  const data = new Float64Array(xs.length * 2);
  for (let i = 0; i < xs.length; i++) {
    data[i * 2] = tickToTime(xs[i]);
    data[i * 2 + 1] = ys[i];
  }

  const option: echarts.EChartsOption = {
    xAxis: {
      type: 'time',
    },
    yAxis: {
      min: 0,
    },
    series: [
      {
        data,
        dimensions: ['time', 'value'],
        type: 'scatter',
        markPoint,
      },
    ],
  };

  return (
    <YStack alignItems="center">
      <H5 color="black">{title}</H5>
      <EchartComponent {...option} />
    </YStack>
  );
}
