import {
  Alert,
  AppShell,
  Avatar,
  Divider,
  Flex,
  Footer,
  Group,
  Header,
  Menu,
  NavLink,
  Navbar,
  Paper,
  Text,
  TextInput,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAdjustmentsAlt,
  IconAlertTriangle,
  IconBook2,
  IconBrandDiscord,
  IconBrandGithub,
  IconDashboard,
  IconGitFork,
  IconLogout,
  IconMailForward,
  IconQuestionMark,
  IconSun,
  IconUser,
  IconUserSearch,
} from '@tabler/icons';
import { signOut } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Logo } from '../Logo';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const { t } = useTranslation();
  return (
    <AppShell
      styles={{
        root: {
          background: '#f1f1f1',
        },
      }}
      navbar={
        <Navbar width={{ base: 300 }}>
          <Navbar.Section pt="xs" grow>
            <NavLink
              label="Users"
              icon={
                <ThemeIcon size="md" variant="light" color="red">
                  <IconUser size="1rem" />
                </ThemeIcon>
              }
            >
              <NavLink
                icon={<IconAdjustmentsAlt size="1rem" />}
                label="Manage"
                component={Link}
                href="/admin/users"
              />
              <NavLink
                icon={<IconMailForward size="1rem" />}
                label="Invites"
                component={Link}
                href="/admin/users/invites"
              />
            </NavLink>
            <NavLink
              label="Help"
              icon={
                <ThemeIcon size="md" variant="light" color="red">
                  <IconQuestionMark size="1rem" />
                </ThemeIcon>
              }
            >
              <NavLink icon={<IconBook2 size="1rem" />} label="Documentation" />
              <NavLink icon={<IconBrandGithub size="1rem" />} label="Report an issue / bug" />
              <NavLink icon={<IconBrandDiscord size="1rem" />} label="Ask a question" />
              <NavLink icon={<IconGitFork size="1rem" />} label="Contribute" />
            </NavLink>
          </Navbar.Section>
          <Navbar.Section p="md">
            <Alert color="red">
              <Flex gap="md">
                <IconAlertTriangle size={35} color="red" />
                <Text color="red">
                  This is an experimental dashboard any may not work as intended. Please report any
                  bugs on GitHub
                </Text>
              </Flex>
            </Alert>
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="sm" pt="xs">
          <Group spacing="xl" position="apart" noWrap>
            <UnstyledButton component={Link} href="/admin">
              <Logo />
            </UnstyledButton>
            <TextInput radius="xl" w={400} placeholder="Sarch..." variant="filled" />

            <Group noWrap>
              <UnstyledButton>
                <Menu>
                  <Menu.Target>
                    <Avatar />
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item icon={<IconSun size="1rem" />}>Switch theme</Menu.Item>
                    <Menu.Item icon={<IconUserSearch size="1rem" />}>View Profile</Menu.Item>
                    <Menu.Item icon={<IconDashboard size="1rem" />}>Default Dashboard</Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      icon={<IconLogout size="1rem" />}
                      color="red"
                      onClick={() => signOut()}
                    >
                      Logout
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </UnstyledButton>
            </Group>
          </Group>
        </Header>
      }
      footer={
        <Footer height={25}>
          <Group position="apart" px="md">
            <Flex gap="md">
              <Text color="dimmed" size="sm">© Homarr</Text>
              <Divider orientation="vertical" my={4} />
              <Text color="dimmed" size="sm">Version 0.0.0</Text>
            </Flex>
          </Group>
        </Footer>
      }
    >
      <Paper p="xl" withBorder>
        {children}
      </Paper>
    </AppShell>
  );
};
