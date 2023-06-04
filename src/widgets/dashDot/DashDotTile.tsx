import { Center, createStyles, Grid, Stack, Text, Title } from '@mantine/core';
import { IconUnlink } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import {
  createWidgetComponent,
  defineWidget,
  widgetOption,
} from '~/new-components/dashboard/items/widget/definition';
import { api } from '~/utils/api';
import { DashDotGraph } from './DashDotGraph';

const definition = defineWidget({
  sort: 'dashdot',
  icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/dashdot.png',
  options: {
    url: widgetOption.text(z.string().url(), {
      defaultValue: '',
      nullable: false,
    }),
    usePercentages: widgetOption.switch(z.boolean(), {
      defaultValue: false,
    }),
    columns: widgetOption.number(z.number().min(1).max(2), {
      defaultValue: 2,
    }),
    graphHeight: widgetOption.number(z.number().step(5), {
      defaultValue: 115,
      stepHoldDelay: 500,
      stepHoldInterval: 100,
    }),
    graphsOrder: widgetOption.staticDraggableList(
      {
        storage: {
          enabled: widgetOption.switch(z.boolean(), { defaultValue: true }),
          compactView: widgetOption.switch(z.boolean(), { defaultValue: true }),
          span: widgetOption.number(z.number().min(1).max(2), { defaultValue: 2 }),
          multiView: widgetOption.switch(z.boolean(), { defaultValue: false }),
        },
        network: {
          enabled: widgetOption.switch(z.boolean(), { defaultValue: true }),
          compactView: widgetOption.switch(z.boolean(), { defaultValue: true }),
          span: widgetOption.number(z.number().min(1).max(2), { defaultValue: 2 }),
        },
        cpu: {
          enabled: widgetOption.switch(z.boolean(), { defaultValue: true }),
          multiView: widgetOption.switch(z.boolean(), { defaultValue: false }),
          span: widgetOption.number(z.number().min(1).max(2), { defaultValue: 1 }),
        },
        ram: {
          enabled: widgetOption.switch(z.boolean(), { defaultValue: true }),
          span: widgetOption.number(z.number().min(1).max(2), { defaultValue: 1 }),
        },
        gpu: {
          enabled: widgetOption.switch(z.boolean(), { defaultValue: false }),
          span: widgetOption.number(z.number().min(1).max(2), { defaultValue: 1 }),
        },
      },
      {
        defaultValue: ['storage', 'network', 'cpu', 'ram', 'gpu'],
      }
    ),
  },
  gridstack: {
    minWidth: 2,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 14,
  },
});

const DashDotWidget = createWidgetComponent(definition, ({ options }) => {
  const { classes } = useDashDotTileStyles();
  const { t } = useTranslation('modules/dashdot');

  const dashDotUrl = options.url;
  const locationProtocol = window.location.protocol;
  const detectedProtocolDowngrade =
    locationProtocol === 'https:' && dashDotUrl.toLowerCase().startsWith('http:');

  const { data: info } = useDashDotInfo({
    dashDotUrl,
    enabled: !detectedProtocolDowngrade,
  });

  if (detectedProtocolDowngrade) {
    return (
      <Center h="100%">
        <Stack spacing="xs" align="center">
          <IconUnlink size={40} strokeWidth={1.2} />
          <Title order={5}>{t('card.errors.protocolDowngrade.title')}</Title>
          <Text align="center" size="sm">
            {t('card.errors.protocolDowngrade.text')}
          </Text>
        </Stack>
      </Center>
    );
  }

  const { usePercentages, columns, graphHeight, graphsOrder } = options;

  return (
    <Stack spacing="xs">
      <Title order={3}>{t('card.title')}</Title>
      {!info && <p>{t('card.errors.noInformation')}</p>}
      {info && (
        <div className={classes.graphsContainer}>
          <Grid grow gutter="sm" w="100%" columns={columns}>
            {graphsOrder
              .filter((g) => g.subValues.enabled)
              .map((g) => (
                <Grid.Col key={g.key} span={Math.min(columns, g.subValues.span)}>
                  <DashDotGraph
                    dashDotUrl={dashDotUrl}
                    info={info}
                    graph={g.key as any}
                    graphHeight={graphHeight}
                    isCompact={
                      g.key === 'storage' || g.key === 'network' ? g.subValues.compactView : false
                    }
                    multiView={
                      g.key === 'storage' || g.key === 'cpu' ? g.subValues.multiView : false
                    }
                    usePercentages={usePercentages}
                    url={dashDotUrl}
                  />
                </Grid.Col>
              ))}
          </Grid>
        </div>
      )}
    </Stack>
  );
});

const useDashDotInfo = ({ dashDotUrl, enabled }: { dashDotUrl: string; enabled: boolean }) =>
  api.dashDot.info.useQuery(
    {
      url: dashDotUrl,
    },
    {
      refetchInterval: 50000,
      enabled,
    }
  );
export const useDashDotTileStyles = createStyles((theme) => ({
  graphsContainer: {
    marginRight: `calc(${theme.spacing.sm} * -1)`,
  },
}));

export default DashDotWidget;
