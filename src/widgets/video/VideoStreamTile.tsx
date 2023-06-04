import { Center, Group, Stack, Title } from '@mantine/core';
import { IconDeviceCctv, IconHeartBroken } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import { z } from 'zod';
import {
  createWidgetComponent,
  defineWidget,
  widgetOption,
} from '~/new-components/dashboard/items/widget/definition';

const VideoFeed = dynamic(() => import('./VideoFeed'), { ssr: false });

const definition = defineWidget({
  sort: 'video-stream',
  icon: IconDeviceCctv,
  options: {
    feedUrl: widgetOption.text(z.string(), {
      defaultValue: '',
      nullable: false,
    }),
    autoPlay: widgetOption.switch(z.boolean(), {
      defaultValue: true,
    }),
    muted: widgetOption.switch(z.boolean(), {
      defaultValue: true,
    }),
    controls: widgetOption.switch(z.boolean(), {
      defaultValue: false,
    }),
  },
  gridstack: {
    minWidth: 3,
    minHeight: 2,
    maxWidth: 12,
    maxHeight: 12,
  },
});

const VideoStreamWidget = createWidgetComponent(definition, ({ options }) => {
  const { t } = useTranslation('modules/video-stream');
  if (!options.feedUrl) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconHeartBroken />
          <Title order={4}>{t('errors.invalidStream')}</Title>
        </Stack>
      </Center>
    );
  }
  return (
    <Group position="center" w="100%" h="100%">
      <VideoFeed
        source={options.feedUrl}
        muted={options.muted}
        autoPlay={options.autoPlay}
        controls={options.controls}
      />
    </Group>
  );
});

export default VideoStreamWidget;
