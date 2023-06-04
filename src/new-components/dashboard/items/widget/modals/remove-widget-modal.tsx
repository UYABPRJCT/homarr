import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { ContextModalProps } from '@mantine/modals';
import { Trans, useTranslation } from 'next-i18next';
import { useDashboardStore } from '~/new-components/dashboard/store';

type InnerProps = {
  widgetId: string;
  widgetSort: string;
};

export const WidgetRemoveModal = ({ context, id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.widgetSort}`, 'common']);
  const items = useDashboardStore((x) => x.items);

  const handleDeletion = () => {
    items.remove(innerProps.widgetId);

    context.closeModal(id);
  };

  return (
    <Stack>
      <Trans
        i18nKey="common:removeConfirm"
        components={[<Text weight={500} />]}
        values={{ item: innerProps.widgetSort }}
      />
      <Group position="right">
        <Button onClick={() => context.closeModal(id)} variant="light">
          {t('common:cancel')}
        </Button>
        <Button onClick={() => handleDeletion()}>{t('common:ok')}</Button>
      </Group>
    </Stack>
  );
};
