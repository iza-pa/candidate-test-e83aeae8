import { ReactNode } from 'react'

export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
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

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-slate-50">{children}</tr>
}

export function TableCell({ children }: { children?: ReactNode }) {
  return <td className="px-4 py-3 text-slate-700">{children}</td>
}
