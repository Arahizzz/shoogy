import { DatabaseAdapter } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from '~/core/db/schema';

export const adapter: DatabaseAdapter = new SQLiteAdapter({
  dbName: 'Shoogy',
  schema,
  jsi: true /* enable if Platform.OS === 'ios' */,
  // (You might want to comment out migrations for development purposes -- see Migrations documentation)
  // migrations,
});
