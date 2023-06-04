import { ActionIcon, Menu } from '@mantine/core';
import { IconDots, IconLayoutKanban, IconPencil, IconTrash } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useDashboardStore } from '../../store';

type ItemMenuProps = {
  handleEditClick: () => void;
  handleChangePositionClick: () => void;
  handleDeleteClick: () => void;
  isEditable: boolean;
};

export const ItemMenu = ({
  handleEditClick,
  handleChangePositionClick,
  handleDeleteClick,
  isEditable,
}: ItemMenuProps) => {
  const { t } = useTranslation('common');
  const isEditMode = useDashboardStore((x) => x.isEditMode);

  if (!isEditMode) {
    return null;
  }

  return (
    <Menu withinPortal withArrow position="right">
      <Menu.Target>
        <ActionIcon size="md" radius="md" pos="absolute" top={8} right={8}>
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown w={250}>
        <Menu.Label>{t('sections.settings')}</Menu.Label>
        {isEditable && (
          <Menu.Item icon={<IconPencil size={16} stroke={1.5} />} onClick={handleEditClick}>
            {t('edit')}
          </Menu.Item>
        )}
        <Menu.Item
          icon={<IconLayoutKanban size={16} stroke={1.5} />}
          onClick={handleChangePositionClick}
        >
          {t('changePosition')}
        </Menu.Item>
        <Menu.Label>{t('sections.dangerZone')}</Menu.Label>
        <Menu.Item
          color="red"
          icon={<IconTrash size={16} stroke={1.5} color="red" />}
          onClick={handleDeleteClick}
        >
          {t('remove')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
