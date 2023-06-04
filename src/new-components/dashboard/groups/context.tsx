import { createContext, useContext } from 'react';
import { Group, GroupOnly } from './type';

type GroupContextType<TGroup extends Group = Group> = {
  group: TGroup | null;
};

const GroupContext = createContext<GroupContextType>({ group: null });

export const useGroupContext = () => useContext(GroupContext);

export const useCategoryGroupContext = () =>
  useGroupContext() as GroupContextType<GroupOnly<'category'>>;

export const useWrapperGroupContext = () =>
  useGroupContext() as GroupContextType<GroupOnly<'wrapper'>>;

export const useSidebarGroupContext = () =>
  useGroupContext() as GroupContextType<GroupOnly<'sidebar'>>;

export const GroupProvider = GroupContext.Provider;
