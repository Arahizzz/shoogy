import { open, QueryResult, OPSQLiteConnection } from '@op-engineering/op-sqlite';
//@ts-ignore
import setGlobalVars from 'indexeddbshim/dist/indexeddbshim-noninvasive';
import type { ShimmedObject } from 'indexeddbshim/dist/setGlobalVars';

type SQLTransactionCallback = (tx: SQLTransaction) => void;
type SQLTransactionErrorCallback = (tx: SQLTransaction, error: any) => void;
type SQLTransactionSuccessCallback = (tx: SQLTransaction, resultSet: QueryResult) => void;

interface SQLTransaction {
  executeSql(
    query: string,
    params: any[],
    successCallback?: SQLTransactionSuccessCallback,
    errorCallback?: SQLTransactionErrorCallback
  ): void;
}

class WebSQLWrapper {
  constructor(private db: OPSQLiteConnection) {}

  transaction(
    txCallback: SQLTransactionCallback,
    onError?: (e: any) => void,
    onSuccess?: () => void
  ): void {
    this.db
      .transaction(async (transaction) => {
        const tx: SQLTransaction = {
          executeSql: (
            query: string,
            params: any[],
            successCallback?: SQLTransactionSuccessCallback,
            errorCallback?: SQLTransactionErrorCallback
          ) => {
            transaction
              .executeAsync(query, params)
              .then((result) => {
                if (successCallback) {
                  successCallback(tx, result);
                }
              })
              .catch((error) => {
                if (errorCallback) {
                  errorCallback(tx, error);
                }
              });
          },
        };
        if (onSuccess) {
          onSuccess();
        }
        txCallback(tx);
      })
      .catch((error) => {
        console.error('Transaction error:', error);
        if (onError) {
          onError(error);
        }
      });
  }

  readTransaction(callback: SQLTransactionCallback): void {
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
