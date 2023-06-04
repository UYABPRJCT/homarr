import { ContextModalProps } from '@mantine/modals';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useTranslation } from 'next-i18next';
import { TextInput, Group, Button } from '@mantine/core';
import { GroupOnly } from '../type';

export type CategoryEditModalInnerProps = {
  category: GroupOnly<'category'>;
  onSuccess: (name: string) => void;
};

export const CategoryEditModal = ({
  context,
  innerProps,
  id,
}: ContextModalProps<CategoryEditModalInnerProps>) => {
  const form = useForm<FormType>({
    initialValues: {
      name: innerProps.category.name,
    },
    validate: zodResolver(formTypeSchema),
  });

  const handleSubmit = async (values: FormType) => {
    innerProps.onSuccess(values.name);
    context.closeModal(id);
  };

  const { t } = useTranslation('common');

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput data-autoFocus {...form.getInputProps('name')} autoFocus />

      <Group mt="md" grow>
        <Button onClick={() => context.closeModal(id)} variant="filled" color="gray">
          {t('cancel')}
        </Button>
        <Button type="submit">{t('save')}</Button>
      </Group>
    </form>
  );
};

const formTypeSchema = z.object({
  name: z.string().nonempty(),
});

type FormType = z.infer<typeof formTypeSchema>;
