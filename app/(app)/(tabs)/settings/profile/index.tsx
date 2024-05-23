import { ChevronRight } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useObservableState } from 'observable-hooks/src';
import { Button, Card, RadioGroup, Text, View } from 'tamagui';
import { db } from '~/core/db';

export default function ProfileScreen() {
  const selectProfile = (id: string) => {
    return db.states.profile_settings.set('selectedProfileId', (_) => id);
  };
  const [profilesList] = useObservableState(() => db.profiles.find().$, []);
  const [selectedProfile] = useObservableState(() => db.states.profile_settings.selectedProfileId$);

  return (
    <RadioGroup
      value={selectedProfile}
      onValueChange={selectProfile}
      alignItems="center"
      gap={5}
      marginTop={10}>
      <Link href={{ pathname: '/(tabs)/settings/profile/[id]', params: { id: 'new' } }} asChild>
        <Button>
          <Text>New Profile</Text>
        </Button>
      </Link>
      {profilesList.map((profile) => (
        <Card key={profile.id} maxWidth={400} width={'90%'}>
          <Card.Background
            backgroundColor="white"
            borderColor="black"
            borderRadius={10}
            borderWidth={2}
          />
          <Card.Header flexDirection="row" justifyContent="space-between" alignItems="center">
            <View>
              <RadioGroup.Item value={profile.id}>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
              <Text color="black">{profile.name}</Text>
            </View>
            <Link
              href={{ pathname: '/(app)/(tabs)/settings/profile/[id]', params: { id: profile.id } }}
              asChild>
              <Button paddingRight={0}>
                <Text>Edit</Text>
                <ChevronRight />
              </Button>
            </Link>
          </Card.Header>
        </Card>
      ))}
    </RadioGroup>
  );
}
