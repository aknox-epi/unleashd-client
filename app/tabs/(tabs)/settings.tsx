import { ScrollView } from 'react-native';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@/components/ui/icon';
import { MoonIcon, SunIcon } from '@/components/ui/icon';
import { Button, ButtonText } from '@/components/ui/button';
import { Link, LinkText } from '@/components/ui/link';
import { Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useWhatsNew } from '@/contexts/WhatsNewContext';
import { Badge, BadgeText } from '@/components/ui/badge';
import {
  Drawer,
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
} from '@/components/ui/drawer';

export default function Settings() {
  const { colorMode, toggleColorMode } = useTheme();
  const {
    isEnabled,
    toggleEnabled,
    latestChangelog,
    isDrawerOpen,
    closeDrawer,
  } = useWhatsNew();
  const isDarkMode = colorMode === 'dark';

  return (
    <>
      <ScrollView className="flex-1">
        <Center>
          <VStack className="w-full max-w-md gap-6 p-4">
            <Heading className="font-bold text-2xl">Settings</Heading>

            <VStack className="gap-4">
              {/* Dark Mode Toggle */}
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

              {/* What's New Toggle */}
              <HStack className="justify-between items-center py-3 px-4 bg-background-50 rounded-lg">
                <HStack className="items-center gap-3 flex-1">
                  <Icon as={Sparkles} size="xl" className="text-blue-500" />
                  <VStack className="flex-1">
                    <Text className="font-semibold text-base">
                      What&apos;s New Notifications
                    </Text>
                    <Text className="text-sm text-typography-500">
                      {isEnabled ? 'Show changelog badge' : 'Disabled'}
                    </Text>
                  </VStack>
                </HStack>
                <Switch
                  value={isEnabled}
                  onValueChange={toggleEnabled}
                  size="md"
                />
              </HStack>
            </VStack>
          </VStack>
        </Center>
      </ScrollView>

      {/* What's New Drawer */}
      <Drawer isOpen={isDrawerOpen} onClose={closeDrawer} size="lg">
        <DrawerBackdrop />
        <DrawerContent>
          <DrawerHeader>
            <HStack className="items-center gap-2">
              <Icon as={Sparkles} size="lg" className="text-blue-500" />
              <Heading size="lg">What&apos;s New</Heading>
            </HStack>
          </DrawerHeader>

          <DrawerBody>
            {latestChangelog ? (
              <VStack className="gap-4">
                <HStack className="items-center gap-2">
                  <Badge action="success" size="md">
                    <BadgeText>v{latestChangelog.version}</BadgeText>
                  </Badge>
                  <Text className="text-typography-500">
                    {latestChangelog.date}
                  </Text>
                </HStack>

                {latestChangelog.sections.map((section, index) => (
                  <VStack key={index} className="gap-2">
                    <Heading size="sm" className="font-semibold">
                      {section.title}
                    </Heading>
                    <VStack className="gap-1">
                      {section.items.map((item, itemIndex) => (
                        <HStack key={itemIndex} className="gap-2">
                          <Text className="text-typography-700">•</Text>
                          <Text className="flex-1">
                            {item.text}
                            {item.commitHash && item.commitUrl && (
                              <>
                                {' '}
                                <Link href={item.commitUrl}>
                                  <LinkText className="text-blue-500">
                                    {item.commitHash}
                                  </LinkText>
                                </Link>
                              </>
                            )}
                          </Text>
                        </HStack>
                      ))}
                    </VStack>
                  </VStack>
                ))}
              </VStack>
            ) : (
              <Text className="text-typography-500">
                No changelog available
              </Text>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button onPress={closeDrawer} className="w-full">
              <ButtonText>Close</ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
