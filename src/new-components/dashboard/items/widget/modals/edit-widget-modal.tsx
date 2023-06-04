import {
  Alert,
  Button,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Slider,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { UseFormReturnType, useForm, zodResolver } from '@mantine/form';
import { ContextModalProps } from '@mantine/modals';
import { IconAlertTriangle } from '@tabler/icons';
import { Trans, useTranslation } from 'next-i18next';
import { ZodNumber, z } from 'zod';
import { DraggableList } from '~/components/Dashboard/Tiles/Widgets/DraggableList';
import { mapObject } from '~/tools/client/objects';
import { useColorTheme } from '~/tools/color';
import { AnyWidgetOptions, OptionDefinition, WidgetDefinition } from '../definition';
import { useDashboardStore } from '~/new-components/dashboard/store';

type Form = UseFormReturnType<AnyWidgetOptions, (values: AnyWidgetOptions) => AnyWidgetOptions>;

type InnerProps = {
  widgetId: string;
  widgetSort: string;
  options: AnyWidgetOptions;
  definition: WidgetDefinition<string, OptionDefinition>;
};

export const WidgetEditModal = ({ context, id, innerProps }: ContextModalProps<InnerProps>) => {
  const { t } = useTranslation([`modules/${innerProps.widgetSort}`, 'common']);
  const form = useForm({
    initialValues: innerProps.options,
    validate: zodResolver(constructZodSchema(innerProps.definition.options)),
    validateInputOnBlur: true,
  });
  const widgets = useDashboardStore((x) => x.widgets);

  const handleSubmit = (values: AnyWidgetOptions) => {
    widgets.saveOptions({
      id: innerProps.widgetId,
      options: values,
    });
    context.closeModal(id);
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack>
        {Object.keys(innerProps.definition.options).map((name) => {
          const option = innerProps.definition.options[name];

          if (!option) {
            return (
              <Alert icon={<IconAlertTriangle />} color="red">
                <Text>
                  <Trans
                    i18nKey="modules/common:errors.unmappedOptions.text"
                    values={{ key: name }}
                    components={{ b: <b />, code: <code /> }}
                  />
                </Text>
              </Alert>
            );
          }

          return (
            <WidgetOptionInput
              name={name}
              value={form.values[name]}
              option={option}
              widgetSort={innerProps.widgetSort}
              form={form}
            />
          );
        })}
        <Group position="right">
          <Button onClick={() => context.closeModal(id)} variant="light">
            {t('common:cancel')}
          </Button>
          <Button type="submit">{t('common:save')}</Button>
        </Group>
      </Stack>
    </form>
  );
};

const constructZodSchema = (options: OptionDefinition) => {
  const innerObject: any = {};

  Object.keys(options).forEach((key) => {
    const option = options[key];

    innerObject[key] = option.zod;
  });

  return z.object(innerObject);
};

type WidgetOptionInputProps = {
  name: string;
  value: any;
  option: OptionDefinition[string];
  widgetSort: string;
  form: Form;
};

const WidgetOptionInput = ({ name, value, option, widgetSort, form }: WidgetOptionInputProps) => {
  const { t } = useTranslation([`modules/${widgetSort}`, 'common']);
  const { primaryColor } = useColorTheme();

  switch (option.type) {
    case 'switch':
      return (
        <Switch
          label={t(`descriptor.settings.${name}.label`)}
          {...form.getInputProps(name, {
            type: 'checkbox',
          })}
        />
      );

    case 'text':
      return (
        <TextInput
          color={primaryColor}
          label={t(`descriptor.settings.${name}.label`)}
          {...form.getInputProps(name)}
        />
      );

    case 'multiSelect':
      return (
        <MultiSelect
          color={primaryColor}
          data={option.zod._def.values.map((value) => ({
            value,
            label: t(`descriptor.settings.${name}.options.${value}`),
          }))}
          label={t(`descriptor.settings.${name}.label`)}
          {...form.getInputProps(name)}
        />
      );

    case 'select':
      return (
        <Select
          color={primaryColor}
          data={option.zod._def.values.map((value) => ({
            value,
            label: t(`descriptor.settings.${name}.options.${value}`),
          }))}
          label={t(`descriptor.settings.${name}.label`)}
          {...form.getInputProps(name)}
        />
      );

    case 'number':
      return (
        <NumberInput
          color={primaryColor}
          label={t(`descriptor.settings.${name}.label`)}
          {...form.getInputProps(name)}
          {...option.options}
          min={getMinValueFromSchema(option.zod as ZodNumber)}
          max={getMaxValueFromSchema(option.zod as ZodNumber)}
          step={getSpanValueFromSchema(option.zod as ZodNumber)}
        />
      );

    case 'slider':
      //const schema = z.number().min(0).max(7);
      //schema._def.checks.find(c => c.kind === 'min')?.value

      return (
        <Stack spacing="xs">
          <Text>{t(`descriptor.settings.${name}.label`)}</Text>
          <Slider
            color={primaryColor}
            label={value}
            {...form.getInputProps(name)}
            min={getMinValueFromSchema(option.zod as ZodNumber)}
            max={getMaxValueFromSchema(option.zod as ZodNumber)}
            step={getSpanValueFromSchema(option.zod as ZodNumber)}
          />
        </Stack>
      );

    case 'static-draggable-list':
      const extractSubValue = (liName: string, settingName: string) =>
        value.find((v: { key: string; subValues: any }) => v.key === liName)?.subValues?.[
          settingName
        ];

      const handleSubChange = (liName: string, settingName: string) => (_: any, newVal: any) => {};

      return (
        <Stack spacing="xs">
          <Text>{t(`descriptor.settings.${name}.label`)}</Text>
          <DraggableList
            value={value}
            //onChange={(v) => handleChange(key, v)}
            labels={mapObject(option.items, (liName) =>
              t(`descriptor.settings.${name}.${liName}.label`)
            )}
            onChange={() => {}}
          >
            {mapObject(option.items, (liName, liSettings) =>
              Object.entries(liSettings).map(([settingName, setting], i) => (
                <WidgetOptionInput
                  name={`${liName}.${settingName}.${i}`}
                  option={setting}
                  widgetSort={widgetSort}
                  value={extractSubValue(liName, settingName)}
                  form={form}
                />
              ))
            )}
          </DraggableList>
        </Stack>
      );

    case 'multipleText':
      return (
        <MultiSelect
          data={value.map((name: any) => ({ value: name, label: name }))}
          label={t(`descriptor.settings.${name}.label`)}
          description={t(`descriptor.settings.${name}.description`)}
          withinPortal
          searchable
          creatable
          getCreateLabel={(query) => t('common:createItem', { item: query })}
          {...form.getInputProps(name)}
        />
      );

    default:
      return null;
  }
};

const checkSchema = z.object({
  value: z.number(),
});
const getMinValueFromSchema = (schema: ZodNumber) => {
  const minCheck = schema._def.checks.find((c) => c.kind === 'min');
  const out = checkSchema.safeParse(minCheck);
  if (out.success) return out.data.value;
  return undefined;
};
const getMaxValueFromSchema = (schema: ZodNumber) => {
  const maxCheck = schema._def.checks.find((c) => c.kind === 'max');
  const out = checkSchema.safeParse(maxCheck);
  if (out.success) return out.data.value;
  return undefined;
};
const getSpanValueFromSchema = (schema: ZodNumber) => {
  const spanCheck = schema._def.checks.find((c) => c.kind === 'multipleOf');
  const out = checkSchema.safeParse(spanCheck);
  if (out.success) return out.data.value;
  return undefined;
};
