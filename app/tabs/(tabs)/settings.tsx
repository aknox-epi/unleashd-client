import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';
import { MoonIcon, SunIcon } from '@/components/ui/icon';
import { useTheme } from '@/contexts/ThemeContext';

export default function Settings() {
  const { colorMode, toggleColorMode } = useTheme();
  const isDarkMode = colorMode === 'dark';

  return (
    <Center>
      <VStack className="w-full max-w-md gap-6 p-4">
        <Heading className="font-bold text-2xl">Settings</Heading>

        <VStack className="gap-4">
          <HStack className="justify-between items-center py-3 px-4 bg-background-50 rounded-lg">
            <HStack className="items-center gap-3 flex-1">
              <Icon
                as={isDarkMode ? MoonIcon : SunIcon}
                size="xl"
                className={isDarkMode ? 'text-blue-400' : 'text-yellow-500'}
              />
              <VStack className="flex-1">
                <Text className="font-semibold text-base">Dark Mode</Text>
                <Text className="text-sm text-typography-500">
                  {isDarkMode ? 'Enabled' : 'Disabled'}
                </Text>
              </VStack>
            </HStack>
            <Switch
              value={isDarkMode}
              onValueChange={toggleColorMode}
              size="md"
            />
          </HStack>
        </VStack>
      </VStack>
    </Center>
  );
}
