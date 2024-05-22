import { Meal, PopulatedMeal } from '~/core/models/meal';
import { Injection, PopulatedInjection } from '~/core/models/injection';
import { db } from '~/core/db';
import { unwrapDoc } from '~/core/utils';

export type Activity = Meal | Injection;

export type PopulatedActivity = PopulatedMeal | PopulatedInjection;

export async function populateActivity(activity: Activity): Promise<PopulatedActivity> {
  if (activity.type === 'meal') {
    return {
      ...activity,
      mealType: await db.meal_types.findOne(activity.mealType).exec().then(unwrapDoc),
    };
  } else {
    return {
      ...activity,
      insulinType: await db.insulin_types.findOne(activity.insulinType).exec().then(unwrapDoc),
    };
  }
}
