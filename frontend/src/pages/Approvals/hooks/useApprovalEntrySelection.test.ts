import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useApprovalEntrySelection } from './useApprovalEntrySelection'

describe('useApprovalEntrySelection', () => {
  it('starts with nothing selected', () => {
    const { result } = renderHook(() => useApprovalEntrySelection([1, 2, 3]))

    expect(result.current.selectedIds.size).toBe(0)
    expect(result.current.anySelected).toBe(false)
    expect(result.current.hasHiddenSelection).toBe(false)
  })

  it('toggles a single id on and off', () => {
    const { result } = renderHook(() => useApprovalEntrySelection([1, 2, 3]))

    act(() => result.current.toggleSelected(2))
    expect(result.current.selectedIds.has(2)).toBe(true)

    act(() => result.current.toggleSelected(2))
    expect(result.current.selectedIds.has(2)).toBe(false)
  })

  it('selects every visible id when none are selected', () => {
    const { result } = renderHook(() => useApprovalEntrySelection([1, 2, 3]))

    act(() => result.current.toggleSelectAll())

    expect([...result.current.selectedIds].sort()).toEqual([1, 2, 3])
  })

  it('clears the visible selection when any visible id is already selected', () => {
    const { result } = renderHook(() => useApprovalEntrySelection([1, 2, 3]))

    act(() => result.current.toggleSelected(2))
    act(() => result.current.toggleSelectAll())

    expect(result.current.selectedIds.size).toBe(0)
  })

  it('leaves a hidden selection untouched when filters change, and flags it', () => {
    const { result, rerender } = renderHook(
      ({ filteredIds }) => useApprovalEntrySelection(filteredIds),
      { initialProps: { filteredIds: [1, 2, 3] } }
    )

    act(() => result.current.toggleSelected(1))
    rerender({ filteredIds: [2, 3] }) // a filter now hides id 1

    expect(result.current.hasHiddenSelection).toBe(true)
    expect(result.current.anySelected).toBe(false) // none of the *visible* ids are selected

    act(() => result.current.toggleSelectAll()) // selects the visible 2 and 3

    expect([...result.current.selectedIds].sort()).toEqual([1, 2, 3])
  })

  it('deselect removes specific ids regardless of the current filter', () => {
    const { result } = renderHook(() => useApprovalEntrySelection([1, 2, 3]))

    act(() => {
      result.current.toggleSelected(1)
      result.current.toggleSelected(2)
    })
    act(() => result.current.deselect([1]))

    expect([...result.current.selectedIds]).toEqual([2])
  })
})
