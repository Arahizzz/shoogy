import { Button, Input, XStack } from 'tamagui';
import {
  combineLatestWith,
  filter,
  map,
  NextObserver,
  Observable,
  of,
  share,
  switchAll,
} from 'rxjs';
import { useObservable, useSubscription } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';

export type ValidationState = Record<string, Record<string, string>>;

type Props = {
  id: string;
  initialValue: Observable<number>;
  $changes?: NextObserver<number>;
  $validation?: NextObserver<ValidationState>;
  min?: number;
  max?: number;
  step: number;
};

const isNumber = (value: any): value is number => {
  return typeof value === 'number';
};

const isString = (value: any): value is string => {
  return typeof value === 'string';
};

export default function NumericInput(props: Props) {
  const validate = (value?: string) => {
    if (!value) return 'Required';
    const number = parseFloat(value);
    if (isNaN(number)) return 'Not a number';
    if (props.min && number < props.min) return 'Too low';
    if (props.max && number > props.max) return 'Too high';
    return number;
  };

  const [state, setState] = useObservableState<string>(
    (input$) => of(props.initialValue.pipe(map((n) => n.toString())), input$).pipe(switchAll()),
    ''
  );
  const validationState$ = useObservable(
    (inputs$) =>
      inputs$.pipe(
        map(([value]) => validate(value)),
        share()
      ),
    [state]
  );
  const changes$ = useObservable(() => validationState$.pipe(filter(isNumber)));
  const errors$ = useObservable(
    (inputs$) =>
      validationState$.pipe(
        filter(isString),
        combineLatestWith(inputs$),
        map(([value, [id]]) => ({ [id]: { value } }))
      ),
    [props.id]
  );

  useSubscription(changes$, props.$changes);
  useSubscription(errors$, props.$validation);

  const lastVal = useObservableState(changes$, 0);
  const increment = () => {
    if (props.max && lastVal + props.step > props.max) return;
    setState((lastVal + props.step).toFixed(1).toString());
  };
  const decrement = () => {
    if (props.min && lastVal - props.step < props.min) return;
    setState((lastVal - props.step).toFixed(1).toString());
  };

  return (
    <XStack>
      <Button onPress={decrement}>-</Button>
      <Input
        width={'60px'}
        keyboardType={'numeric'}
        value={state}
        onChangeText={(t) => setState(t)}
      />
      <Button onPress={increment}>+</Button>
    </XStack>
  );
}
