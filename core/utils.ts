import { RxDocument } from 'rxdb/src/types';

export function isDefined<T>(obj: T): obj is NonNullable<T> {
  return !!obj;
}

export function unwrapDoc<T>(doc: RxDocument<T> | null): T {
  if (!doc) {
    throw new Error('Document is null');
  }
  return doc._data;
}
