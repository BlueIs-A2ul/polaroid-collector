import { useState, useEffect, useCallback } from 'react'
import {
  getRanking,
  getIdolDetail,
  getStatistics,
} from '../services/recordService'
import { RankingItem, IdolDetail, Statistics } from '../types'

export const useRecords = () => {
  const [ranking, setRanking] = useState<RankingItem[]>([])
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshRanking = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, data, error: err } = await getRanking()

      if (success) {
        setRanking(data ?? [])
      } else {
        setError(err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStatistics = useCallback(async () => {
    try {
      const { success, data, error: err } = await getStatistics()

      if (success) {
        setStatistics(data)
      } else {
        console.error('获取统计数据失败:', err)
      }
    } catch (err) {
      console.error('获取统计数据失败:', err)
    }
  }, [])

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshRanking(), refreshStatistics()])
  }, [refreshRanking, refreshStatistics])

  useEffect(() => {
    refreshAll()
  }, [refreshAll])

  return {
    ranking,
    statistics,
    loading,
    error,
    refreshRanking,
    refreshStatistics,
    refreshAll,
  }
}

export const useIdolDetail = (idolName: string) => {
  const [detail, setDetail] = useState<IdolDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ascending, setAscending] = useState(true)

  const refreshDetail = useCallback(async () => {
    if (!idolName) return

    try {
      setLoading(true)
      setError(null)
      const {
        success,
        data,
        error: err,
      } = await getIdolDetail(idolName, ascending)

      if (success) {
        setDetail(data)
      } else {
        setError(err)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [idolName, ascending])

  const toggleSort = useCallback(() => {
    setAscending(prev => !prev)
  }, [])

  useEffect(() => {
    refreshDetail()
  }, [refreshDetail])

  return {
    detail,
    loading,
    error,
    ascending,
    toggleSort,
    refreshDetail,
  }
}
