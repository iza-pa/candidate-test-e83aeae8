import { Dropdown } from './inputs/Dropdown'
import { DateInput } from './inputs/DateInput'
import { Button } from './Button'

export type FilterKey<F> = keyof F

export type DropdownOption = { value: string; label: string }

export type DropdownFilterField<F> = {
  kind: 'dropdown'
  key: FilterKey<F>
  id: string
  label: string
  placeholder: string
  options: DropdownOption[]
}

export type DateFilterField<F> = {
  kind: 'date'
  key: FilterKey<F>
  id: string
  label: string
  min?: string
  max?: string
}

export type FilterField<F> = DropdownFilterField<F> | DateFilterField<F>

export type FiltersProps<F extends Record<string, string>> = {
  filters: F
  updateFilter: (key: keyof F, value: string) => void
  clearFilters: () => void
  filterFields: FilterField<F>[]
}

export function Filters<F extends Record<string, string>>({
  filters,
  updateFilter,
  clearFilters,
  filterFields,
}: FiltersProps<F>) {
  const hasActiveFilters: boolean = filterFields.some((field) => filters[field.key] !== '')

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {filterFields.map((field) =>
        field.kind === 'dropdown' ? (
          <Dropdown
            key={String(field.key)}
            id={field.id}
            label={field.label}
            value={filters[field.key]}
            onChange={(value) => updateFilter(field.key, value)}
            options={field.options}
            placeholder={field.placeholder}
          />
        ) : (
          <DateInput
            key={String(field.key)}
            id={field.id}
            label={field.label}
            value={filters[field.key]}
            onChange={(value) => updateFilter(field.key, value)}
            min={field.min}
            max={field.max}
          />
        )
      )}
      <Button variant="secondary" size="sm" disabled={!hasActiveFilters} onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  )
}
