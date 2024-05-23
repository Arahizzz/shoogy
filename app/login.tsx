import { Button, Input, Label, Text, XStack, YStack } from 'tamagui';
import React, { useState } from 'react';
import loginManager from '~/core/nightscout/login-manager';
import { router, Stack } from 'expo-router';

export default function LoginScreen() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  const onSubmit = async () => {
    const response = await fetch(`${url}/v2/authorization/request/${token}`);
    if (!response.ok) {
      console.error(response);
      alert('Unable to login');
      return;
    }
    await loginManager.login({ url, token });
    router.replace('/');
  };

  return (
    <YStack
      maxWidth={'600px'}
      height={'100%'}
      gap={5}
      alignSelf={'center'}
      justifyContent={'center'}>
      <Text fontSize={50} color={'black'} alignSelf={'center'}>
        Login
      </Text>
      <XStack gap={5} justifyContent={'space-between'}>
        <Label color={'black'}>Nightscout URL:</Label>
        <Input
          inputMode={'url'}
          value={url}
          onChangeText={setUrl}
          placeholder={'https://nightscout.com/api'}
        />
      </XStack>
      <XStack gap={5} justifyContent={'space-between'}>
        <Label color={'black'}>Token:</Label>
        <Input value={token} onChangeText={setToken} placeholder={'Token'} />
      </XStack>
      <Button onPress={onSubmit}>Enter</Button>
    </YStack>
  );
}
