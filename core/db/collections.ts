import { RxCollection, type RxCollectionCreator, RxJsonSchema } from 'rxdb/src/types';

import { Profile } from '~/core/models/profile';

export const profileSchema: RxJsonSchema<Profile> = {
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

export type GetDocType<D extends keyof DatabaseCollections> =
  DatabaseCollections[D] extends RxCollection<infer X> ? X : never;

export const collections: {
  [key in keyof DatabaseCollections]: RxCollectionCreator<GetDocType<key>>;
} = {
  profiles: {
    schema: profileSchema,
  },
};
