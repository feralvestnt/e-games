function TablePagination({ page, total, onPageChange, pageSize = 10 }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-gray-600">
      <span>{total} registros - pagina {page} de {pages}</span>
      {pages > 1 && <div className="flex gap-2">
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page === 1} className="rounded border px-3 py-1 disabled:opacity-50">Anterior</button>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page === pages} className="rounded border px-3 py-1 disabled:opacity-50">Proxima</button>
      </div>}
    </div>
  );
}

export default TablePagination;
