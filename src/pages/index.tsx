import { GetServerSidePropsContext } from 'next';

import { createServerSideHelpers } from '@trpc/react-query/server';
import { createContext, useContext } from 'react';
import superjson from 'superjson';
import { useDashboardStore } from '~/components/Dashboard/store';
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
  return (
    <Layout>
      <Dashboard />
      <LoadConfigComponent />
    </Layout>
  );
}

type Dashboard = RouterOutputs['dashboard']['default'];

export const useDashboard = () => {
  const utils = api.useContext();
  const dashboard = utils.dashboard.default.getData()!;
  const clientDashboard = useDashboardStore((x) => x.dashboard);
  return clientDashboard ?? dashboard;
};

export const isSidebarEnabled = (dashboard: Dashboard, position: 'left' | 'right'): boolean =>
  dashboard.groups.some((x) => x.type === 'sidebar' && x.position === position);
