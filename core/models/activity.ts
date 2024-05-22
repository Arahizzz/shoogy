import { Meal, PopulatedMeal } from '~/core/models/meal';
import { Injection, PopulatedInjection } from '~/core/models/injection';
import { db } from '~/core/db';
import { unwrapDoc } from '~/core/utils';

export type Activity = Meal | Injection;

export type PopulatedActivity = PopulatedMeal | PopulatedInjection;

export async function populateMeal(meal: Meal): Promise<PopulatedMeal> {
  return {
    ...meal,
    mealType: await db.meal_types.findOne(meal.mealType).exec().then(unwrapDoc),
  };
}

export async function populateInjection(injection: Injection): Promise<PopulatedInjection> {
  return {
    ...injection,
    insulinType: await db.insulin_types.findOne(injection.insulinType).exec().then(unwrapDoc),
  };
}
