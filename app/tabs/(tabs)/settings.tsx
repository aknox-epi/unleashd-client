import { ScrollView } from 'react-native';
import { useState } from 'react';
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
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react-native';
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
import {
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
} from '@/components/ui/checkbox';
import { CheckIcon, ChevronDownIcon } from '@/components/ui/icon';
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionTitleText,
  AccordionContent,
} from '@/components/ui/accordion';
import type { TimelineFilter } from '@/types/whats-new';

export default function Settings() {
  const { colorMode, toggleColorMode } = useTheme();
  const {
    isEnabled,
    toggleEnabled,
    filteredChangelogs,
    allChangelogs,
    filters,
    setFilters,
    isDrawerOpen,
    closeDrawer,
    hasNewVersion,
    markVersionAsSeen,
  } = useWhatsNew();
  const isDarkMode = colorMode === 'dark';
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true);

  // Handle drawer close - mark version as seen if there's a new version
  const handleDrawerClose = () => {
    if (hasNewVersion) {
      markVersionAsSeen();
    }
    closeDrawer();
  };

  // Get all unique section types across all changelogs
  const allSectionTypes = Array.from(
    new Set(
      allChangelogs.flatMap((changelog) =>
        changelog.sections.map((section) => section.title)
      )
    )
  );

  // Timeline options
  const timelineOptions: Array<{ value: TimelineFilter; label: string }> = [
    { value: 'latest', label: 'Latest Version' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'all', label: 'All Time' },
  ];

  const handleTimelineChange = (value: string) => {
    setFilters({ ...filters, timeline: value as TimelineFilter });
  };

  const handleTypeToggle = (type: string) => {
    // If types is empty (all selected), first populate with all types except the clicked one
    if (filters.types.length === 0) {
      const newTypes = allSectionTypes.filter((t) => t !== type);
      setFilters({ ...filters, types: newTypes });
    } else if (filters.types.includes(type)) {
      // Remove the type (uncheck it)
      const newTypes = filters.types.filter((t) => t !== type);
      setFilters({ ...filters, types: newTypes });
    } else {
      // Add the type (check it)
      const newTypes = [...filters.types, type];
      // If all types are now selected, set to empty array (means "all")
      if (newTypes.length === allSectionTypes.length) {
        setFilters({ ...filters, types: [] });
      } else {
        setFilters({ ...filters, types: newTypes });
      }
    }
  };

  return (
    <>
      <ScrollView className="flex-1">
        <Center>
          <VStack className="w-full max-w-md gap-6 p-4">
            <Heading className="font-bold text-2xl">Settings</Heading>

            <VStack className="gap-4">
              {/* Theme Toggle */}
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
      <Drawer isOpen={isDrawerOpen} onClose={handleDrawerClose} size="lg">
        <DrawerBackdrop />
        <DrawerContent className="flex flex-col overflow-hidden px-3 py-6">
          <DrawerHeader className="shrink-0">
            <HStack className="items-center gap-2">
              <Icon as={Sparkles} size="lg" className="text-blue-500" />
              <Heading size="lg">What&apos;s New</Heading>
            </HStack>
          </DrawerHeader>

          <DrawerBody className="flex-1 shrink mt-4 mb-0">
            <VStack className="gap-4 px-1">
              {/* Filter Section - Collapsible */}
              <Accordion
                variant="unfilled"
                size="sm"
                type="single"
                value={isFiltersExpanded ? ['filters'] : []}
                onValueChange={(value) =>
                  setIsFiltersExpanded(value.includes('filters'))
                }
              >
                <AccordionItem
                  value="filters"
                  className="border-b border-outline-200"
                >
                  <AccordionHeader>
                    <AccordionTrigger className="py-2 px-0">
                      <AccordionTitleText className="font-semibold text-sm text-typography-700">
                        Filters
                      </AccordionTitleText>
                      <Icon
                        as={isFiltersExpanded ? ChevronUp : ChevronDown}
                        size="sm"
                        className="ml-2 text-typography-700"
                      />
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent className="px-0 pb-4">
                    <VStack className="gap-3">
                      {/* Timeline Filter */}
                      <VStack className="gap-2">
                        <Text className="font-semibold text-sm text-typography-700">
                          Timeline
                        </Text>
                        <Select
                          onValueChange={handleTimelineChange}
                          value={filters.timeline}
                        >
                          <SelectTrigger>
                            <SelectInput placeholder="Select timeline" />
                            <SelectIcon as={ChevronDownIcon} className="mr-2" />
                          </SelectTrigger>
                          <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                              <SelectDragIndicatorWrapper>
                                <SelectDragIndicator />
                              </SelectDragIndicatorWrapper>
                              {timelineOptions.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  label={option.label}
                                  value={option.value}
                                />
                              ))}
                            </SelectContent>
                          </SelectPortal>
                        </Select>
                      </VStack>

                      {/* Type Filters */}
                      <VStack className="gap-2">
                        <Text className="font-semibold text-sm text-typography-700">
                          Types {filters.types.length === 0 && '(All)'}
                        </Text>
                        <VStack className="gap-2 ml-1">
                          {allSectionTypes.map((type) => (
                            <Checkbox
                              key={type}
                              value={type}
                              isChecked={
                                filters.types.length === 0 ||
                                filters.types.includes(type)
                              }
                              onChange={() => handleTypeToggle(type)}
                            >
                              <CheckboxIndicator>
                                <CheckboxIcon as={CheckIcon} />
                              </CheckboxIndicator>
                              <Text className="ml-2">{type}</Text>
                            </Checkbox>
                          ))}
                        </VStack>
                      </VStack>
                    </VStack>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Changelog Display */}
              {filteredChangelogs.length > 0 ? (
                filteredChangelogs.map((changelog, changelogIndex) => (
                  <VStack
                    key={changelogIndex}
                    className="gap-3 pb-4 border-b border-outline-100 last:border-b-0"
                  >
                    <HStack className="items-center gap-2">
                      <Badge action="success" size="md">
                        <BadgeText>v{changelog.version}</BadgeText>
                      </Badge>
                      <Text className="text-typography-500">
                        {changelog.date}
                      </Text>
                    </HStack>

                    {changelog.sections.map((section, sectionIndex) => (
                      <VStack key={sectionIndex} className="gap-2">
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
                ))
              ) : (
                <Text className="text-typography-500">
                  No changelog entries match the selected filters
                </Text>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter className="shrink-0 border-t border-outline-200 pt-4">
            <Button onPress={closeDrawer} className="w-full">
              <ButtonText>Close</ButtonText>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
