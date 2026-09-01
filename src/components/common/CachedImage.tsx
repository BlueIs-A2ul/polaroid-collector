import React, { useEffect, useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Image, ImageContentFit } from 'expo-image'
import { useTheme } from '../../contexts/ThemeContext'

interface CachedImageProps {
  uri: string
  style?: any
  resizeMode?: ImageContentFit
}

const CachedImage: React.FC<CachedImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
}) => {
  const { colors } = useTheme()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [uri])

  if (failed) {
    return (
      <View
        style={[
          styles.fallback,
          { backgroundColor: colors.GRAY[200] },
          style,
        ]}
      >
        <Ionicons name='image-outline' size={28} color={colors.GRAY[400]} />
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={resizeMode}
      transition={200}
      cachePolicy='memory-disk'
      onError={() => setFailed(true)}
    />
  )
}

const styles = StyleSheet.create({
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default CachedImage
