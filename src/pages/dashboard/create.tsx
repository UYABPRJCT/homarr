import { Button } from '@mantine/core';
import { api } from '~/utils/api';

export default function Create() {
  const { mutateAsync } = api.dashboard.create.useMutation();

  return (
    <Button
      onClick={() =>
        mutateAsync({
          name: 'New dashboard',
          isPublic: false,
        })
      }
    >
      Create
    </Button>
  );
}
