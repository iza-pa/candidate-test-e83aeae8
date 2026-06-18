import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApprovalEntries } from '../hooks/useApprovalEntries'
import { Table, TableRow, TableCell } from '../components/Table'
import { Checkbox } from '../components/inputs/Checkbox'
import { Button } from '../components/Button'

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

export default function Approvals() {
  const { isAdmin } = useAuth()

  if (!isAdmin) {
    return <Navigate to="/contracts" replace />
  }

  const { entries, isLoading, isError } = useApprovalEntries()
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  function toggleSelected(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const allSelected = entries.length > 0 && entries.every(({ entry }) => selectedIds.has(entry.id))

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(entries.map(({ entry }) => entry.id)))
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Pending Approvals</h1>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <LoadError />
      ) : entries.length === 0 ? (
        <NoEntries />
      ) : (
        <>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={toggleSelectAll}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="success"
              disabled={selectedIds.size === 0}
              onClick={() => console.log('approved', Array.from(selectedIds))}
            >
              Approve Selected
            </Button>
            <Button
              variant="danger"
              disabled={selectedIds.size === 0}
              onClick={() => console.log('rejected', Array.from(selectedIds))}
            >
              Reject Selected
            </Button>
          </div>
          <Table
            headers={[
              'Select',
              'Freelancer',
              'Company',
              'Day rate',
              'Date submitted',
              'Hours',
              'Cost',
              'Actions',
            ]}
          >
            {entries.map(({ entry, contract, cost }) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(entry.id)}
                    onChange={(checked) => toggleSelected(entry.id, checked)}
                    label={`Select entry for ${contract?.freelancer.name ?? 'unknown freelancer'} on ${entry.date}`}
                  />
                </TableCell>
                <TableCell>
                  {contract ? (
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {contract.freelancer.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>{contract?.company.name ?? '—'}</TableCell>
                <TableCell>{contract ? `£${Number(contract.daily_rate).toFixed(2)}` : '—'}</TableCell>
                <TableCell>{entry.date}</TableCell>
                <TableCell>{entry.hours}h</TableCell>
                <TableCell>{cost !== null ? `£${cost.toFixed(2)}` : '—'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => console.log('approved', entry.id)}>
                      Approve
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => console.log('rejected', entry.id)}>
                      Reject
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </>
      )}
    </div>
  )
}
