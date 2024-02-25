import { SVGRenderer, SkiaChart } from '@wuba/react-native-echarts';
import { EChartsOption } from 'echarts';
import { LineChart, ScatterChart } from 'echarts/charts';
import { GridComponent, MarkPointComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import React, { useRef, useEffect } from 'react';
import { useWindowDimensions } from 'react-native';

echarts.use([SVGRenderer, LineChart, GridComponent, ScatterChart, MarkPointComponent]);

export default function EchartComponent(options: EChartsOption) {
  const { width } = useWindowDimensions();
  const skiaRef = useRef<any>(null);
  let chart: echarts.ECharts | undefined;
  useEffect(() => {
    if (!chart) {
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'svg',
      });
    }
    chart.setOption(options);
    chart.resize({ width, height: 300 });
    return () => chart?.dispose();
  }, [skiaRef.current, options, width]);

  return <SkiaChart ref={skiaRef} />;
}
