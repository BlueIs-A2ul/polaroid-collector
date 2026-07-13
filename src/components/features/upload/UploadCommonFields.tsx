import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ResolvedColors } from '../../../types/theme'
import { createUploadScreenStyles } from '../../../screens/uploadScreenStyles'

type FieldSelectorKey = 'groupName' | 'city' | 'venue'

interface UploadCommonFieldsProps {
  globalGroupName: string
  globalCity: string
  globalVenue: string
  colors: ResolvedColors
  styles: ReturnType<typeof createUploadScreenStyles>
  onOpenFieldSelector: (field: FieldSelectorKey) => void
}

const UploadCommonFields: React.FC<UploadCommonFieldsProps> = ({
  globalGroupName,
  globalCity,
  globalVenue,
  colors,
  styles,
  onOpenFieldSelector,
}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>公共信息（应用到所有照片）</Text>
    <View style={styles.globalFieldsRow}>
      <View style={styles.globalFieldHalf}>
        <Text style={styles.extraFieldLabel}>团体</Text>
        <TouchableOpacity
          style={styles.extraFieldInputWrapper}
          onPress={() => onOpenFieldSelector('groupName')}
        >
          <Text
            style={[
              styles.extraFieldInputText,
              globalGroupName ? null : styles.extraFieldPlaceholder,
            ]}
          >
            {globalGroupName || '选填'}
          </Text>
          <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
        </TouchableOpacity>
      </View>
      <View style={styles.globalFieldHalf}>
        <Text style={styles.extraFieldLabel}>城市</Text>
        <TouchableOpacity
          style={styles.extraFieldInputWrapper}
          onPress={() => onOpenFieldSelector('city')}
        >
          <Text
            style={[
              styles.extraFieldInputText,
              globalCity ? null : styles.extraFieldPlaceholder,
            ]}
          >
            {globalCity || '选填'}
          </Text>
          <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.globalFieldsRow}>
      <View style={styles.globalFieldFull}>
        <Text style={styles.extraFieldLabel}>场馆</Text>
        <TouchableOpacity
          style={styles.extraFieldInputWrapper}
          onPress={() => onOpenFieldSelector('venue')}
        >
          <Text
            style={[
              styles.extraFieldInputText,
              globalVenue ? null : styles.extraFieldPlaceholder,
            ]}
          >
            {globalVenue || '选填'}
          </Text>
          <Ionicons name='chevron-down' size={16} color={colors.GRAY[500]} />
        </TouchableOpacity>
      </View>
    </View>
  </View>
)

export default UploadCommonFields
