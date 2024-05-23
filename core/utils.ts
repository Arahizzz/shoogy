import { RxDocument } from 'rxdb/src/types';

export function isDefined<T>(obj: T): obj is NonNullable<T> {
  return !!obj;
}

export function unwrapDoc<T>(doc: RxDocument<T>): T {
  return doc._data;
}
