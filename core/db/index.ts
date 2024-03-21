import { useObservable } from 'observable-hooks';
import { Platform } from 'react-native';
import { createRxDatabase } from 'rxdb';
import { disableWarnings, RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { addRxPlugin } from 'rxdb/src';
import { getRxStorageDexie } from 'rxdb/src/plugins/storage-dexie';
import { type MangoQueryNoLimit, RxDatabase, RxDocument } from 'rxdb/src/types';
import { filter, Observable } from 'rxjs';

import { collections, DatabaseCollections, GetDocType } from '~/core/db/collections';
import { IDBKeyRange, indexedDB } from '~/core/db/indexdb';
import { isDefined } from '~/core/utils';

export type Database = RxDatabase<DatabaseCollections>;

let _db: Database | null = null;

export const getDb = (async () => {
  if (__DEV__) {
    disableWarnings();
    // @ts-ignore
    addRxPlugin(RxDBDevModePlugin);
  }

  const name = 'shoogydb';
  const storage = getRxStorageDexie({
    // @ts-ignore
    indexedDB,
    IDBKeyRange,
  });

  // if (__DEV__) {
  //   console.log('Removing database');
  //   const collections = await removeRxDatabase(name, storage);
  //   console.log('Removed database', collections);
  // }

  const db = await createRxDatabase({
    name,
    // @ts-ignore
    storage,
    multiInstance: Platform.OS === 'web',
  });
  console.log('RxDB has been created');
  // @ts-ignore

  await db.addCollections<DatabaseCollections>(collections);
  console.log('RxDB has been initialized');

  _db = db as unknown as Database;
  return _db;
})();

export function useDb(): Database {
  if (_db) return _db;
  throw getDb;
}

export function useObservableDoc<C extends keyof DatabaseCollections>(
  collection: C,
  selector: MangoQueryNoLimit<GetDocType<C>> | string
): Observable<RxDocument<GetDocType<C>>> {
  const db = useDb();
  return useObservable(() =>
    db[collection].findOne(selector).$.pipe(filter(isDefined))
  ) as unknown as Observable<RxDocument<GetDocType<C>>>;
}
