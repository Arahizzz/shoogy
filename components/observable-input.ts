import { useObservable, useSubscription } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import { Mask, useMaskedInputProps } from 'react-native-mask-input';
import { filter, map, merge, Observable, PartialObserver, share } from 'rxjs';

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

// eslint-disable-next-line
export function useObservableInput<T extends {}, TId extends string>(
  props: ObservableInputProps<T, TId>
) {
  const [text, setText] = useObservableState<string>(
    (input$) => merge(props.value$.pipe(map((n) => props.display(n))), input$),
    ''
  );
  const maskedInputProps = useMaskedInputProps({
    value: text,
    onChangeText: setText,
    mask: props.mask,
    maskAutoComplete: false,
  });
  const validationState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        map(([value]) => props.validate(value)),
        share()
      ),
    [text]
  );
  const isInvalid = (value: T | Record<TId, string>): value is Record<TId, string> => {
    return typeof value === 'object' && props.id in value;
  };
  const isValid = (value: T | Record<TId, string>): value is T => {
    return !isInvalid(value);
  };
  const changes$ = useObservable(() => validationState$.pipe(filter(isValid)));
  const errors$ = useObservable(() => validationState$.pipe(filter(isInvalid)));

  useSubscription(changes$, props.$changes);
  useSubscription(errors$, props.$validation);

  return {
    inputProps: maskedInputProps,
    setText,
    changes$,
    errors$,
  };
}
