type DateInputProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  min?: string
  max?: string
}

export function DateInput({ id, label, value, onChange, min, max }: DateInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  )
}
