import { Accordion, Title } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
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

  const categoryList = onlyItemsFromType(dashboard.groups, 'category').map((c) => c.id);
  const [toggledCategories, setToggledCategories] = useLocalStorage({
    key: `app-shelf-toggled-${dashboard.id}`,
    // This is a bit of a hack to toggle the categories on the first load, return a string[] of the categories
    defaultValue: categoryList,
  });

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
      <Accordion.Item value={category.id}>
        <Accordion.Control icon={isEditMode && <CategoryEditMenu category={category} />}>
          <Title order={3}>{category.name}</Title>
        </Accordion.Control>
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
