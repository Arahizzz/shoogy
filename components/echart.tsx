import { SvgChart, SVGRenderer } from '@wuba/react-native-echarts';
import { EChartsOption } from 'echarts';
import { LineChart, ScatterChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { useSubscription } from 'observable-hooks';
import React, { useEffect, useRef } from 'react';
import { useWindowDimensions } from 'react-native';
import { Observable } from 'rxjs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

echarts.use([
  SVGRenderer,
  LineChart,
  GridComponent,
  ScatterChart,
  MarkPointComponent,
  MarkLineComponent,
  TitleComponent,
  TooltipComponent,
  DataZoomComponent,
]);

type Props = {
  options$: Observable<EChartsOption>;
  height: number;
};

export default function EchartComponent(props: Props) {
  const ref = useRef<any>(null);
  const chart = useRef<echarts.ECharts | undefined>();
  const { width } = useWindowDimensions();
  useEffect(() => {
    if (!chart.current) {
      chart.current = echarts.init(ref.current, 'light', {
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SvgChart useRNGH ref={ref} />
    </GestureHandlerRootView>
  );
}
