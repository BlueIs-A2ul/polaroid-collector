import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ResolvedColors } from '../../../types/theme'
import { createEditScreenStyles } from '../../../screens/editScreenStyles'

interface EditPhotoSectionProps {
  photoUri: string | null
  backPhotoUri: string | null
  colors: ResolvedColors
  styles: ReturnType<typeof createEditScreenStyles>
  onPickPhoto: (source: 'camera' | 'library', photoType: 'front' | 'back') => void
  onRemovePhoto: () => void
  onPickBackPhoto: () => void
  onRemoveBackPhoto: () => void
}

const EditPhotoSection: React.FC<EditPhotoSectionProps> = ({
  photoUri,
  backPhotoUri,
  colors,
  styles,
  onPickPhoto,
  onRemovePhoto,
  onPickBackPhoto,
  onRemoveBackPhoto,
}) => (
  <>
    <View style={styles.formGroup}>
      <Text style={styles.label}>正面照片</Text>
      {photoUri ? (
        <>
          <View style={styles.photoPreviewContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <TouchableOpacity
              style={styles.removePhotoButton}
              onPress={onRemovePhoto}
            >
              <Ionicons
                name='close-circle'
                size={24}
                color={colors.ERROR}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.photoButtons}>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => onPickPhoto('camera', 'front')}
            >
              <Ionicons name='camera' size={28} color={colors.PRIMARY} />
              <Text style={styles.photoButtonText}>拍照</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoButton}
              onPress={() => onPickPhoto('library', 'front')}
            >
              <Ionicons name='images' size={28} color={colors.PRIMARY} />
              <Text style={styles.photoButtonText}>相册</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.photoButtons}>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => onPickPhoto('camera', 'front')}
          >
            <Ionicons name='camera' size={28} color={colors.PRIMARY} />
            <Text style={styles.photoButtonText}>拍照</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => onPickPhoto('library', 'front')}
          >
            <Ionicons name='images' size={28} color={colors.PRIMARY} />
            <Text style={styles.photoButtonText}>相册</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>

    <View style={styles.formGroup}>
      <View style={styles.backPhotoHeader}>
        <Text style={styles.label}>背签照片</Text>
        {backPhotoUri && (
          <View style={styles.hasBackTag}>
            <Ionicons name='checkmark-circle' size={14} color={colors.SUCCESS} />
            <Text style={styles.hasBackText}>已添加</Text>
          </View>
        )}
      </View>
      {backPhotoUri ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri: backPhotoUri }} style={styles.photoPreview} />
          <TouchableOpacity
            style={styles.removePhotoButton}
            onPress={onRemoveBackPhoto}
          >
            <Ionicons
              name='close-circle'
              size={24}
              color={colors.ERROR}
            />
          </TouchableOpacity>
          <View style={styles.backPhotoLabel}>
            <Ionicons name='document-text' size={14} color={colors.ON_PRIMARY} />
            <Text style={styles.backPhotoLabelText}>背签</Text>
          </View>
        </View>
      ) : null}
      <View style={styles.backPhotoButtons}>
        {backPhotoUri ? (
          <TouchableOpacity
            style={styles.changeBackPhotoButton}
            onPress={onPickBackPhoto}
          >
            <Ionicons name='sync' size={18} color={colors.PRIMARY} />
            <Text style={styles.changeBackPhotoText}>更换背签</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.addBackPhotoButton}
            onPress={onPickBackPhoto}
          >
            <Ionicons name='add-circle-outline' size={18} color={colors.PRIMARY} />
            <Text style={styles.addBackPhotoText}>添加背签照片</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </>
)

export default EditPhotoSection
