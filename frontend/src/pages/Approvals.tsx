import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useApprovalEntries } from '../hooks/useApprovalEntries'
import { Table, TableRow, TableCell } from '../components/Table'

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
        <Table
          headers={[
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
              <TableCell />
            </TableRow>
          ))}
        </Table>
      )}
    </div>
  )
}
