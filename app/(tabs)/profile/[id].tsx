import { Button, Form, Input, styled, Text, XStack } from 'tamagui';
import { Profile } from '~/core/db/schema';
import { db } from '~/core/db';
import { useObservable, useObservableCallback, useObservableState } from 'observable-hooks';
import { firstValueFrom, map, merge } from 'rxjs';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import NumericInput from '~/components/numeric-input';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const profile$ = useObservable(() => db.get<Profile>('profile').findAndObserve(id as string));
  const insulinSensitivity$ = useObservable(() =>
    profile$.pipe(map((profile) => profile.insulinSensitivity))
  );
  const carbSensitivity$ = useObservable(() =>
    profile$.pipe(map((profile) => profile.carbSensitivity))
  );
  const [insulinSensitivity, setInsulinSensitivity] = useObservableState(
    () => insulinSensitivity$,
    0
  );
  const [carbSensitivity, setCarbSensitivity] = useObservableState(() => carbSensitivity$, 0);
  const [name, setName] = useObservableState(
    (input$) => merge(input$, profile$.pipe(map((profile) => profile.name))),
    ''
  );
  const onSubmit = async () => {
    await db.write(async () => {
      const profile = await firstValueFrom(profile$);
      await profile.update((profile) => {
        profile.name = name;
        profile.insulinSensitivity = insulinSensitivity;
        profile.carbSensitivity = carbSensitivity;
      });
    });
    navigation.goBack();
  };

  return (
    <Form
      marginTop={20}
      onSubmit={() => {}}
      alignItems="stretch"
      alignSelf={'center'}
      minWidth={200}
      maxWidth={400}
      gap="$2">
      <FormRow>
        <Label>Name</Label>
        <Input value={name} onChangeText={setName} />
      </FormRow>
      <FormRow>
        <Label>Insulin Sensitivity</Label>
        <NumericInput
          id={'insulin-sensitivity'}
          min={0}
          initialValue={insulinSensitivity$}
          step={0.1}
          $changes={{
            next: setInsulinSensitivity,
          }}
        />
      </FormRow>
      <FormRow>
        <Label>Carb Sensitivity</Label>
        <NumericInput
          id={'carb-sensitivity'}
          min={0}
          initialValue={carbSensitivity$}
          step={0.5}
          $changes={{
            next: setCarbSensitivity,
          }}
        />
      </FormRow>
      <Form.Trigger asChild>
        <Button onPress={onSubmit}>Save</Button>
      </Form.Trigger>
    </Form>
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
