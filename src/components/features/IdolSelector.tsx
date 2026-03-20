import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, CARD_SHADOW } from '../../constants/themeColors'
import { getIdolListWithCount } from '../../services/recordService'

interface IdolItem {
  name: string
  count: number
}

interface IdolSelectorProps {
  visible: boolean
  onClose: () => void
  onSelectIdol: (idolName: string) => void
  currentIdolName?: string
}

/**
 * 偶像选择器组件
 * 用于从已有偶像列表中选择偶像
 * 按拍立得数量从高到低排序显示
 */
const IdolSelector: React.FC<IdolSelectorProps> = ({
  visible,
  onClose,
  onSelectIdol,
  currentIdolName,
}) => {
  const [idolList, setIdolList] = useState<IdolItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<boolean>(false)
  const INITIAL_DISPLAY_COUNT = 5 // 默认显示前5个偶像

  /**
   * 加载偶像列表
   */
  const loadIdolNames = async () => {
    setLoading(true)
    try {
      const { success, data, error } = await getIdolListWithCount()

      console.log('偶像选择器 - 加载结果:', { success, data, error })

      if (success && data) {
        setIdolList(data)
        console.log('偶像选择器 - 加载成功，共', data.length, '个偶像')
      } else {
        console.error('偶像选择器 - 加载失败:', error)
        Alert.alert('错误', `加载偶像列表失败: ${error}`)
      }
    } catch (error) {
      console.error('偶像选择器 - 加载异常:', error)
      Alert.alert('错误', `加载偶像列表失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 切换展开/收起
   */
  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  /**
   * 获取当前显示的偶像列表
   */
  const getDisplayIdolList = (): IdolItem[] => {
    if (expanded || idolList.length <= INITIAL_DISPLAY_COUNT) {
      return idolList
    }
    return idolList.slice(0, INITIAL_DISPLAY_COUNT)
  }

  /**
   * 选择偶像
   */
  const handleSelectIdol = (idolName: string) => {
    onSelectIdol(idolName)
    onClose()
  }

  /**
   * 模框显示时加载数据
   */
  useEffect(() => {
    if (visible) {
      loadIdolNames()
    }
  }, [visible])

  /**
   * 渲染偶像项
   */
  const renderIdolItem = ({ item }: { item: IdolItem }) => {
    const isSelected = item.name === currentIdolName

    return (
      <TouchableOpacity
        style={[styles.idolItem, isSelected && styles.selectedIdolItem]}
        onPress={() => handleSelectIdol(item.name)}
      >
        <View style={styles.idolItemContent}>
          <View style={styles.idolInfo}>
            <Text
              style={[styles.idolName, isSelected && styles.selectedIdolName]}
            >
              {item.name}
            </Text>
            <Text style={styles.idolCount}>{item.count} 张</Text>
          </View>
          {isSelected && (
            <Ionicons
              name='checkmark-circle'
              size={20}
              color={COLORS.PRIMARY}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  /**
   * 渲染空状态
   */
  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size='large' color={COLORS.PRIMARY} />
          <Text style={styles.emptyStateText}>加载中...</Text>
        </View>
      )
    }

    if (idolList.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='person-outline' size={48} color={COLORS.GRAY[400]} />
          <Text style={styles.emptyStateText}>暂无偶像数据</Text>
          <Text style={styles.emptyStateSubText}>请手动输入新的偶像名称</Text>
        </View>
      )
    }

    return null
  }

  /**
   * 渲染展开/收起按钮
   */
  const renderExpandButton = () => {
    if (idolList.length <= INITIAL_DISPLAY_COUNT) {
      return null
    }

    return (
      <TouchableOpacity style={styles.expandButton} onPress={toggleExpanded}>
        <Text style={styles.expandButtonText}>
          {expanded
            ? '收起'
            : `查看更多 (${idolList.length - INITIAL_DISPLAY_COUNT})`}
        </Text>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.PRIMARY}
        />
      </TouchableOpacity>
    )
  }

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 头部 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择偶像</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name='close' size={24} color={COLORS.BLACK} />
            </TouchableOpacity>
          </View>

          {/* 说明文字 */}
          <View style={styles.hintContainer}>
            <Ionicons
              name='information-circle-outline'
              size={16}
              color={COLORS.GRAY[500]}
            />
            <Text style={styles.hintText}>按拍立得数量从高到低排序</Text>
          </View>

          {/* 偶像列表 */}
          <View style={styles.listContainer}>
            <FlatList
              data={getDisplayIdolList()}
              renderItem={renderIdolItem}
              keyExtractor={item => item.name}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={renderExpandButton}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    ...CARD_SHADOW,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.GRAY[200],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.BLACK,
  },
  closeButton: {
    padding: 8,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: `${COLORS.PRIMARY}10`,
  },
  hintText: {
    marginLeft: 6,
    fontSize: 13,
    color: COLORS.GRAY[600],
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  idolItem: {
    paddingVertical: 14,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 8,
    ...CARD_SHADOW,
  },
  selectedIdolItem: {
    backgroundColor: `${COLORS.PRIMARY}20`,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
  },
  idolItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  idolInfo: {
    flex: 1,
  },
  idolName: {
    fontSize: 16,
    color: COLORS.BLACK,
  },
  idolCount: {
    fontSize: 13,
    color: COLORS.GRAY[600],
    marginTop: 2,
  },
  selectedIdolName: {
    fontWeight: 'bold',
    color: COLORS.PRIMARY,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.GRAY[600],
  },
  emptyStateSubText: {
    marginTop: 4,
    fontSize: 14,
    color: COLORS.GRAY[400],
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 10,
    backgroundColor: `${COLORS.PRIMARY}10`,
    borderRadius: 8,
  },
  expandButtonText: {
    marginRight: 6,
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: 'bold',
  },
})

export default IdolSelector
