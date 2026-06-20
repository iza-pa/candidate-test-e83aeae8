import { UseQueryResult, useQuery } from '@tanstack/react-query'
import { fetchTimesheets } from '../../../api/timesheets'
import { fetchContracts } from '../../../api/contracts'
import { Contract, TimesheetEntry } from '../../../api/client'

export interface ApprovalEntry {
  timesheet: TimesheetEntry
  contract: Contract
  cost: number
}

export function joinApprovalEntries(
  timesheets: TimesheetEntry[],
  contracts: Contract[]
): ApprovalEntry[] {
  const contractsById: Record<string, Contract> = Object.fromEntries(contracts.map((c) => [c.id, c]))
  return timesheets.map((timesheet) => {
    const contract: Contract = contractsById[timesheet.contract]
    return {
      timesheet,
      contract,
      cost: Number(timesheet.hours) * (Number(contract.daily_rate) / 8),
    }
  })
}

type UseApprovalEntriesResult = {
  entries: ApprovalEntry[]
  companyName: string | undefined
  isLoading: boolean
  isError: boolean
}

export function useApprovalEntries(): UseApprovalEntriesResult {
  const timesheetsQuery: UseQueryResult<TimesheetEntry[]> = useQuery({
    queryKey: ['timesheets', { status: 'submitted' }],
    queryFn: () => fetchTimesheets({ status: 'submitted' }),
  })

  const contractsQuery: UseQueryResult<Contract[]> = useQuery({
    queryKey: ['contracts'],
    queryFn: fetchContracts,
  })

  return {
    entries:
      timesheetsQuery.data && contractsQuery.data
        ? joinApprovalEntries(timesheetsQuery.data, contractsQuery.data)
        : [],
    companyName: contractsQuery.data?.[0]?.company.name,
    isLoading: timesheetsQuery.isLoading || contractsQuery.isLoading,
    isError: timesheetsQuery.isError || contractsQuery.isError,
  }
}
