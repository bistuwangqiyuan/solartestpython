'use client'

interface DataTableProps {
  data: {
    headers: string[]
    data: any[]
  }
}

export default function DataTable({ data }: DataTableProps) {
  const { headers, data: rows } = data

  return (
    <div className="overflow-x-auto">
      <table className="data-table min-w-full">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index} className="text-left">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {headers.map((header, colIndex) => (
                <td key={colIndex}>
                  {formatCellValue(row[header])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function formatCellValue(value: any): string {
  if (value === null || value === undefined) return '-'
  
  if (typeof value === 'number') {
    // Check if it's likely a decimal number
    if (value % 1 !== 0) {
      return value.toFixed(3)
    }
    return value.toString()
  }
  
  return value.toString()
}