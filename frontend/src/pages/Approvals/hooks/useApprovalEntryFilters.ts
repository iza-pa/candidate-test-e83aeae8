import {useMemo, useState} from 'react'
import {ApprovalEntry} from './useApprovalEntries'
import {DropdownOption, FilterField} from '../../../components/Filters'
import {Contract, FreelancerProfile} from '../../../api/client'

export type ApprovalFilters = {
  contractId: string
  freelancerId: string
  dateFrom: string
  dateTo: string
}

export const EMPTY_FILTERS: ApprovalFilters = {
  contractId: '',
  freelancerId: '',
  dateFrom: '',
  dateTo: '',
}

export function filterApprovalEntries(
  entries: ApprovalEntry[],
  filters: ApprovalFilters
): ApprovalEntry[] {
  return entries
    .filter(({ contract }) => !filters.contractId || contract.id === Number(filters.contractId))
    .filter(
      ({ contract }) => !filters.freelancerId || contract.freelancer.id === Number(filters.freelancerId)
    )
    .filter(({ timesheet }) => !filters.dateFrom || timesheet.date >= filters.dateFrom)
    .filter(({ timesheet }) => !filters.dateTo || timesheet.date <= filters.dateTo)
}

const toOption = (value: string, label: string): DropdownOption => ({ value, label })

function getContractOptions(entries: ApprovalEntry[]): DropdownOption[] {
  const contracts: Contract[] = entries.map(({ contract }) => contract)
  const uniqueContracts: Contract[] = Array.from(
    new Map(contracts.map((contract) => [contract.id, contract])).values()
  )
  return uniqueContracts.map((contract) =>
    toOption(String(contract.id), `${contract.freelancer.name} – ${contract.id}`)
  )
}

function getFreelancerOptions(entries: ApprovalEntry[]): DropdownOption[] {
  const freelancers: FreelancerProfile[] = entries.map(({ contract }) => contract.freelancer)
  const uniqueFreelancers: FreelancerProfile[] = Array.from(
    new Map(freelancers.map((freelancer) => [freelancer.id, freelancer])).values()
  )
  return uniqueFreelancers.map((freelancer) => toOption(String(freelancer.id), freelancer.name))
}

type UseApprovalEntryFiltersResult = {
  filters: ApprovalFilters
  updateFilter: (key: keyof ApprovalFilters, value: string) => void
  clearFilters: () => void
  filteredEntries: ApprovalEntry[]
  filterFields: FilterField<ApprovalFilters>[]
}

export function useApprovalEntryFilters(entries: ApprovalEntry[]): UseApprovalEntryFiltersResult {
  const [filters, setFilters] = useState<ApprovalFilters>(EMPTY_FILTERS)

  const contractOptions: DropdownOption[] = useMemo(() => getContractOptions(entries), [entries])
  const freelancerOptions: DropdownOption[] = useMemo(() => getFreelancerOptions(entries), [entries])

  const { minDate, maxDate }: { minDate: string; maxDate: string } = useMemo(() => {
    const entryDates: string[] = entries.map(({ timesheet }) => timesheet.date).sort()
    return { minDate: entryDates[0], maxDate: entryDates[entryDates.length - 1] }
  }, [entries])

  function updateFilter(key: keyof ApprovalFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS)
  }

  const filterFields: FilterField<ApprovalFilters>[] = useMemo(
    () => [
      {
        kind: 'dropdown',
        key: 'contractId',
        id: 'contract-filter',
        label: 'Contract',
        placeholder: 'All contracts',
        options: contractOptions,
      },
      {
        kind: 'dropdown',
        key: 'freelancerId',
        id: 'freelancer-filter',
        label: 'Freelancer',
        placeholder: 'All freelancers',
        options: freelancerOptions,
      },
      {
        kind: 'date',
        key: 'dateFrom',
        id: 'date-from-filter',
        label: 'From',
        min: minDate,
        max: filters.dateTo || maxDate,
      },
      {
        kind: 'date',
        key: 'dateTo',
        id: 'date-to-filter',
        label: 'To',
        min: filters.dateFrom || minDate,
        max: maxDate,
      },
    ],
    [contractOptions, freelancerOptions, minDate, maxDate, filters.dateFrom, filters.dateTo]
  )

  const filteredEntries: ApprovalEntry[] = useMemo(() => filterApprovalEntries(entries, filters), [entries, filters])

  return { filters, updateFilter, clearFilters, filteredEntries, filterFields }
}
