import {
  Checkbox,
  createStyles,
  Divider,
  Flex,
  Group,
  Indicator,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { useConfigStore } from '../../../../config/store';
import { createDummyArray } from '../../../../tools/client/arrays';
import { CustomizationSettingsType } from '../../../../types/settings';
import { Logo } from '../../../layout/Logo';
import { useDashboard } from '~/pages';

export const LayoutSelector = () => {
  const { classes } = useStyles();

  const dashboard = useDashboard();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const [isLeftSidebarEnabled, setLeftSidebarEnabled] = useState(
    dashboard.groups.some((x) => x.type === 'sidebar' && x.position === 'left') ?? true
  );
  const [isRightSidebarEnabled, setRightSidebarEnabled] = useState(
    dashboard.groups.some((x) => x.type === 'sidebar' && x.position === 'right') ?? true
  );
  const [isDockerEnabled, setDockerEnabled] = useState(dashboard.isDockerEnabled ?? false);
  const [isPingEnabled, setPingEnabled] = useState(dashboard.isPingEnabled ?? false);
  const [isSearchEnabled, setSearchEnabled] = useState(dashboard.isSearchEnabled ?? false);
  const { t } = useTranslation('settings/common');

  if (!dashboard) return null;

  const handleChange = (
    key: keyof CustomizationSettingsType['layout'],
    event: ChangeEvent<HTMLInputElement>,
    setState: Dispatch<SetStateAction<boolean>>
  ) => {
    const value = event.target.checked;
    setState(value);
    /*updateConfig(
      configName,
      (prev) => {
        const { layout } = prev.settings.customization;

        layout[key] = value;

        return {
          ...prev,
          settings: {
            ...prev.settings,
            customization: {
              ...prev.settings.customization,
              layout,
            },
          },
        };
      },
      true
    );*/
  };

  return (
    <>
      <Stack spacing={0} mb="md">
        <Title order={6}>{t('layout.preview.title')}</Title>
        <Text color="dimmed" size="xs">
          {t('layout.preview.subtitle')}
        </Text>
      </Stack>
      <Stack spacing="xs">
        <Paper px="xs" py={4} withBorder>
          <Group position="apart">
            <Logo size="xs" />
            <Group spacing={5}>
              {isSearchEnabled && <PlaceholderElement width={60} height={10} />}
              {isDockerEnabled && <PlaceholderElement width={10} height={10} />}
            </Group>
          </Group>
        </Paper>

        <Flex gap={6}>
          {isLeftSidebarEnabled && (
            <Paper className={classes.secondaryWrapper} p="xs" withBorder>
              <Flex gap={5} wrap="wrap">
                {createDummyArray(5).map((item, index) => (
                  <PlaceholderElement
                    height={index % 4 === 0 ? 60 + 5 : 30}
                    width={30}
                    key={`example-item-right-sidebard-${index}`}
                    index={index}
                    hasPing={isPingEnabled}
                  />
                ))}
              </Flex>
            </Paper>
          )}

          <Paper className={classes.primaryWrapper} p="xs" withBorder>
            <Flex gap={5} wrap="wrap">
              {createDummyArray(10).map((item, index) => (
                <PlaceholderElement
                  height={30}
                  width={index % 5 === 0 ? 60 : 30}
                  key={`example-item-main-${index}`}
                  index={index}
                  hasPing={isPingEnabled}
                />
              ))}
            </Flex>
          </Paper>

          {isRightSidebarEnabled && (
            <Paper className={classes.secondaryWrapper} p="xs" withBorder>
              <Flex gap={5} align="start" wrap="wrap">
                {createDummyArray(5).map((item, index) => (
                  <PlaceholderElement
                    height={30}
                    width={index % 4 === 0 ? 60 + 5 : 30}
                    key={`example-item-right-sidebard-${index}`}
                    index={index}
                    hasPing={isPingEnabled}
                  />
                ))}
              </Flex>
            </Paper>
          )}
        </Flex>

        <Divider label={t('layout.divider')} labelPosition="center" mt="md" mb="xs" />
        <Stack spacing="xs">
          <Checkbox
            label={t('layout.enablelsidebar')}
            description={t('layout.enablelsidebardesc')}
            checked={isLeftSidebarEnabled}
            onChange={(ev) => handleChange('enabledLeftSidebar', ev, setLeftSidebarEnabled)}
          />
          <Checkbox
            label={t('layout.enablersidebar')}
            description={t('layout.enablersidebardesc')}
            checked={isRightSidebarEnabled}
            onChange={(ev) => handleChange('enabledRightSidebar', ev, setRightSidebarEnabled)}
          />
          <Checkbox
            label={t('layout.enablesearchbar')}
            checked={isSearchEnabled}
            onChange={(ev) => handleChange('enabledSearchbar', ev, setSearchEnabled)}
          />
          <Checkbox
            label={t('layout.enabledocker')}
            checked={isDockerEnabled}
            onChange={(ev) => handleChange('enabledDocker', ev, setDockerEnabled)}
          />
          <Checkbox
            label={t('layout.enableping')}
            checked={isPingEnabled}
            onChange={(ev) => handleChange('enabledPing', ev, setPingEnabled)}
          />
        </Stack>
      </Stack>
    </>
  );
};

const BaseElement = ({ height, width }: { height: number; width: number }) => (
  <Paper
    sx={(theme) => ({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[1],
    })}
    h={height}
    p={2}
    w={width}
  />
);

const PlaceholderElement = (props: any) => {
  const { height, width, hasPing, index } = props;

  if (hasPing) {
    return (
      <Indicator
        position="bottom-end"
        size={5}
        offset={10}
        color={index % 4 === 0 ? 'red' : 'green'}
      >
        <BaseElement width={width} height={height} />
      </Indicator>
    );
  }

  return <BaseElement width={width} height={height} />;
};

const useStyles = createStyles((theme) => ({
  primaryWrapper: {
    flexGrow: 2,
  },
  secondaryWrapper: {
    flexGrow: 1,
    maxWidth: 100,
  },
}));
