import { useLocalSearchParams, useNavigation } from 'expo-router';
import { combineLatestAll, filter, map, merge, mergeAll, Observable } from 'rxjs';
import { Button, Form, Input, styled, Text, XStack } from 'tamagui';

import NumericInput from '~/components/numeric-input';
import { useDb } from '~/core/db';
import { isDefined } from '~/core/utils';
import { useObservable, useObservableState } from 'observable-hooks';
import { MealType } from '~/core/models/meal';
import { nanoid } from 'nanoid';

type QueryParams = {
  id: string;
};
type MealTypeForm = Omit<MealType, 'id'>;

const initialMealTypeForm: MealTypeForm = {
  name: '',
  digestedPercentage: 100,
  carbsAbsorptionRatePerHr: 20,
};

export default function EditFoodScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<QueryParams>();
  const db = useDb();

  const mealInit$ = useObservable(() => db.meal_types.findOne(id).$);
  const [meal, setMeal] = useObservableState<MealTypeForm>(
    (input$) => merge(input$, mealInit$.pipe(filter(isDefined))),
    initialMealTypeForm
  );
  const onSubmit = async () => {
    const doc = await db.meal_types.findOne(id).exec();
    if (!doc) {
      db.meal_types.insert({
        ...meal,
        id: nanoid(),
      });
    } else {
      await doc.patch(meal);
    }
    navigation.goBack();
  };
  const onRemove = async () => {
    const doc = await db.meal_types.findOne(id).exec();
    if (doc) {
      await doc.remove();
    }
    navigation.goBack();
  };

  const setName = (name: string) => setMeal({ ...meal, name });
  const setDigestedPercentage = (digestedPercentage: number) =>
    setMeal({ ...meal, digestedPercentage });
  const setCarbsAbsorptionRatePerHr = (carbsAbsorptionRatePerHr: number) =>
    setMeal({ ...meal, carbsAbsorptionRatePerHr });

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
        <Input value={meal.name ?? ''} onChangeText={setName} />
      </FormRow>
      <FormRow>
        <Label>Digested Percentage</Label>
        <NumericInput
          id="digested-percentage"
          min={0}
          initialValue={mealInit$.pipe(
            map((m) => (m ? m.digestedPercentage : initialMealTypeForm.digestedPercentage))
          )}
          step={1}
          $changes={{
            next: setDigestedPercentage,
          }}
        />
      </FormRow>
      <FormRow>
        <Label>Carbs Absorption Rate Per Hour</Label>
        <NumericInput
          id="carbs-absorption-rate-per-hr"
          min={0}
          initialValue={mealInit$.pipe(
            map((m) =>
              m ? m.carbsAbsorptionRatePerHr : initialMealTypeForm.carbsAbsorptionRatePerHr
            )
          )}
          step={1}
          $changes={{
            next: setCarbsAbsorptionRatePerHr,
          }}
        />
      </FormRow>
      <Form.Trigger asChild>
        <Button onPress={onSubmit}>Save</Button>
      </Form.Trigger>
      {id && id !== 'new' && (
        <Form.Trigger asChild>
          <Button onPress={onRemove}>Remove</Button>
        </Form.Trigger>
      )}
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
