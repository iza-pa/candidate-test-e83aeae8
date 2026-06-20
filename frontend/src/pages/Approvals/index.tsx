import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useApprovalEntries, ApprovalEntry } from './hooks/useApprovalEntries'
import { useApprovalEntryFilters } from './hooks/useApprovalEntryFilters'
import { useApprovalEntrySelection } from './hooks/useApprovalEntrySelection'
import { useApprovalActions, RejectionVariables } from './hooks/useApprovalActions'
import { Filters } from '../../components/Filters'
import { Notification } from '../../components/Notification'
import { WarningIcon } from '../../components/WarningIcon'
import { BulkActionsBar } from './components/BulkActionsBar'
import { ApprovalEntryTable } from './components/ApprovalEntryTable'
import { RejectionModal } from './components/RejectionModal'

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
  const { bulkApproveMutation, bulkRejectMutation } = useApprovalActions()
  const { filters, updateFilter, clearFilters, filteredEntries, filterFields } =
    useApprovalEntryFilters(entries)
  const filteredIds: number[] = filteredEntries.map(({ timesheet }) => timesheet.id)
  const { selectedIds, toggleSelected, anySelected, toggleSelectAll, deselect, hasHiddenSelection } =
    useApprovalEntrySelection(filteredIds)

  const selectedEntries: ApprovalEntry[] = entries.filter(({ timesheet }) => selectedIds.has(timesheet.id))
  const selectedCount: number = selectedEntries.length
  const selectedTotal: number = selectedEntries.reduce((sum, { cost }) => sum + cost, 0)

  const failedTimesheetIds: Set<number> = new Set([
    ...(bulkApproveMutation.data?.failedIds ?? []),
    ...(bulkRejectMutation.data?.failedIds ?? []),
  ])

  const [rejectingEntries, setRejectingEntries] = useState<ApprovalEntry[] | null>(null)

  function handleBulkApprove() {
    const ids = Array.from(selectedIds)
    deselect(ids)
    bulkApproveMutation.mutate(ids.map((timesheetId) => ({ timesheetId })))
  }

  function handleReject(rejections: RejectionVariables[]) {
    deselect(rejections.map((r) => r.timesheetId))
    bulkRejectMutation.mutate(rejections)
    setRejectingEntries(null)
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
          <BulkActionsBar
            anySelected={anySelected}
            toggleSelectAll={toggleSelectAll}
            onApprove={handleBulkApprove}
            onReject={() => setRejectingEntries(selectedEntries)}
            disabled={selectedIds.size === 0}
            selectedCount={selectedCount}
            selectedTotal={selectedTotal}
            hasHiddenSelection={hasHiddenSelection}
          />
          {bulkApproveMutation.data && bulkApproveMutation.data.failedIds.length > 0 && (
            <Notification type="error">
              <span className="inline-flex items-center gap-1.5">
                <WarningIcon />
                {bulkApproveMutation.data.failedIds.length} entries failed to approve — they remain in
                the list, please try again.
              </span>
            </Notification>
          )}
          {bulkRejectMutation.data && bulkRejectMutation.data.failedIds.length > 0 && (
            <Notification type="error">
              <span className="inline-flex items-center gap-1.5">
                <WarningIcon />
                {bulkRejectMutation.data.failedIds.length} entries failed to reject — they remain in the
                list, please try again.
              </span>
            </Notification>
          )}
          {filteredEntries.length === 0 ? (
            <NoFilterMatches />
          ) : (
            <ApprovalEntryTable
              entries={filteredEntries}
              selectedIds={selectedIds}
              toggleSelected={toggleSelected}
              failedTimesheetIds={failedTimesheetIds}
            />
          )}
        </>
      )}
      {rejectingEntries && (
        <RejectionModal
          entries={rejectingEntries}
          onClose={() => setRejectingEntries(null)}
          onSubmit={handleReject}
        />
      )}
    </div>
  )
}
