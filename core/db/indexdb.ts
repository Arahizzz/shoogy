import * as SQLite from 'expo-sqlite';
//@ts-ignore
import setGlobalVars from 'indexeddbshim/dist/indexeddbshim-noninvasive';
import type { ShimmedObject } from 'indexeddbshim/dist/setGlobalVars';

const win = {} as ShimmedObject;

setGlobalVars(win, {
  checkOrigin: false,
  win: SQLite,
  deleteDatabaseFiles: false,
  useSQLiteIndexes: true,
  DEBUG: false,
});

export const indexedDB = win.indexedDB!;
export const IDBKeyRange = win.IDBKeyRange!;
