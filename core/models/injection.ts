import { RxJsonSchema } from 'rxdb/src/types';

export type Injection = {
  id: string;
  type: 'insulin';
  insulinType: string;
  insulinAmount: number;
  startTick: number;
};

export type ActivityPoints = {
  tick: number;
  value: number;
};

export type InsulinType = {
  id: string;
  name: string;
  points: ActivityPoints[];
};

export type PopulatedInjection = Omit<Injection, 'insulinType'> & { insulinType: InsulinType };

export const Apidra: InsulinType = {
  id: 'Apidra',
  name: 'Apidra',
  points: [
    { tick: 0, value: 0.0 },
    { tick: 6, value: 0.5 },
    { tick: 12, value: 0.99 },
    { tick: 18, value: 0.6 },
    { tick: 24, value: 0.2 },
    { tick: 48, value: 0.0 },
  ],
};

export const insulinTypeSchema: RxJsonSchema<InsulinType> = {
  title: 'InsulinType',
  version: 0,
  description: 'Collection of user insulin types',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    name: {
      type: 'string',
    },
    points: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tick: { type: 'number' },
          value: { type: 'number' },
        },
        required: ['time', 'value'],
      },
    },
  },
  primaryKey: 'id',
  required: ['name', 'points'],
};

export const injectionSchema: RxJsonSchema<Injection> = {
  title: 'Injection',
  version: 0,
  description: 'Collection of user injections',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36,
    },
    type: {
      type: 'string',
    },
    insulinType: {
      type: 'string',
      ref: 'insulin_types',
    },
    insulinAmount: {
      type: 'number',
    },
    startTick: {
      type: 'number',
    },
  },
  primaryKey: 'id',
  required: ['id', 'type', 'insulinType', 'insulinAmount', 'startTick'],
};
