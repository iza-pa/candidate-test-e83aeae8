import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useApprovalEntries } from './hooks/useApprovalEntries'
import { useApprovalEntryFilters } from './hooks/useApprovalEntryFilters'
import { Filters } from '../../components/Filters'
import { ApprovalEntryTable } from './components/ApprovalEntryTable'


function Loading() {
  return <p className="text-slate-500">Loading…</p>
}

function LoadError() {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded px-4 py-3 text-sm">
      Failed to load approvals.
    </div>
  )
}

function NoEntries() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-6 py-10 text-center">
      <p className="text-slate-500 text-sm">No pending approvals.</p>
      <p className="text-slate-400 text-xs mt-1">
        Submitted timesheet entries will appear here for review.
      </p>
    </div>
  )
}

function NoFilterMatches() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-6 py-10 text-center">
      <p className="text-slate-500 text-sm">No entries match your filters.</p>
    </div>
  )
}

export default function Approvals() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/contracts" replace />
  }

  const { entries, companyName, isLoading, isError } = useApprovalEntries()
  const { filters, updateFilter, clearFilters, filteredEntries, filterFields } =
    useApprovalEntryFilters(entries)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  function toggleSelected(id: number) {
    setSelectedIds((prev) => {
      const next: Set<number> = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">
        Pending Approvals{companyName ? ` @ ${companyName}` : ''}
      </h1>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <LoadError />
      ) : entries.length === 0 ? (
        <NoEntries />
      ) : (
        <>
          <Filters
            filters={filters}
            updateFilter={updateFilter}
            clearFilters={clearFilters}
            filterFields={filterFields}
          />
          {filteredEntries.length === 0 ? (
            <NoFilterMatches />
          ) : (
            <ApprovalEntryTable
              entries={filteredEntries}
              selectedIds={selectedIds}
              toggleSelected={toggleSelected}
            />
          )}
        </>
      )}
    </div>
  )
}
