import { useObservableState } from 'observable-hooks';
import { distinctUntilChanged, map, merge, Observable, OperatorFunction, pipe } from 'rxjs';
export function isDefined<T>(obj: T): obj is NonNullable<T> {
  return !!obj;
}

export function newId(): string {
  return 'p' + Date.now();
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
