import { Stack } from 'tamagui';

import LineChart from '~/components/line-chart';
import { Injection, Apidra } from '~/core/injection';
import { Meal } from '~/core/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick } from '~/core/time';

export default function InsulinScreen() {
  const now = getCurrentTick();
  const xs = new Float64Array(60).map((_, i) => incrementTick(now, i));
  const injection = new Injection(Apidra, 7, now);

  // Data for the chart
  const activityPlot = injection.getActivityPlot(xs);
  const iobPlot = injection.getObPlot(xs);

  return (
    <Stack flexDirection="row" flexWrap="wrap">
      <LineChart xs={activityPlot.xs} ys={activityPlot.ys} title="Sugar Influence" />
      <LineChart xs={iobPlot.xs} ys={iobPlot.ys} title="Insulin on Board" />
    </Stack>
  );
}
