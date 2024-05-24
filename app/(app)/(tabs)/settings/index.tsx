import { ListItem, Separator, YGroup, View } from 'tamagui';
import { ChevronRight, FileHeart, Moon, Star, Syringe, Utensils } from '@tamagui/lucide-icons';
import { Link } from 'expo-router';

export default function SettingsScreen() {
  return (
    <View margin={5}>
      <YGroup alignSelf="center" bordered width={'100%'} size="$5" separator={<Separator />}>
        <YGroup.Item>
          <Link href={{ pathname: '/(app)/(tabs)/settings/profile' }} asChild>
            <ListItem
              hoverTheme
              pressTheme
              title="Profiles"
              icon={FileHeart}
              iconAfter={ChevronRight}
            />
          </Link>
        </YGroup.Item>
        <YGroup.Item>
          <Link href={{ pathname: '/(app)/(tabs)/settings/food' }} asChild>
            <ListItem
              hoverTheme
              pressTheme
              title="Meal Types"
              icon={Utensils}
              iconAfter={ChevronRight}
            />
          </Link>
        </YGroup.Item>
        <YGroup.Item>
          <Link href={{ pathname: '/(app)/(tabs)/settings/insulin' }} asChild>
            <ListItem
              hoverTheme
              pressTheme
              title="Insulin Types"
              icon={Syringe}
              iconAfter={ChevronRight}
            />
          </Link>
        </YGroup.Item>
      </YGroup>
    </View>
  );
}
