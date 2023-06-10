import { Group, Space, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconBox, IconBoxAlignTop, IconStack } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'next-i18next';
import { ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppItem, onlyItemsFromType } from '~/components/Dashboard/types';
import { useDashboard } from '~/pages';
import { useConfigStore } from '../../../../../../config/store';
import { openContextModalGeneric } from '../../../../../../tools/mantineModalManagerExtensions';
import { AppType } from '../../../../../../types/app';
import { CategoryEditModalInnerProps } from '../../../../Wrappers/Category/CategoryEditModal';
import { useStyles } from '../Shared/styles';

interface AvailableElementTypesProps {
  modalId: string;
  onOpenIntegrations: () => void;
  onOpenStaticElements: () => void;
}

export const AvailableElementTypes = ({
  modalId,
  onOpenIntegrations: onOpenWidgets,
  onOpenStaticElements,
}: AvailableElementTypesProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  //const { config, name: configName } = useConfigContext();
  const dashboard = useDashboard();
  const { updateConfig } = useConfigStore();
  const getLowestWrapper = () =>
    onlyItemsFromType(dashboard.groups, 'wrapper').sort((a, b) => a.index - b.index)[0];

  const onClickCreateCategory = async () => {
    openContextModalGeneric<CategoryEditModalInnerProps>({
      modal: 'categoryEditModal',
      title: 'Name of new category',
      withCloseButton: false,
      innerProps: {
        category: {
          id: uuidv4(),
          name: 'New category',
          position: 0, // doesn't matter, is being overwritten
        },
        onSuccess: async (category) => {
          //if (!configName) return;
          /*await updateConfig(configName, (previousConfig) => ({
            ...previousConfig,
            wrappers: [
              ...previousConfig.wrappers,
              {
                id: uuidv4(),
                // Thank you ChatGPT ;)
                position: previousConfig.categories.length + 1,
              },
            ],
            categories: [
              ...previousConfig.categories,
              {
                id: uuidv4(),
                name: category.name,
                position: previousConfig.categories.length + 1,
              },
            ],
          })).then(() => {
            closeModal(modalId);
            showNotification({
              title: 'Category created',
              message: `The category ${category.name} has been created`,
              color: 'teal',
            });
          });*/
        },
      },
    });
  };

  return (
    <>
      <Text color="dimmed">{t('modal.text')}</Text>
      <Space h="lg" />
      <Group spacing="md" grow>
        <ElementItem
          name="Apps"
          icon={<IconBox size={40} strokeWidth={1.3} />}
          onClick={() => {
            openContextModalGeneric<{ app: Partial<AppItem>; allowAppNamePropagation: boolean }>({
              modal: 'editApp',
              innerProps: {
                app: {
                  name: 'Your app',
                  internalUrl: 'https://homarr.dev',
                  iconSource: '/imgs/logo/logo.png',
                  /*network: {
                    enabledStatusChecker: true,
                    statusCodes: ['200', '301', '302', '304', '307', '308'],
                    okStatus: [200, 301, 302, 304, 307, 308],
                  },*/
                  openInNewTab: true,
                  externalUrl: '',
                  groupId: getLowestWrapper().id,
                  /*integration: {
                    type: null,
                    properties: [],
                  },*/
                  type: 'app',
                  // TODO: remove temporary status location and size
                  positionX: 0,
                  positionY: 0,
                  width: 1,
                  height: 1,
                },
                allowAppNamePropagation: true,
              },
              size: 'xl',
            });
          }}
        />
        <ElementItem
          name="Widgets"
          icon={<IconStack size={40} strokeWidth={1.3} />}
          onClick={onOpenWidgets}
        />
        <ElementItem
          name="Category"
          icon={<IconBoxAlignTop size={40} strokeWidth={1.3} />}
          onClick={onClickCreateCategory}
        />
      </Group>
    </>
  );
};

interface ElementItemProps {
  icon: ReactNode;
  name: string;
  onClick: () => void;
}

const ElementItem = ({ name, icon, onClick }: ElementItemProps) => {
  const { classes, cx } = useStyles();
  return (
    <UnstyledButton
      className={cx(classes.elementButton, classes.styledButton)}
      onClick={onClick}
      py="md"
    >
      <Stack className={classes.elementStack} align="center" spacing={5}>
        <motion.div
          // On hover zoom in
          whileHover={{ scale: 1.2 }}
        >
          {icon}
        </motion.div>
        <Text className={classes.elementName} weight={500} size="sm">
          {name}
        </Text>
      </Stack>
    </UnstyledButton>
  );
};
