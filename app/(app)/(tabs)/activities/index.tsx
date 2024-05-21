import { Link } from 'expo-router';
import { Button, Text, XStack, YStack } from 'tamagui';
import { glucoseFetchWorker } from '~/core/nightscout/api';
import { useObservableState, useSubscription } from 'observable-hooks';
import { format } from 'date-fns';
import { Direction } from '~/core/models/glucoseEntry';
import { match } from 'ts-pattern';
import {
  ArrowBigDownDash,
  ArrowBigUpDash,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  ShieldQuestion,
} from '@tamagui/lucide-icons';
import { IconProps } from '@tamagui/helpers-icon';
import IndexActivityChart from '~/components/index-activity-chart';
import { db } from '~/core/db';

export default function CombinedScreen() {
  useSubscription(glucoseFetchWorker);

  return (
    <YStack alignItems="center">
      <CurrentGlucose />
      <IndexActivityChart />
      <Link href="/(tabs)/activities/edit" asChild>
        <Button maxWidth="250px">New Activity</Button>
      </Link>
    </YStack>
  );
}

function CurrentGlucose() {
  const [bloodGlucose] = useObservableState(
    () =>
      db.glucose_entries.find({
        sort: [{ date: 'desc' }],
        limit: 1,
      }).$,
    []
  );
  console.log(bloodGlucose);

  if (!bloodGlucose.length) return <></>;

  const currentGlucose = bloodGlucose[0];

  return (
    <XStack gap={10} alignItems={'stretch'}>
      <YStack justifyContent={'center'}>
        <GlucoseDirection direction={currentGlucose.direction} />
      </YStack>
      <Text color={'black'} fontSize={80}>
        {currentGlucose.sugar.toFixed(1)}
      </Text>
      <YStack justifyContent={'space-around'}>
        <Text color={'black'} fontSize={24}>
          {format(currentGlucose.date, 'HH:mm')}
        </Text>
        <Text color={'black'} fontSize={24}>
          mmol/L
        </Text>
      </YStack>
    </XStack>
  );
}

function GlucoseDirection({ direction }: { direction: Direction }) {
  const iconProps: IconProps = { color: 'black', size: 48 };
  return match(direction)
    .with(Direction.DoubleDown, () => <ArrowBigDownDash {...iconProps} />)
    .with(Direction.SingleDown, () => <ArrowDown {...iconProps} />)
    .with(Direction.FortyFiveDown, () => <ArrowDownRight {...iconProps} />)
    .with(Direction.Flat, () => <ArrowRight {...iconProps} />)
    .with(Direction.FortyFiveUp, () => <ArrowUpRight {...iconProps} />)
    .with(Direction.SingleUp, () => <ArrowUp {...iconProps} />)
    .with(Direction.DoubleUp, () => <ArrowBigUpDash {...iconProps} />)
    .with(Direction.Unknown, () => <ShieldQuestion {...iconProps} />)
    .exhaustive();
}
