import { Link } from 'expo-router';
import { Button, styled, Text, XStack, YStack } from 'tamagui';
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
        <Text
          color={'black'}
          fontSize={80}
          $sm={{
            fontSize: 60,
          }}>
          {currentGlucose.sugar.toFixed(1)}
        </Text>
        <YStack justifyContent={'space-around'}>
          <AuxillaryText>{format(currentGlucose.date, 'HH:mm')}</AuxillaryText>
          <AuxillaryText>mmol/L</AuxillaryText>
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

  if (!iob || iob <= 0) return <></>;

  return (
    <YStack>
      <ObText>IOB: {iob.toFixed(2)}U</ObText>
    </YStack>
  );
}

function CobInfo() {
  const [cob] = useObservableState(() => currentCob$, undefined);

  if (!cob || cob <= 0) return <></>;

  return (
    <YStack>
      <ObText>COB: {cob.toFixed(2)}g</ObText>
    </YStack>
  );
}

const AuxillaryText = styled(Text, {
  color: 'black',
  fontSize: 24,
  $sm: {
    fontSize: 20,
  },
});

const ObText = styled(Text, {
  color: 'black',
});
