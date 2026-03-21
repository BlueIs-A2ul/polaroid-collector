import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image as RNImage,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../contexts/ThemeContext'
import { getIdolReport, IdolReport } from '../services/idolReportService'
import { formatDate } from '../utils/rankingUtils'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - 48

interface IdolReportScreenProps {
  route: {
    params: {
      idolName: string
      avatarUri?: string | null
    }
  }
}

const IdolReportScreen: React.FC<IdolReportScreenProps> = ({ route }) => {
  const { idolName, avatarUri } = route.params
  const { colors } = useTheme()
  const [report, setReport] = useState<IdolReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  useEffect(() => {
    loadReport()
  }, [idolName])

  const loadReport = async () => {
    setLoading(true)
    const { success, data } = await getIdolReport(idolName)
    if (success && data) {
      setReport(data)
    }
    setLoading(false)
  }

  const totalPages = 7

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.PRIMARY,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexDirection: 'row',
    },
    page: {
      width: width,
      padding: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      width: CARD_WIDTH,
      backgroundColor: colors.WHITE,
      borderRadius: 24,
      padding: 28,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    pageTitle: {
      fontSize: 14,
      color: colors.GRAY[500],
      marginBottom: 20,
      textAlign: 'center',
    },
    mainTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.BLACK,
      textAlign: 'center',
      marginBottom: 12,
    },
    subTitle: {
      fontSize: 16,
      color: colors.GRAY[600],
      textAlign: 'center',
      lineHeight: 24,
    },
    bigNumber: {
      fontSize: 72,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginTop: 20,
    },
    bigNumberLabel: {
      fontSize: 18,
      color: colors.GRAY[600],
      marginTop: 8,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.SECONDARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      overflow: 'hidden',
    },
    avatarImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    statRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 24,
    },
    statItem: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.PRIMARY,
    },
    statLabel: {
      fontSize: 12,
      color: colors.GRAY[500],
      marginTop: 4,
    },
    topList: {
      width: '100%',
      marginTop: 16,
    },
    topItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[100],
    },
    topRank: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    topRankText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    topRankSecond: {
      backgroundColor: colors.GRAY[400],
    },
    topRankThird: {
      backgroundColor: colors.GRAY[300],
    },
    topName: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: colors.BLACK,
    },
    topCount: {
      fontSize: 14,
      color: colors.GRAY[600],
    },
    priceCard: {
      width: '100%',
      backgroundColor: colors.GRAY[100],
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    priceLabel: {
      fontSize: 14,
      color: colors.GRAY[600],
    },
    priceValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.PRIMARY,
    },
    highlight: {
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
    footer: {
      position: 'absolute',
      bottom: 40,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    pagination: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.WHITE,
      opacity: 0.4,
    },
    dotActive: {
      opacity: 1,
      width: 20,
    },
    nextHint: {
      marginTop: 16,
      fontSize: 12,
      color: colors.WHITE,
      opacity: 0.6,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: `${colors.PRIMARY}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    timelineRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 16,
    },
    timelineItem: {
      alignItems: 'center',
      flex: 1,
    },
    timelineValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.PRIMARY,
    },
    timelineLabel: {
      fontSize: 11,
      color: colors.GRAY[500],
      marginTop: 4,
      textAlign: 'center',
    },
    monthBarContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      height: 100,
      width: '100%',
      marginTop: 16,
      gap: 4,
    },
    monthBar: {
      flex: 1,
      backgroundColor: `${colors.PRIMARY}30`,
      borderRadius: 4,
      minHeight: 4,
    },
    monthBarActive: {
      backgroundColor: colors.PRIMARY,
    },
    monthBarLabel: {
      fontSize: 10,
      color: colors.GRAY[400],
      textAlign: 'center',
      marginTop: 4,
    },
  }), [colors])

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const page = Math.round(offsetX / width)
    setCurrentPage(page)
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color={colors.WHITE} />
      </View>
    )
  }

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.WHITE }}>暂无数据</Text>
      </View>
    )
  }

  const maxMonthPhotos = Math.max(...report.monthlyData.map(m => m.photos), 1)

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Page 1: 封面 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <View style={styles.avatar}>
              {avatarUri ? (
                <RNImage source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name='person' size={36} color={colors.PRIMARY} />
              )}
            </View>
            <Text style={styles.mainTitle}>{idolName}</Text>
            <Text style={styles.subTitle}>个人报告</Text>
            {report.firstRecord && (
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <Text style={styles.pageTitle}>首次拍摄</Text>
                <Text style={styles.highlight}>{formatDate(report.firstRecord.date)}</Text>
                <Text style={[styles.subTitle, { marginTop: 8, fontSize: 12 }]}>
                  已相识 {report.daysSinceFirst} 天
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Page 2: 总览 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>你一共拍了</Text>
            <Text style={styles.bigNumber}>{report.totalPhotos}</Text>
            <Text style={styles.bigNumberLabel}>张拍立得</Text>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <View style={styles.iconWrapper}>
                  <Ionicons name='calendar' size={24} color={colors.PRIMARY} />
                </View>
                <Text style={styles.statValue}>{report.totalRecords}</Text>
                <Text style={styles.statLabel}>拍摄次数</Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.iconWrapper}>
                  <Ionicons name='today' size={24} color={colors.PRIMARY} />
                </View>
                <Text style={styles.statValue}>{report.totalDaysWithRecords}</Text>
                <Text style={styles.statLabel}>拍摄天数</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Page 3: 花费 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>花费统计</Text>
            {report.totalPrice > 0 ? (
              <>
                <Text style={styles.bigNumber}>¥{report.totalPrice}</Text>
                <Text style={styles.bigNumberLabel}>总花费</Text>
                <View style={styles.priceCard}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>平均单价</Text>
                    <Text style={styles.priceValue}>¥{report.averagePrice.toFixed(0)}/张</Text>
                  </View>
                </View>
                {report.mostExpensiveRecord && (
                  <View style={[styles.priceCard, { marginTop: 8 }]}>
                    <Text style={[styles.priceLabel, { marginBottom: 4 }]}>最贵的一次</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>{formatDate(report.mostExpensiveRecord.date)}</Text>
                      <Text style={styles.priceValue}>¥{report.mostExpensiveRecord.price}</Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <Text style={[styles.subTitle, { marginTop: 40 }]}>暂无花费记录</Text>
            )}
          </View>
        </View>

        {/* Page 4: 时间分析 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>拍摄习惯</Text>

            <View style={styles.timelineRow}>
              <View style={styles.timelineItem}>
                <Ionicons name='sunny' size={24} color={colors.PRIMARY} />
                <Text style={styles.timelineValue}>{report.favoriteDayOfWeek.day}</Text>
                <Text style={styles.timelineLabel}>最爱拍摄日</Text>
              </View>
              <View style={styles.timelineItem}>
                <Ionicons name='calendar' size={24} color={colors.PRIMARY} />
                <Text style={styles.timelineValue}>{report.favoriteMonth.month}</Text>
                <Text style={styles.timelineLabel}>最爱拍摄月</Text>
              </View>
            </View>

            {report.averageDaysBetween > 0 && (
              <View style={[styles.priceCard, { marginTop: 20 }]}>
                <Text style={styles.subTitle}>
                  平均每 <Text style={styles.highlight}>{report.averageDaysBetween}</Text> 天拍摄一次
                </Text>
                {report.daysSinceLast > 0 && (
                  <Text style={[styles.subTitle, { marginTop: 8, fontSize: 13 }]}>
                    距上次拍摄已 <Text style={styles.highlight}>{report.daysSinceLast}</Text> 天
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Page 5: 地点分析 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>常去地点</Text>
            {report.topCities.length > 0 || report.topVenues.length > 0 ? (
              <>
                {report.topCities.length > 0 && (
                  <View style={styles.topList}>
                    <Text style={[styles.pageTitle, { alignSelf: 'flex-start', marginBottom: 8 }]}>城市 TOP3</Text>
                    {report.topCities.map((city, index) => (
                      <View key={city.name} style={styles.topItem}>
                        <View style={[styles.topRank, index === 1 && styles.topRankSecond, index === 2 && styles.topRankThird]}>
                          <Text style={styles.topRankText}>{index + 1}</Text>
                        </View>
                        <Ionicons name='location' size={18} color={colors.PRIMARY} style={{ marginRight: 8 }} />
                        <Text style={styles.topName}>{city.name}</Text>
                        <Text style={styles.topCount}>{city.count} 次</Text>
                      </View>
                    ))}
                  </View>
                )}
                {report.topVenues.length > 0 && (
                  <View style={[styles.topList, { marginTop: 16 }]}>
                    <Text style={[styles.pageTitle, { alignSelf: 'flex-start', marginBottom: 8 }]}>场馆 TOP3</Text>
                    {report.topVenues.map((venue, index) => (
                      <View key={venue.name} style={styles.topItem}>
                        <View style={[styles.topRank, index === 1 && styles.topRankSecond, index === 2 && styles.topRankThird]}>
                          <Text style={styles.topRankText}>{index + 1}</Text>
                        </View>
                        <Ionicons name='business' size={18} color={colors.PRIMARY} style={{ marginRight: 8 }} />
                        <Text style={styles.topName}>{venue.name}</Text>
                        <Text style={styles.topCount}>{venue.count} 次</Text>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <Text style={[styles.subTitle, { marginTop: 20 }]}>暂无地点记录</Text>
            )}
          </View>
        </View>

        {/* Page 6: 月度趋势 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>拍摄趋势</Text>
            {report.monthlyData.length > 0 ? (
              <View style={styles.monthBarContainer}>
                {report.monthlyData.map((m) => {
                  const height = Math.max((m.photos / maxMonthPhotos) * 100, 4)
                  return (
                    <View key={m.month} style={{ flex: 1, alignItems: 'center' }}>
                      <View style={[styles.monthBar, { height }, m.photos > 0 && styles.monthBarActive]} />
                      <Text style={styles.monthBarLabel}>{m.month.split('-')[1]}月</Text>
                    </View>
                  )
                })}
              </View>
            ) : (
              <Text style={[styles.subTitle, { marginTop: 20 }]}>暂无趋势数据</Text>
            )}
          </View>
        </View>

        {/* Page 7: 结尾 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Ionicons name='heart' size={48} color={colors.PRIMARY} />
            <Text style={styles.mainTitle}>{idolName}</Text>
            <Text style={styles.subTitle}>
              一共记录了 <Text style={styles.highlight}>{report.totalPhotos}</Text> 张拍立得{'\n'}
              花费 <Text style={styles.highlight}>¥{report.totalPrice}</Text>{'\n'}
              跨越 <Text style={styles.highlight}>{report.daysSinceFirst}</Text> 天{'\n\n'}
              继续记录心动时刻吧！
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {Array.from({ length: totalPages }).map((_, index) => (
            <View key={index} style={[styles.dot, currentPage === index && styles.dotActive]} />
          ))}
        </View>
        {currentPage < totalPages - 1 && (
          <Text style={styles.nextHint}>左滑继续</Text>
        )}
      </View>
    </View>
  )
}

export default IdolReportScreen