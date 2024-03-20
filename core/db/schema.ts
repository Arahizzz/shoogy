import { appSchema, Model, tableSchema } from '@nozbe/watermelondb';
import { field, text, writer } from '@nozbe/watermelondb/decorators';

export const schema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'profile',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'insulin_sensitivity', type: 'number' },
        { name: 'carb_sensitivity', type: 'number' },
      ],
    }),
    tableSchema({
      name: 'settings',
      columns: [
        { name: 'name', type: 'string', isIndexed: true },
        { name: 'value', type: 'string' },
      ],
    }),
  ],
});

export class Profile extends Model {
  static table = 'profile';

  @field('name') name: string;
  @field('insulin_sensitivity') insulinSensitivity: number;
  @field('carb_sensitivity') carbSensitivity: number;
}

export class Setting extends Model {
  static table = 'settings';

  @text('name') name: string;
  @text('value') value: string;
}
