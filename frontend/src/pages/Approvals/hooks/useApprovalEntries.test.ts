import { describe, it, expect } from 'vitest'
import { joinApprovalEntries } from './useApprovalEntries'
import { Contract, TimesheetEntry } from '../../../api/client'

function makeContract(overrides: Partial<Contract> = {}): Contract {
  return {
    id: 1,
    company: { id: 1, name: 'Acme', billing_email: 'billing@acme.com' },
    freelancer: { id: 1, name: 'Jane Doe' },
    daily_rate: '400',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active',
    ...overrides,
  }
}

function makeTimesheet(overrides: Partial<TimesheetEntry> = {}): TimesheetEntry {
  return {
    id: 1,
    contract: 1,
    contract_id: 1,
    date: '2026-06-01',
    hours: '8',
    status: 'submitted',
    rejection_reason: null,
    ...overrides,
  }
}

describe('joinApprovalEntries', () => {
  it('computes cost as hours times the hourly rate (daily rate / 8)', () => {
    const [entry] = joinApprovalEntries(
      [makeTimesheet({ hours: '4' })],
      [makeContract({ daily_rate: '400' })]
    )

    expect(entry.cost).toBe(200)
  })

  it('handles fractional hours and rates', () => {
    const [entry] = joinApprovalEntries(
      [makeTimesheet({ hours: '7.5' })],
      [makeContract({ daily_rate: '450' })]
    )

    expect(entry.cost).toBeCloseTo(421.875)
  })

  it('matches each timesheet to its own contract, not just the first one', () => {
    const contracts = [
      makeContract({ id: 1, daily_rate: '400', freelancer: { id: 1, name: 'Jane' } }),
      makeContract({ id: 2, daily_rate: '800', freelancer: { id: 2, name: 'Ravi' } }),
    ]
    const timesheets = [
      makeTimesheet({ id: 10, contract: 1, hours: '8' }),
      makeTimesheet({ id: 11, contract: 2, hours: '8' }),
    ]

    const entries = joinApprovalEntries(timesheets, contracts)

    expect(entries.find((e) => e.timesheet.id === 10)?.contract.freelancer.name).toBe('Jane')
    expect(entries.find((e) => e.timesheet.id === 10)?.cost).toBe(400)
    expect(entries.find((e) => e.timesheet.id === 11)?.contract.freelancer.name).toBe('Ravi')
    expect(entries.find((e) => e.timesheet.id === 11)?.cost).toBe(800)
  })

  it('returns an empty array when there are no timesheets', () => {
    expect(joinApprovalEntries([], [makeContract()])).toEqual([])
  })
})
