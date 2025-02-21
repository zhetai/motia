import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { useState } from 'react'
import { useGetFields, useGetTraces, useGetValues } from './hooks/states-hooks'
import { StateDetail } from './state-detail'

export const States = () => {
  const [selectedTraceId, setSelectedTraceId] = useState<string>()
  const [selectedState, setSelectedState] = useState<any>() // eslint-disable-line @typescript-eslint/no-explicit-any
  const traces = useGetTraces()
  const fields = useGetFields(selectedTraceId)
  const values = useGetValues(selectedTraceId, selectedState)

  const handleTraceClick = (traceId: string) => {
    setSelectedTraceId(traceId)
    setSelectedState(undefined)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleStateClick = (state: any) => {
    setSelectedState(state)
  }

  return (
    <div className="flex flex-row gap-4 h-full">
      <StateDetail state={values} onClose={() => setSelectedState(undefined)} />

      <div className="flex flex-col gap-2 flex-1 pl-4 py-4">
        <Table>
          <TableHeader className="sticky top-0">
            <TableRow>
              <TableHead>Root Field (Trace ID)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traces.map((trace) => (
              <TableRow key={trace} onClick={() => handleTraceClick(trace)}>
                <TableCell
                  className={`rounded-lg font-mono font-semibold ${selectedTraceId === trace ? 'bg-indigo-900/50 hover:bg-indigo-900/30' : ''}`}
                >
                  {trace}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2 flex-1 pr-4 py-4">
        <Table>
          <TableHeader className="sticky top-0">
            <TableRow>
              <TableHead>Fields</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.map((field) => (
              <TableRow
                key={field}
                className={`font-semibold font-mono ${selectedState === field ? 'bg-indigo-900/50 hover:bg-indigo-900/30' : ''}`}
                onClick={() => handleStateClick(field)}
              >
                <TableCell>{field}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
