import { ChevronDown, Pizza, Syringe, Trash2 } from '@tamagui/lucide-icons';
import { router } from 'expo-router';
import { useObservablePickState } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import React, { useEffect } from 'react';
import { ColorValue } from 'react-native';
import { BehaviorSubject, concat, first, map, Observable, of } from 'rxjs';
import {
  Adapt,
  Button,
  ScrollView,
  Select,
  Sheet,
  Stack,
  styled,
  Text,
  XStack,
  YStack,
} from 'tamagui';

import EditActivityChart from '~/components/edit-activity-chart';
import NumericInput from '~/components/numeric-input';
import TimeInput from '~/components/time-input';
import { getDb, useDb } from '~/core/db';
import { Activity } from '~/core/models/activity';
import { Injection } from '~/core/models/injection';
import { Meal } from '~/core/models/meal';
import { linkNext } from '~/core/rxjs';
import { decrementTick, getCurrentTick, incrementTick } from '~/core/time';
import { newId } from '~/core/utils';

class ActivityStore {
  public activitiesState$ = new BehaviorSubject<BehaviorSubject<Activity>[]>([]);
  public startSugar$ = new BehaviorSubject(0);
  private toDelete: { type: 'injection' | 'meal'; id: string }[] = [];

  async init() {
    const db = await getDb;
    // Load activities that were created in the last 12 hours
    const now = getCurrentTick();
    const twelveHoursAgo = decrementTick(now, (60 / 5) * 12);
    const meals = await db.meals
      .find({
        selector: {
          startTick: { $gte: twelveHoursAgo },
        },
      })
      .exec();
    const injections = await db.injections
      .find({
        selector: {
          startTick: { $gte: twelveHoursAgo },
        },
      })
      .exec();
    const activities = [...meals, ...injections]
      .sort((a, b) => a.startTick - b.startTick)
      .map(
        (activity) => new BehaviorSubject(activity._data)
      ) as unknown as BehaviorSubject<Activity>[];

    this.activitiesState$.next(activities);
    of(5).pipe(first()).subscribe(linkNext(this.startSugar$));
  }
  dispose() {
    this.activitiesState$.next([]);
    this.startSugar$.next(0);
    this.toDelete = [];
  }

  newActivity(activityProps: Omit<Meal, 'id'> | Omit<Injection, 'id'>) {
    const activity$ = new BehaviorSubject<Activity>({
      id: newId(),
      ...activityProps,
    });
    this.activitiesState$.next([...this.activitiesState$.value, activity$]);
  }
  removeActivity(type: 'injection' | 'meal', id: string) {
    this.toDelete.push({ type, id });
    this.activitiesState$.next(
      this.activitiesState$.value.filter((activity$) => activity$.value.id !== id)
    );
  }
  async saveActivities() {
    const db = await getDb;
    for (const activity$ of this.activitiesState$.value) {
      if (activity$.value.type === 'meal') {
        const meal = activity$.value as Meal;
        await db.meals.upsert(meal);
      } else if (activity$.value.type === 'injection') {
        const injection = activity$.value as Injection;
        await db.injections.upsert(injection);
      }
    }

    for (const { type, id } of this.toDelete) {
      if (type === 'meal') {
        const meal = await db.meals.findOne(id).exec();
        if (meal) await meal.remove();
      } else if (type === 'injection') {
        const injection = await db.injections.findOne(id).exec();
        if (injection) await injection.remove();
      }
    }
  }
}

const store = new ActivityStore();

export default function EditActivityScreen() {
  useEffect(() => {
    store.init().catch(console.error);
    return () => store.dispose();
  }, []);

  const onSave = async () => {
    await store.saveActivities();
    router.back();
  };

  return (
    <ScrollView stickyHeaderIndices={[0]}>
      <YStack backgroundColor="whitesmoke" alignItems="center">
        <EditActivityChart activities$={store.activitiesState$} startSugar$={store.startSugar$} />
        <XStack justifyContent="center" gap={10}>
          {/*<StartSugarEdit />*/}
          <Button
            icon={<Pizza />}
            variant="outlined"
            backgroundColor="$orange10Light"
            width={150}
            onPress={() =>
              store.newActivity({
                type: 'meal',
                carbsCount: 30,
                mealType: 'medium-gi',
                startTick: getCurrentTick(),
              })
            }>
            Meal
          </Button>
          <Button
            icon={<Syringe />}
            variant="outlined"
            backgroundColor="$blue10Light"
            width={150}
            onPress={() =>
              store.newActivity({
                type: 'injection',
                insulinType: 'Apidra',
                insulinAmount: 4,
                startTick: getCurrentTick(),
              })
            }>
            Injection
          </Button>
        </XStack>
        <ActivitiesEdit />
        <Button width={200} onPress={onSave}>
          <Text>Save</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}

function ActivitiesEdit() {
  const activities = useObservableState(store.activitiesState$);

  return (
    <YStack
      alignItems="stretch"
      alignSelf="center"
      marginTop={10}
      marginHorizontal={15}
      maxWidth={600}
      width="90%">
      {activities.map((activity$) => (
        <ActivityEdit key={activity$.value.id.toString()} activity$={activity$} />
      ))}
    </YStack>
  );
}

function ActivityEdit({ activity$ }: { activity$: BehaviorSubject<Activity> }) {
  const { type } = useObservablePickState(activity$, activity$.value, 'type');

  return type === 'meal' ? (
    <MealEdit meal$={activity$ as BehaviorSubject<Meal>} />
  ) : (
    <InsulinEdit insulin$={activity$ as BehaviorSubject<Injection>} />
  );
}

function ActivityTimeEdit({
  activity$,
  color,
  fontColor,
}: {
  activity$: BehaviorSubject<Activity>;
  color?: ColorValue;
  fontColor?: ColorValue;
}) {
  return (
    <TimeInput
      color={color}
      fontColor={fontColor}
      id="time"
      initialValue={of(activity$.value.startTick)}
      $changes={{
        next: (startTick: number) => {
          activity$.next({ ...activity$.value, startTick });
        },
      }}
    />
  );
}

function DeleteButton({
  type,
  id,
  color,
}: {
  type: 'injection' | 'meal';
  id: string;
  color?: string;
}) {
  return (
    <Button
      variant="outlined"
      borderColor={undefined}
      paddingHorizontal={5}
      height={40}
      $xs={{ height: 30 }}
      onPress={() => store.removeActivity(type, id)}
      icon={<Trash2 color={color} size="$1" />}
    />
  );
}

function MealEdit({ meal$ }: { meal$: BehaviorSubject<Meal> }) {
  const color = '$orange10Light';
  const fontColor = '$orange8Dark';

  return (
    <ActivityEditCard
      backgroundColor="rgba(237, 95, 0, 0.25)"
      $xs={{
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 5,
      }}>
      <PizzaIcon />
      <XStack justifyContent="space-between">
        <DeleteButton type={'meal'} id={meal$.value.id} color={color} />
        <ActivityTimeEdit
          color={color}
          fontColor={fontColor}
          activity$={meal$ as BehaviorSubject<Activity>}
        />
      </XStack>
      <XStack justifyContent="space-between">
        <MealTypeEdit meal$={meal$} />
        <NumericInput
          color={color}
          fontColor={fontColor}
          id="meal-carbs"
          suffix="g"
          initialValue={meal$.pipe(map((meal) => meal.carbsCount))}
          min={0}
          step={1}
          $changes={{
            next: (carbsCount: number) => {
              const prevMeal = meal$.value;
              meal$.next({ ...prevMeal, carbsCount });
            },
          }}
        />
      </XStack>
    </ActivityEditCard>
  );
}

function MealTypeEdit({ meal$ }: { meal$: BehaviorSubject<Meal> }) {
  const db = useDb();
  const [mealTypes] = useObservableState(() => db.meal_types.find().$, []);
  const { mealType } = useObservablePickState(meal$, meal$.value, 'mealType');
  const changeType = (mealType: string) => {
    const prevMeal = meal$.value;
    meal$.next({ ...prevMeal, mealType });
  };

  return (
    <Select value={mealType} onValueChange={changeType}>
      <Select.Trigger
        height={40}
        width={150}
        fontSize={8}
        paddingVertical={0}
        // backgroundColor="whitesmoke"
        color="black"
        iconAfter={<ChevronDown color="black" />}>
        <Select.Value placeholder="Meal Type" />
      </Select.Trigger>
      <Adapt platform="touch">
        <Sheet
          native
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: 'spring',
            damping: 20,
            mass: 1.2,
            stiffness: 250,
          }}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
          <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.Viewport>
          {mealTypes.map((mealType, i) => (
            <Select.Item key={mealType.id} value={mealType.id} index={i}>
              <Select.ItemText>{mealType.name}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}

function InsulinEdit({ insulin$ }: { insulin$: BehaviorSubject<Injection> }) {
  const color = '$blue10Light';
  const fontColor = '$blue8Dark';

  return (
    <ActivityEditCard backgroundColor="rgba(0, 106, 220, 0.25)">
      <SyringeIcon />
      <XStack>
        <DeleteButton type={'injection'} id={insulin$.value.id} color={color} />
        <ActivityTimeEdit
          color={color}
          fontColor={fontColor}
          activity$={insulin$ as BehaviorSubject<Activity>}
        />
      </XStack>
      <XStack>
        <NumericInput
          color={color}
          fontColor={fontColor}
          id="insulin-amount"
          suffix="U"
          initialValue={insulin$.pipe(map((injection) => injection.insulinAmount))}
          min={0}
          step={1}
          $changes={{
            next: (insulinAmount: number) => {
              const prevInjection = insulin$.value;
              insulin$.next({ ...prevInjection, insulinAmount });
            },
          }}
        />
      </XStack>
    </ActivityEditCard>
  );
}

const ActivityEditCard = styled(Stack, {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignSelf: 'stretch',
  padding: 10,
  borderRadius: 7,
  marginVertical: 5,
  $sm: {
    paddingHorizontal: 3,
  },
});

const cornerIconPosition = {
  position: 'absolute',
  top: -15,
  left: -10,
  height: 30,
} as const;

const SyringeIcon = () => <Syringe {...cornerIconPosition} color="$blue10Light" />;
const PizzaIcon = () => <Pizza {...cornerIconPosition} color="$orange10Light" />;
