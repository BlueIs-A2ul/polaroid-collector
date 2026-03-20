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
      placeholder={{ blurhash: 'L6PZfSjE.AyE_3t7axV@DgM|RPV@' }}
      placeholderContentFit='cover'
      cachePolicy='memory-disk'
    />
  )
}

const styles = StyleSheet.create({})

export default CachedImage