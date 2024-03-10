import { Button, Input, styled, Text, XGroup } from 'tamagui';
import { Observable, PartialObserver } from 'rxjs';
import { useObservableState } from 'observable-hooks/src';
import { Mask } from 'react-native-mask-input';
import { useObservableInput } from '~/components/observable-input';

export type ValidationState = Record<string, string>;

type Props = {
  id: string;
  suffix?: string;
  initialValue: Observable<number>;
  $changes?: PartialObserver<number>;
  $validation?: PartialObserver<ValidationState>;
  mask?: Mask;
  min?: number;
  max?: number;
  step: number;
};

export default function NumericInput(props: Props) {
  const validate = (value?: string) => {
    if (!value)
      return {
        [props.id]: 'Required',
      };
    const number = parseFloat(value);
    if (isNaN(number))
      return {
        [props.id]: 'Not a number',
      };
    if (props.min && number < props.min) return { [props.id]: 'Too low' };
    if (props.max && number > props.max) return { [props.id]: 'Too high' };
    return number;
  };

  const { inputProps, changes$, setValue } = useObservableInput({
    id: props.id,
    initialValue: props.initialValue,
    $changes: props.$changes,
    $validation: props.$validation,
    mask: props.mask,
    validate,
    display: (value) => value.toFixed(1).toString(),
  });

  const lastVal = useObservableState(changes$, 0);
  const increment = () => {
    if (props.max && lastVal + props.step > props.max) return;
    setValue(lastVal + props.step);
  };
  const decrement = () => {
    if (props.min && lastVal - props.step < props.min) return;
    setValue(lastVal - props.step);
  };

  return (
    <XGroup marginHorizontal={5}>
      <SideButton onPress={decrement}>-</SideButton>
      <SmallNumericInput keyboardType={'numeric'} {...inputProps} />
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
