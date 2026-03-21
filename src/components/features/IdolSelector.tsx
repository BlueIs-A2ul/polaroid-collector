import React, { useState, useEffect, useMemo } from 'react'
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
import { useTheme } from '../../contexts/ThemeContext'
import { CARD_SHADOW } from '../../constants/themes'
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

const IdolSelector: React.FC<IdolSelectorProps> = ({
  visible,
  onClose,
  onSelectIdol,
  currentIdolName,
}) => {
  const { colors } = useTheme()
  const [idolList, setIdolList] = useState<IdolItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [expanded, setExpanded] = useState<boolean>(false)
  const INITIAL_DISPLAY_COUNT = 5

  const styles = useMemo(() => StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.WHITE,
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
      borderBottomColor: colors.GRAY[200],
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    closeButton: {
      padding: 8,
    },
    hintContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: `${colors.PRIMARY}10`,
    },
    hintText: {
      marginLeft: 6,
      fontSize: 13,
      color: colors.GRAY[600],
    },
    listContainer: {
      maxHeight: 400,
      paddingHorizontal: 15,
      paddingVertical: 10,
    },
    idolItem: {
      paddingVertical: 14,
      paddingHorizontal: 15,
      marginBottom: 10,
      backgroundColor: colors.GRAY[100],
      borderRadius: 8,
      ...CARD_SHADOW,
    },
    selectedIdolItem: {
      backgroundColor: `${colors.PRIMARY}20`,
      borderWidth: 2,
      borderColor: colors.PRIMARY,
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
      color: colors.BLACK,
    },
    idolCount: {
      fontSize: 13,
      color: colors.GRAY[600],
      marginTop: 2,
    },
    selectedIdolName: {
      fontWeight: 'bold',
      color: colors.PRIMARY,
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
      color: colors.GRAY[600],
    },
    emptyStateSubText: {
      marginTop: 4,
      fontSize: 14,
      color: colors.GRAY[400],
    },
    expandButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      marginTop: 10,
      backgroundColor: `${colors.PRIMARY}10`,
      borderRadius: 8,
    },
    expandButtonText: {
      marginRight: 6,
      fontSize: 14,
      color: colors.PRIMARY,
      fontWeight: 'bold',
    },
  }), [colors])

  const loadIdolNames = async () => {
    setLoading(true)
    try {
      const { success, data, error } = await getIdolListWithCount()

      if (success && data) {
        setIdolList(data)
      } else {
        Alert.alert('错误', `加载偶像列表失败: ${error}`)
      }
    } catch (error) {
      Alert.alert('错误', `加载偶像列表失败: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const getDisplayIdolList = (): IdolItem[] => {
    if (expanded || idolList.length <= INITIAL_DISPLAY_COUNT) {
      return idolList
    }
    return idolList.slice(0, INITIAL_DISPLAY_COUNT)
  }

  const handleSelectIdol = (idolName: string) => {
    onSelectIdol(idolName)
    onClose()
  }

  useEffect(() => {
    if (visible) {
      loadIdolNames()
    }
  }, [visible])

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
              color={colors.PRIMARY}
            />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size='large' color={colors.PRIMARY} />
          <Text style={styles.emptyStateText}>加载中...</Text>
        </View>
      )
    }

    if (idolList.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='person-outline' size={48} color={colors.GRAY[400]} />
          <Text style={styles.emptyStateText}>暂无偶像数据</Text>
          <Text style={styles.emptyStateSubText}>请手动输入新的偶像名称</Text>
        </View>
      )
    }

    return null
  }

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
          color={colors.PRIMARY}
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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>选择偶像</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name='close' size={24} color={colors.BLACK} />
            </TouchableOpacity>
          </View>

          <View style={styles.hintContainer}>
            <Ionicons
              name='information-circle-outline'
              size={16}
              color={colors.GRAY[500]}
            />
            <Text style={styles.hintText}>按拍立得数量从高到低排序</Text>
          </View>

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

export default IdolSelector