import { GetServerSidePropsContext } from 'next';

import { createServerSideHelpers } from '@trpc/react-query/server';
import { ReactNode, createContext, useContext } from 'react';
import superjson from 'superjson';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { RouterOutputs, api } from '~/utils/api';
import { LoadConfigComponent } from '../components/Config/LoadConfig';
import { Dashboard } from '../components/Dashboard/Dashboard';
import Layout from '../components/layout/Layout';
import { getServerSideTranslations } from '../tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '../tools/server/translation-namespaces';
import { DashboardServerSideProps } from '../types/dashboardPageType';

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: DashboardServerSideProps }> {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createTRPCContext({ req: req as any, res: res as any }),
    transformer: superjson, // optional - adds superjson serialization
  });

  await helpers.dashboard.default.prefetch();

  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);

  return {
    props: {
      ...translations,
      trpcState: helpers.dehydrate(),
    },
  };
}

export default function HomePage() {
  const utils = api.useContext();
  const dashboard = utils.dashboard.default.getData();
  //useInitConfig(config);

  return (
    <DashboardProvider dashboard={dashboard}>
      <Layout>
        <Dashboard />
        <LoadConfigComponent />
      </Layout>
    </DashboardProvider>
  );
}

type Dashboard = RouterOutputs['dashboard']['default'];

type DashboardContextType = {
  dashboard: Dashboard;
};

const DashboardContext = createContext<DashboardContextType | null>(null);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context.dashboard;
};

type DashboardProviderProps = {
  dashboard: Dashboard | undefined;
  children: JSX.Element;
};

export const DashboardProvider = ({ dashboard, children }: DashboardProviderProps) => {
  if (!dashboard) return <span>Loading...</span>;
  return <DashboardContext.Provider value={{ dashboard }}>{children}</DashboardContext.Provider>;
};
