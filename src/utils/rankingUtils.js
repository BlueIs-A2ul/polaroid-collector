/**
 * 排行榜计算工具
 * 用于计算偶像的拍立得排行榜数据
 */

/**
 * 计算偶像排行榜
 * @param {Array} records - 所有拍立得记录
 * @returns {Array} 排行榜数据
 */
export const calculateRanking = records => {
  const idolStats = {}

  records.forEach(record => {
    if (!idolStats[record.idolName]) {
      idolStats[record.idolName] = {
        idolName: record.idolName,
        totalCount: 0,
        records: [],
        latestPhoto: null,
        latestDate: null,
        dates: [],
      }
    }

    idolStats[record.idolName].totalCount += record.photoCount
    idolStats[record.idolName].records.push(record)
    idolStats[record.idolName].dates.push(record.photoDate)

    // 更新最新照片和日期
    if (
      !idolStats[record.idolName].latestPhoto ||
      record.photoDate > idolStats[record.idolName].latestDate
    ) {
      idolStats[record.idolName].latestPhoto = record.photoUri
      idolStats[record.idolName].latestDate = record.photoDate
    }
  })

  // 按总数降序排列
  return Object.values(idolStats).sort((a, b) => b.totalCount - a.totalCount)
}

/**
 * 按日期排序记录
 * @param {Array} records - 记录数组
 * @param {boolean} ascending - 是否升序，默认为 true
 * @returns {Array} 排序后的记录
 */
export const sortRecordsByDate = (records, ascending = true) => {
  return [...records].sort((a, b) => {
    const dateA = new Date(a.photoDate)
    const dateB = new Date(b.photoDate)
    return ascending ? dateA - dateB : dateB - dateA
  })
}

/**
 * 格式化日期
 * @param {string} dateString - 日期字符串 (YYYY-MM-DD)
 * @returns {string} 格式化后的日期
 */
export const formatDate = dateString => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}.${month}.${day}`
}

/**
 * 获取今日日期字符串
 * @returns {string} 今日日期字符串 (YYYY-MM-DD)
 */
export const getTodayDateString = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
