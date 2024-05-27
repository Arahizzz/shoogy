import { Input, Label, styled, XStack } from 'tamagui';

export const FormLabel = styled(Label, {
  $sm: {
    fontSize: 12,
  },
  color: 'black',
});

export const FormRow = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
});

export const FormInput = styled(Input, {
  width: 200,
});
