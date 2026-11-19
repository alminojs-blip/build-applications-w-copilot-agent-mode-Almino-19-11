import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<{ suggestions: Suggestion[] }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((reason: Error) => setError(reason.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Sugestões de treino" description="Receba recomendações de treino com base nos seus padrões de atividade." loading={loading} error={error} empty={suggestions.length === 0} emptyText="Nenhuma sugestão disponível.">
      <ul className="list-group">
        {suggestions.map((suggestion, index) => (
          <li className="list-group-item" key={index}>
            <strong>{suggestion.title}</strong> — {suggestion.reason}
          </li>
        ))}
      </ul>
    </CapabilityCard>
  );
}
