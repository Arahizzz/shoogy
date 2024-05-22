import {
  distinctUntilChanged,
  map,
  merge,
  Observable,
  Observer,
  OperatorFunction,
  pipe,
} from 'rxjs';
import { useObservableState } from 'observable-hooks';

export const linkNext = <T>(target: Observer<T>) => {
  return { next: (value: T) => target.next(value) };
};

export function useStateFromObservable<T>(
  observable$: Observable<T>
): [T | undefined, (_: T) => void] {
  const [state, setState] = useObservableState<T>((input$) => merge(input$, observable$));
  return [state, setState];
}

export function useStateFromObservableAndInitial<T>(
  observable$: Observable<T>,
  initialValue: T
): [T, (_: T) => void] {
  const [state, setState] = useObservableState<T>(
    (input$) => merge(input$, observable$),
    initialValue
  );
  return [state, setState];
}

export function useGetObservableProperty<T, K extends keyof T>(
  observable$: Observable<T>,
  prop: K
): Observable<T[K]> {
  return observable$.pipe(
    map((value) => value[prop]),
    distinctUntilChanged()
  );
}

export function throwIfNull<T>(): OperatorFunction<T, NonNullable<T>> {
  return pipe(
    map((value) => {
      if (!value) {
        throw new Error('Value is null');
      }
      return value;
    })
  );
}

export function mapArray<T, U>(fn: (value: T) => U): OperatorFunction<T[], U[]> {
  return pipe(
    map((arr) => {
      return arr.map(fn);
    })
  );
}
