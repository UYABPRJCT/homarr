import { Flex, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useRef } from 'react';
import { AppType } from '../../../../../../types/app';
import { IconSelector } from '../../../../../IconSelector/IconSelector';

import { api } from '~/utils/api';

interface AppearanceTabProps {
  form: UseFormReturnType<AppType, (values: AppType) => AppType>;
  disallowAppNameProgagation: () => void;
  allowAppNamePropagation: boolean;
}

export const AppearanceTab = ({
  form,
  disallowAppNameProgagation,
  allowAppNamePropagation,
}: AppearanceTabProps) => {
  const iconSelectorRef = useRef();
  const [debouncedValue] = useDebouncedValue(form.values.name, 500);

  useEffect(() => {
    if (allowAppNamePropagation !== true) {
      return;
    }

    if (!iconSelectorRef.current) {
      return;
    }

    const currentRef = iconSelectorRef.current as {
      chooseFirstOrDefault: (debouncedValue: string) => void;
    };

    currentRef.chooseFirstOrDefault(debouncedValue);
  }, [debouncedValue]);

  return (
    <Tabs.Panel value="appearance" pt="lg">
      <Flex gap={5}>
        <IconSelector
          defaultValue={form.values.appearance.iconUrl}
          onChange={(value) => {
            form.setFieldValue('appearance.iconUrl', value);
            disallowAppNameProgagation();
          }}
          value={form.values.appearance.iconUrl}
          ref={iconSelectorRef}
        />
      </Flex>
    </Tabs.Panel>
  );
};

const replaceCharacters = (value: string) => value.toLowerCase().replaceAll('', '-');

export const useGetDashboardIcons = () =>
  api.icon.all.useQuery(undefined, {
    refetchOnMount: true,
    staleTime: 10 * 60 * 1000, // When opening the modal the data is only refetched every 10 minutes.
    refetchOnWindowFocus: false,
  });
