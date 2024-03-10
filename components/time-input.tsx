import { XGroup } from 'tamagui';
import { merge, Observable, of, PartialObserver } from 'rxjs';
import { useObservableState } from 'observable-hooks/src';
import { useObservableInput, validationError } from '~/components/observable-input';
import { SideButton, SmallNumericInput } from './numeric-input';
import React, { useState } from 'react';
import { decrementTick, getCurrentTick, incrementTick, tickToTime, timeToTick } from '~/core/time';
import { useObservableCallback } from 'observable-hooks';
import { addDays, differenceInHours, format, set, setHours, subDays } from 'date-fns';

export type ValidationState = Record<string, string>;

type Props = {
  id: string;
  suffix?: string;
  initialValue: Observable<number>;
  $changes?: PartialObserver<number>;
  $validation?: PartialObserver<ValidationState>;
};

const timePattern = /([0-2][0-3]):([0-5][0-9])/;

export default function TimeInput(props: Props) {
  const now = useState(getCurrentTick())[0];
  const validate = (value?: string) => {
    if (!value) return validationError(props.id, 'Required');
    const match = value.match(timePattern);
    if (!match) return validationError(props.id, 'Invalid time format');

    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const nowTime = new Date(tickToTime(now));

    let time = set(nowTime, {
      hours: hours,
      minutes: minutes,
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
    mask: [/[0-2]/, /[0-3]/, ':', /[0-5]/, /[0-9]/],
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
    <XGroup marginHorizontal={5}>
      <SideButton onPress={decrement}>-</SideButton>
      <SmallNumericInput keyboardType={'numeric'} {...inputProps} />
      <SideButton onPress={increment}>+</SideButton>
    </XGroup>
  );
}
