import {
  Accordion,
  ActionIcon,
  Box,
  List,
  Menu,
  Stack,
  Text,
  Title,
  createStyles,
} from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconShare3 } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useDashboard } from '~/pages';
import { useCardStyles } from '../../../layout/useCardStyles';
import { useEditModeStore } from '../../Views/useEditModeStore';
import { CategoryGroup, onlyItemsFromType } from '../../types';
import { WrapperContent } from '../WrapperContent';
import { useGridstack } from '../gridstack/use-gridstack';
import { CategoryEditMenu } from './CategoryEditMenu';

interface DashboardCategoryProps {
  category: CategoryGroup;
}

export const DashboardCategory = ({ category }: DashboardCategoryProps) => {
  const { refs, items } = useGridstack('category', category.id);
  const isEditMode = useEditModeStore((x) => x.enabled);
  const { classes: cardClasses, cx } = useCardStyles(true);
  const dashboard = useDashboard();
  const { classes } = useStyles();
  const { t } = useTranslation(['layout/common', 'common']);

  const categoryList = onlyItemsFromType(dashboard.groups, 'category').map((c) => c.id);
  const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: `app-shelf-toggled-${dashboard.id}`,
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: categoryList,
  });

  const handleMenuClick = () => {
    const apps = onlyItemsFromType(category.items, 'app');
    for (let i = 0; i < apps.length; i += 1) {
      const app = apps[i];
      const popUp = window.open(app.externalUrl, app.id);

      if (popUp === null) {
        modals.openConfirmModal({
          title: <Text weight="bold">{t('modals.blockedPopups.title')}</Text>,
          children: (
            <Stack maw="100%">
              <Text>{t('modals.blockedPopups.text')}</Text>
              <List>
                <List.Item className={classes.listItem}>
                  {t('modals.blockedPopups.list.browserPermission')}
                </List.Item>
                <List.Item className={classes.listItem}>
                  {t('modals.blockedPopups.list.adBlockers')}
                </List.Item>
                <List.Item className={classes.listItem}>
                  {t('modals.blockedPopups.list.otherBrowser')}
                </List.Item>
              </List>
            </Stack>
          ),
          labels: {
            confirm: t('common:close'),
            cancel: '',
          },
          cancelProps: {
            display: 'none',
          },
          closeOnClickOutside: false,
        });
        break;
      }
    }
  };

  return (
    <Accordion
      classNames={{
        item: cx(cardClasses.card, 'dashboard-gs-category'),
      }}
      mx={10}
      chevronPosition="left"
      multiple
      value={isEditMode ? categoryList : toggledCategories}
      variant="separated"
      radius="lg"
      onChange={(state) => {
        // Cancel if edit mode is on
        if (isEditMode) return;
        setToggledCategories([...state]);
      }}
    >
      <Accordion.Item value={category.name}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Accordion.Control icon={isEditMode && <CategoryEditMenu category={category} />}>
            <Title order={3}>{category.name}</Title>
          </Accordion.Control>
          {!isEditMode && (
            <Menu withArrow withinPortal>
              <Menu.Target>
                <ActionIcon variant="light" mr="md">
                  <IconDotsVertical />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item onClick={handleMenuClick} icon={<IconShare3 size="1rem" />}>
                  {t('actions.category.openAllInNewTab')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </Box>
        <Accordion.Panel>
          <div
            className="grid-stack grid-stack-category"
            data-category={category.id}
            ref={refs.wrapper}
          >
            <WrapperContent items={items} refs={refs} />
          </div>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
};

const useStyles = createStyles(() => ({
  listItem: {
    '& div': {
      maxWidth: 'calc(100% - 23px)',
    },
  },
}));
