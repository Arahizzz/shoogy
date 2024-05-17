import { open, OPSQLiteConnection, QueryResult } from '@op-engineering/op-sqlite';
//@ts-ignore
import setGlobalVars from 'indexeddbshim/dist/indexeddbshim-noninvasive';
import type { ShimmedObject } from 'indexeddbshim/dist/setGlobalVars';

type WebSQLTransactionCallback = (tx: WebSQLTransaction) => void;
type WebSQLTransactionErrorCallback = (tx: WebSQLTransaction, error: any) => void;
type WebSQLTransactionSuccessCallback = (tx: WebSQLTransaction, resultSet: QueryResult) => void;

interface WebSQLTransaction {
  executeSql(
    query: string,
    params: any[],
    successCallback?: WebSQLTransactionSuccessCallback,
    errorCallback?: WebSQLTransactionErrorCallback
  ): void;
}

/**
 * Shim around the op-sqlite library to provide a WebSQL-like API
 */
class WebSQLWrapper {
  constructor(private db: OPSQLiteConnection) {}

  transaction(
    txCallback: WebSQLTransactionCallback,
    onError?: (e: any) => void,
    onSuccess?: () => void
  ): void {
    this.db
      .transaction(async (transaction) => {
        let txPromise: Promise<void> = Promise.resolve();
        const tx: WebSQLTransaction = {
          executeSql: (
            query: string,
            params: any[],
            successCallback?: WebSQLTransactionSuccessCallback,
            errorCallback?: WebSQLTransactionErrorCallback
          ) => {
            txPromise = txPromise.then(() =>
              transaction
                .executeAsync(query, params)
                .then((result) => {
                  if (successCallback) {
                    successCallback(tx, result);
                  }
                  return result;
                })
                .catch((error) => {
                  console.error('Error executing SQL query', query, params, error);
                  if (errorCallback) {
                    errorCallback(tx, error);
                  }
                  throw error;
                })
            ) as Promise<void>;
          },
        };

        txCallback(tx);

        return txPromise
          .catch((error) => {
            if (onError) {
              onError(error);
            }
            throw error;
          })
          .then(() => {
            if (onSuccess) {
              onSuccess();
            }
          });
      })
      .catch(console.error);
  }

  readTransaction(callback: WebSQLTransactionCallback): void {
    this.transaction(callback);
  }

  static openDatabase(
    name: string,
    version: string,
    displayName: string,
    estimatedSize: number,
    creationCallback?: (db: WebSQLWrapper) => void
  ): WebSQLWrapper {
    // Open the database using the provided API
    const db = open({ name });
    const webSQLDb = new WebSQLWrapper(db);

    // Call the creation callback if provided
    if (creationCallback) {
      creationCallback(webSQLDb);
    }

    return webSQLDb;
  }
}

const win = {} as ShimmedObject;

setGlobalVars(win, {
  checkOrigin: false,
  win: WebSQLWrapper,
  deleteDatabaseFiles: false,
  useSQLiteIndexes: true,
  DEBUG: false,
});

export const indexedDB = win.indexedDB!;
export const IDBKeyRange = win.IDBKeyRange!;
