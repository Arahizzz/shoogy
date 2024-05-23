import { useLocalSearchParams, useNavigation } from 'expo-router';
import { defer, filter, iif, map, merge, of, shareReplay } from 'rxjs';
import { Button, Form, Input } from 'tamagui';

import NumericInput from '~/components/input/numericInput';
import { db } from '~/core/db';
import { FormLabel, FormRow } from '~/components/input/form';
import React from 'react';
import { useObservable, useObservableState } from 'observable-hooks';
import { isDefined, unwrapDoc } from '~/core/utils';
import { Profile } from '~/core/models/profile';
import { uuidv4 } from '@firebase/util';

const initialProfileForm = () =>
  of<Profile>({
    id: uuidv4(),
    name: '',
    insulinSensitivity: 3,
    carbSensitivity: 3,
    insulinType: 'Apidra',
  });

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const profileInit$ = useObservable(() =>
    iif(
      () => id === 'new',
      defer(initialProfileForm),
      db.profiles
        .findOne(id)
        .$.pipe(filter(isDefined), map(unwrapDoc<Profile>))
        .pipe(shareReplay(1))
    )
  );
  const [profile, setProfile] = useObservableState<Profile>((input$) =>
    merge(input$, profileInit$)
  );

  if (!profile) return null;

  const onSubmit = async () => {
    await db.profiles.upsert(profile);
    navigation.goBack();
  };

  const onRemove = async () => {
    const doc = await db.profiles.findOne(id).exec();
    if (doc) {
      await doc.remove();
    }
    navigation.goBack();
  };

  const setName = (name: string) => setProfile({ ...profile, name });
  const setInsulinSensitivity = (insulinSensitivity: number) =>
    setProfile({ ...profile, insulinSensitivity });
  const setCarbSensitivity = (carbSensitivity: number) =>
    setProfile({ ...profile, carbSensitivity });

  return (
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
        <Input value={profile.name} onChangeText={setName} />
      </FormRow>
      <FormRow>
        <FormLabel>Insulin Sensitivity</FormLabel>
        <NumericInput
          id="insulin-sensitivity"
          min={0}
          initialValue={profileInit$.pipe(map((p) => p.insulinSensitivity))}
          step={0.1}
          $changes={{
            next: setInsulinSensitivity,
          }}
        />
      </FormRow>
      <FormRow>
        <FormLabel>Carb Sensitivity</FormLabel>
        <NumericInput
          id="carb-sensitivity"
          min={0}
          initialValue={profileInit$.pipe(map((p) => p.carbSensitivity))}
          step={0.5}
          $changes={{
            next: setCarbSensitivity,
          }}
        />
      </FormRow>
      <Form.Trigger asChild>
        <Button onPress={onSubmit}>Save</Button>
      </Form.Trigger>
      <Form.Trigger asChild>
        <Button backgroundColor={'red'} onPress={onRemove}>
          Remove
        </Button>
      </Form.Trigger>
    </Form>
  );
}
