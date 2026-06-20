import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useApprovalActions } from './useApprovalActions'
import { patchTimesheetEntry } from '../../../api/timesheets'
import { TimesheetEntry } from '../../../api/client'

vi.mock('../../../api/timesheets', () => ({
  patchTimesheetEntry: vi.fn(),
}))

const TIMESHEETS_QUERY_KEY = ['timesheets', { status: 'submitted' }]

function makeTimesheet(id: number, overrides: Partial<TimesheetEntry> = {}): TimesheetEntry {
  return {
    id,
    contract: 1,
    contract_id: 1,
    date: '2026-06-01',
    hours: '8',
    status: 'submitted',
    rejection_reason: null,
    ...overrides,
  }
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  queryClient.setQueryData(TIMESHEETS_QUERY_KEY, [makeTimesheet(1), makeTimesheet(2), makeTimesheet(3)])

  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }

  return { queryClient, wrapper }
}

beforeEach(() => {
  vi.mocked(patchTimesheetEntry).mockReset()
})

describe('useApprovalActions', () => {
  it('reports no failures when every approval succeeds', async () => {
    vi.mocked(patchTimesheetEntry).mockImplementation((id) =>
      Promise.resolve(makeTimesheet(id, { status: 'approved' }))
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useApprovalActions(), { wrapper })

    act(() => {
      result.current.bulkApproveMutation.mutate([{ timesheetId: 1 }, { timesheetId: 2 }])
    })

    await waitFor(() => expect(result.current.bulkApproveMutation.isSuccess).toBe(true))
    expect(result.current.bulkApproveMutation.data).toEqual({
      attemptedIds: [1, 2],
      failedIds: [],
    })
  })

  it('reports only the ids that failed, alongside the ones that succeeded', async () => {
    vi.mocked(patchTimesheetEntry).mockImplementation((id) =>
      id === 2 ? Promise.reject(new Error('server error')) : Promise.resolve(makeTimesheet(id, { status: 'approved' }))
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useApprovalActions(), { wrapper })

    act(() => {
      result.current.bulkApproveMutation.mutate([{ timesheetId: 1 }, { timesheetId: 2 }, { timesheetId: 3 }])
    })

    await waitFor(() => expect(result.current.bulkApproveMutation.isSuccess).toBe(true))
    expect(result.current.bulkApproveMutation.data).toEqual({
      attemptedIds: [1, 2, 3],
      failedIds: [2],
    })
  })

  it('sends the rejection reason and reports per-id failures on the reject path', async () => {
    vi.mocked(patchTimesheetEntry).mockImplementation((id) =>
      id === 3 ? Promise.reject(new Error('server error')) : Promise.resolve(makeTimesheet(id, { status: 'rejected' }))
    )
    const { wrapper } = createWrapper()
    const { result } = renderHook(() => useApprovalActions(), { wrapper })

    act(() => {
      result.current.bulkRejectMutation.mutate([
        { timesheetId: 1, reason: 'Incorrect number of hours logged' },
        { timesheetId: 3, reason: 'Other' },
      ])
    })

    await waitFor(() => expect(result.current.bulkRejectMutation.isSuccess).toBe(true))
    expect(result.current.bulkRejectMutation.data).toEqual({
      attemptedIds: [1, 3],
      failedIds: [3],
    })
    expect(patchTimesheetEntry).toHaveBeenCalledWith(1, {
      status: 'rejected',
      rejection_reason: 'Incorrect number of hours logged',
    })
  })

  it('optimistically removes attempted entries from the cache before the request settles', async () => {
    vi.mocked(patchTimesheetEntry).mockImplementation(() => new Promise(() => {})) // never resolves
    const { wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useApprovalActions(), { wrapper })

    act(() => {
      result.current.bulkApproveMutation.mutate([{ timesheetId: 2 }])
    })

    await waitFor(() => {
      const cached = queryClient.getQueryData<TimesheetEntry[]>(TIMESHEETS_QUERY_KEY)
      expect(cached?.map((t) => t.id)).toEqual([1, 3])
    })
  })
})
