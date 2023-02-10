import { Badge, Button, Container, Group, Stack, Title } from '@mantine/core';
import { NextLink } from '@mantine/next';
import { IconUser } from '@tabler/icons';
import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import Head from 'next/head';
import { openInviteCreateModal } from '../../components/Admin/Invite/InviteCreateModal';
import { InviteTable } from '../../components/Admin/Invite/InviteTable';
import { useUsersQuery } from '../../components/Admin/User/UserList';
import { useScreenSmallerThan } from '../../hooks/useScreenSmallerThan';
import { getServerAuthSession } from '../../server/common/get-server-auth-session';
import { getServerSideTranslations } from '../../tools/getServerSideTranslations';

const Invites: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => {
  const smallerThanSm = useScreenSmallerThan('sm');

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container>
        <Stack>
          <div>
            <Title>Invites</Title>
            <Title order={4} weight={400}>
              Manage your invites for new users.
            </Title>
          </div>
          <Group grow={smallerThanSm} position="right">
            <UsersButton />
            <Button onClick={openInviteCreateModal}>New invite</Button>
          </Group>
          <InviteTable />
        </Stack>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({
    req: context.req,
    res: context.res,
  });

  const currentUser = await prisma?.user.findFirst({
    where: {
      id: session?.user?.id,
    },
  });

  if (!currentUser?.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    context.req,
    context.res,
    ['common', 'form'],
    context.locale
  );

  return { props: { ...translations } };
};

export default Invites;

const UsersButton = () => {
  const { data: users } = useUsersQuery();

  return (
    <Button
      component={NextLink}
      href="/admin/users"
      variant="default"
      leftIcon={<IconUser size={16} />}
      rightIcon={users?.length === 0 || !users ? null : <Badge>{users.length}</Badge>}
    >
      Users
    </Button>
  );
};
