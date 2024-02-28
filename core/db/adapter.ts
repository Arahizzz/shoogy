import { DatabaseAdapter } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import { schema } from '~/core/db/schema';

export const adapter: DatabaseAdapter = new LokiJSAdapter({
  dbName: 'Shoogy',
  useWebWorker: false,
  useIncrementalIndexedDB: true,
  schema,
  // (You might want to comment out migrations for development purposes -- see Migrations documentation)
  // migrations,
});
