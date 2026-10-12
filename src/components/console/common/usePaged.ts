import { useEffect, useMemo, useState } from "react";

/** Slice a list into pages; resets to page 1 whenever the list itself changes
 *  (a new filter or search), so the user never lands on an empty page. */
export function usePaged<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  useEffect(() => setPage(1), [items]);
  const current = Math.min(page, pageCount);
  const slice = useMemo(
    () => items.slice((current - 1) * pageSize, current * pageSize),
    [items, current, pageSize],
  );
  return { slice, page: current, pageCount, setPage, total: items.length, pageSize };
}
