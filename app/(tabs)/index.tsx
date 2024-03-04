import { Link } from 'expo-router';
import { Button, YStack } from 'tamagui';

import LineChart from '~/components/line-chart';
import { Injection, Apidra } from '~/core/injection';
import { Meal } from '~/core/meal';
import { getCombinedSugarPlot } from '~/core/sugarInfluence';
import { getCurrentTick, incrementTick, tickToTime } from '~/core/time';
import { of } from 'rxjs';

export default function CombinedScreen() {
  const now = getCurrentTick();
  const xs = new Float64Array(60).map((_, i) => incrementTick(now, i));

  // Data for the chart
  const pasta = new Meal(100, 40, incrementTick(now, 3));
  const injection1 = new Injection(Apidra, 4, now);
  const injection2 = new Injection(Apidra, 5, incrementTick(now, 7));
  const injection3 = new Injection(Apidra, 1, incrementTick(now, 15));
  const activities = [pasta, injection1, injection2, injection3];

  const activityPlot = getCombinedSugarPlot(xs, activities, 5);

  const markPoint: echarts.MarkPointComponentOption = {
    data: activities.map((activity, i) => {
      if (activity instanceof Meal) {
        return {
          name: 'Meal',
          coord: [tickToTime(activity.startTime), 2],
          value: `${activity.carbsCount}g`,
          itemStyle: {
            color: 'yellow',
          },
          symbol: 'square',
          symbolSize: 35,
        };
      } else {
        return {
          name: 'Injection',
          coord: [tickToTime(activity.startTime), 10],
          value: `${activity.insulinAmount}U`,
          itemStyle: {
            color: 'blue',
          },
          symbol: 'circle',
          symbolSize: 35,
        };
      }
    }),
  };

  return (
    <YStack alignItems="center">
      <LineChart data$={of({ xs, ys: activityPlot.ys, markPoint })} title="Sugar Influence" />
      <Link href="/editActivity" asChild>
        <Button maxWidth="250px">New Activity</Button>
      </Link>
    </YStack>
  );
}
