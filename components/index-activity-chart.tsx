import ScatterChart from '~/components/scatter-chart';
import { indexActivityChartPipeline } from '~/core/chart/indexActivityChart';
import { useState } from 'react';

export default function IndexActivityChart() {
  const [{ dataZoom$, currentSugarPlot$, prognosisPlot$ }] = useState(indexActivityChartPipeline());

  return <ScatterChart dataZoom={dataZoom$} series={[currentSugarPlot$, prognosisPlot$]} />;
}
