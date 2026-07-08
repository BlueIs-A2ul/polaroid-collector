import React from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StackNavigationProp } from '@react-navigation/stack'
import { RouteProp, useFocusEffect } from '@react-navigation/native'
import { useTheme } from '../contexts/ThemeContext'
import { CARD_SHADOW } from '../constants/themes'
import { RootStackParamList } from '../navigation/AppNavigator'
import { getAllRecords } from '../services/storageService'
import LoadingSpinner from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import { DuplicateCandidate, IncompleteRecordIssue, PolaroidRecord } from '../types'
import {
  getDuplicateCandidates,
  getIncompleteRecords,
  getOrganizationSummary,
} from '../utils/organizationUtils'
import { withOpacity } from '../utils/colorUtils'

type OrganizationCenterNavigationProp = StackNavigationProp<
  RootStackParamList,
  'OrganizationCenter'
>
type OrganizationCenterRouteProp = RouteProp<
  RootStackParamList,
  'OrganizationCenter'
>

interface OrganizationCenterScreenProps {
  navigation: OrganizationCenterNavigationProp
  route: OrganizationCenterRouteProp
}

type OrganizationTab = 'duplicates' | 'incomplete'

const OrganizationCenterScreen: React.FC<OrganizationCenterScreenProps> = ({
  navigation,
}) => {
  const { colors } = useTheme()
  const [records, setRecords] = React.useState<PolaroidRecord[]>([])
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<OrganizationTab>('duplicates')

  const duplicateCandidates = React.useMemo(
    () => getDuplicateCandidates(records),
    [records],
  )
  const incompleteRecords = React.useMemo(
    () => getIncompleteRecords(records),
    [records],
  )
  const summary = React.useMemo(
    () => getOrganizationSummary(records),
    [records],
  )

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
    },
    introCard: {
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      ...CARD_SHADOW,
    },
    introHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    introTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    introText: {
      fontSize: 13,
      lineHeight: 20,
      color: colors.GRAY[600],
    },
    summaryGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 12,
      ...CARD_SHADOW,
    },
    summaryValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.PRIMARY,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.GRAY[600],
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 4,
      marginBottom: 16,
      ...CARD_SHADOW,
    },
    tabButton: {
      flex: 1,
      borderRadius: 6,
      paddingVertical: 10,
      alignItems: 'center',
    },
    tabButtonActive: {
      backgroundColor: colors.PRIMARY,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.GRAY[600],
    },
    tabTextActive: {
      color: colors.WHITE,
    },
    card: {
      backgroundColor: colors.WHITE,
      borderRadius: 8,
      padding: 14,
      marginBottom: 12,
      ...CARD_SHADOW,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 8,
    },
    cardTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.GRAY[600],
      marginBottom: 10,
    },
    confidenceBadge: {
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    confidenceText: {
      fontSize: 11,
      fontWeight: '700',
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 10,
    },
    metaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.GRAY[100],
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.GRAY[700],
    },
    reasonRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    reasonPill: {
      backgroundColor: withOpacity(colors.PRIMARY, 0.1),
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    reasonText: {
      fontSize: 12,
      color: colors.PRIMARY,
      fontWeight: '500',
    },
    missingRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 8,
    },
    missingPill: {
      backgroundColor: withOpacity(colors.ERROR, 0.1),
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    missingText: {
      fontSize: 12,
      color: colors.ERROR,
      fontWeight: '500',
    },
    actionHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
      marginTop: 4,
    },
    actionHintText: {
      fontSize: 12,
      color: colors.PRIMARY,
      fontWeight: '600',
    },
  }), [colors])

  const loadRecords = React.useCallback(async () => {
    setError(null)
    const { success, data, error: err } = await getAllRecords()

    if (success) {
      setRecords(data || [])
    } else {
      setError(err || '加载记录失败')
    }

    setLoading(false)
  }, [])

  useFocusEffect(
    React.useCallback(() => {
      loadRecords()
    }, [loadRecords]),
  )

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true)
    await loadRecords()
    setRefreshing(false)
  }, [loadRecords])

  const getConfidenceStyle = (candidate: DuplicateCandidate) => {
    if (candidate.confidence === 'high') {
      return {
        badge: { backgroundColor: withOpacity(colors.ERROR, 0.12) },
        text: { color: colors.ERROR },
        label: '高可信',
      }
    }

    if (candidate.confidence === 'medium') {
      return {
        badge: { backgroundColor: withOpacity(colors.WARNING, 0.16) },
        text: { color: colors.WARNING },
        label: '中可信',
      }
    }

    return {
      badge: { backgroundColor: withOpacity(colors.GRAY[500], 0.12) },
      text: { color: colors.GRAY[600] },
      label: '待确认',
    }
  }

  const renderDuplicateCandidate = (candidate: DuplicateCandidate) => {
    const confidence = getConfidenceStyle(candidate)
    const reasons = candidate.reasons.length > 0
      ? candidate.reasons
      : ['同偶像同日期']

    return (
      <TouchableOpacity
        key={candidate.id}
        style={styles.card}
        onPress={() => navigation.navigate('Detail', {
          idolName: candidate.idolName,
        })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{candidate.idolName}</Text>
          <View style={[styles.confidenceBadge, confidence.badge]}>
            <Text style={[styles.confidenceText, confidence.text]}>
              {confidence.label}
            </Text>
          </View>
        </View>

        <Text style={styles.cardSubtitle}>{candidate.photoDate}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Ionicons name='documents-outline' size={14} color={colors.GRAY[600]} />
            <Text style={styles.metaText}>{candidate.recordCount} 条记录</Text>
          </View>
          <View style={styles.metaPill}>
            <Ionicons name='images-outline' size={14} color={colors.GRAY[600]} />
            <Text style={styles.metaText}>{candidate.totalPhotos} 张</Text>
          </View>
          {candidate.totalPrice > 0 && (
            <View style={styles.metaPill}>
              <Ionicons name='cash-outline' size={14} color={colors.GRAY[600]} />
              <Text style={styles.metaText}>¥{candidate.totalPrice}</Text>
            </View>
          )}
        </View>

        <View style={styles.reasonRow}>
          {reasons.map(reason => (
            <View key={reason} style={styles.reasonPill}>
              <Text style={styles.reasonText}>{reason}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>查看详情</Text>
          <Ionicons name='chevron-forward' size={14} color={colors.PRIMARY} />
        </View>
      </TouchableOpacity>
    )
  }

  const renderIncompleteRecord = (issue: IncompleteRecordIssue) => {
    return (
      <TouchableOpacity
        key={issue.record.id}
        style={styles.card}
        onPress={() => navigation.navigate('Edit', {
          recordId: issue.record.id,
        })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{issue.record.idolName}</Text>
          <View style={[
            styles.confidenceBadge,
            { backgroundColor: withOpacity(colors.ERROR, 0.12) },
          ]}>
            <Text style={[styles.confidenceText, { color: colors.ERROR }]}>
              缺 {issue.missingCount} 项
            </Text>
          </View>
        </View>

        <Text style={styles.cardSubtitle}>
          {issue.record.photoDate} · {issue.record.photoCount} 张
        </Text>

        <View style={styles.missingRow}>
          {issue.missingFields.map(field => (
            <View key={field.key} style={styles.missingPill}>
              <Text style={styles.missingText}>{field.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionHint}>
          <Text style={styles.actionHintText}>去补充</Text>
          <Ionicons name='create-outline' size={14} color={colors.PRIMARY} />
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <EmptyState
        icon='alert-circle-outline'
        title='加载失败'
        message={error}
      />
    )
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon='albums-outline'
        title='暂无可整理记录'
        message='添加拍立得记录后，这里会帮你找出疑似重复和待补信息'
      />
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.PRIMARY]}
          tintColor={colors.PRIMARY}
        />
      }
    >
      <View style={styles.introCard}>
        <View style={styles.introHeader}>
          <Ionicons name='sparkles-outline' size={22} color={colors.PRIMARY} />
          <Text style={styles.introTitle}>整理中心</Text>
        </View>
        <Text style={styles.introText}>
          这里会帮你找出同偶像同日期的疑似重复记录，以及缺少关键信息的照片。所有操作都需要你进入详情或编辑页确认。
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.duplicateGroupCount}</Text>
          <Text style={styles.summaryLabel}>疑似重复组</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.incompleteRecordCount}</Text>
          <Text style={styles.summaryLabel}>待补记录</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{summary.missingFieldCount}</Text>
          <Text style={styles.summaryLabel}>待补字段</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'duplicates' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('duplicates')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'duplicates' && styles.tabTextActive,
          ]}>
            疑似重复
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'incomplete' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('incomplete')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'incomplete' && styles.tabTextActive,
          ]}>
            待补信息
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'duplicates' && (
        duplicateCandidates.length > 0 ? (
          duplicateCandidates.map(renderDuplicateCandidate)
        ) : (
          <EmptyState
            icon='checkmark-circle-outline'
            title='没有疑似重复'
            message='当前没有同偶像同日期的多条记录'
          />
        )
      )}

      {activeTab === 'incomplete' && (
        incompleteRecords.length > 0 ? (
          incompleteRecords.map(renderIncompleteRecord)
        ) : (
          <EmptyState
            icon='checkmark-done-outline'
            title='信息很完整'
            message='当前没有需要补充的记录'
          />
        )
      )}
    </ScrollView>
  )
}

export default OrganizationCenterScreen
