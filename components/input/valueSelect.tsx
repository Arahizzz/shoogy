import { Observable } from 'rxjs';
import { useObservableState } from 'observable-hooks/src';
import { Adapt, Select, Sheet } from 'tamagui';
import { ChevronDown } from '@tamagui/lucide-icons';
import React from 'react';

type SelectProps = {
  value$: Observable<string>;
  options$: Observable<{ value: string; label: string }[]>;
  onChange: (value: string) => void;
};

export function ValueSelect({ value$, onChange, options$ }: SelectProps) {
  const value = useObservableState(value$);
  const options = useObservableState(options$, []);

  if (!value) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <Select.Trigger
        width={150}
        minHeight={0}
        paddingVertical={0}
        paddingHorizontal={10}
        marginHorizontal={5}
        color="black"
        iconAfter={<ChevronDown color="white" />}>
        <Select.Value fontSize={12} paddingVertical={0} />
      </Select.Trigger>

      <Adapt platform="touch">
        <Sheet
          native
          modal
          dismissOnSnapToBottom
          animationConfig={{
            type: 'spring',
            damping: 60,
            mass: 1.2,
            stiffness: 250,
          }}>
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>
        </Sheet>
      </Adapt>

      <Select.Content>
        <Select.Viewport>
          {options.map(({ label, value }, i) => (
            <Select.Item key={value} value={value} index={i}>
              <Select.ItemText>{label}</Select.ItemText>
            </Select.Item>
          ))}
        </Select.Viewport>
      </Select.Content>
    </Select>
  );
}
