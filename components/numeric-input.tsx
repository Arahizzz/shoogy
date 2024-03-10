import { Button, Input, styled, Text, XGroup, XStack } from 'tamagui';
import { StyleSheet } from 'react-native';
import {
  combineLatestWith,
  filter,
  first,
  map,
  NextObserver,
  Observable,
  of,
  share,
  switchAll,
} from 'rxjs';
import { useObservable, useSubscription } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import { Mask, useMaskedInputProps } from 'react-native-mask-input';

export type ValidationState = Record<string, Record<string, string>>;

type Props = {
  id: string;
  suffix?: string;
  initialValue: Observable<number>;
  $changes?: NextObserver<number>;
  $validation?: NextObserver<ValidationState>;
  mask?: Mask;
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
    <XGroup marginHorizontal={5}>
      <SideButton onPress={decrement}>-</SideButton>
      <SmallNumericInput keyboardType={'numeric'} {...maskedInputProps} />
      <Suffix>{props.suffix}</Suffix>
      <SideButton onPress={increment}>+</SideButton>
    </XGroup>
  );
}

export const SideButton = styled(Button, {
  backgroundColor: 'salmon',
  paddingHorizontal: 10,
  height: 40,
});

export const SmallNumericInput = styled(Input, {
  backgroundColor: 'whitesmoke',
  color: 'black',
  borderColor: 'salmon',
  borderLeftWidth: 0,
  borderRightWidth: 0,
  minWidth: '60px',
  paddingHorizontal: 10,
  height: 40,
});

export const Suffix = styled(Text, {
  backgroundColor: 'whitesmoke',
  color: 'black',
  borderColor: 'salmon',
  borderLeftWidth: 0,
  borderRightWidth: 0,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  paddingLeft: 0,
  paddingRight: 3,
  paddingVertical: 5,
  lineHeight: 23,
  height: 40,
});
