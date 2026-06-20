import { useState } from 'react'

type UseApprovalEntrySelectionResult = {
  selectedIds: Set<number>
  toggleSelected: (id: number) => void
  anySelected: boolean
  toggleSelectAll: () => void
  deselect: (ids: number[]) => void
  hasHiddenSelection: boolean
}

export function useApprovalEntrySelection(filteredIds: number[]): UseApprovalEntrySelectionResult {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next: Set<number> = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const anySelected: boolean = filteredIds.some((id) => selectedIds.has(id))

  const visibleSelectedCount: number = filteredIds.filter((id) => selectedIds.has(id)).length
  const hasHiddenSelection: boolean = selectedIds.size > visibleSelectedCount

  function toggleSelectAll() {
    setSelectedIds((prev) => {
      const next: Set<number> = new Set(prev)
      filteredIds.forEach((id) => (anySelected ? next.delete(id) : next.add(id)))
      return next
    })
  }

  function deselect(ids: number[]) {
    setSelectedIds((prev) => {
      const next: Set<number> = new Set(prev)
      ids.forEach((id) => next.delete(id))
      return next
    })
  }

  return { selectedIds, toggleSelected, anySelected, toggleSelectAll, deselect, hasHiddenSelection }
}
