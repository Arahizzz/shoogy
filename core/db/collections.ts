import { RxCollection, type RxCollectionCreator, RxState } from 'rxdb/src/types';

import { Profile, profileSchema, ProfileSettings } from '~/core/models/profile';
import {
  Injection,
  injectionSchema,
  InsulinType,
  insulinTypeSchema,
} from '~/core/models/injection';
import { Meal, mealSchema, MealType, mealTypeSchema } from '~/core/models/meal';
import { GlucoseEntry, glucoseEntrySchema } from '~/core/models/glucoseEntry';

export type DatabaseCollections = {
  profiles: RxCollection<Profile>;
  insulin_types: RxCollection<InsulinType>;
  injections: RxCollection<Injection>;
  meal_types: RxCollection<MealType>;
  meals: RxCollection<Meal>;
  glucose_entries: RxCollection<GlucoseEntry>;
};

export type DatabaseStates = {
  profile_settings: RxState<ProfileSettings>;
};

export type GetCollectionType<D extends keyof DatabaseCollections> =
  DatabaseCollections[D] extends RxCollection<infer X> ? X : never;

export type GetStateType<D extends keyof DatabaseStates> =
  DatabaseStates[D] extends RxState<infer X> ? X : never;

export type Collections = {
  [key in keyof DatabaseCollections as DatabaseCollections[key] extends RxCollection
    ? key
    : never]: RxCollection<GetCollectionType<key>>;
};

export const collections: {
  [key in keyof Collections]: RxCollectionCreator<GetCollectionType<key>>;
} = {
  profiles: {
    schema: profileSchema,
  },
  insulin_types: {
    schema: insulinTypeSchema,
  },
  injections: {
    schema: injectionSchema,
  },
  meal_types: {
    schema: mealTypeSchema,
  },
  meals: {
    schema: mealSchema,
  },
  glucose_entries: {
    schema: glucoseEntrySchema,
  },
};

export const states: Record<keyof DatabaseStates, string> = {
  profile_settings: 'profile_settings',
};
