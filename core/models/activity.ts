import { Meal, PopulatedMeal } from '~/core/models/meal';
import { Injection, PopulatedInjection } from '~/core/models/injection';

export type Activity = Meal | Injection;

export type PopulatedActivity = PopulatedMeal | PopulatedInjection;
