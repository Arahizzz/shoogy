import { useObservableCallback } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import { ColorValue, Platform } from 'react-native';
import { first, merge, Observable, PartialObserver } from 'rxjs';
import { Button, Input, styled, Text, XGroup } from 'tamagui';

import { useObservableInput, validationError } from '~/components/input/observableInput';
import { mergeProps } from '@tamagui/web';

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

  color?: ColorValue;
  fontColor?: ColorValue;
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
    if (props.max !== undefined && currValue + props.step > props.max) return;
    setValue(currValue + props.step);
  };
  const decrement = () => {
    if (props.min !== undefined && currValue - props.step < props.min) return;
    setValue(currValue - props.step);
  };

  return (
    <StepperWrapper>
      <Stepper onPress={decrement} backgroundColor={props.color}>
        -
      </Stepper>
      <SmallNumericInput
        inputMode="numeric"
        {...inputProps}
        borderColor={props.color}
        shadowColor={props.color}
        color={props.fontColor ?? 'black'}
        selectTextOnFocus
      />
      {props.suffix && (
        <Suffix borderColor={props.color} color={props.fontColor ?? 'black'}>
          {props.suffix}
        </Suffix>
      )}
      <Stepper onPress={increment} backgroundColor={props.color}>
        +
      </Stepper>
    </StepperWrapper>
  );
}

const sizeConfig = {
  height: 40,
  $sm: {
    height: 33,
    fontSize: 11,
    lineHeight: Platform.OS === 'android' ? 22 : undefined,
  },
} as const;

export const StepperWrapper = styled(XGroup, {
  width: 140,
  marginHorizontal: 5,
});

export const Stepper = styled(
  Button,
  mergeProps(sizeConfig, {
    paddingHorizontal: 10,
  })
);

export const SmallNumericInput = styled(
  Input,
  mergeProps(sizeConfig, {
    backgroundColor: 'whitesmoke',
    color: 'black',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    paddingHorizontal: 0,
    textAlign: 'center',
    width: 0,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  })
);

export const Suffix = styled(
  Text,
  mergeProps(sizeConfig, {
    backgroundColor: 'whitesmoke',
    color: 'black',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingLeft: 5,
    paddingRight: 3,
    paddingVertical: 0,
    lineHeight: 33,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  })
);
