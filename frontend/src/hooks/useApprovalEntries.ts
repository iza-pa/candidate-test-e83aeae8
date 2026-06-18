import { useQuery } from '@tanstack/react-query'
import { fetchTimesheets } from '../api/timesheets'
import { fetchContracts } from '../api/contracts'
import { Contract, TimesheetEntry } from '../api/client'

export interface ApprovalEntry {
  entry: TimesheetEntry
  contract: Contract | undefined
  cost: number | null
}

export function joinApprovalEntries(
  entries: TimesheetEntry[],
  contracts: Contract[]
): ApprovalEntry[] {
  const contractsById = Object.fromEntries(contracts.map((c) => [c.id, c]))
  return entries.map((entry) => {
    const contract = contractsById[entry.contract]
    return {
      entry,
      contract,
      cost: contract ? Number(entry.hours) * (Number(contract.daily_rate) / 8) : null,
    }
  })
}

export function useApprovalEntries(): {
  entries: ApprovalEntry[]
  isLoading: boolean
  isError: boolean
} {
  const timesheetsQuery = useQuery({
    queryKey: ['timesheets', { status: 'submitted' }],
    queryFn: () => fetchTimesheets({ status: 'submitted' }),
  })

  const contractsQuery = useQuery({
    queryKey: ['contracts'],
    queryFn: fetchContracts,
  })

  return {
    entries: joinApprovalEntries(timesheetsQuery.data ?? [], contractsQuery.data ?? []),
    isLoading: timesheetsQuery.isLoading || contractsQuery.isLoading,
    isError: timesheetsQuery.isError || contractsQuery.isError,
  }
}
