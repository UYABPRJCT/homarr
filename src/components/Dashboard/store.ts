import { create } from 'zustand';
import { Dashboard } from './types';

type DashboardStore = {
  dashboard: Dashboard | null;
  save: (callback: (previous: Dashboard) => Dashboard) => void;
  set: (dashboard: Dashboard) => void;
};

export const useDashboardStore = create<DashboardStore>((set) => ({
  dashboard: null,
  save: (callback) => {
    set((previous) => ({ ...previous, dashboard: callback(previous.dashboard!) }));
  },
  set: (dashboard) => set({ dashboard }),
}));
