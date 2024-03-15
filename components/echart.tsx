import { SVGRenderer, SkiaChart } from '@wuba/react-native-echarts';
import { EChartsOption } from 'echarts';
import { LineChart, ScatterChart } from 'echarts/charts';
import {
  GridComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { useSubscription } from 'observable-hooks';
import React, { useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Observable } from 'rxjs';

echarts.use([
  SVGRenderer,
  LineChart,
  GridComponent,
  ScatterChart,
  MarkPointComponent,
  MarkLineComponent,
  TitleComponent,
]);

type Props = {
  options$: Observable<EChartsOption>;
  height: number;
};

export default function EchartComponent(props: Props) {
  const skiaRef = useRef<any>(null);
  const chart = useRef<echarts.ECharts | undefined>();
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (!chart.current) {
      chart.current = echarts.init(skiaRef.current, 'light', {
        renderer: 'svg',
        width,
        height: props.height,
      });
    }
    return () => chart.current?.dispose();
  }, []);
  useEffect(() => {
    chart.current?.resize({ width, height: props.height });
  }, [width, props.height]);
  useSubscription(props.options$, (options) => {
    chart.current?.setOption(options);
  });

  return <SkiaChart ref={skiaRef} />;
}
