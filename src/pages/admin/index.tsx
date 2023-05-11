import {
  ActionIcon,
  Button,
  Card,
  Divider,
  Flex,
  Grid,
  Menu,
  Paper,
  Space,
  Text,
  Title,
} from '@mantine/core';
import {
  IconAppWindow,
  IconDots,
  IconHomeShare,
  IconKey,
  IconSettings,
  IconShare,
  IconTrash,
} from '@tabler/icons';
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { MainLayout } from '../../components/layout/admin/main-layout';
import { getServerSideTranslations } from '../../tools/server/getServerSideTranslations';

const Index: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => (
  <MainLayout>
    <Flex gap="sm" mb="md">
      <Title>Good morning,</Title>
      <Title variant="gradient" gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}>
        Ajnart
      </Title>
    </Flex>
    <Text size="lg">
      Welcome back to Homarr - we're glad that you're here. What would you like to do?
    </Text>

    <Divider my="lg" maw={600} mx="auto" px="lg" />

    <Title order={3} mb="md">
      Recently viewed
    </Title>
    <Grid>
      {[...new Array(5)].map((index) => (
        <Grid.Col xs={12} sm={6} md={4} key={index}>
          <Card withBorder>
            <Card.Section mb="md">
              <Paper bg="gray" w="100%" h={200} />
            </Card.Section>
            <Title order={5}>Your Dashboard</Title>
            <Space h="md" />
            <Flex gap="xs">
              <Button variant="default" fullWidth>
                Open
              </Button>
              <Menu width={200} withinPortal>
                <Menu.Target>
                  <ActionIcon size={34.5} variant="default">
                    <IconDots size="1rem" />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item icon={<IconHomeShare size="1rem" />}>Open</Menu.Item>
                  <Menu.Item icon={<IconAppWindow size="1rem" />}>Open in new window</Menu.Item>
                  <Menu.Item icon={<IconShare size="1rem" />}>Share</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item icon={<IconKey size="1rem" />}>Secrets</Menu.Item>
                  <Menu.Item icon={<IconSettings size="1rem" />}>Settings</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item icon={<IconTrash size="1rem" />} color="red">
                    Delete permanently
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Flex>
          </Card>
        </Grid.Col>
      ))}
    </Grid>
  </MainLayout>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translations = await getServerSideTranslations(
    ['common', 'form'],
    context.locale,
    context.req,
    context.res
  );

  return { props: { ...translations } };
};

export default Index;
