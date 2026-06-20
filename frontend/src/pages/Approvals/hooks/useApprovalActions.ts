import { DefaultError, QueryClient, UseMutationResult, useMutation, useQueryClient } from '@tanstack/react-query'
import { patchTimesheetEntry } from '../../../api/timesheets'
import { TimesheetEntry } from '../../../api/client'

const TIMESHEETS_QUERY_KEY = ['timesheets', { status: 'submitted' }]

export type ApprovalVariables = {
  timesheetId: number
}

export type RejectionVariables = {
  timesheetId: number
  reason: string
}

type SettlementResult = {
  attemptedIds: number[]
  failedIds: number[]
}

async function settleApprovals(approvals: ApprovalVariables[]): Promise<SettlementResult> {
  const results: PromiseSettledResult<TimesheetEntry>[] = await Promise.allSettled(
    approvals.map(({ timesheetId }) => patchTimesheetEntry(timesheetId, { status: 'approved' }))
  )
  const attemptedIds: number[] = approvals.map((approval) => approval.timesheetId)
  const failedIds: number[] = attemptedIds.filter((_, i) => results[i].status === 'rejected')
  return { attemptedIds, failedIds }
}

async function settleRejections(rejections: RejectionVariables[]): Promise<SettlementResult> {
  const results: PromiseSettledResult<TimesheetEntry>[] = await Promise.allSettled(
    rejections.map(({ timesheetId, reason }) =>
      patchTimesheetEntry(timesheetId, { status: 'rejected', rejection_reason: reason })
    )
  )
  const attemptedIds: number[] = rejections.map((rejection) => rejection.timesheetId)
  const failedIds: number[] = attemptedIds.filter((_, i) => results[i].status === 'rejected')
  return { attemptedIds, failedIds }
}

type UseApprovalActionsResult = {
  bulkApproveMutation: UseMutationResult<SettlementResult, DefaultError, ApprovalVariables[]>
  bulkRejectMutation: UseMutationResult<SettlementResult, DefaultError, RejectionVariables[]>
}

// Optimistic: strikes the submitted ids from the cache immediately. No snapshot/rollback —
// onSettled's invalidate is the only correction step, and it naturally brings back anything
// that's still 'submitted' server-side (i.e. failed to actually change status).
async function removeFromCache(queryClient: QueryClient, ids: number[]) {
  await queryClient.cancelQueries({ queryKey: TIMESHEETS_QUERY_KEY })
  queryClient.setQueryData<TimesheetEntry[]>(TIMESHEETS_QUERY_KEY, (old) =>
    old?.filter((entry) => !ids.includes(entry.id))
  )
}

export function useApprovalActions(): UseApprovalActionsResult {
  const queryClient: QueryClient = useQueryClient()

  const bulkApproveMutation: UseMutationResult<SettlementResult, DefaultError, ApprovalVariables[]> = useMutation({
    mutationFn: settleApprovals,
    onMutate: (approvals) => removeFromCache(queryClient, approvals.map((a) => a.timesheetId)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: TIMESHEETS_QUERY_KEY }),
  })

  const bulkRejectMutation: UseMutationResult<SettlementResult, DefaultError, RejectionVariables[]> = useMutation({
    mutationFn: settleRejections,
    onMutate: (rejections) => removeFromCache(queryClient, rejections.map((r) => r.timesheetId)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: TIMESHEETS_QUERY_KEY }),
  })

  return { bulkApproveMutation, bulkRejectMutation }
}
