import { Button, Group, Popover, Stack, Tabs, Text, ThemeIcon } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { ContextModalProps } from '@mantine/modals';
import {
  IconAccessPoint,
  IconAdjustments,
  IconAlertTriangle,
  IconBrush,
  IconClick,
  IconPlug,
} from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { z } from 'zod';
import { DebouncedImage } from '../../../IconSelector/DebouncedImage';
import { useDashboardStore } from '../../store';
import { AppItem } from '../../types';
import { AppearanceTab } from './Tabs/AppereanceTab/AppereanceTab';
import { BehaviourTab } from './Tabs/BehaviourTab/BehaviourTab';
import { GeneralTab } from './Tabs/GeneralTab/GeneralTab';
import { IntegrationTab } from './Tabs/IntegrationTab/IntegrationTab';
import { NetworkTab } from './Tabs/NetworkTab/NetworkTab';
import { EditAppModalTab } from './Tabs/type';
import { v4 } from 'uuid';

const appUrlRegex =
  '(https?://(?:www.|(?!www))\\[?[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\\]?.[^\\s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^\\s]{2,}|https?://(?:www.|(?!www))\\[?[a-zA-Z0-9]+\\]?.[^\\s]{2,}|www.[a-zA-Z0-9]+.[^\\s]{2,})';

export const EditAppModal = ({
  context,
  id,
  innerProps,
}: ContextModalProps<{ app: AppItem; allowAppNamePropagation: boolean }>) => {
  const { t } = useTranslation(['layout/modals/add-app', 'common']);
  const save = useDashboardStore((x) => x.save);
  const [allowAppNamePropagation, setAllowAppNamePropagation] = useState<boolean>(
    innerProps.allowAppNamePropagation
  );

  const form = useForm<AppItem>({
    initialValues: innerProps.app,
    validate: zodResolver(
      z.object({
        name: z
          .string({
            required_error: 'Name is required',
          })
          .nonempty({
            message: 'Name is required',
          }),
        internalUrl: z
          .string({
            required_error: 'Url is required',
          })
          .regex(new RegExp(appUrlRegex), {
            message: 'Value is not a valid url',
          }),
        iconSource: z
          .string({
            required_error: 'This field is required',
          })
          .nonempty({
            message: 'This field is required',
          }),
        externalUrl: z
          .string()
          .regex(new RegExp(appUrlRegex), {
            message: 'Uri override is not a valid uri',
          })
          .optional(),
      })
    ),
    validateInputOnChange: true,
  });

  const onSubmit = (values: AppItem) => {
    save((dashboard) => ({
      ...dashboard,
      groups: dashboard.groups.map((group) => ({
        ...group,
        items:
          values.id === undefined && values.groupId === group.id
            ? [
                ...group.items,
                {
                  ...values,
                  id: v4(),
                },
              ]
            : group.items.map((item) => {
                if (item.id !== values.id) return item;

                return {
                  ...item,
                  ...values,
                };
              }),
      })),
    }));

    // also close the parent modal
    context.closeAll();
  };

  const [activeTab, setActiveTab] = useState<EditAppModalTab>('general');

  const closeModal = () => {
    context.closeModal(id);
  };

  const validationErrors = Object.keys(form.errors);

  const ValidationErrorIndicator = ({ keys }: { keys: (keyof AppItem)[] }) => {
    const relevantErrors = validationErrors.filter((x) => keys.includes(x as keyof AppItem));

    return (
      <ThemeIcon
        opacity={relevantErrors.length === 0 ? 0 : 1}
        color="red"
        size={18}
        variant="light"
      >
        <IconAlertTriangle size={15} />
      </ThemeIcon>
    );
  };

  return (
    <>
      <Stack spacing={0} align="center" my="lg">
        <DebouncedImage src={form.values.iconSource ?? ''} width={120} height={120} />

        <Text align="center" weight="bold" size="lg" mt="md">
          {form.values.name ?? 'New App'}
        </Text>
      </Stack>

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack
          justify="space-between"
          style={{
            minHeight: 300,
          }}
        >
          <Tabs
            value={activeTab}
            onTabChange={(tab) => setActiveTab(tab as EditAppModalTab)}
            defaultValue="general"
            radius="md"
          >
            <Tabs.List grow>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['name', 'internalUrl']} />}
                icon={<IconAdjustments size={14} />}
                value="general"
              >
                {t('tabs.general')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['externalUrl']} />}
                icon={<IconClick size={14} />}
                value="behaviour"
              >
                {t('tabs.behaviour')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={[]} />}
                icon={<IconAccessPoint size={14} />}
                value="network"
              >
                {t('tabs.network')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={['iconSource']} />}
                icon={<IconBrush size={14} />}
                value="appearance"
              >
                {t('tabs.appearance')}
              </Tabs.Tab>
              <Tabs.Tab
                rightSection={<ValidationErrorIndicator keys={[]} />}
                icon={<IconPlug size={14} />}
                value="integration"
              >
                {t('tabs.integration')}
              </Tabs.Tab>
            </Tabs.List>

            <GeneralTab form={form} openTab={(targetTab) => setActiveTab(targetTab)} />
            <BehaviourTab form={form} />
            <NetworkTab form={form} />
            <AppearanceTab
              form={form}
              disallowAppNameProgagation={() => setAllowAppNamePropagation(false)}
              allowAppNamePropagation={allowAppNamePropagation}
            />
            <IntegrationTab form={form} />
          </Tabs>

          <Group position="right" mt="md">
            <Button onClick={closeModal} px={50} variant="light" color="gray">
              {t('common:cancel')}
            </Button>
            <SaveButton formIsValid={form.isValid()} />
          </Group>
        </Stack>
      </form>
    </>
  );
};

const SaveButton = ({ formIsValid }: { formIsValid: boolean }) => {
  const [opened, { close, open }] = useDisclosure(false);
  const { t } = useTranslation(['layout/modals/add-app', 'common']);

  return (
    <Popover opened={opened && !formIsValid} width={300} withArrow withinPortal>
      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Button disabled={!formIsValid} px={50} type="submit">
            {t('common:save')}
          </Button>
        </div>
      </Popover.Target>
      <Popover.Dropdown sx={{ pointerEvents: 'none' }}>{t('validation.popover')}</Popover.Dropdown>
    </Popover>
  );
};
