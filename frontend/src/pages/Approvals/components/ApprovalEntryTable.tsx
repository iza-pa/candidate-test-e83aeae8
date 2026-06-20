import { Link } from 'react-router-dom'
import { Table, TableRow, TableCell, TableFooterRow, TableFooterCell } from '../../../components/Table'
import { Checkbox } from '../../../components/inputs/Checkbox'
import { WarningIcon } from '../../../components/WarningIcon'
import { ApprovalEntry } from '../hooks/useApprovalEntries'

type ApprovalEntryTableProps = {
  entries: ApprovalEntry[]
  selectedIds: Set<number>
  toggleSelected: (id: number) => void
  failedTimesheetIds: Set<number>
}

export function ApprovalEntryTable({
  entries,
  selectedIds,
  toggleSelected,
  failedTimesheetIds,
}: ApprovalEntryTableProps) {
  const totalCount: number = entries.length
  const totalCost: number = entries.reduce((sum, { cost }) => sum + cost, 0)

  return (
    <Table headers={['Select', 'Freelancer', 'Day rate', 'Date submitted', 'Hours', 'Cost']}>
      {entries.map(({ timesheet, contract, cost }) => (
        <TableRow key={timesheet.id}>
          <TableCell>
            <Checkbox
              checked={selectedIds.has(timesheet.id)}
              onChange={() => toggleSelected(timesheet.id)}
              label={`Select entry for ${contract?.freelancer.name} on ${timesheet.date}`}
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-1.5">
              <Link
                to={`/contracts/${contract?.id}`}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                {contract?.freelancer.name}
              </Link>
              {failedTimesheetIds.has(timesheet.id) && <WarningIcon />}
            </div>
          </TableCell>
          <TableCell>£{Number(contract?.daily_rate).toFixed(2)}</TableCell>
          <TableCell>{timesheet.date}</TableCell>
          <TableCell>{timesheet.hours}h</TableCell>
          <TableCell>£{cost?.toFixed(2)}</TableCell>
        </TableRow>
      ))}
      <TableFooterRow>
        <TableFooterCell colSpan={6}>
          {totalCount} entries &middot; £{totalCost.toFixed(2)} total
        </TableFooterCell>
      </TableFooterRow>
    </Table>
  )
}
