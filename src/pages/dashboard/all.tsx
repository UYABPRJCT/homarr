import { api } from '~/utils/api';

export default function Dashboards() {
  const { data, isLoading } = api.dashboard.all.useQuery();

  if (isLoading) {
    return <span>Loading...</span>;
  }

  return (
    <div>
      <h1>Dashboards</h1>

      <ul>
        {data?.map((dashboard) => (
          <li key={dashboard.id}>{dashboard.name}</li>
        ))}
      </ul>
    </div>
  );
}
