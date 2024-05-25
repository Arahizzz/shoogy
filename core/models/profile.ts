import { RxJsonSchema } from 'rxdb/src/types';

export interface Profile {
  id: string;
  name: string;
  insulinSensitivity: number;
  carbSensitivity: number;
  insulinType: string;
}

export interface ProfileSettings {
  selectedProfileId: string;
}

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
    insulinType: {
      type: 'string',
      ref: 'insulin_types',
    },
  },
  primaryKey: 'id',
  required: ['id', 'name', 'insulinSensitivity', 'carbSensitivity'],
};

export const defaultProfile: Profile = {
  id: 'default',
  name: 'Default',
  insulinSensitivity: 3,
  carbSensitivity: 0.3,
  insulinType: 'Apidra',
};
