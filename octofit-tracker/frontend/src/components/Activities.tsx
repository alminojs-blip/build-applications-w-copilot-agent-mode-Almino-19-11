import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Atividades" description="Acompanhe os minutos de atividade e os pontos das pessoas participantes." loading={loading} error={error} empty={activities.length === 0} emptyText="Nenhuma atividade cadastrada.">
      <ul className="list-group">
        {activities.map((activity, index) => (
          <li className="list-group-item" key={index}>
            {activity.type === 'run' ? 'Corrida' : activity.type} — {activity.minutes} minutos — {activity.points} pontos
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
