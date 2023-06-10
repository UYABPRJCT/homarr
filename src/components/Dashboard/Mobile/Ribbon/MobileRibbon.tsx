import { ActionIcon, createStyles, Space } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { isSidebarEnabled, useDashboard } from '~/pages';
import { useScreenLargerThan } from '../../../../hooks/useScreenLargerThan';
import { MobileRibbonSidebarDrawer } from './MobileRibbonSidebarDrawer';

export const MobileRibbons = () => {
  const { classes, cx } = useStyles();
  const dashboard = useDashboard();
  const [openedRight, rightSidebar] = useDisclosure(false);
  const [openedLeft, leftSidebar] = useDisclosure(false);
  const screenLargerThanMd = useScreenLargerThan('md');

  if (screenLargerThanMd || !dashboard) {
    return <></>;
  }

  return (
    <div className={classes.root}>
      {isSidebarEnabled(dashboard, 'left') ? (
        <>
          <ActionIcon
            onClick={leftSidebar.open}
            className={cx(classes.button, classes.removeBorderLeft)}
            variant="default"
          >
            <IconChevronRight />
          </ActionIcon>
          <MobileRibbonSidebarDrawer
            onClose={leftSidebar.close}
            opened={openedLeft}
            location="left"
          />
        </>
      ) : (
        <Space />
      )}

      {isSidebarEnabled(dashboard, 'right') ? (
        <>
          <ActionIcon
            onClick={rightSidebar.open}
            className={cx(classes.button, classes.removeBorderRight)}
            variant="default"
          >
            <IconChevronLeft />
          </ActionIcon>
          <MobileRibbonSidebarDrawer
            onClose={rightSidebar.close}
            opened={openedRight}
            location="right"
          />
        </>
      ) : null}
    </div>
  );
};

const useStyles = createStyles(() => ({
  root: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    pointerEvents: 'none',
  },
  button: {
    height: 100,
    width: 36,
    pointerEvents: 'auto',
  },
  removeBorderLeft: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  removeBorderRight: {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
}));
