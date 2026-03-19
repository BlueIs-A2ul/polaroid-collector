import { useState, useEffect } from 'react'
import {
  getRanking,
  getIdolDetail,
  getStatistics,
} from '../services/recordService'

/**
 * 记录管理 Hook
 * 用于管理拍立得记录的状态和操作
 */
export const useRecords = () => {
  const [ranking, setRanking] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  /**
   * 刷新排行榜数据
   */
  const refreshRanking = async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, data, error: err } = await getRanking()

      if (success) {
        setRanking(data)
      } else {
        setError(err)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 刷新统计数据
   */
  const refreshStatistics = async () => {
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
  }

  /**
   * 刷新所有数据
   */
  const refreshAll = async () => {
    await Promise.all([refreshRanking(), refreshStatistics()])
  }

  // 初始化时加载数据
  useEffect(() => {
    refreshAll()
  }, [])

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

/**
 * 偶像详情 Hook
 * @param {string} idolName - 偶像名称
 */
export const useIdolDetail = idolName => {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ascending, setAscending] = useState(true)

  /**
   * 刷新偶像详情
   */
  const refreshDetail = async () => {
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
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 切换排序方式
   */
  const toggleSort = () => {
    setAscending(!ascending)
  }

  // 当偶像名称或排序方式改变时刷新数据
  useEffect(() => {
    refreshDetail()
  }, [idolName, ascending])

  return {
    detail,
    loading,
    error,
    ascending,
    toggleSort,
    refreshDetail,
  }
}
