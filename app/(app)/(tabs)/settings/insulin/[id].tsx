import { useLocalSearchParams, useNavigation } from 'expo-router';
import { defer, filter, iif, map, merge, of, shareReplay, Subject } from 'rxjs';
import { Button, Form, Input, XStack, YStack } from 'tamagui';

import NumericInput from '~/components/input/numericInput';
import { isDefined, unwrapDoc } from '~/core/utils';
import { useObservable, useObservableState, useSubscription } from 'observable-hooks';
import { InsulinType } from '~/core/models/injection';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import React from 'react';
import { db } from '~/core/db';
import { uuidv4 } from '@firebase/util';
import { FormLabel, FormRow } from '~/components/input/form';
import { confirmDelete } from '~/components/utils';

type QueryParams = {
  id: string;
};

const initialInsulinTypeForm = () =>
  of<InsulinType>({
    id: uuidv4(),
    name: '',
    points: [
      {
        tick: 0,
        value: 0,
      },
    ],
  });

export const $saveChanges = new Subject<void>();
export const $remove = new Subject<void>();

export default function EditInsulinScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<QueryParams>();

  const insulinInit$ = useObservable(() =>
    iif(
      () => id === 'new',
      defer(initialInsulinTypeForm),
      db.insulin_types
        .findOne(id)
        .$.pipe(filter(isDefined), map(unwrapDoc<InsulinType>))
        .pipe(shareReplay(1))
    )
  );
  const [insulin, setInsulin] = useObservableState<InsulinType>((input$) =>
    merge(input$, insulinInit$)
  );

  useSubscription($saveChanges, async () => {
    if (!insulin) return;
    await db.insulin_types.upsert(insulin);
    navigation.goBack();
  });
  useSubscription($remove, async () => {
    if (!(await confirmDelete())) return;
    const doc = await db.insulin_types.findOne(id).exec();
    if (doc) {
      await doc.remove();
    }
    navigation.goBack();
  });

  if (!insulin) return null;

  const setName = (name: string) => setInsulin({ ...insulin, name });
  const setPointTick = (index: number, value: number) => {
    setInsulin({
      ...insulin,
      points: insulin.points.map((v, i) => {
        if (i === index) return { tick: value, value: v.value };
        return v;
      }),
    });
  };
  const setPointValue = (index: number, value: number) => {
    setInsulin({
      ...insulin,
      points: insulin.points.map((v, i) => {
        if (i === index) return { value: value, tick: v.tick };
        return v;
      }),
    });
  };
  const addPoint = () =>
    setInsulin({
      ...insulin,
      points: [
        ...insulin.points,
        {
          tick: 0,
          value: 0,
        },
      ],
    });
  const removePoint = (index: number) =>
    setInsulin({
      ...insulin,
      points: insulin.points.filter((_, i) => i !== index),
    });

  return (
    <YStack>
      {/*<ScatterChart series={} dataZoom={of(undefined)} />*/}
      <Form
        marginTop={20}
        onSubmit={() => {}}
        alignItems="stretch"
        alignSelf="center"
        minWidth={200}
        maxWidth={400}
        gap="$2">
        <FormRow>
          <FormLabel>Name</FormLabel>
          <Input value={insulin.name} onChangeText={setName} />
        </FormRow>
        <XStack>
          <FormLabel>Points:</FormLabel>
          <Button
            variant="outlined"
            borderColor={undefined}
            height={20}
            onPress={() => addPoint()}
            icon={<Plus color={'black'} size="$1" />}
          />
        </XStack>
        {insulin.points.map((p, i) => (
          <FormRow key={i}>
            <NumericInput
              id={`tick-${i}`}
              initialValue={of(p.tick)}
              step={1}
              min={0}
              $changes={{
                next: (n) => setPointTick(i, n),
              }}
            />
            <NumericInput
              id={`value-${i}`}
              initialValue={of(p.value)}
              step={0.1}
              min={0}
              max={1}
              $changes={{
                next: (n) => setPointValue(i, n),
              }}
            />
            <Button
              variant="outlined"
              borderColor={undefined}
              paddingHorizontal={5}
              height={40}
              $xs={{ height: 20 }}
              onPress={() => removePoint(i)}
              icon={<Trash2 color={'red'} size="$1" />}
            />
          </FormRow>
        ))}
      </Form>
    </YStack>
  );
}
