import { Stack, useMedia } from 'tamagui';

import LineChart from '~/components/line-chart';
import { Injection, Apidra } from '~/core/injection';
import { Meal } from '~/core/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick } from '~/core/time';

export default function FoodScreen() {
  const media = useMedia();
  const now = getCurrentTick();
  const xs = new Float64Array(32).map((_, i) => incrementTick(now, i));

  // Data for the chart
  const pasta = new Meal(100, 40, now);
  const activityPlot = pasta.getActivityPlot(xs);
  const cobPlot = pasta.getObPlot(xs);

  return (
    <Stack flexDirection="row" flexWrap="wrap">
      <LineChart xs={activityPlot.xs} ys={activityPlot.ys} title="Sugar Influence" />
      <LineChart xs={cobPlot.xs} ys={cobPlot.ys} title="Carbs on Board" />
    </Stack>
  );
}
