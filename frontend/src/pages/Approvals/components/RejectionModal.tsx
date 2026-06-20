import { useState } from 'react'
import { Modal } from '../../../components/Modal'
import { Dropdown } from '../../../components/inputs/Dropdown'
import { DropdownOption } from '../../../components/Filters'
import { Button } from '../../../components/Button'
import { ApprovalEntry } from '../hooks/useApprovalEntries'
import { RejectionVariables } from '../hooks/useApprovalActions'

type TimesheetId = number

const REJECTION_REASONS = [
  { id: 1, text: 'Hours logged on a non-working day' },
  { id: 2, text: 'Incorrect number of hours logged' },
  { id: 3, text: 'Contract obligations not met' },
  { id: 4, text: 'Other' },
] as const

type ReasonId = `${(typeof REJECTION_REASONS)[number]['id']}`

type RejectionModalProps = {
  entries: ApprovalEntry[]
  onClose: () => void
  onSubmit: (rejections: RejectionVariables[]) => void
}

export function RejectionModal({ entries, onClose, onSubmit }: RejectionModalProps) {
  const [reasonsById, setReasonsById] = useState<Record<TimesheetId, ReasonId>>({})

  const reasonOptions: DropdownOption[] = REJECTION_REASONS.map((reason) => ({
    value: String(reason.id),
    label: reason.text,
  }))
  const allReasonsSelected: boolean = entries.every(({ timesheet }) => reasonsById[timesheet.id])
  const totalCost: number = entries.reduce((sum, { cost }) => sum + cost, 0)

  function handleSubmit() {
    onSubmit(
      entries.map(({ timesheet }) => ({
        timesheetId: timesheet.id,
        // allReasonsSelected gates Submit, so a match is always found here
        reason: REJECTION_REASONS.find((r) => String(r.id) === reasonsById[timesheet.id])!.text,
      }))
    )
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-base font-medium text-slate-900 mb-4">
        Reject {entries.length} {entries.length === 1 ? 'entry' : 'entries'} &middot; £
        {totalCost.toFixed(2)}
      </h2>
      <div className="border border-slate-200 rounded divide-y divide-slate-100 mb-4">
        {entries.map(({ timesheet, contract, cost }) => (
          <div key={timesheet.id} className="px-3 py-2 text-sm">
            <div className="flex justify-between gap-4 mb-2">
              <span className="text-slate-700">{contract.freelancer.name}</span>
              <span className="text-slate-500">{timesheet.date}</span>
              <span className="text-slate-700">£{cost.toFixed(2)}</span>
            </div>
            <Dropdown
              id={`rejection-reason-${timesheet.id}`}
              label="Reason"
              value={reasonsById[timesheet.id] ?? ''}
              onChange={(value) =>
                setReasonsById((prev) => ({ ...prev, [timesheet.id]: value as ReasonId }))
              }
              placeholder="Select a reason"
              options={reasonOptions}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-4">
        <Button variant="primary" disabled={!allReasonsSelected} onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </Modal>
  )
}
