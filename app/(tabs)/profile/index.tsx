import { ChevronRight } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useObservableState } from 'observable-hooks/src';
import { Button, Card, Text, View, YStack } from 'tamagui';

import { useDb } from '~/core/db';
import { Profile } from '~/core/models/profile';
import { useEffect } from 'react';

export default function ProfileScreen() {
  const db = useDb();
  const profiles = db.profiles;
  const addProfile = async () => {
    await profiles.insert({
      id: 'p' + Date.now(),
      name: 'New Profile',
      carbSensitivity: 10,
      insulinSensitivity: 10,
    });
  };
  const [profilesList] = useObservableState(() => profiles.find().$, []);

  return (
    <YStack alignItems="center" gap={5} marginTop={10}>
      <Button onPress={addProfile}>
        <Text>New Profile</Text>
      </Button>
      {profilesList.map((profile) => (
        <Card key={profile.id} width={400}>
          <Card.Background
            backgroundColor="white"
            borderColor="black"
            borderRadius={10}
            borderWidth={2}
          />
          <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center">
            <View>
              <Text color="black">{profile.name}</Text>
            </View>
            <Link href={{ pathname: '/(tabs)/profile/[id]', params: { id: profile.id } }} asChild>
              <Button paddingRight={0}>
                <Text>Edit</Text>
                <ChevronRight />
              </Button>
            </Link>
          </Card.Header>
        </Card>
      ))}
    </YStack>
  );
}
