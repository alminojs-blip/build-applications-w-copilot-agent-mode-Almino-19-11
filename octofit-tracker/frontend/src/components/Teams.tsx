import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; mascot?: string; members?: unknown[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Equipes" description="Gerencie equipes e integrantes." loading={loading} error={error} empty={teams.length === 0} emptyText="Nenhuma equipe cadastrada.">
      <ul className="list-group">
        {teams.map((team, index) => (
          <li className="list-group-item" key={index}>
            {team.name}{team.mascot ? ` — mascote: ${team.mascot}` : ''}
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
