import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'
import AnimatedBottomSheet from '../../common/AnimatedBottomSheet'
import { createUploadScreenStyles } from '../../../screens/uploadScreenStyles'

interface UploadPriceSelectorSheetProps {
  visible: boolean
  priceOptions: number[]
  styles: ReturnType<typeof createUploadScreenStyles>
  onClose: () => void
  onSelectPrice: (price: number) => void
}

const UploadPriceSelectorSheet: React.FC<UploadPriceSelectorSheetProps> = ({
  visible,
  priceOptions,
  styles,
  onClose,
  onSelectPrice,
}) => (
  <AnimatedBottomSheet
    visible={visible}
    onClose={onClose}
    title='选择价格'
  >
    <View style={{ padding: 16 }}>
      {priceOptions.map(price => (
        <TouchableOpacity
          key={price}
          style={styles.priceOption}
          onPress={() => onSelectPrice(price)}
        >
          <Text style={styles.priceOptionText}>¥{price}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.priceOption}
        onPress={onClose}
      >
        <Text style={[styles.priceOptionText, styles.priceOptionManual]}>
          手动输入
        </Text>
      </TouchableOpacity>
    </View>
  </AnimatedBottomSheet>
)

export default UploadPriceSelectorSheet
