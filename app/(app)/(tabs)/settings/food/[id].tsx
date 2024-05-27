import { useLocalSearchParams, useNavigation } from 'expo-router';
import { defer, filter, iif, map, merge, of, shareReplay, Subject } from 'rxjs';
import { Form } from 'tamagui';

import NumericInput from '~/components/input/numericInput';
import { isDefined, unwrapDoc } from '~/core/utils';
import { useObservable, useObservableState, useSubscription } from 'observable-hooks';
import { MealType } from '~/core/models/meal';
import { db } from '~/core/db';
import { uuidv4 } from '@firebase/util';
import { FormInput, FormLabel, FormRow } from '~/components/input/form';
import { confirmDelete } from '~/components/utils';

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

export const $saveChanges = new Subject<void>();
export const $remove = new Subject<void>();

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

  useSubscription($saveChanges, async () => {
    if (!meal) return;
    await db.meal_types.upsert(meal);
    navigation.goBack();
  });

  useSubscription($remove, async () => {
    if (!(await confirmDelete())) return;
    const doc = await db.meal_types.findOne(id).exec();
    if (doc) {
      await doc.remove();
    }
    navigation.goBack();
  });

  if (!meal) return null;

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
        <FormInput value={meal.name} onChangeText={setName} />
      </FormRow>
      <FormRow>
        <FormLabel>Digested Percentage</FormLabel>
        <NumericInput
          id="digested-percentage"
          min={0}
          initialValue={mealInit$.pipe(map((m) => m.digestedPercentage))}
          step={1}
          suffix={'%'}
          $changes={{
            next: setDigestedPercentage,
          }}
        />
      </FormRow>
      <FormRow>
        <FormLabel>Absorption Rate</FormLabel>
        <NumericInput
          id="absorption-rate-per-hr"
          min={0}
          initialValue={mealInit$.pipe(map((m) => m.carbsAbsorptionRatePerHr))}
          step={1}
          suffix={'g/hr'}
          $changes={{
            next: setCarbsAbsorptionRatePerHr,
          }}
        />
      </FormRow>
    </Form>
  );
}
