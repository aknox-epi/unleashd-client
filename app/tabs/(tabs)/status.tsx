import { useState } from 'react';
import { Badge, BadgeText } from '@/components/ui/badge';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRescueGroupsContext } from '@/contexts/RescueGroupsContext';
import { ServiceStatus } from '@/services/rescuegroups';
import { isDevelopment } from '@/utils/env';

export default function Status() {
  const { serviceStatus, checkServiceHealth } = useRescueGroupsContext();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Show status UI in development or when explicitly enabled via env variable
  const showStatusCard =
    isDevelopment() || process.env.EXPO_PUBLIC_SHOW_DEBUG_UI === 'true';

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkServiceHealth(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusConfig = (): {
    action: 'success' | 'warning' | 'error' | 'muted';
    label: string;
    message: string;
  } => {
    switch (serviceStatus) {
      case ServiceStatus.CONFIGURED:
        return {
          action: 'success',
          label: 'Connected',
          message: 'RescueGroups API is configured and working',
        };
      case ServiceStatus.NOT_CONFIGURED:
        return {
          action: 'warning',
          label: 'Not Configured',
          message:
            'API key not found. Please set EXPO_PUBLIC_RESCUEGROUPS_API_KEY',
        };
      case ServiceStatus.ERROR:
        return {
          action: 'error',
          label: 'Error',
          message: 'Failed to connect to RescueGroups API',
        };
      default:
        return {
          action: 'muted',
          label: 'Unknown',
          message: 'Service status unknown',
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <Center>
      <VStack className="w-full max-w-md gap-6 p-4">
        <Heading className="font-bold text-2xl">Service Status</Heading>

        {showStatusCard && (
          <Card className="p-4">
            <VStack className="gap-4">
              <HStack className="justify-between items-center">
                <Text className="font-semibold">RescueGroups API</Text>
                <Badge action={statusConfig.action}>
                  <BadgeText>{statusConfig.label}</BadgeText>
                </Badge>
              </HStack>

              <Text className="text-sm text-gray-600">
                {statusConfig.message}
              </Text>

              <Button
                onPress={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                variant="outline"
              >
                <ButtonText>
                  {isRefreshing ? 'Checking...' : 'Refresh Status'}
                </ButtonText>
              </Button>
            </VStack>
          </Card>
        )}
      </VStack>
    </Center>
  );
}
