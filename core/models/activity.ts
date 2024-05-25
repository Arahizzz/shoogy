import { Meal, MealType, PopulatedMeal } from '~/core/models/meal';
import { Injection, InsulinType, PopulatedInjection } from '~/core/models/injection';
import { db } from '~/core/db';
import { unwrapDoc } from '~/core/utils';
import { map, Observable } from 'rxjs';
import { throwIfNull } from '~/core/rxjs';

export type Activity = Meal | Injection;

export type PopulatedActivity = PopulatedMeal | PopulatedInjection;

export function populateMeal(meal: Meal): Observable<PopulatedMeal> {
  return db.meal_types.findOne(meal.mealType).$.pipe(
    throwIfNull(),
    map(unwrapDoc<MealType>),
    map((mealType) => ({
      ...meal,
      mealType,
    }))
  );
}

export function populateInjection(injection: Injection): Observable<PopulatedInjection> {
  return db.insulin_types.findOne(injection.insulinType).$.pipe(
    throwIfNull(),
    map(unwrapDoc<InsulinType>),
    map((insulinType) => ({
      ...injection,
      insulinType,
    }))
  );
}

export function populateActivity(activity: Activity): Observable<PopulatedActivity> {
  return activity.type === 'meal' ? populateMeal(activity) : populateInjection(activity);
}
