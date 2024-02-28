import { appSchema, Model, tableSchema } from '@nozbe/watermelondb';
import { field, text } from '@nozbe/watermelondb/decorators';

export const schema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'board_games',
      columns: [
        { name: 'title', type: 'string', isIndexed: true }, // indexed means that we can search the column based on the title
        { name: 'min_players', type: 'number' },
      ],
    }),
  ],
});

export class BoardGame extends Model {
  static table = 'board_games'; // bind the model to specific table
  // @ts-ignore
  @text('title') title: string; // binds a table column to a model property
  // @ts-ignore
  @field('min_players') minPlayers; // for non-text fields you the "field" decorator
}
