import { useObservable } from 'observable-hooks';
import { Platform } from 'react-native';
import { createRxDatabase, addRxPlugin } from 'rxdb';
import { disableWarnings, RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageDexie } from 'rxdb/src/plugins/storage-dexie';
import { type MangoQueryNoLimit, RxDatabase, RxDocument } from 'rxdb/src/types';
import { Observable } from 'rxjs';

import {
  collections,
  DatabaseCollections,
  DatabaseStates,
  GetCollectionType,
  states,
} from '~/core/db/collections';
import { IDBKeyRange, indexedDB } from '~/core/db/indexdb';
import { throwIfNull } from '~/core/utils';
import { RxDBStatePlugin } from 'rxdb/plugins/state';

if (__DEV__) {
  disableWarnings();
  // @ts-ignore
  addRxPlugin(RxDBDevModePlugin);
}

addRxPlugin(RxDBStatePlugin);

export type Database = RxDatabase<
  DatabaseCollections & {
    states: DatabaseStates;
  }
>;

let _db: Database | null = null;

export const getDb = (async () => {
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

  // @ts-ignore
  await db.addCollections<DatabaseCollections>(collections);
  console.log('RxDB has been initialized');

  for (const state of states) {
    await db.addState(state);
  }

  _db = db as unknown as Database;
  return _db;
})();

export function useDb(): Database {
  if (_db) return _db;
  throw getDb;
}

export function useObservableDoc<C extends keyof DatabaseCollections>(
  collection: C,
  selector: MangoQueryNoLimit<GetCollectionType<C>> | string
): Observable<RxDocument<GetCollectionType<C>>> {
  const db = useDb();
  return useObservable(() =>
    db[collection].findOne(selector).$.pipe(throwIfNull())
  ) as unknown as Observable<RxDocument<GetCollectionType<C>>>;
}
