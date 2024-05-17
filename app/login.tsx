import { Button, Input, Text, YStack } from 'tamagui';
import React, { useState } from 'react';
import loginManager from '~/core/nightscout/login-manager';
import { router, Stack } from 'expo-router';

export default function LoginScreen() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');

  const onSubmit = async () => {
    const response = await fetch(`${url}/v2/authorization/request/${token}`);
    if (!response.ok) {
      alert('Unable to login');
      return;
    }
    await loginManager.login({ url, token });
    router.replace('/');
  };

  return (
    <YStack>
      <Text>Login</Text>
      <Input inputMode={'url'} value={url} onChangeText={setUrl} placeholder={'URL'} />
      <Input value={token} onChangeText={setToken} placeholder={'Token'} />
      <Button onPress={onSubmit}>Submit</Button>
    </YStack>
  );
}
