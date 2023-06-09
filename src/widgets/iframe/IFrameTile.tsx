import { Center, Container, Stack, Text, Title, createStyles } from '@mantine/core';
import { IconBrowser, IconUnlink } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { z } from 'zod';
import {
  createWidgetComponent,
  defineWidget,
  inferOptionsFromDefinition,
  widgetOption,
} from '../common/definition';

const definition = defineWidget({
  sort: 'iframe',
  icon: IconBrowser,
  options: {
    embedUrl: widgetOption.text(z.string().url(), {
      defaultValue: '',
      nullable: false,
    }),
    allowFullScreen: widgetOption.switch(z.boolean(), { defaultValue: false }),
    allowScrolling: widgetOption.switch(z.boolean(), { defaultValue: true }),
    allowTransparency: widgetOption.switch(z.boolean(), { defaultValue: false }),
    allowPayment: widgetOption.switch(z.boolean(), { defaultValue: false }),
    allowAutoPlay: widgetOption.switch(z.boolean(), { defaultValue: false }),
    allowMicrophone: widgetOption.switch(z.boolean(), { defaultValue: false }),
    allowCamera: widgetOption.switch(z.boolean(), { defaultValue: false }),
    allowGeolocation: widgetOption.switch(z.boolean(), { defaultValue: false }),
  },
  gridstack: {
    maxHeight: 12,
    maxWidth: 12,
    minHeight: 1,
    minWidth: 1,
  },
  options: {
    embedUrl: {
      type: 'text',
      defaultValue: '',
    },
    allowFullScreen: {
      type: 'switch',
      defaultValue: false,
    },
  },
  component: IFrameTile,
});

const IFrameWidget = createWidgetComponent(definition, ({ options }) => {
  const { t } = useTranslation('modules/iframe');
  const { classes } = useStyles();

  if (!options.embedUrl) {
    return (
      <Center h="100%">
        <Stack align="center">
          <IconUnlink size={36} strokeWidth={1.2} />
          <Stack align="center" spacing={0}>
            <Title order={6} align="center">
              {t('card.errors.noUrl.title')}
            </Title>
            <Text align="center" maw={200}>
              {t('card.errors.noUrl.text')}
            </Text>
          </Stack>
        </Stack>
      </Center>
    );
  }

  const allowedPermissions = useAllowedPermissions(options);

  return (
    <Container h="100%" w="100%" maw="initial" mah="initial" p={0}>
      <iframe
        className={classes.iframe}
        src={options.embedUrl}
        title="widget iframe"
        allow={allowedPermissions.join(' ')}
        allow={allowedPermissions.join(' ')}
      >
        <Text>Your Browser does not support iframes. Please update your browser.</Text>
      </iframe>
    </Container>
  );
});

const useAllowedPermissions = (options: inferOptionsFromDefinition<typeof definition>) => {
  const permissions: string[] = [];

  if (options.allowTransparency) permissions.push('transparency');
  if (options.allowFullScreen) permissions.push('fullscreen');
  if (options.allowPayment) permissions.push('payment');
  if (options.allowAutoPlay) permissions.push('autoplay');
  if (options.allowCamera) permissions.push('camera');
  if (options.allowMicrophone) permissions.push('microphone');
  if (options.allowGeolocation) permissions.push('geolocation');

  return permissions;
};

const useStyles = createStyles(({ radius }) => ({
  iframe: {
    borderRadius: radius.sm,
    width: '100%',
    height: '100%',
    border: 'none',
    background: 'none',
    backgroundColor: 'transparent',
  },
}));

export default IFrameWidget;
