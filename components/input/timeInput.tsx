import { addDays, differenceInHours, set, subDays } from 'date-fns';
import { useObservableCallback } from 'observable-hooks';
import { useObservableState } from 'observable-hooks/src';
import React, { useState } from 'react';
import { ColorValue } from 'react-native';
import { merge, Observable, of, PartialObserver } from 'rxjs';

import { SmallNumericInput, Stepper, StepperWrapper } from './numericInput';

import { useObservableInput, validationError } from '~/components/input/observableInput';
import { decrementTick, getCurrentTick, incrementTick, tickToTime, timeToTick } from '~/core/time';

export type ValidationState = Record<string, string>;

type Props = {
  id: string;
  suffix?: string;
  initialValue: Observable<number>;
  $changes?: PartialObserver<number>;
  $validation?: PartialObserver<ValidationState>;

  color?: ColorValue;
  fontColor?: ColorValue;
};

const timePattern = /([0-2][0-9]):([0-5][0-9])/;

export default function TimeInput(props: Props) {
  const now = useState(getCurrentTick())[0];
  const validate = (value?: string) => {
    if (!value) return validationError(props.id, 'Required');
    const match = value.match(timePattern);
    if (!match) return validationError(props.id, 'Invalid time format');

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const nowTime = new Date(tickToTime(now));

    let time = set(nowTime, {
      hours,
      minutes,
    });
    if (differenceInHours(nowTime, time) < -12) {
      time = subDays(time, 1);
    } else if (differenceInHours(nowTime, time) > 12) {
      time = addDays(time, 1);
    }

    return timeToTick(time.getTime());
  };

  const display = (value: number) => {
    const date = new Date(tickToTime(value));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const [setValue, value$] = useObservableCallback<number>((input$) =>
    merge(input$, of(now), props.initialValue)
  );

  const { inputProps, changes$ } = useObservableInput({
    id: props.id,
    value$,
    $changes: props.$changes,
    $validation: props.$validation,
    mask: [/[0-2]/, /[0-9]/, ':', /[0-5]/, /[0-9]/],
    validate,
    display,
  });

  const lastVal = useObservableState(changes$, 0);
  const increment = () => {
    setValue(incrementTick(lastVal));
  };
  const decrement = () => {
    setValue(decrementTick(lastVal));
  };

  return (
    <StepperWrapper>
      <Stepper backgroundColor={props.color} onPress={decrement}>
        -
      </Stepper>
      <SmallNumericInput
        color={props.fontColor ?? 'black'}
        borderColor={props.color}
        keyboardType="numeric"
        selectTextOnFocus
        {...inputProps}
      />
      <Stepper backgroundColor={props.color} onPress={increment}>
        +
      </Stepper>
    </StepperWrapper>
  );
}
