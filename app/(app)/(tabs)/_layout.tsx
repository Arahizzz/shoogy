import { Activity, FileHeart } from '@tamagui/lucide-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'black',
      }}>
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Activities',
          headerShown: false,
          tabBarIcon: (props) => <Activity color="black" size={20} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profiles',
          headerShown: false,
          tabBarIcon: (props) => <FileHeart color="black" size={20} />,
        }}
      />
      <Tabs.Screen
        name="insulin"
        options={{
          title: 'Insulin',
          href: null,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'Food',
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
  tabBarIcon: {
    marginBottom: -3,
  },
});
