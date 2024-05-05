import { RxJsonSchema } from 'rxdb/src/types';

export type GlucoseEntry = {
  id: string;
  date: number;
  tick: number;
  sugar: number;
  direction: Direction;
};

export const enum Direction {
  'DoubleDown' = 'DoubleDown',
  'SingleDown' = 'SingleDown',
  'FortyFiveDown' = 'FortyFiveDown',
  'Flat' = 'Flat',
  'FortyFiveUp' = 'FortyFiveUp',
  'SingleUp' = 'SingleUp',
  'DoubleUp' = 'DoubleUp',
  Unknown = 'Unknown',
}

export const glucoseEntrySchema: RxJsonSchema<GlucoseEntry> = {
  title: 'GlucoseEntry',
  version: 0,
  description: 'Collection of user glucose entries',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    date: {
      type: 'number',
    },
    tick: {
      type: 'number',
    },
    sugar: {
      type: 'number',
    },
    direction: {
      type: 'string',
      enum: [
        'DoubleDown',
        'SingleDown',
        'FortyFiveDown',
        'Flat',
        'FortyFiveUp',
        'SingleUp',
        'DoubleUp',
        'Unknown',
      ],
    },
  },
  primaryKey: 'id',
  required: ['id', 'date', 'tick', 'sugar', 'direction'],
};
