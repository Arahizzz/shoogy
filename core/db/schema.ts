import { RxJsonSchema } from 'rxdb/src/types';

import { Profile } from '~/core/models/profile';

export const profileSchema = {
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
} as const satisfies RxJsonSchema<Profile>;
