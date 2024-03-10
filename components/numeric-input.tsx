import { Button, Input, styled, Text, XGroup } from 'tamagui';
import { first, merge, Observable, PartialObserver } from 'rxjs';
import { useObservableState } from 'observable-hooks/src';
import { useObservableInput, validationError } from '~/components/observable-input';
import { useObservableCallback } from 'observable-hooks';

export type ValidationState = Record<string, string>;

type Props = {
  id: string;
  suffix?: string;
  initialValue: Observable<number>;
  $changes?: PartialObserver<number>;
  $validation?: PartialObserver<ValidationState>;
  min?: number;
  max?: number;
  step: number;
};

export default function NumericInput(props: Props) {
  const validate = (value?: string) => {
    if (!value) return validationError(props.id, 'Required');
    const number = parseFloat(value);
    if (isNaN(number)) return validationError(props.id, 'Invalid number');
    if (props.min && number < props.min) return validationError(props.id, 'Too low');
    if (props.max && number > props.max) return validationError(props.id, 'Too high');
    return number;
  };

  const [setValue, value$] = useObservableCallback<number>((input$) =>
    merge(input$, props.initialValue.pipe(first()))
  );

  const { inputProps, changes$ } = useObservableInput({
    id: props.id,
    value$,
    $changes: props.$changes,
    $validation: props.$validation,
    validate,
    display: (value) => value.toFixed(1).toString(),
  });

  const currValue = useObservableState(changes$, 0);
  const increment = () => {
    if (props.max && currValue + props.step > props.max) return;
    setValue(currValue + props.step);
  };
  const decrement = () => {
    if (props.min && currValue - props.step < props.min) return;
    setValue(currValue - props.step);
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
