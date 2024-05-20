import { useLocalSearchParams, useNavigation } from 'expo-router';
import { filter, merge, of } from 'rxjs';
import { Button, Form, Input, styled, Text, XStack, YStack } from 'tamagui';

import NumericInput from '~/components/numeric-input';
import { useDb } from '~/core/db';
import { isDefined } from '~/core/utils';
import { useObservable, useObservableState } from 'observable-hooks';
import { nanoid } from 'nanoid';
import { InsulinType } from '~/core/models/injection';
import { Plus, Trash2 } from '@tamagui/lucide-icons';
import React from 'react';

type QueryParams = {
  id: string;
};
type InsulinTypeForm = Omit<InsulinType, 'id'>;

const initialMealTypeForm: InsulinTypeForm = {
  name: '',
  points: [
    {
      tick: 0,
      value: 0,
    },
  ],
};

export default function EditInsulinScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<QueryParams>();
  const db = useDb();

  const insulinInit$ = useObservable(() => db.insulin_types.findOne(id).$);
  const [insulin, setInsulin] = useObservableState<InsulinTypeForm>(
    (input$) => merge(input$, insulinInit$.pipe(filter(isDefined))),
    initialMealTypeForm
  );
  const onSubmit = async () => {
    const doc = await db.insulin_types.findOne(id).exec();
    if (!doc) {
      db.insulin_types.insert({
        ...insulin,
        id: nanoid(),
      });
    } else {
      await doc.patch(insulin);
    }
    navigation.goBack();
  };
  const onRemove = async () => {
    const doc = await db.insulin_types.findOne(id).exec();
    if (doc) {
      await doc.remove();
    }
    navigation.goBack();
  };

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
          <Label>Name</Label>
          <Input value={insulin.name} onChangeText={setName} />
        </FormRow>
        <XStack>
          <Label>Points:</Label>
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
              $xs={{ height: 30 }}
              onPress={() => removePoint(i)}
              icon={<Trash2 color={'red'} size="$1" />}
            />
          </FormRow>
        ))}
        <Form.Trigger asChild>
          <Button onPress={onSubmit}>Save</Button>
        </Form.Trigger>
        {id && id !== 'new' && (
          <Form.Trigger asChild>
            <Button onPress={onRemove}>Remove</Button>
          </Form.Trigger>
        )}
      </Form>
    </YStack>
  );
}

const FormRow = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
});

const Label = styled(Text, {
  color: 'black',
});
