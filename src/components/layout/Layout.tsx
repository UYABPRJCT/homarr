import { AppShell, createStyles } from '@mantine/core';
import { Background } from './Background';
import { Header } from './header/Header';
import { Head } from './header/Meta/Head';
import { useDashboard } from '~/pages';

const useStyles = createStyles(() => ({}));

export default function Layout({ children }: any) {
  const { cx } = useStyles();
  const dashboard = useDashboard();

  return (
    <AppShell
      fixed={false}
      header={<Header />}
      styles={{
        main: {
          minHeight: 'calc(100vh - var(--mantine-header-height))',
        },
      }}
      className="dashboard-app-shell"
    >
      <Head />
      <Background />
      {children}
      <style>{cx(dashboard.customCss)}</style>
    </AppShell>
  );
}
