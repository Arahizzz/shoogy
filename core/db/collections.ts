import { RxCollection, type RxCollectionCreator, RxJsonSchema, RxState } from 'rxdb/src/types';

import { Profile, ProfileSettings } from '~/core/models/profile';

const profileSchema: RxJsonSchema<Profile> = {
  title: 'Profile',
  version: 0,
  description: "Collection of user's individual parameters",
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 36, // <- the primary key must have set maxLength
    },
    name: {
      type: 'string',
    },
    insulinSensitivity: {
      type: 'number',
    },
    carbSensitivity: {
      type: 'number',
    },
  },
  primaryKey: 'id',
  required: ['id', 'name', 'insulinSensitivity', 'carbSensitivity'],
};

export type DatabaseCollections = {
  profiles: RxCollection<Profile>;
};

export type DatabaseStates = {
  ['profile_settings']: RxState<ProfileSettings>;
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
};

export const states: (keyof DatabaseStates)[] = ['profile_settings'];
