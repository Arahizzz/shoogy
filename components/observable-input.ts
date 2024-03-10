import { filter, map, merge, Observable, PartialObserver, share } from 'rxjs';
import { Mask, useMaskedInputProps } from 'react-native-mask-input';
import { useObservableState } from 'observable-hooks/src';
import { useObservable, useSubscription } from 'observable-hooks';
import { ValidationState } from '~/components/numeric-input';

type ObservableInputProps<T, TId extends string> = {
  id: TId;
  value$: Observable<T>;
  $changes?: PartialObserver<T>;
  $validation?: PartialObserver<ValidationState>;
  mask?: Mask;
  validate: (value: string) => T | Record<TId, string>;
  display: (value: T) => string;
};

export const validationError = <TId extends string>(id: TId, message: string) => ({
  [id]: message,
});

export function useObservableInput<T, TId extends string>(props: ObservableInputProps<T, TId>) {
  const [state, setState] = useObservableState<string>(
    (input$) => merge(props.value$.pipe(map((n) => props.display(n))), input$),
    ''
  );
  const maskedInputProps = useMaskedInputProps({
    value: state,
    onChangeText: setState,
    mask: props.mask,
    maskAutoComplete: false,
  });
  const validationState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        map(([value]) => props.validate(value)),
        share()
      ),
    [state]
  );
  const isValid = (value: T | Record<TId, string>): value is T => {
    return value && !(typeof value === 'object' && props.id in value);
  };
  const isInvalid = (value: T | Record<TId, string>): value is Record<TId, string> => {
    return value && typeof value === 'object' && props.id in value;
  };
  const changes$ = useObservable(() => validationState$.pipe(filter(isValid)));
  const errors$ = useObservable(() => validationState$.pipe(filter(isInvalid)));

  useSubscription(changes$, props.$changes);
  useSubscription(errors$, props.$validation);

  return {
    inputProps: maskedInputProps,
    setState,
    changes$,
    errors$,
  };
}
