import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import Slider from '@react-native-community/slider'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../contexts/ThemeContext'
import { PRESET_THEMES } from '../constants/themes'
import { ThemeAdjustment } from '../types/theme'

const ThemeSettingsScreen: React.FC = () => {
  const {
    colors,
    originalColors,
    currentThemeId,
    adjustment,
    setTheme,
    setAdjustment,
    resetAdjustment,
  } = useTheme()

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
    header: {
      backgroundColor: colors.PRIMARY,
      padding: 20,
      paddingTop: 60,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.WHITE,
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.BLACK,
      marginBottom: 16,
    },
    themeList: {
      gap: 12,
    },
    themeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 16,
    },
    themeItemSelected: {
      borderWidth: 2,
      borderColor: colors.PRIMARY,
    },
    colorPreview: {
      flexDirection: 'row',
      marginRight: 16,
    },
    primaryColor: {
      width: 40,
      height: 40,
      borderRadius: 8,
      marginRight: -12,
      borderWidth: 2,
      borderColor: colors.WHITE,
    },
    secondaryColor: {
      width: 40,
      height: 40,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.WHITE,
    },
    themeInfo: {
      flex: 1,
      marginLeft: 16,
    },
    themeName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.BLACK,
    },
    themeNameSelected: {
      color: colors.PRIMARY,
    },
    checkIcon: {
      marginLeft: 8,
    },
    adjustmentSection: {
      backgroundColor: colors.WHITE,
      borderRadius: 12,
      padding: 16,
    },
    sliderRow: {
      marginBottom: 20,
    },
    sliderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    sliderLabel: {
      fontSize: 14,
      color: colors.BLACK,
      fontWeight: '500',
    },
    sliderValue: {
      fontSize: 14,
      color: colors.GRAY[600],
    },
    slider: {
      width: '100%',
      height: 40,
    },
    previewContainer: {
      marginTop: 16,
      padding: 16,
      borderRadius: 8,
      backgroundColor: colors.GRAY[100],
    },
    previewTitle: {
      fontSize: 12,
      color: colors.GRAY[600],
      marginBottom: 12,
      textAlign: 'center',
    },
    previewColors: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 16,
    },
    previewColorBox: {
      width: 60,
      height: 60,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewColorLabel: {
      fontSize: 10,
      color: colors.WHITE,
      fontWeight: 'bold',
      marginTop: 4,
    },
    resetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.GRAY[200],
      borderRadius: 8,
      paddingVertical: 12,
      marginTop: 16,
      gap: 8,
    },
    resetButtonText: {
      fontSize: 14,
      color: colors.GRAY[700],
      fontWeight: '500',
    },
    bottomPadding: {
      height: 20,
    },
  }), [colors])

  const handleAdjustmentChange = (key: keyof ThemeAdjustment, value: number) => {
    setAdjustment({
      ...adjustment,
      [key]: value,
    })
  }

  const hasAdjustment = adjustment.hueShift !== 0 || adjustment.saturation !== 0 || adjustment.lightness !== 0

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>主题设置</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>选择基础主题</Text>

          <View style={styles.themeList}>
            {PRESET_THEMES.map(theme => {
              const isSelected = theme.id === currentThemeId
              return (
                <TouchableOpacity
                  key={theme.id}
                  style={[styles.themeItem, isSelected && styles.themeItemSelected]}
                  onPress={() => setTheme(theme.id)}
                >
                  <View style={styles.colorPreview}>
                    <View style={[styles.primaryColor, { backgroundColor: theme.colors.PRIMARY }]} />
                    <View style={[styles.secondaryColor, { backgroundColor: theme.colors.SECONDARY }]} />
                  </View>

                  <View style={styles.themeInfo}>
                    <Text style={[styles.themeName, isSelected && styles.themeNameSelected]}>
                      {theme.name}
                    </Text>
                  </View>

                  {isSelected && (
                    <Ionicons name='checkmark-circle' size={24} color={colors.PRIMARY} style={styles.checkIcon} />
                  )}
                </TouchableOpacity>
              )
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>自定义调整</Text>

          <View style={styles.adjustmentSection}>
            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>色相偏移</Text>
                <Text style={styles.sliderValue}>{adjustment.hueShift}°</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={-180}
                maximumValue={180}
                step={5}
                value={adjustment.hueShift}
                onValueChange={(value) => handleAdjustmentChange('hueShift', value)}
                minimumTrackTintColor={colors.PRIMARY}
                maximumTrackTintColor={colors.GRAY[300]}
                thumbTintColor={colors.PRIMARY}
              />
            </View>

            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>饱和度</Text>
                <Text style={styles.sliderValue}>{adjustment.saturation > 0 ? '+' : ''}{adjustment.saturation}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={-50}
                maximumValue={50}
                step={5}
                value={adjustment.saturation}
                onValueChange={(value) => handleAdjustmentChange('saturation', value)}
                minimumTrackTintColor={colors.PRIMARY}
                maximumTrackTintColor={colors.GRAY[300]}
                thumbTintColor={colors.PRIMARY}
              />
            </View>

            <View style={styles.sliderRow}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>亮度</Text>
                <Text style={styles.sliderValue}>{adjustment.lightness > 0 ? '+' : ''}{adjustment.lightness}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={-30}
                maximumValue={30}
                step={5}
                value={adjustment.lightness}
                onValueChange={(value) => handleAdjustmentChange('lightness', value)}
                minimumTrackTintColor={colors.PRIMARY}
                maximumTrackTintColor={colors.GRAY[300]}
                thumbTintColor={colors.PRIMARY}
              />
            </View>

            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>预览效果</Text>
              <View style={styles.previewColors}>
                <View style={[styles.previewColorBox, { backgroundColor: colors.PRIMARY }]}>
                  <Text style={styles.previewColorLabel}>主色</Text>
                </View>
                <View style={[styles.previewColorBox, { backgroundColor: colors.SECONDARY }]}>
                  <Text style={[styles.previewColorLabel, { color: colors.BLACK }]}>背景</Text>
                </View>
                <View style={[styles.previewColorBox, { backgroundColor: colors.SUCCESS }]}>
                  <Text style={styles.previewColorLabel}>成功</Text>
                </View>
              </View>
            </View>

            {hasAdjustment && (
              <TouchableOpacity style={styles.resetButton} onPress={resetAdjustment}>
                <Ionicons name='refresh' size={18} color={colors.GRAY[700]} />
                <Text style={styles.resetButtonText}>重置为默认</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

export default ThemeSettingsScreen