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
import IndexActivityChart from '~/components/chart/index-activity-chart';
import { currentCob$, currentIob$, currentSugarValue$ } from '~/core/calculations/data';

export default function CombinedScreen() {
  useSubscription(glucoseFetchWorker);

  return (
    <YStack alignItems="center">
      <CurrentGlucose />
      <IndexActivityChart />
      <Link href="/(tabs)/activities/edit" asChild>
        <Button maxWidth="250px">Manage Activities</Button>
      </Link>
    </YStack>
  );
}

function CurrentGlucose() {
  const [currentGlucose] = useObservableState(() => currentSugarValue$, undefined);

  if (!currentGlucose) return <></>;

  return (
    <YStack>
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
      <XStack justifyContent={'space-between'}>
        <IobInfo />
        <CobInfo />
      </XStack>
    </YStack>
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

function IobInfo() {
  const [iob] = useObservableState(() => currentIob$, undefined);

  if (!iob) return <></>;

  return (
    <YStack>
      <Text color={'black'}>IOB: {iob.toFixed(2)}U</Text>
    </YStack>
  );
}

function CobInfo() {
  const [cob] = useObservableState(() => currentCob$, undefined);

  if (!cob) return <></>;

  return (
    <YStack>
      <Text color={'black'}>COB: {cob.toFixed(2)}g</Text>
    </YStack>
  );
}
