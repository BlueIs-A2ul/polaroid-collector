import React, { useMemo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../contexts/ThemeContext'
import { PRESET_THEMES } from '../constants/themes'

const ThemeSettingsScreen: React.FC = () => {
  const { colors, currentThemeId, setTheme } = useTheme()

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
    themeHint: {
      fontSize: 12,
      color: colors.GRAY[500],
      marginTop: 4,
    },
    checkIcon: {
      marginLeft: 8,
    },
    bottomPadding: {
      height: 20,
    },
  }), [colors])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>主题设置</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>选择主题</Text>

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

      <View style={styles.bottomPadding} />
    </ScrollView>
  )
}

export default ThemeSettingsScreen