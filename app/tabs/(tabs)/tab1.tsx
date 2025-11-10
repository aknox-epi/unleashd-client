import { useState } from 'react';
import { ScrollView } from 'react-native';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Spinner } from '@/components/ui/spinner';
import { useAnimalSearch } from '@/hooks/useAnimals';
import { RESCUEGROUPS_CONFIG } from '@/constants/RescueGroupsConfig';
import { getErrorMessage } from '@/services/rescuegroups';

export default function Tab1() {
  const { search, results, total, isLoading, error } = useAnimalSearch();
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearchDogs = async () => {
    setSearchPerformed(true);
    await search({
      species: RESCUEGROUPS_CONFIG.SPECIES.DOG,
      limit: 10,
    });
  };

  const handleSearchCats = async () => {
    setSearchPerformed(true);
    await search({
      species: RESCUEGROUPS_CONFIG.SPECIES.CAT,
      limit: 10,
    });
  };

  return (
    <ScrollView className="flex-1">
      <Center className="flex-1 p-6">
        <VStack space="lg" className="w-full max-w-2xl">
          <Heading className="text-2xl font-bold text-center">
            RescueGroups API Test
          </Heading>

          <Text className="text-center text-typography-500">
            Test the RescueGroups API integration by searching for adoptable
            pets.
          </Text>

          <HStack space="md" className="justify-center">
            <Button onPress={handleSearchDogs} isDisabled={isLoading}>
              <ButtonText>Search Dogs</ButtonText>
            </Button>
            <Button onPress={handleSearchCats} isDisabled={isLoading}>
              <ButtonText>Search Cats</ButtonText>
            </Button>
          </HStack>

          {isLoading && (
            <Center className="py-8">
              <Spinner size="large" />
              <Text className="mt-4 text-typography-500">Searching...</Text>
            </Center>
          )}

          {error && (
            <Center className="py-4">
              <Text className="text-error-500 text-center">
                {getErrorMessage(error)}
              </Text>
            </Center>
          )}

          {!isLoading && searchPerformed && results.length === 0 && !error && (
            <Center className="py-4">
              <Text className="text-typography-500">No results found</Text>
            </Center>
          )}

          {!isLoading && results.length > 0 && (
            <VStack space="md" className="w-full">
              <Text className="text-center font-semibold">
                Found {total} animals (showing {results.length})
              </Text>

              {results.map((animal) => (
                <VStack
                  key={animal.animalID}
                  className="border border-outline-200 rounded-lg p-4 bg-background-0"
                  space="sm"
                >
                  <Heading size="sm" className="font-semibold">
                    {animal.animalName}
                  </Heading>
                  <HStack space="sm">
                    <Text className="text-typography-500">
                      {animal.animalSpecies}
                    </Text>
                    {animal.animalBreed && (
                      <>
                        <Text className="text-typography-500">•</Text>
                        <Text className="text-typography-500">
                          {animal.animalBreed}
                        </Text>
                      </>
                    )}
                  </HStack>
                  {animal.animalGeneralAge && (
                    <Text className="text-typography-500">
                      Age: {animal.animalGeneralAge}
                    </Text>
                  )}
                  {animal.animalSex && (
                    <Text className="text-typography-500">
                      Sex: {animal.animalSex}
                    </Text>
                  )}
                  {animal.animalLocationCitystate && (
                    <Text className="text-typography-400 text-sm">
                      Location: {animal.animalLocationCitystate}
                    </Text>
                  )}
                </VStack>
              ))}
            </VStack>
          )}
        </VStack>
      </Center>
    </ScrollView>
  );
}
