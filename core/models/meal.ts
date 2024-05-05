import { RxJsonSchema } from 'rxdb/src/types';

export type MealType = {
  id: string;
  name: string;
  carbsAbsorptionRatePerHr: number;
  digestedPercentage: number;
};

export type Meal = {
  id: string;
  type: 'meal';
  carbsCount: number;
  mealType: string;
  startTick: number;
};

export type PopulatedMeal = Omit<Meal, 'mealType'> & { mealType: MealType };

export const mealTypeSchema: RxJsonSchema<MealType> = {
  title: 'MealType',
  version: 0,
  description: 'Collection of user meal types',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    name: {
      type: 'string',
    },
    carbsAbsorptionRatePerHr: {
      type: 'number',
    },
    digestedPercentage: {
      type: 'number',
    },
  },
  primaryKey: 'id',
  required: ['id', 'name', 'carbsAbsorptionRatePerHr'],
};

export const mealSchema: RxJsonSchema<Meal> = {
  title: 'Meal',
  version: 0,
  description: 'Collection of user meals',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    type: {
      type: 'string',
      enum: ['meal'],
    },
    carbsCount: {
      type: 'number',
    },
    mealType: {
      type: 'string',
      ref: 'meal_types',
    },
    startTick: {
      type: 'number',
    },
  },
  primaryKey: 'id',
  required: ['id', 'type', 'carbsCount', 'mealType', 'startTick'],
};

export const mealTypes: MealType[] = [
  {
    id: 'low-gi',
    name: 'Low GI',
    carbsAbsorptionRatePerHr: 30,
    digestedPercentage: 1,
  },
  {
    id: 'medium-gi',
    name: 'Medium GI',
    carbsAbsorptionRatePerHr: 45,
    digestedPercentage: 1,
  },
  {
    id: 'high-gi',
    name: 'High GI',
    carbsAbsorptionRatePerHr: 60,
    digestedPercentage: 1,
  },
  {
    id: 'protein',
    name: 'Protein',
    carbsAbsorptionRatePerHr: 15,
    digestedPercentage: 0.4,
  },
];
