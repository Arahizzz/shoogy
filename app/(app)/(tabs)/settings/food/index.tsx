import { ChevronRight } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';
import { useObservableState } from 'observable-hooks';
import { Button, ListItem, Separator, YGroup } from 'tamagui';
import { db } from '~/core/db';

export default function FoodScreen() {
  const [food] = useObservableState(() => db.meal_types.find().$, []);

  return (
    <YGroup alignSelf="center" bordered width="95%" size="$5" separator={<Separator />}>
      {food.map((meal) => (
        <YGroup.Item key={meal.id}>
          <Link
            href={{ pathname: '/(app)/(tabs)/settings/food/[id]', params: { id: meal.id } }}
            asChild>
            <ListItem hoverTheme pressTheme title={meal.name} iconAfter={ChevronRight} />
          </Link>
        </YGroup.Item>
      ))}
      <YGroup.Item>
        <Link
          href={{ pathname: '/(app)/(tabs)/settings/food/[id]', params: { id: 'new' } }}
          asChild>
          <Button>New Meal Type</Button>
        </Link>
      </YGroup.Item>
    </YGroup>
  );
}
