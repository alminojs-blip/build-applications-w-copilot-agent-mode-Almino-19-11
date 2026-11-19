type Props = {
  title: string;
  description: string;
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyText: string;
  children: React.ReactNode;
};

export function CapabilityCard({ title, description, loading, error, empty, emptyText, children }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading && <p role="status">Carregando {title.toLowerCase()}...</p>}
        {error && <p role="alert">Não foi possível carregar os dados: {error}</p>}
        {!loading && !error && empty && <p>{emptyText}</p>}
        {!loading && !error && !empty && children}
      </div>
    </section>
  );
}
