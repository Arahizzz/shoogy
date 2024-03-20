import { useObservable } from 'observable-hooks';
import { createRxDatabase } from 'rxdb';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageLoki } from 'rxdb/plugins/storage-lokijs';
import { addRxPlugin } from 'rxdb/src';
import { type MangoQueryNoLimit, RxCollection, RxDatabase, RxDocument } from 'rxdb/src/types';
import { filter, Observable } from 'rxjs';

import { PartitionedAsyncStorageAdapter } from '~/core/db/lokijs';
import { profileSchema } from '~/core/db/schema';
import { Profile } from '~/core/models/profile';
import { isDefined } from '~/core/utils';
import { Platform } from 'react-native';

type DatabaseCollections = {
  profiles: RxCollection<Profile>;
};
export type Database = RxDatabase<DatabaseCollections>;

let _db: Database | null = null;
export const getDb = (async () => {
  if (__DEV__) {
    // await AsyncStorage.clear();
    // @ts-ignore
    addRxPlugin(RxDBDevModePlugin);
    //   console.log('Removing database');
    //   const collections = await removeRxDatabase(name, storage);
    //   console.log('Removed database', collections);
  }

  const name = 'shoogydb';
  const storage = getRxStorageLoki({
    adapter: new PartitionedAsyncStorageAdapter(),
    /*
     * Do not set lokiJS persistence options like autoload and autosave,
     * RxDB will pick proper defaults based on the given adapter
     */
  });

  const db = await createRxDatabase({
    name,
    storage,
    multiInstance: Platform.OS === 'web',
  });
  console.log('RxDB has been created');
  await db.addCollections<DatabaseCollections>({
    profiles: {
      schema: profileSchema,
    },
  });
  console.log('RxDB has been initialized');

  _db = db as unknown as Database;
  return _db;
})();

export function useDb(): Database {
  if (_db) return _db;
  throw getDb;
}

type GetDocType<D extends keyof DatabaseCollections> =
  DatabaseCollections[D] extends RxCollection<infer X> ? X : never;

export function useObservableDoc<C extends keyof DatabaseCollections>(
  collection: C,
  selector: MangoQueryNoLimit<GetDocType<C>> | string
): Observable<RxDocument<GetDocType<C>>> {
  const db = useDb();
  return useObservable(() =>
    db[collection].findOne(selector).$.pipe(filter(isDefined))
  ) as unknown as Observable<RxDocument<GetDocType<C>>>;
}
