import { createContext, useContext } from 'react';
import { Dashboard } from './type';

type DashboardContextType<TDashboard extends Dashboard = Dashboard> = {
  dashboard: TDashboard | null;
};

const DashboardContext = createContext<DashboardContextType>({ dashboard: null });

export const useDashboardContext = () => useContext(DashboardContext);
export const DashboardProvider = DashboardContext.Provider;
