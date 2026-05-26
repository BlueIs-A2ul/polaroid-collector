import React, { useEffect, useRef, useState, useCallback } from 'react'
import { View, StyleSheet } from 'react-native'
import ToastItem from './Toast'
import ConfirmDialog from './ConfirmDialog'
import {
  registerToast,
  registerConfirm,
  ToastVariant,
  ConfirmOptions,
} from '../../services/dialogService'

interface ToastEntry {
  id: number
  message: string
  variant: ToastVariant
}

const DialogRoot: React.FC = () => {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions
    resolve: (idx: number) => void
  } | null>(null)
  const idCounter = useRef(0)

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = idCounter.current++
    setToasts(prev => [...prev, { id, message, variant }])
  }, [])

  const showConfirm = useCallback((options: ConfirmOptions): Promise<number> => {
    return new Promise<number>((resolve) => {
      setConfirmState({ options, resolve })
    })
  }, [])

  useEffect(() => {
    registerToast(showToast)
    registerConfirm(showConfirm)
  }, [showToast, showConfirm])

  const handleToastDismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handleConfirmResult = useCallback((index: number) => {
    if (confirmState) {
      const { resolve } = confirmState
      setConfirmState(null)
      setTimeout(() => resolve(index), 0)
    }
  }, [confirmState])

  return (
    <View style={styles.root} pointerEvents='box-none'>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          variant={toast.variant}
          index={index}
          onDismiss={() => handleToastDismiss(toast.id)}
        />
      ))}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.options.title}
          message={confirmState.options.message}
          buttons={confirmState.options.buttons}
          onResult={handleConfirmResult}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
})

export default DialogRoot
