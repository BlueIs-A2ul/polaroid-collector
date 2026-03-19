import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { COLORS, CARD_SHADOW } from '../../constants/themeColors'
import { getAllIdolNames } from '../../services/recordService'

interface IdolSelectorProps {
  visible: boolean
  onClose: () => void
  onSelectIdol: (idolName: string) => void
  currentIdolName?: string
}

/**
 * 偶像选择器组件
 * 用于从已有偶像列表中选择偶像
 */
const IdolSelector: React.FC<IdolSelectorProps> = ({
  visible,
  onClose,
  onSelectIdol,
  currentIdolName,
}) => {
  const [idolNames, setIdolNames] = useState<string[]>([])
  const [filteredIdolNames, setFilteredIdolNames] = useState<string[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  /**
   * 加载偶像列表
   */
  const loadIdolNames = async () => {
    setLoading(true)
    try {
      const { success, data, error } = await getAllIdolNames()

      if (success && data) {
        setIdolNames(data)
        setFilteredIdolNames(data)
      } else {
        console.error('加载偶像列表失败:', error)
        Alert.alert('错误', '加载偶像列表失败')
      }
    } catch (error) {
      console.error('加载偶像列表失败:', error)
      Alert.alert('错误', '加载偶像列表失败')
    } finally {
      setLoading(false)
    }
  }

  /**
   * 搜索偶像
   */
  const handleSearch = (text: string) => {
    setSearchText(text)
    if (text.trim() === '') {
      setFilteredIdolNames(idolNames)
    } else {
      const filtered = idolNames.filter(name =>
        name.toLowerCase().includes(text.toLowerCase()),
      )
      setFilteredIdolNames(filtered)
    }
  }

  /**
   * 选择偶像
   */
  const handleSelectIdol = (idolName: string) => {
    onSelectIdol(idolName)
    onClose()
    // 清空搜索
    setSearchText('')
    setFilteredIdolNames(idolNames)
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
  const renderIdolItem = ({ item }: { item: string }) => {
    const isSelected = item === currentIdolName

    return (
      <TouchableOpacity
        style={[styles.idolItem, isSelected && styles.selectedIdolItem]}
        onPress={() => handleSelectIdol(item)}
      >
        <View style={styles.idolItemContent}>
          <Text
            style={[styles.idolName, isSelected && styles.selectedIdolName]}
          >
            {item}
          </Text>
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

    if (idolNames.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='person-outline' size={48} color={COLORS.GRAY[400]} />
          <Text style={styles.emptyStateText}>暂无偶像数据</Text>
          <Text style={styles.emptyStateSubText}>请手动输入新的偶像名称</Text>
        </View>
      )
    }

    if (filteredIdolNames.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name='search-outline' size={48} color={COLORS.GRAY[400]} />
          <Text style={styles.emptyStateText}>未找到匹配的偶像</Text>
        </View>
      )
    }

    return null
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

          {/* 搜索框 */}
          <View style={styles.searchContainer}>
            <Ionicons
              name='search'
              size={20}
              color={COLORS.GRAY[400]}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder='搜索偶像...'
              placeholderTextColor={COLORS.GRAY[400]}
              value={searchText}
              onChangeText={handleSearch}
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons
                  name='close-circle'
                  size={20}
                  color={COLORS.GRAY[400]}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* 偶像列表 */}
          <View style={styles.listContainer}>
            <FlatList
              data={filteredIdolNames}
              renderItem={renderIdolItem}
              keyExtractor={item => item}
              ListEmptyComponent={renderEmptyState}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 15,
    backgroundColor: COLORS.GRAY[100],
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: COLORS.BLACK,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  idolItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 8,
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
  idolName: {
    fontSize: 16,
    color: COLORS.BLACK,
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
})

export default IdolSelector
