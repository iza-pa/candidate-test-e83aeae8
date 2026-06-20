import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import Approvals from './index'
import { useAuth } from '../../hooks/useAuth'
import { Contract, TimesheetEntry } from '../../api/client'

vi.mock('../../hooks/useAuth')

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

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

function jsonResponse(body: unknown, init: { ok?: boolean; status?: number } = {}): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: async () => body,
  } as unknown as Response
}

// A tiny in-memory stand-in for the API: GET /api/contracts/, GET /api/timesheets/?status=submitted,
// and PATCH /api/timesheets/<id>/. PATCHes mutate the in-memory list so a refetch after a
// mutation reflects what "really" happened, including ids deliberately marked to fail.
function createServer(contracts: Contract[], initialTimesheets: TimesheetEntry[]) {
  let timesheets = initialTimesheets
  const failingIds = new Set<number>()

  function markFailing(...ids: number[]) {
    ids.forEach((id) => failingIds.add(id))
  }

  function getTimesheet(id: number) {
    return timesheets.find((t) => t.id === id)
  }

  async function handle(url: string, options: RequestInit = {}): Promise<Response> {
    const method = (options.method ?? 'GET').toUpperCase()

    if (method === 'GET' && url === '/api/contracts/') {
      return jsonResponse(contracts)
    }
    if (method === 'GET' && url.startsWith('/api/timesheets/?')) {
      return jsonResponse(timesheets.filter((t) => t.status === 'submitted'))
    }
    const patchMatch = method === 'PATCH' ? url.match(/^\/api\/timesheets\/(\d+)\/$/) : null
    if (patchMatch) {
      const id = Number(patchMatch[1])
      if (failingIds.has(id)) {
        return jsonResponse({ detail: 'Server error' }, { ok: false, status: 500 })
      }
      const body = JSON.parse(options.body as string)
      timesheets = timesheets.map((t) => (t.id === id ? { ...t, ...body } : t))
      return jsonResponse(getTimesheet(id))
    }

    throw new Error(`Unhandled request in test: ${method} ${url}`)
  }

  vi.stubGlobal('fetch', vi.fn(handle))

  return { markFailing, getTimesheet }
}

function renderApprovals({ isAdmin = true }: { isAdmin?: boolean } = {}) {
  vi.mocked(useAuth).mockReturnValue({ isAdmin } as ReturnType<typeof useAuth>)
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/approvals']}>
        <Routes>
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/contracts" element={<div>Contracts Page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

describe('Approvals page', () => {
  it('redirects non-admin users away from the page', async () => {
    renderApprovals({ isAdmin: false })

    expect(await screen.findByText('Contracts Page')).toBeInTheDocument()
    expect(screen.queryByText(/Pending Approvals/)).not.toBeInTheDocument()
  })

  it('shows the empty state when there are no submitted entries', async () => {
    createServer([makeContract()], [])
    renderApprovals()

    expect(await screen.findByText('No pending approvals.')).toBeInTheDocument()
  })

  it('renders pending entries with a running total', async () => {
    const contracts = [
      makeContract({ id: 1, daily_rate: '400', freelancer: { id: 1, name: 'Jane Doe' } }),
      makeContract({ id: 2, daily_rate: '800', freelancer: { id: 2, name: 'Ravi Shah' } }),
    ]
    const timesheets = [
      makeTimesheet({ id: 101, contract: 1, hours: '8', date: '2026-06-01' }),
      makeTimesheet({ id: 102, contract: 2, hours: '4', date: '2026-06-05' }),
    ]
    createServer(contracts, timesheets)
    renderApprovals()

    expect(await screen.findByRole('link', { name: 'Jane Doe' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ravi Shah' })).toBeInTheDocument()
    expect(screen.getByText('2 entries · £800.00 total')).toBeInTheDocument()
  })

  it('shows a message when filters exclude every entry', async () => {
    const contracts = [makeContract()]
    const timesheets = [makeTimesheet({ id: 101, date: '2026-06-01' })]
    createServer(contracts, timesheets)
    renderApprovals()

    await screen.findByRole('link', { name: 'Jane Doe' })
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2026-07-01' } })

    expect(await screen.findByText('No entries match your filters.')).toBeInTheDocument()
  })

  it('selects entries and bulk approves them', async () => {
    const contracts = [
      makeContract({ id: 1, daily_rate: '400', freelancer: { id: 1, name: 'Jane Doe' } }),
      makeContract({ id: 2, daily_rate: '800', freelancer: { id: 2, name: 'Ravi Shah' } }),
    ]
    const timesheets = [
      makeTimesheet({ id: 101, contract: 1, hours: '8', date: '2026-06-01' }),
      makeTimesheet({ id: 102, contract: 2, hours: '4', date: '2026-06-05' }),
    ]
    const server = createServer(contracts, timesheets)
    const user = userEvent.setup()
    renderApprovals()

    await screen.findByRole('link', { name: 'Jane Doe' })
    await user.click(screen.getByRole('button', { name: 'Select All' }))
    await user.click(screen.getByRole('button', { name: 'Approve Selected' }))

    await screen.findByText('No pending approvals.')
    expect(server.getTimesheet(101)?.status).toBe('approved')
    expect(server.getTimesheet(102)?.status).toBe('approved')
  })

  it('requires a reason before submitting a rejection, then submits it', async () => {
    const contracts = [makeContract({ id: 1, freelancer: { id: 1, name: 'Jane Doe' } })]
    const timesheets = [makeTimesheet({ id: 101, contract: 1, date: '2026-06-01' })]
    const server = createServer(contracts, timesheets)
    const user = userEvent.setup()
    renderApprovals()

    await screen.findByRole('link', { name: 'Jane Doe' })
    await user.click(screen.getByRole('checkbox', { name: 'Select entry for Jane Doe on 2026-06-01' }))
    await user.click(screen.getByRole('button', { name: 'Reject Selected' }))

    const submitButton = screen.getByRole('button', { name: 'Submit' })
    expect(submitButton).toBeDisabled()

    await user.selectOptions(screen.getByLabelText('Reason'), 'Incorrect number of hours logged')
    expect(submitButton).toBeEnabled()
    await user.click(submitButton)

    await screen.findByText('No pending approvals.')
    expect(server.getTimesheet(101)?.status).toBe('rejected')
    expect(server.getTimesheet(101)?.rejection_reason).toBe('Incorrect number of hours logged')
  })

  it('shows a warning on rows that fail to approve, while removing the ones that succeeded', async () => {
    const contracts = [
      makeContract({ id: 1, daily_rate: '400', freelancer: { id: 1, name: 'Jane Doe' } }),
      makeContract({ id: 2, daily_rate: '800', freelancer: { id: 2, name: 'Ravi Shah' } }),
    ]
    const timesheets = [
      makeTimesheet({ id: 101, contract: 1, hours: '8', date: '2026-06-01' }),
      makeTimesheet({ id: 102, contract: 2, hours: '4', date: '2026-06-05' }),
    ]
    const server = createServer(contracts, timesheets)
    server.markFailing(102)
    const user = userEvent.setup()
    renderApprovals()

    await screen.findByRole('link', { name: 'Jane Doe' })
    await user.click(screen.getByRole('button', { name: 'Select All' }))
    await user.click(screen.getByRole('button', { name: 'Approve Selected' }))

    expect(await screen.findByText(/1 entries failed to approve/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Jane Doe' })).not.toBeInTheDocument()
    const ravisRow = screen.getByRole('link', { name: 'Ravi Shah' }).closest('tr')
    expect(ravisRow?.querySelector('svg')).toBeTruthy()
    expect(server.getTimesheet(101)?.status).toBe('approved')
    expect(server.getTimesheet(102)?.status).toBe('submitted')
  })
})
