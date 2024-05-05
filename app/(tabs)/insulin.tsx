import { of } from 'rxjs';
import { Stack } from 'tamagui';

import ScatterChart from '~/components/scatter-chart';
import { Apidra, InjectionCalculation } from '~/core/injectionCalculation';
import { getCurrentTick, incrementTick } from '~/core/time';

export default function InsulinScreen() {
  const now = getCurrentTick();
  const xs = new Float64Array(60).map((_, i) => incrementTick(now, i));
  const injection = new InjectionCalculation({
    insulinType: Apidra,
    startTick: now,
    insulinAmount: 7,
  });

  // Data for the chart
  const activityPlot = injection.getActivityPlot(xs);
  const iobPlot = injection.getObPlot(xs);

  return (
    <Stack flexDirection="row" flexWrap="wrap">
      <ScatterChart data$={of(activityPlot)} title="Sugar Influence" />
      <ScatterChart data$={of(iobPlot)} title="Insulin on Board" />
    </Stack>
  );
}
