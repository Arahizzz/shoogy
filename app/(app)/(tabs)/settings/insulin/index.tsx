import { ChevronRight } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useObservableState } from 'observable-hooks/src';
import { Button, ListItem, Separator, YGroup } from 'tamagui';

import { useDb } from '~/core/db';

export default function InsulinScreen() {
  const db = useDb();

  const [insulins] = useObservableState(() => db.insulin_types.find().$, []);

  return (
    <YGroup alignSelf="center" bordered width="95%" size="$5" separator={<Separator />}>
      {insulins.map((meal) => (
        <YGroup.Item key={meal.id}>
          <Link
            href={{ pathname: '/(tabs)/settings/insulin/[id]', params: { id: meal.id } }}
            asChild>
            <ListItem hoverTheme pressTheme title={meal.name} iconAfter={ChevronRight} />
          </Link>
        </YGroup.Item>
      ))}
      <YGroup.Item>
        <Link href={{ pathname: '/(tabs)/settings/insulin/[id]', params: { id: 'new' } }} asChild>
          <Button>New Insulin Type</Button>
        </Link>
      </YGroup.Item>
    </YGroup>
  );
}
