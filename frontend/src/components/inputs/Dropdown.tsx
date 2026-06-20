type DropdownProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}

export function Dropdown({ id, label, value, onChange, options, placeholder }: DropdownProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-slate-600 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
