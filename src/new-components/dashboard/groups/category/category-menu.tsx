import { ActionIcon, Menu, Title } from '@mantine/core';
import {
  IconDots,
  IconEdit,
  IconRowInsertBottom,
  IconRowInsertTop,
  IconTransitionBottom,
  IconTransitionTop,
  IconTrash,
} from '@tabler/icons';
import { openConfirmModal } from '@mantine/modals';
import { useCategoryGroupContext } from '../context';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';
import { CategoryEditModalInnerProps } from './category-edit-modal';
import { GroupOnly } from '../type';
import { useDashboardStore } from '../../store';

export const CategoryEditMenu = () => {
  const { group: category } = useCategoryGroupContext();
  const { categories } = useDashboardStore();
  const addCategory = useAddCategory();
  const editCategory = useEditCategory();
  const removeCategory = useRemoveCategory();

  return (
    <Menu withinPortal withArrow>
      <Menu.Target>
        <ActionIcon>
          <IconDots />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconEdit size={20} />} onClick={() => editCategory(category!)}>
          Edit
        </Menu.Item>
        <Menu.Item icon={<IconTrash size={20} />} onClick={() => removeCategory(category!)}>
          Remove
        </Menu.Item>
        <Menu.Label>Change positon</Menu.Label>
        <Menu.Item
          icon={<IconTransitionTop size={20} />}
          onClick={() =>
            categories.move({
              id: category!.id,
              direction: 'up',
            })
          }
        >
          Move up
        </Menu.Item>
        <Menu.Item
          icon={<IconTransitionBottom size={20} />}
          onClick={() =>
            categories.move({
              id: category!.id,
              direction: 'down',
            })
          }
        >
          Move down
        </Menu.Item>
        <Menu.Label>Add category</Menu.Label>
        <Menu.Item
          icon={<IconRowInsertTop size={20} />}
          onClick={() => addCategory(category!, 'above')}
        >
          Add category above
        </Menu.Item>
        <Menu.Item
          icon={<IconRowInsertBottom size={20} />}
          onClick={() => addCategory(category!, 'below')}
        >
          Add category below
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const useAddCategory = () => {
  const { categories } = useDashboardStore();

  return (category: GroupOnly<'category'>, position: 'above' | 'below') =>
    openContextModalGeneric<CategoryEditModalInnerProps>({
      title: <Title order={4}>Add category</Title>,
      modal: 'editCategoryModal',
      innerProps: {
        category,
        onSuccess(name) {
          categories.add({
            id: category.id,
            position,
            name,
          });
        },
      },
    });
};

const useEditCategory = () => {
  const { categories } = useDashboardStore();

  return (category: GroupOnly<'category'>) =>
    openContextModalGeneric<CategoryEditModalInnerProps>({
      title: <Title order={4}>Edit category</Title>,
      modal: 'editCategoryModal',
      innerProps: {
        category,
        onSuccess(name) {
          categories.rename({
            id: category.id,
            name,
          });
        },
      },
    });
};

const useRemoveCategory = () => {
  const { categories } = useDashboardStore();

  return (category: GroupOnly<'category'>) =>
    openConfirmModal({
      title: 'Remove category',
      labels: {
        confirm: 'Remove',
        cancel: 'Cancel',
      },
      children: `Are you sure that you want to remove category "${category.name}"?`,
      onConfirm() {
        categories.remove(category.id);
      },
    });
};
