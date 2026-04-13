import React from 'react'
import { StyleSheet } from 'react-native'
import { Image, ImageContentFit } from 'expo-image'

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
  return (
    <Image
      source={{ uri }}
      style={style}
      contentFit={resizeMode}
      transition={200}
      cachePolicy='memory-disk'
    />
  )
}

const styles = StyleSheet.create({})

export default CachedImage