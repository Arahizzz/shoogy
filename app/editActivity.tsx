import { Link } from 'expo-router';
import { Button, YStack } from 'tamagui';

import LineChart from '~/components/line-chart';
import { getChartMarkers } from '~/core/chart';
import { Apidra, Injection } from '~/core/injection';
import { Meal } from '~/core/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick, tickToTime } from '~/core/time';

export default function EditActivityScreen() {
  const now = getCurrentTick();
  const xs = new Float64Array(60).map((_, i) => incrementTick(now, i));

  // Data for the chart
  const pasta = new Meal(100, 40, incrementTick(now, 3));
  const injection1 = new Injection(Apidra, 4, now);
  const injection2 = new Injection(Apidra, 5, incrementTick(now, 7));
  const injection3 = new Injection(Apidra, 1, incrementTick(now, 15));
  const activities = [pasta, injection1, injection2, injection3];

  const activityPlot = getCombinedSugarPlot(xs, activities, 5);

  const markPoint = getChartMarkers(activities);

  return (
    <YStack alignItems="center">
      <LineChart
        xs={activityPlot.xs}
        ys={activityPlot.ys}
        markPoint={markPoint}
        title="Sugar Influence"
      />
    </YStack>
  );
}
