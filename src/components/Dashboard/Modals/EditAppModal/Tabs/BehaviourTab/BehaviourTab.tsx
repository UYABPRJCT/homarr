import { Switch, Tabs } from '@mantine/core';
import { UseFormReturnType } from '@mantine/form';
import { useTranslation } from 'next-i18next';
import { AppItem } from '~/components/Dashboard/types';

interface BehaviourTabProps {
  form: UseFormReturnType<AppItem, (values: AppItem) => AppItem>;
}

export const BehaviourTab = ({ form }: BehaviourTabProps) => {
  const { t } = useTranslation('layout/modals/add-app');

  return (
    <Tabs.Panel value="behaviour" pt="xs">
      <Switch
        label={t('behaviour.isOpeningNewTab.label')}
        description={t('behaviour.isOpeningNewTab.description')}
        {...form.getInputProps('openInNewTab', { type: 'checkbox' })}
      />
    </Tabs.Panel>
  );
};
