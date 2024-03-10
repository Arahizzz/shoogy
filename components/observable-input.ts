import {
  filter,
  first,
  map,
  NextObserver,
  Observable,
  of,
  PartialObserver,
  share,
  switchAll,
} from 'rxjs';
import { Mask, useMaskedInputProps } from 'react-native-mask-input';
import { useObservableState } from 'observable-hooks/src';
import { useObservable, useSubscription } from 'observable-hooks';
import { ValidationState } from '~/components/numeric-input';

type ObservableInputProps<T, TId extends string> = {
  id: TId;
  initialValue: Observable<number>;
  $changes?: PartialObserver<T>;
  $validation?: PartialObserver<ValidationState>;
  mask?: Mask;
  validate: (value: string) => T | Record<TId, string>;
  display: (value: T) => string;
};
export function useObservableInput<T, TId extends string>(props: ObservableInputProps<T, TId>) {
  const [state, setState] = useObservableState<string>(
    (input$) =>
      of(
        props.initialValue.pipe(
          first(),
          map((n) => n.toString())
        ),
        input$
      ).pipe(switchAll()),
    ''
  );
  const maskedInputProps = useMaskedInputProps({
    value: state,
    onChangeText: setState,
    mask: props.mask,
    maskAutoComplete: true,
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
    setValue: (value: T) => {
      setState(props.display(value));
    },
  };
}
