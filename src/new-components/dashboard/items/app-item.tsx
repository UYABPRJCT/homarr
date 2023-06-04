import Link from 'next/link';
import { Box, Stack, Title, UnstyledButton, createStyles } from '@mantine/core';
import { motion } from 'framer-motion';
import { HomarrCardWrapper } from '~/components/Dashboard/Tiles/HomarrCardWrapper';
import { useDashboardStore } from '../store';
import { useAppItemContext } from './context';

export const AppItem = () => {
  const { item } = useAppItemContext();
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  const { cx, classes } = useStyles();

  if (!item) return null;
  const onClickUrl = item.externalUrl || item.internalUrl;
  const target = item.openInNewTab ? '_blank' : '_self';

  const buttonProps = isEditMode
    ? ({} as Record<never, never>)
    : {
        component: Link,
        href: onClickUrl,
        target,
      };

  return (
    <HomarrCardWrapper className="grid-stack-item-content">
      <UnstyledButton
        style={{ pointerEvents: isEditMode ? 'none' : 'auto' }}
        {...buttonProps}
        className={cx(classes.button)}
      >
        <Stack
          m={0}
          p={0}
          spacing="xs"
          justify="space-around"
          align="center"
          style={{ height: '100%', width: '100%' }}
          className="dashboard-tile-app"
        >
          <Box hidden={false}>
            <Title
              order={5}
              size="md"
              ta="center"
              lineClamp={1}
              className={cx(classes.appName, 'dashboard-tile-app-title')}
            >
              {item.name}
            </Title>
          </Box>
          <motion.img
            className={classes.image}
            height="85%"
            width="85%"
            style={{
              objectFit: 'contain',
            }}
            src={item.iconSource}
            alt={item.name}
            whileHover={{
              scale: 1.2,
              transition: { duration: 0.2 },
            }}
          />
        </Stack>
      </UnstyledButton>
    </HomarrCardWrapper>
  );
};

const useStyles = createStyles(() => ({
  image: {
    maxHeight: '90%',
    maxWidth: '90%',
  },
  appName: {
    wordBreak: 'break-word',
  },
  button: {
    paddingBottom: 10,
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
}));
