import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp } from '@react-navigation/native'
import { COLORS, CARD_SHADOW } from '../constants/themeColors'
import { RootStackParamList } from '../navigation/AppNavigator'
import { useIdolDetail } from '../hooks/useRecords'
import { formatDate } from '../utils/rankingUtils'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'

type DetailScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Detail'
>
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>

interface DetailScreenProps {
  navigation: DetailScreenNavigationProp
  route: DetailScreenRouteProp
}

/**
 * 详情页面
 * 显示偶像的详细拍立得记录
 */
const DetailScreen: React.FC<DetailScreenProps> = ({ route, navigation }) => {
  const { idolName } = route.params
  const { detail, loading, error, ascending, toggleSort, refreshDetail } =
    useIdolDetail(idolName)

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={toggleSort}>
          <Ionicons
            name={ascending ? 'arrow-up' : 'arrow-down'}
            size={24}
            color={COLORS.WHITE}
          />
        </TouchableOpacity>
      ),
    })
  }, [navigation, ascending])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !detail) {
    return (
      <EmptyState
        icon='alert-circle-outline'
        title='加载失败'
        message={error || '偶像不存在'}
      />
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* 头部信息 */}
      <View style={styles.header}>
        <Text style={styles.idolName}>{detail.idolName}</Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Ionicons name='camera' size={20} color={COLORS.PRIMARY} />
            <Text style={styles.statText}>{detail.totalCount} 张</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name='calendar' size={20} color={COLORS.PRIMARY} />
            <Text style={styles.statText}>{detail.totalRecords} 次记录</Text>
          </View>
        </View>
      </View>

      {/* 最新照片 */}
      {detail.latestPhoto && (
        <View style={styles.latestPhotoContainer}>
          <Text style={styles.sectionTitle}>最新照片</Text>
          <Image
            source={{ uri: detail.latestPhoto }}
            style={styles.latestPhoto}
          />
        </View>
      )}

      {/* 记录列表 */}
      <View style={styles.recordsContainer}>
        <Text style={styles.sectionTitle}>
          记录列表 ({ascending ? '从旧到新' : '从新到旧'})
        </Text>
        {detail.records.map(record => (
          <TouchableOpacity
            key={record.id}
            style={styles.recordCard}
            onPress={() => navigation.navigate('Edit', { recordId: record.id })}
          >
            <Image
              source={{ uri: record.photoUri }}
              style={styles.recordPhoto}
            />
            <View style={styles.recordInfo}>
              <View style={styles.recordHeader}>
                <Text style={styles.recordDate}>
                  {formatDate(record.photoDate)}
                </Text>
                <View style={styles.recordCountBadge}>
                  <Ionicons
                    name='camera-outline'
                    size={14}
                    color={COLORS.PRIMARY}
                  />
                  <Text style={styles.recordCountText}>
                    {record.photoCount}
                  </Text>
                </View>
              </View>
              <View style={styles.recordFooter}>
                <Text style={styles.recordTime}>
                  {new Date(record.createdAt).toLocaleString('zh-CN')}
                </Text>
                <Ionicons
                  name='chevron-forward'
                  size={20}
                  color={COLORS.GRAY[400]}
                />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.SECONDARY,
  },
  header: {
    backgroundColor: COLORS.PRIMARY,
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  idolName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.WHITE,
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.WHITE,
  },
  latestPhotoContainer: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.BLACK,
    marginBottom: 12,
  },
  latestPhoto: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    resizeMode: 'contain',
    backgroundColor: COLORS.WHITE,
  },
  recordsContainer: {
    padding: 16,
  },
  recordCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    ...CARD_SHADOW,
  },
  recordPhoto: {
    width: 100,
    height: 100,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  recordInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  recordCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.GRAY[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recordCountText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTime: {
    fontSize: 12,
    color: COLORS.GRAY[500],
  },
})

export default DetailScreen
