import { useState, useEffect, useRef } from 'react';

export function useFetch<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cancelledRef = useRef(false)

  const fetchData = async () => {
    cancelledRef.current = false
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      if (!cancelledRef.current) {
        setError(err as Error)
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    fetchData()

    return () => {
      cancelledRef.current = true
    }
  }, dependencies)

  return { data, loading, error, refetch: fetchData }
}

export function usePagination(initialPage: number = 1, initialLimit: number = 10) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)

  const nextPage = () => setPage(p => p + 1)
  const prevPage = () => setPage(p => Math.max(1, p - 1))
  const goToPage = (p: number) => setPage(Math.max(1, p))
  const changeLimit = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1)
  }

  return {
    page,
    limit,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit
  }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export { useFetch as useApi }