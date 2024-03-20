import { YStack, Text, Card, Button, View } from 'tamagui';
import { db } from '~/core/db';
import { Profile } from '~/core/db/schema';
import { useObservableState } from 'observable-hooks/src';
import { ChevronRight } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useSubscription } from 'observable-hooks';
import { withObservables } from '@nozbe/watermelondb/react';

const addProfile = () => {
  return db.write(() => {
    return db.get<Profile>('profile').create((profile) => {
      profile.name = 'New Profile';
      profile.insulinSensitivity = 3;
      profile.carbSensitivity = 10;
    });
  });
};

const profiles$ = db.get<Profile>('profile').query().observe();

export default function ProfileScreen() {
  const profilesList = useObservableState(profiles$, []);
  return (
    <YStack alignItems="center" gap={5}>
      <Button onPress={addProfile}>
        <Text>New Profile</Text>
      </Button>
      {profilesList.map((profile) => (
        <Card key={profile.id} width={400}>
          <Card.Background
            backgroundColor={'white'}
            borderColor={'black'}
            borderRadius={10}
            borderWidth={2}
          />
          <Card.Header flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'}>
            <View>
              <Text color={'black'}>{profile.name}</Text>
            </View>
            <Link href={{ pathname: '/(tabs)/profile/[id]', params: { id: profile.id } }}>
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
