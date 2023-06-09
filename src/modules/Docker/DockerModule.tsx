import { ActionIcon, Drawer, Tooltip, Text } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { IconBrandDocker, IconX } from '@tabler/icons-react';
import Docker from 'dockerode';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { notifications } from '@mantine/notifications';
import { useCardStyles } from '../../components/layout/useCardStyles';
import { useConfigContext } from '../../config/provider';

import { env } from '~/env.mjs';
import { api } from '~/utils/api';
import ContainerActionBar from './ContainerActionBar';
import DockerTable from './DockerTable';

export default function DockerMenuButton(props: any) {
  const [opened, setOpened] = useState(false);
  const { config } = useConfigContext();
  const dockerEnabled = config?.settings.customization.layout.enabledDocker || false;
  const [selection, setSelection] = useState<Docker.ContainerInfo[]>([]);
  const { data: containers, isLoading } = useDockerContainersQuery({
    enabled: dockerEnabled,
    resetSelection: () => setSelection([]),
  });
  const { classes } = useCardStyles(true);

  useHotkeys([['mod+B', () => setOpened(!opened)]]);

  const { t } = useTranslation('modules/docker');

  if (!dockerEnabled || env.NEXT_PUBLIC_DISABLE_EDIT_MODE) {
    return null;
  }

  return (
    <>
      <Drawer
        opened={opened}
        trapFocus={false}
        onClose={() => setOpened(false)}
        padding="xl"
        position="right"
        size="100%"
        title={<ContainerActionBar selected={selection} isLoading={isLoading} />}
        transitionProps={{
          transition: 'pop',
        }}
        styles={{
          content: {
            display: 'flex',
            flexDirection: 'column',
          },
          body: {
            minHeight: 0,
          },
        }}
      >
        <DockerTable
          containers={containers ?? []}
          selection={selection}
          setSelection={setSelection}
        />
      </Drawer>
      <Tooltip label={t('actionIcon.tooltip')}>
        <ActionIcon
          variant="default"
          className={classes.card}
          radius="md"
          size="xl"
          color="blue"
          onClick={() => setOpened(true)}
        >
          <IconBrandDocker />
        </ActionIcon>
      </Tooltip>
    </>
  );
}

const useDockerContainersQuery = ({
  enabled,
  resetSelection,
}: {
  enabled: boolean;
  resetSelection: () => void;
}) => {
  const { t } = useTranslation('modules/docker');
  return api.docker.all.useQuery(undefined, {
    onSettled() {
      resetSelection();
    },
    onError() {
      notifications.show({
        autoClose: 1500,
        title: <Text>{t('errors.integrationFailed.title')}</Text>,
        color: 'red',
        icon: <IconX />,
        message: t('errors.integrationFailed.message'),
      });
    },
    enabled,
  });
};
