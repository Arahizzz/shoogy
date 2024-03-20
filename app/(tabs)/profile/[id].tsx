import { useLocalSearchParams, useNavigation } from 'expo-router';
import { firstValueFrom } from 'rxjs';
import { Button, Form, Input, styled, Text, XStack } from 'tamagui';

import NumericInput from '~/components/numeric-input';
import { useObservableDoc } from '~/core/db';
import {
  useGetObservableProperty,
  useStateFromObservable,
  useStateFromObservableAndInitial,
} from '~/core/utils';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const profile$ = useObservableDoc('profiles', id as string);
  const name$ = useGetObservableProperty(profile$, 'name');
  const insulinSensitivity$ = useGetObservableProperty(profile$, 'insulinSensitivity');
  const carbSensitivity$ = useGetObservableProperty(profile$, 'carbSensitivity');
  const [insulinSensitivity, setInsulinSensitivity] = useStateFromObservable(insulinSensitivity$);
  const [carbSensitivity, setCarbSensitivity] = useStateFromObservable(carbSensitivity$);
  const [name, setName] = useStateFromObservableAndInitial(name$, '');
  const onSubmit = async () => {
    const doc = await firstValueFrom(profile$);
    await doc.patch({
      insulinSensitivity,
      carbSensitivity,
      name,
    });
    navigation.goBack();
  };

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
        <Label>Name</Label>
        <Input value={name} onChangeText={setName} />
      </FormRow>
      <FormRow>
        <Label>Insulin Sensitivity</Label>
        <NumericInput
          id="insulin-sensitivity"
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
          id="carb-sensitivity"
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
