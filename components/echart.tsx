import { SVGRenderer, SkiaChart } from '@wuba/react-native-echarts';
import { EChartsOption } from 'echarts';
import { LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, MarkPointComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Observable } from 'rxjs';
import { useSubscription } from 'observable-hooks';

echarts.use([SVGRenderer, LineChart, GridComponent, ScatterChart, MarkPointComponent]);

type Props = {
  options$: Observable<EChartsOption>;
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
        height: 250,
      });
    }
    return () => chart.current?.dispose();
  }, []);
  useEffect(() => {
    chart.current?.resize({ width, height: 250 });
  }, [width]);
  useSubscription(props.options$, (options) => {
    chart.current?.setOption(options);
  });

  return <SkiaChart ref={skiaRef} />;
}
