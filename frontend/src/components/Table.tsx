import { ReactNode } from 'react'

type TableProps = {
  headers: string[]
  children: ReactNode
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map((header) => (
              <th key={header} className="text-left px-4 py-3 font-medium text-slate-600">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  )
}

type TableRowProps = {
  children: ReactNode
}

export function TableRow({ children }: TableRowProps) {
  return <tr className="hover:bg-slate-50">{children}</tr>
}

type TableCellProps = {
  children?: ReactNode
}

export function TableCell({ children }: TableCellProps) {
  return <td className="px-4 py-3 text-slate-700">{children}</td>
}

type TableFooterRowProps = {
  children: ReactNode
}

export function TableFooterRow({ children }: TableFooterRowProps) {
  return <tr className="bg-slate-50 border-t border-slate-200">{children}</tr>
}

type TableFooterCellProps = {
  children?: ReactNode
  colSpan?: number
}

export function TableFooterCell({ children, colSpan }: TableFooterCellProps) {
  return (
    <td className="px-4 py-2 text-slate-500 text-xs" colSpan={colSpan}>
      {children}
    </td>
  )
}
