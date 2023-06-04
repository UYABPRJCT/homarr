import { Button, Stack } from '@mantine/core';
import { api } from '~/utils/api';
import { DashboardProvider } from './context';
import { CategoryGroup } from './groups/category-group';
import { GroupProvider } from './groups/context';
import { GroupWithout } from './groups/type';
import { WrapperGroup } from './groups/wrapper-group';
import { useDashboardSave, useDashboardStore } from './store';

export const DashboardNew = () => {
  const { data, isLoading, isError } = api.dashboard.byId.useQuery({
    id: 'clhgj9ogl0000vqrgtkkldyx9',
  });
  const { data: dashboard } = useDashboard('clhgj9ogl0000vqrgtkkldyx9');
  const isEditMode = useDashboardStore((x) => x.isEditMode);
  const edit = useDashboardStore((x) => x.edit);
  const saveChanges = useDashboardSave();

  const rightSidebar = dashboard?.groups.find(
    (group) => group.type === 'sidebar' && group.position === 'right'
  );
  const leftSidebar = dashboard?.groups.find(
    (group) => group.type === 'sidebar' && group.position === 'left'
  );
  const mainGroups =
    dashboard?.groups
      .filter((group): group is GroupWithout<'sidebar'> => group.type !== 'sidebar')
      .sort((a, b) => a.index - b.index) ?? [];

  return (
    <DashboardProvider
      value={{
        dashboard: dashboard ?? null,
      }}
    >
      <Stack>
        <Button
          onClick={async () => {
            if (isEditMode) {
              await saveChanges(dashboard);
              return;
            }
            edit(dashboard!);
          }}
        >
          Toggle
        </Button>
        {mainGroups.map((group) => (
          <GroupProvider key={group.id} value={{ group }}>
            {group.type === 'category' ? <CategoryGroup /> : <WrapperGroup />}
          </GroupProvider>
        ))}
      </Stack>
    </DashboardProvider>
  );
};

export const useDashboard = (id: string) => {
  const { data, isLoading, isError } = api.dashboard.byId.useQuery({ id });

  const clientData = useDashboardStore((x) => x.dashboard);
  const isEditMode = useDashboardStore((x) => x.isEditMode);

  return {
    data: isEditMode ? clientData : data,
    isLoading,
    isError,
  };
};
