import React from 'react';
import { Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Settings, Sparkles, Heart } from 'lucide-react-native';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { AnimatedTabIcon } from '@/components/ui/animated-tab-icon';
import { useWhatsNew } from '@/contexts/WhatsNewContext';
import { useFavorites } from '@/contexts/FavoritesContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={18} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { isEnabled, hasNewVersion, openDrawer, markVersionAsSeen } =
    useWhatsNew();
  const { count } = useFavorites();

  const handleWhatsNewPress = () => {
    openDrawer();
    if (hasNewVersion) {
      markVersionAsSeen();
    }
  };

  return (
    <Tabs
      screenOptions={{
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color }) => (
            <AnimatedTabIcon icon={Heart} color={color} showBadge={count > 0} />
          ),
          tabBarBadge: count > 0 ? count : undefined,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <AnimatedTabIcon
              icon={Settings}
              color={color}
              showBadge={hasNewVersion}
            />
          ),
          headerRight: () =>
            isEnabled ? (
              <Pressable
                onPress={handleWhatsNewPress}
                style={{ marginRight: 15 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AnimatedTabIcon
                  icon={Sparkles}
                  color={hasNewVersion ? '#3b82f6' : '#9ca3af'}
                  showBadge={hasNewVersion}
                />
              </Pressable>
            ) : null,
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="heartbeat" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
