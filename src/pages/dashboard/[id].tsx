import { useRouter } from 'next/router';
import { api } from '~/utils/api';

export default function Dashboard() {
  const router = useRouter();
  const { id } = router.query;
  const { data, isLoading } = api.dashboard.byId.useQuery({ id: id as string });

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      <h1>{data?.name}</h1>
      <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
}
