import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated } from 'react-native'
import { useTheme } from '../../contexts/ThemeContext'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: any
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = 4,
  style,
}) => {
  const { colors } = useTheme()
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()

    return () => animation.stop()
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.GRAY[200],
          opacity,
        },
        style,
      ]}
    />
  )
}

export const SkeletonCircle: React.FC<{ size?: number }> = ({ size = 48 }) => {
  const { colors } = useTheme()
  const animatedValue = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    )
    animation.start()

    return () => animation.stop()
  }, [animatedValue])

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  })

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.GRAY[200],
        opacity,
      }}
    />
  )
}

const createSkeletonStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.SECONDARY,
    },
  })

export const HomeSkeleton: React.FC = () => {
  const { colors } = useTheme()
  const styles = createSkeletonStyles(colors)

  return (
    <View style={styles.container}>
      <View style={{ padding: 16, gap: 12 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.WHITE,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <SkeletonCircle size={48} />
            <View style={{ flex: 1, marginLeft: 12, gap: 8 }}>
              <Skeleton width='40%' height={16} />
              <Skeleton width='20%' height={14} />
            </View>
            <Skeleton width={48} height={48} borderRadius={8} />
          </View>
        ))}
      </View>
    </View>
  )
}

export const DetailSkeleton: React.FC = () => {
  const { colors } = useTheme()
  const styles = createSkeletonStyles(colors)

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: colors.PRIMARY,
          paddingTop: 60,
          paddingBottom: 20,
          alignItems: 'center',
        }}
      >
        <SkeletonCircle size={80} />
        <Skeleton width={120} height={24} borderRadius={12} style={{ marginTop: 12 }} />
      </View>

      <View style={{ padding: 16, gap: 16 }}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={{
              backgroundColor: colors.WHITE,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Skeleton width={16} height={16} borderRadius={8} />
              <Skeleton width={100} height={14} borderRadius={4} style={{ marginLeft: 8 }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[1, 2, 3].map(j => (
                <Skeleton key={j} width={100} height={100} borderRadius={8} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export const StatisticsSkeleton: React.FC = () => {
  const { colors } = useTheme()
  const styles = createSkeletonStyles(colors)

  return (
    <View style={styles.container}>
      <View
        style={{
          backgroundColor: colors.PRIMARY,
          paddingTop: 60,
          paddingBottom: 20,
          alignItems: 'center',
        }}
      >
        <Skeleton width={100} height={24} borderRadius={12} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 16 }}>
        {[1, 2, 3].map(i => (
          <View
            key={i}
            style={{
              backgroundColor: colors.WHITE,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
            }}
          >
            <SkeletonCircle size={32} />
            <Skeleton width={40} height={24} borderRadius={4} style={{ marginTop: 8 }} />
            <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
          </View>
        ))}
      </View>

      <View style={{ padding: 16 }}>
        <View
          style={{
            backgroundColor: colors.WHITE,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Skeleton width={80} height={18} borderRadius={4} />
          <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-around' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <View key={i} style={{ alignItems: 'center' }}>
                <Skeleton width={60} height={12} borderRadius={4} />
                <Skeleton width={20} height={80} borderRadius={4} style={{ marginTop: 8 }} />
                <Skeleton width={20} height={12} borderRadius={4} style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  )
}