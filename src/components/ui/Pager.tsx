export default function Pager({ page, total, size, onPage }: { page: number; total: number; size: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <nav aria-label="Paginación" className="mt-4 flex items-center justify-between gap-3">
      <span className="num text-base">{total} resultados · página {page} de {pages}</span>
      <span className="flex gap-2">
        <button type="button" className="btn btn-soft btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Anterior</button>
        <button type="button" className="btn btn-soft btn-sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Siguiente</button>
      </span>
    </nav>
  );
}
