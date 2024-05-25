import { RxDocument } from 'rxdb/src/types';
import { shareReplay } from 'rxjs';

export function isDefined<T>(obj: T): obj is NonNullable<T> {
  return !!obj;
}

export function unwrapDoc<T>(doc: RxDocument<T>): T {
  return doc._data;
}

export const shareLatest = <T>() => shareReplay<T>(1);
