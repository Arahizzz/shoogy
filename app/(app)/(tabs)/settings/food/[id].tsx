import { useLocalSearchParams, useNavigation } from 'expo-router';
import { defer, filter, iif, map, merge, of, shareReplay } from 'rxjs';
import { Button, Form, Input } from 'tamagui';

import NumericInput from '~/components/input/numericInput';
import { isDefined, unwrapDoc } from '~/core/utils';
import { useObservable, useObservableState } from 'observable-hooks';
import { MealType } from '~/core/models/meal';
import { db } from '~/core/db';
import { uuidv4 } from '@firebase/util';
import { FormLabel, FormRow } from '~/components/input/form';

type QueryParams = {
  id: string;
};

const initialMealTypeForm = () =>
  of<MealType>({
    id: uuidv4(),
    name: '',
    digestedPercentage: 100,
    carbsAbsorptionRatePerHr: 20,
  });

export default function EditFoodScreen() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams<QueryParams>();

  const mealInit$ = useObservable(() =>
    iif(
      () => id === 'new',
      defer(initialMealTypeForm),
      db.meal_types.findOne(id).$.pipe(filter(isDefined), map(unwrapDoc<MealType>))
    ).pipe(shareReplay(1))
  );
  const [meal, setMeal] = useObservableState<MealType>((input$) => merge(input$, mealInit$));

  if (!meal) return null;

  const onSubmit = async () => {
    await db.meal_types.upsert(meal);
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
      width={'90%'}
      maxWidth={400}
      gap="$2">
      <FormRow>
        <FormLabel>Name</FormLabel>
        <Input value={meal.name} onChangeText={setName} />
      </FormRow>
      <FormRow>
        <FormLabel>Digested Percentage</FormLabel>
        <NumericInput
          id="digested-percentage"
          min={0}
          initialValue={mealInit$.pipe(map((m) => m.digestedPercentage))}
          step={1}
          $changes={{
            next: setDigestedPercentage,
          }}
        />
      </FormRow>
      <FormRow>
        <FormLabel>Carbs Absorption Rate</FormLabel>
        <NumericInput
          id="carbs-absorption-rate-per-hr"
          min={0}
          initialValue={mealInit$.pipe(map((m) => m.carbsAbsorptionRatePerHr))}
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
          <Button backgroundColor={'red'} onPress={onRemove}>
            Remove
          </Button>
        </Form.Trigger>
      )}
    </Form>
  );
}
