import { of } from 'rxjs';
import { Stack } from 'tamagui';

import ScatterChart from '~/components/scatter-chart';
import { MealCalculation } from '~/core/calculations/meal';
import { getCurrentTick, incrementTick } from '~/core/time';

export default function FoodScreen() {
  const now = getCurrentTick();
  const xs = new Float64Array(32).map((_, i) => incrementTick(now, i));

  // Data for the chart
  const pasta = new MealCalculation({
    carbsCount: 100,
    carbsAbsorptionRatePerHr: 40,
    startTick: now,
  });
  const activityPlot = pasta.getActivityPlot(xs);
  const cobPlot = pasta.getObPlot(xs);

  return (
    <Stack flexDirection="row" flexWrap="wrap">
      <ScatterChart data$={of(activityPlot)} title="Sugar Influence" />
      <ScatterChart data$={of(cobPlot)} title="Carbs on Board" />
    </Stack>
  );
}