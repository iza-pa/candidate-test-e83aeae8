import { describe, it, expect } from 'vitest'
import { filterApprovalEntries, EMPTY_FILTERS, ApprovalFilters } from './useApprovalEntryFilters'
import { ApprovalEntry } from './useApprovalEntries'

type EntryOverrides = {
  id?: number
  contractId?: number
  freelancerId?: number
  freelancerName?: string
  date?: string
}

function makeEntry({
  id = 1,
  contractId = 1,
  freelancerId = 1,
  freelancerName = 'Jane Doe',
  date = '2026-06-01',
}: EntryOverrides = {}): ApprovalEntry {
  return {
    timesheet: {
      id,
      contract: contractId,
      contract_id: contractId,
      date,
      hours: '8',
      status: 'submitted',
      rejection_reason: null,
    },
    contract: {
      id: contractId,
      company: { id: 1, name: 'Acme', billing_email: 'billing@acme.com' },
      freelancer: { id: freelancerId, name: freelancerName },
      daily_rate: '400',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      status: 'active',
    },
    cost: 400,
  }
}

describe('filterApprovalEntries', () => {
  const entries: ApprovalEntry[] = [
    makeEntry({ id: 1, contractId: 1, freelancerId: 1, freelancerName: 'Jane', date: '2026-06-01' }),
    makeEntry({ id: 2, contractId: 2, freelancerId: 2, freelancerName: 'Ravi', date: '2026-06-10' }),
    makeEntry({ id: 3, contractId: 1, freelancerId: 1, freelancerName: 'Jane', date: '2026-06-20' }),
  ]

  it('returns every entry when no filters are set', () => {
    expect(filterApprovalEntries(entries, EMPTY_FILTERS)).toEqual(entries)
  })

  it('filters by contract', () => {
    const filters: ApprovalFilters = { ...EMPTY_FILTERS, contractId: '1' }
    expect(filterApprovalEntries(entries, filters).map((e) => e.timesheet.id)).toEqual([1, 3])
  })

  it('filters by freelancer', () => {
    const filters: ApprovalFilters = { ...EMPTY_FILTERS, freelancerId: '2' }
    expect(filterApprovalEntries(entries, filters).map((e) => e.timesheet.id)).toEqual([2])
  })

  it('filters by date range, inclusive of both bounds', () => {
    const filters: ApprovalFilters = { ...EMPTY_FILTERS, dateFrom: '2026-06-01', dateTo: '2026-06-10' }
    expect(filterApprovalEntries(entries, filters).map((e) => e.timesheet.id)).toEqual([1, 2])
  })

  it('excludes entries outside the date range', () => {
    const filters: ApprovalFilters = { ...EMPTY_FILTERS, dateFrom: '2026-06-02', dateTo: '2026-06-19' }
    expect(filterApprovalEntries(entries, filters).map((e) => e.timesheet.id)).toEqual([2])
  })

  it('combines filters with AND semantics', () => {
    const filters: ApprovalFilters = { ...EMPTY_FILTERS, contractId: '1', dateFrom: '2026-06-15' }
    expect(filterApprovalEntries(entries, filters).map((e) => e.timesheet.id)).toEqual([3])
  })
})
