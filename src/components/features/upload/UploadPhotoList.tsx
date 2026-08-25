import React from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import OptionsSelector from '../../common/OptionsSelector'
import {
  POLAROID_TYPE_OPTIONS,
  MEMBER_COUNT_OPTIONS,
} from '../../../constants/polaroidOptions'
import { ResolvedColors } from '../../../types/theme'
import { PhotoItem } from '../../../types'
import { createUploadScreenStyles } from '../../../screens/uploadScreenStyles'

interface UploadPhotoListProps {
  photos: PhotoItem[]
  mergeAsOneRecord: boolean
  priceOptions: number[]
  colors: ResolvedColors
  styles: ReturnType<typeof createUploadScreenStyles>
  onMergeAsOneRecordChange: (value: boolean) => void
  onUpdatePhotoCount: (uri: string, count: number) => void
  onUpdatePhotoPrice: (uri: string, price: number) => void
  onUpdatePhotoNote: (uri: string, note: string) => void
  onUpdatePhotoField: (
    uri: string,
    field: keyof PhotoItem,
    value: string | undefined,
  ) => void
  onAddBackPhoto: (uri: string) => void
  onRemoveBackPhoto: (uri: string) => void
  onRemovePhoto: (uri: string) => void
  onShowPriceSelector: (uri: string) => void
}

const UploadPhotoList: React.FC<UploadPhotoListProps> = ({
  photos,
  mergeAsOneRecord,
  priceOptions,
  colors,
  styles,
  onMergeAsOneRecordChange,
  onUpdatePhotoCount,
  onUpdatePhotoPrice,
  onUpdatePhotoNote,
  onUpdatePhotoField,
  onAddBackPhoto,
  onRemoveBackPhoto,
  onRemovePhoto,
  onShowPriceSelector,
}) => {
  const totalCount = photos.reduce((sum, p) => sum + p.count, 0)
  const totalPrice = photos.reduce((sum, p) => sum + (p.price || 0), 0)

  return (
    <View style={styles.formGroup}>
      <View style={styles.photoListHeader}>
        <Text style={styles.label}>已选照片 ({photos.length})</Text>
        <View style={styles.photoListSummary}>
          <Text style={styles.totalCount}>共 {totalCount} 张</Text>
          {totalPrice > 0 && (
            <Text style={styles.totalPrice}> · ¥{totalPrice}</Text>
          )}
        </View>
      </View>

      {photos.length > 1 && (
        <View style={styles.mergeToggleContainer}>
          <Text style={styles.mergeToggleLabel}>
            {mergeAsOneRecord ? '合并为 1 条记录（推荐）' : '每条照片作为独立记录'}
          </Text>
          <Switch
            value={mergeAsOneRecord}
            onValueChange={onMergeAsOneRecordChange}
            trackColor={{
              false: colors.GRAY[300],
              true: colors.PRIMARY,
            }}
            thumbColor={colors.ON_PRIMARY}
          />
        </View>
      )}

      {photos.map((photo, index) => (
        <View key={photo.uri} style={styles.photoItem}>
          <View style={styles.photoThumbnailContainer}>
            <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
            {photo.backPhotoUri && (
              <View style={styles.backPhotoBadge}>
                <Ionicons name='document-text' size={12} color={colors.ON_PRIMARY} />
              </View>
            )}
          </View>
          <View style={styles.photoInfo}>
            <View style={styles.photoInfoHeader}>
              <Text style={styles.photoIndex}>照片 {index + 1}</Text>
              {photo.backPhotoUri && (
                <View style={styles.backPhotoTag}>
                  <Ionicons name='document-text' size={12} color={colors.SUCCESS} />
                  <Text style={styles.backPhotoTagText}>背签</Text>
                </View>
              )}
            </View>
            <View style={styles.countInputContainer}>
              <Text style={styles.countLabel}>数量:</Text>
              <TextInput
                style={styles.countInput}
                value={String(photo.count)}
                onChangeText={text => onUpdatePhotoCount(photo.uri, parseInt(text) || 1)}
                keyboardType='number-pad'
              />
            </View>
            <View style={styles.countInputContainer}>
              <Text style={styles.countLabel}>价格:</Text>
              <TextInput
                style={styles.countInput}
                value={photo.price ? String(photo.price) : ''}
                onChangeText={text => onUpdatePhotoPrice(photo.uri, parseFloat(text) || 0)}
                keyboardType='decimal-pad'
                placeholder='选填'
              />
              {priceOptions.length > 0 && (
                <TouchableOpacity
                  style={styles.priceSelectButton}
                  onPress={() => onShowPriceSelector(photo.uri)}
                >
                  <Ionicons name='pricetag' size={16} color={colors.PRIMARY} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.noteInputContainer}>
              <Text style={styles.countLabel}>备注:</Text>
              <TextInput
                style={styles.noteInput}
                value={photo.note || ''}
                onChangeText={text => onUpdatePhotoNote(photo.uri, text)}
                placeholder='选填'
                multiline
              />
            </View>
            <View style={styles.extraFieldsContainer}>
              <View style={styles.extraFieldRow}>
                <View style={styles.extraFieldHalf}>
                  <OptionsSelector
                    label='类型'
                    value={photo.polaroidType || ''}
                    options={POLAROID_TYPE_OPTIONS}
                    placeholder='选填'
                    onChange={value => onUpdatePhotoField(photo.uri, 'polaroidType', value)}
                  />
                </View>
                <View style={styles.extraFieldHalf}>
                  <OptionsSelector
                    label='人数'
                    value={photo.memberCount || ''}
                    options={MEMBER_COUNT_OPTIONS}
                    placeholder='选填'
                    onChange={value => onUpdatePhotoField(photo.uri, 'memberCount', value)}
                  />
                </View>
              </View>
            </View>
            <View style={styles.photoActions}>
              {photo.backPhotoUri ? (
                <TouchableOpacity
                  style={styles.removeBackPhotoButton}
                  onPress={() => onRemoveBackPhoto(photo.uri)}
                >
                  <Ionicons name='document-text-outline' size={14} color={colors.ERROR} />
                  <Text style={styles.removeBackPhotoText}>移除背签</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addBackPhotoButton}
                  onPress={() => onAddBackPhoto(photo.uri)}
                >
                  <Ionicons name='add-circle-outline' size={14} color={colors.PRIMARY} />
                  <Text style={styles.addBackPhotoText}>添加背签</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={() => onRemovePhoto(photo.uri)}
          >
            <Ionicons name='close-circle' size={24} color={colors.ERROR} />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

export default UploadPhotoList
