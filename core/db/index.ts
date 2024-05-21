import { useObservable } from 'observable-hooks';
import { Platform } from 'react-native';
import { addRxPlugin, createRxDatabase } from 'rxdb';
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
import { Apidra } from '~/core/models/injection';
import { mealTypes } from '~/core/models/meal';
import { defaultProfile } from '~/core/models/profile';

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

export let db: Database = undefined!;

const seedData = async () => {
  await db.insulin_types.upsert(Apidra);
  await db.meal_types.bulkUpsert(mealTypes);
  await db.profiles.upsert(defaultProfile);

  await db.states.profile_settings.set('selectedProfileId', (_) => defaultProfile.id);
};

export async function initDb() {
  const name = 'shoogydb';
  const storage = getRxStorageDexie({
    // @ts-ignore
    indexedDB,
    IDBKeyRange,
  });

  // if (__DEV__) {
  //   const { removeRxDatabase } = require('rxdb');
  //   console.log('Removing database');
  //   const collections = await removeRxDatabase(name, storage);
  //   console.log('Removed database', collections);
  // }

  const dbInstance = await createRxDatabase({
    name,
    // @ts-ignore
    storage,
    multiInstance: Platform.OS === 'web',
    ignoreDuplicate: __DEV__,
  });

  // @ts-ignore
  await dbInstance.addCollections<DatabaseCollections>(collections);
  console.log('RxDB has been initialized');

  for (const state of Object.values(states)) {
    await dbInstance.addState(state);
  }

  db = dbInstance as unknown as Database;

  await seedData();
}

export function useObservableDoc<C extends keyof DatabaseCollections>(
  collection: C,
  selector: MangoQueryNoLimit<GetCollectionType<C>> | string
): Observable<RxDocument<GetCollectionType<C>>> {
  return useObservable(() =>
    db[collection].findOne(selector).$.pipe(throwIfNull())
  ) as unknown as Observable<RxDocument<GetCollectionType<C>>>;
}
