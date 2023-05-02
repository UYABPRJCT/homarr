import { GetServerSidePropsContext } from 'next';

import { Button, Card, Group, MantineColor, Stack, Title } from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconBoxAlignBottom,
  IconBoxAlignTop,
  IconInputSearch,
  IconX,
} from '@tabler/icons';
import { v4 } from 'uuid';
import { create } from 'zustand';
import { api } from '~/utils/api';
import Layout from '../components/layout/Layout';
import { getServerSideTranslations } from '../tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '../tools/server/translation-namespaces';
import { DashboardNew } from '~/components/dashboard-new/dashboard';

export async function getServerSideProps({
  req,
  res,
  locale,
}: GetServerSidePropsContext): Promise<{ props: any }> {
  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);

  return {
    props: {
      ...translations,
    },
  };
}

export default function HomePage() {
  return (
    <Layout>
      <DashboardNew />
    </Layout>
  );
}
