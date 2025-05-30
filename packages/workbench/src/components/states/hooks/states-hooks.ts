import { useEffect, useState } from 'react'

export const useGetTraces = () => {
  const [traces, setTraces] = useState<string[]>([])

  useEffect(() => {
    fetch('/motia/state')
      .then(async (res) => {
        if (res.ok) {
          return res.json()
        } else {
          throw await res.json()
        }
      })
      .then(setTraces)
      .catch((err) => {
        console.error(err)
      })
  }, [])

  return traces
}

export const useGetFields = (traceId: string | undefined) => {
  const [fields, setFields] = useState<string[]>([])

  useEffect(() => {
    if (!traceId) {
      setFields([])
    } else {
      fetch(`/motia/state/${traceId}`)
        .then((res) => res.json())
        .then((data) => setFields(data))
    }
  }, [traceId])

  return fields
}

export const useGetValues = (traceId: string | undefined, field: string | undefined) => {
  const [values, setValues] = useState<any>()

  useEffect(() => {
    setValues(undefined)

    if (traceId && field) {
      fetch(`/motia/state/${traceId}/${field}`)
        .then((res) => res.json())
        .then((data) => setValues(data))
    }
  }, [traceId, field])

  return values
}
