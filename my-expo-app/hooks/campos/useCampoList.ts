import { useMemo, useState } from 'react';
import { useCampos } from '../useCampos';

export function useCampoList(initialPerPage = 10) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const per_page = initialPerPage;

  const query = useCampos({ q, page, per_page }); // { data, isLoading, isFetching, refetch, ... }

  const total = query.data?.total ?? 0;
  const lastPage = useMemo(
    () => (total ? Math.max(1, Math.ceil(total / per_page)) : 1),
    [total, per_page]
  );

  return {
    q, setQ,
    page, setPage,
    per_page, lastPage,
    ...query, // data, isLoading, isFetching, refetch...
  };
}
