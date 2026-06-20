import { Button } from '../../../components/Button'
import { Notification } from '../../../components/Notification'

type BulkActionsBarProps = {
  anySelected: boolean
  toggleSelectAll: () => void
  onApprove: () => void
  onReject: () => void
  disabled: boolean
  selectedCount: number
  selectedTotal: number
  hasHiddenSelection: boolean
}

export function BulkActionsBar({
  anySelected,
  toggleSelectAll,
  onApprove,
  onReject,
  disabled,
  selectedCount,
  selectedTotal,
  hasHiddenSelection,
}: BulkActionsBarProps) {
  return (
    <div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={toggleSelectAll}>
          {anySelected ? 'Deselect All' : 'Select All'}
        </Button>
        <Button variant="success" disabled={disabled} onClick={onApprove}>
          Approve Selected
        </Button>
        <Button variant="danger" disabled={disabled} onClick={onReject}>
          Reject Selected
        </Button>
      </div>
      {selectedCount > 0 && (
        <p className="text-xs text-slate-500 mt-2">
          {selectedCount} selected &middot; £{selectedTotal.toFixed(2)}
        </p>
      )}
      {hasHiddenSelection && (
        <div className="mt-2">
          <Notification type="warning">Adjust the filters to view all selected items.</Notification>
        </div>
      )}
    </div>
  )
}
