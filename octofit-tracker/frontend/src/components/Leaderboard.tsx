import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type LeaderboardEntry = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ leaderboard: LeaderboardEntry[] }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Placar" description="Compare a pontuação total das equipes." loading={loading} error={error} empty={leaderboard.length === 0} emptyText="Sem classificação disponível.">
      <ol className="list-group list-group-numbered">
        {leaderboard.map((entry) => (
          <li className="list-group-item" key={entry.teamName}>
            {entry.teamName} — {entry.totalPoints} pontos
          </li>
        ))}
      </ol>
    </CapabilityCard>
  );
}
