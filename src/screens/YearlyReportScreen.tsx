import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image as RNImage,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigation } from '@react-navigation/native'
import { YearlyReport } from '../services/reportService'
import { formatDate } from '../utils/rankingUtils'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width - 48

interface YearlyReportScreenProps {
  report: YearlyReport
  avatarMap: Record<string, string | undefined>
}

const YearlyReportScreen: React.FC<YearlyReportScreenProps> = ({ report, avatarMap }) => {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [currentPage, setCurrentPage] = useState(0)
  const scrollViewRef = useRef<ScrollView>(null)

  const totalPages = 8

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
      marginTop: 20,
    },
    topItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.GRAY[100],
    },
    topRank: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.PRIMARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    topRankText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    topRankSecond: {
      backgroundColor: colors.GRAY[400],
    },
    topRankThird: {
      backgroundColor: colors.GRAY[300],
    },
    topAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.SECONDARY,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      overflow: 'hidden',
    },
    topAvatarImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    topName: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    topCount: {
      fontSize: 14,
      color: colors.GRAY[600],
    },
    monthGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginTop: 16,
      gap: 8,
    },
    monthItem: {
      width: (CARD_WIDTH - 48) / 4,
      aspectRatio: 1,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    monthItemActive: {
      backgroundColor: `${colors.PRIMARY}20`,
    },
    monthItemInactive: {
      backgroundColor: colors.GRAY[100],
    },
    monthText: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginBottom: 4,
    },
    monthValue: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    highlight: {
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
    firstRecord: {
      alignItems: 'center',
      marginTop: 20,
    },
    firstRecordLabel: {
      fontSize: 14,
      color: colors.GRAY[500],
      marginBottom: 8,
    },
    firstRecordIdol: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.PRIMARY,
    },
    firstRecordDate: {
      fontSize: 14,
      color: colors.GRAY[600],
      marginTop: 8,
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
    iconWrapper: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: `${colors.PRIMARY}15`,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    closeButton: {
      position: 'absolute',
      top: 50,
      right: 20,
      zIndex: 10,
      padding: 8,
    },
  }), [colors])

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x
    const page = Math.round(offsetX / width)
    setCurrentPage(page)
  }

  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    value: string | number,
    label: string,
  ) => (
    <View style={styles.statItem}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={28} color={colors.PRIMARY} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  )

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name='close' size={28} color={colors.WHITE} />
      </TouchableOpacity>

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
            <Ionicons name='camera' size={48} color={colors.PRIMARY} />
            <Text style={styles.mainTitle}>{report.year} 年度总结</Text>
            <Text style={styles.subTitle}>
              这一年，你记录了{'\n'}
              每一份心动时刻
            </Text>
            <View style={styles.firstRecord}>
              <Text style={styles.firstRecordLabel}>第一次拍摄</Text>
              <Text style={styles.firstRecordIdol}>{report.firstRecord?.idolName}</Text>
              <Text style={styles.firstRecordDate}>
                {report.firstRecord ? formatDate(report.firstRecord.date) : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Page 2: 总览 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>这一年你拍了</Text>
            <Text style={styles.bigNumber}>{report.totalPhotos}</Text>
            <Text style={styles.bigNumberLabel}>张拍立得</Text>
            <View style={styles.statRow}>
              {renderStatCard('calendar', report.totalDays, '拍摄天数')}
              {renderStatCard('person', report.newIdols.length, '新增偶像')}
            </View>
          </View>
        </View>

        {/* Page 3: 花费 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>这一年你花了</Text>
            <Text style={styles.bigNumber}>¥{report.totalPrice}</Text>
            <Text style={styles.bigNumberLabel}>总花费</Text>
            <View style={styles.statRow}>
              {renderStatCard('cash', `¥${report.averagePrice.toFixed(0)}`, '平均单价')}
              {renderStatCard('trending-up', report.totalRecords, '拍摄次数')}
            </View>
          </View>
        </View>

        {/* Page 4: 最爱偶像 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>你最爱的偶像</Text>
            <View style={styles.topList}>
              {report.topIdols.map((idol, index) => (
                <View key={idol.name} style={styles.topItem}>
                  <View style={[
                    styles.topRank,
                    index === 1 && styles.topRankSecond,
                    index === 2 && styles.topRankThird,
                  ]}>
                    <Text style={styles.topRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.topAvatar}>
                    {avatarMap[idol.name] ? (
                      <RNImage source={{ uri: avatarMap[idol.name] }} style={styles.topAvatarImage} />
                    ) : (
                      <Ionicons name='person' size={20} color={colors.PRIMARY} />
                    )}
                  </View>
                  <Text style={styles.topName}>{idol.name}</Text>
                  <Text style={styles.topCount}>{idol.count} 张</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Page 5: 最常去的城市 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>你最常去的城市</Text>
            {report.topCities.length > 0 ? (
              <View style={styles.topList}>
                {report.topCities.map((city, index) => (
                  <View key={city.name} style={styles.topItem}>
                    <View style={[
                      styles.topRank,
                      index === 1 && styles.topRankSecond,
                      index === 2 && styles.topRankThird,
                    ]}>
                      <Text style={styles.topRankText}>{index + 1}</Text>
                    </View>
                    <Ionicons name='location' size={24} color={colors.PRIMARY} style={{ marginRight: 12 }} />
                    <Text style={styles.topName}>{city.name}</Text>
                    <Text style={styles.topCount}>{city.count} 次</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.subTitle}>暂无城市记录</Text>
            )}
          </View>
        </View>

        {/* Page 6: 最常去的场馆 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>你最常去的场馆</Text>
            {report.topVenues.length > 0 ? (
              <View style={styles.topList}>
                {report.topVenues.map((venue, index) => (
                  <View key={venue.name} style={styles.topItem}>
                    <View style={[
                      styles.topRank,
                      index === 1 && styles.topRankSecond,
                      index === 2 && styles.topRankThird,
                    ]}>
                      <Text style={styles.topRankText}>{index + 1}</Text>
                    </View>
                    <Ionicons name='business' size={24} color={colors.PRIMARY} style={{ marginRight: 12 }} />
                    <Text style={styles.topName}>{venue.name}</Text>
                    <Text style={styles.topCount}>{venue.count} 次</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.subTitle}>暂无场馆记录</Text>
            )}
          </View>
        </View>

        {/* Page 7: 月度分布 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Text style={styles.pageTitle}>月度拍摄分布</Text>
            <View style={styles.monthGrid}>
              {report.monthlyData.map((month) => (
                <View
                  key={month.month}
                  style={[
                    styles.monthItem,
                    month.photos > 0 ? styles.monthItemActive : styles.monthItemInactive,
                  ]}
                >
                  <Text style={styles.monthText}>{month.month}月</Text>
                  <Text style={[styles.monthValue, month.photos > 0 && { color: colors.PRIMARY }]}>
                    {month.photos || '-'}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.subTitle}>
              你在 <Text style={styles.highlight}>{report.favoriteDayOfWeek.day}</Text> 拍摄最多{'\n'}
              共 {report.favoriteDayOfWeek.count} 次
            </Text>
          </View>
        </View>

        {/* Page 8: 结尾 */}
        <View style={styles.page}>
          <View style={styles.card}>
            <Ionicons name='heart' size={48} color={colors.PRIMARY} />
            <Text style={styles.mainTitle}>{report.year}，感谢陪伴</Text>
            <Text style={styles.subTitle}>
              你一共记录了{' '}
              <Text style={styles.highlight}>{report.totalPhotos}</Text> 张拍立得{'\n'}
              花费 <Text style={styles.highlight}>¥{report.totalPrice}</Text>{'\n'}
              认识了 <Text style={styles.highlight}>{report.newIdols.length}</Text> 位新偶像{'\n\n'}
              {report.year + 1}，继续记录心动时刻吧！
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

export default YearlyReportScreen