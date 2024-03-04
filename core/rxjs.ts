import { Observer } from 'rxjs';

export const linkNext = <T>(target: Observer<T>) => {
  return { next: (value: T) => target.next(value) };
};
