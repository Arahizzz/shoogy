import AsyncStorage from '@react-native-async-storage/async-storage';
import { LokiPartitioningAdapter } from 'lokijs';

interface LokiPersistenceAdapter {
  mode?: string | undefined;
  loadDatabase(dbname: string, callback: (value: any) => void): void;
  deleteDatabase?(dbnameOrOptions: any, callback: (err?: Error | null, data?: any) => void): void;
  exportDatabase?(dbname: string, dbref: Loki, callback: (err: Error | null) => void): void;
  saveDatabase?(dbname: string, dbstring: any, callback: (err?: Error | null) => void): void;
}

export class AsyncStorageAdapter implements LokiPersistenceAdapter {
  loadDatabase(dbname: string, callback: (value: any) => void): void {
    AsyncStorage.getItem(dbname)
      .then((data) => {
        callback(data ?? '');
      })
      .catch((err) => {
        console.error('loadDatabase', dbname, err);
        callback(err);
      });
  }
  deleteDatabase(dbnameOrOptions: any, callback: (err?: Error | null, data?: any) => void): void {
    AsyncStorage.removeItem(dbnameOrOptions)
      .then(() => callback(null))
      .catch((err) => {
        console.error('deleteDatabase', dbnameOrOptions, err);
        callback(err);
      });
  }
  saveDatabase(dbname: string, dbstring: any, callback: (err?: Error | null) => void): void {
    AsyncStorage.setItem(dbname, dbstring)
      .then(() => callback(null))
      .catch((err) => {
        console.error('saveDatabase', dbname, err);
        callback(err);
      });
  }
}

export class PartitionedAsyncStorageAdapter extends LokiPartitioningAdapter {
  constructor(options?: any) {
    super(new AsyncStorageAdapter(), options);
  }
}
