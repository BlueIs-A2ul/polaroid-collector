import { useState } from 'react'
import { PhotoItem } from '../types'
import { pickPhoto, pickMultiplePhotos } from '../services/photoService'
import { Dialog } from '../services/dialogService'

interface UseUploadPhotosArgs {
  photoDate: string
  defaultPrice: number | null
  setPhotoDate: (date: string) => void
}

export const useUploadPhotos = ({
  photoDate,
  defaultPrice,
  setPhotoDate,
}: UseUploadPhotosArgs) => {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [showCropOptions, setShowCropOptions] = useState<boolean>(false)
  const [allowCrop, setAllowCrop] = useState<boolean>(false)
  const [cropWidth, setCropWidth] = useState<number>(4)
  const [cropHeight, setCropHeight] = useState<number>(3)
  const [pendingSource, setPendingSource] = useState<'camera' | 'library'>('library')
  const [showPriceSelector, setShowPriceSelector] = useState<string | null>(null)
  const [mergeAsOneRecord, setMergeAsOneRecord] = useState<boolean>(false)

  const handleConfirmCropOptionsForMultiple = async () => {
    const today = new Date().toISOString().split('T')[0]

    const { success, data, error } = await pickMultiplePhotos({
      allowCrop,
      cropWidth,
      cropHeight,
    })

    if (success && data) {
      const newPhotos: PhotoItem[] = data.map(p => ({
        uri: p.uri,
        count: 1,
        price: defaultPrice || undefined,
      }))
      setPhotos(prev => [...prev, ...newPhotos])

      const firstDate = data[0]?.capturedDate
      if (firstDate && photoDate === today) {
        setPhotoDate(firstDate)
      }
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择照片失败', 'error')
    }
  }

  const handleShowCropOptions = (source: 'camera' | 'library' | 'multiple') => {
    if (source === 'multiple') {
      handleConfirmCropOptionsForMultiple()
    } else {
      setPendingSource(source)
      setShowCropOptions(true)
    }
  }

  const handleConfirmCropOptions = async () => {
    setShowCropOptions(false)

    const today = new Date().toISOString().split('T')[0]

    const { success, data, error } = await pickPhoto(pendingSource, {
      allowCrop,
      cropWidth,
      cropHeight,
    })

    if (success && data) {
      setPhotos(prev => [
        ...prev,
        {
          uri: data.uri,
          count: 1,
          price: defaultPrice || undefined,
        },
      ])

      if (data.capturedDate && photoDate === today) {
        setPhotoDate(data.capturedDate)
      }
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择照片失败', 'error')
    }
  }

  const updatePhotoCount = (uri: string, count: number) => {
    setPhotos(prev =>
      prev.map(p => (p.uri === uri ? { ...p, count: Math.max(1, count) } : p)),
    )
  }

  const updatePhotoPrice = (uri: string, price: number) => {
    setPhotos(prev =>
      prev.map(p => (
        p.uri === uri ? { ...p, price: price > 0 ? price : undefined } : p
      )),
    )
  }

  const updatePhotoNote = (uri: string, note: string) => {
    setPhotos(prev =>
      prev.map(p => (
        p.uri === uri ? { ...p, note: note.trim() || undefined } : p
      )),
    )
  }

  const updatePhotoField = (
    uri: string,
    field: keyof PhotoItem,
    value: string | undefined,
  ) => {
    setPhotos(prev =>
      prev.map(p => (p.uri === uri ? { ...p, [field]: value || undefined } : p)),
    )
  }

  const removePhoto = (uri: string) => {
    setPhotos(prev => prev.filter(p => p.uri !== uri))
  }

  const handleAddBackPhoto = async (photoUri: string) => {
    const { success, data, error } = await pickPhoto('library', {
      allowCrop: false,
    })

    if (success && data) {
      setPhotos(prev =>
        prev.map(p => (
          p.uri === photoUri ? { ...p, backPhotoUri: data.uri } : p
        )),
      )
    } else if (error !== '用户取消选择') {
      Dialog.toast(error || '选择背签照片失败', 'error')
    }
  }

  const handleRemoveBackPhoto = (photoUri: string) => {
    setPhotos(prev =>
      prev.map(p => (
        p.uri === photoUri ? { ...p, backPhotoUri: undefined } : p
      )),
    )
  }

  const getTotalCount = (): number => {
    return photos.reduce((sum, p) => sum + p.count, 0)
  }

  const getBackPhotoCount = (): number => {
    return photos.filter(p => p.backPhotoUri).length
  }

  const clearPhotos = () => {
    setPhotos([])
  }

  return {
    photos,
    showCropOptions,
    allowCrop,
    cropWidth,
    cropHeight,
    showPriceSelector,
    mergeAsOneRecord,
    setShowCropOptions,
    setAllowCrop,
    setCropWidth,
    setCropHeight,
    setShowPriceSelector,
    setMergeAsOneRecord,
    handleShowCropOptions,
    handleConfirmCropOptions,
    updatePhotoCount,
    updatePhotoPrice,
    updatePhotoNote,
    updatePhotoField,
    removePhoto,
    handleAddBackPhoto,
    handleRemoveBackPhoto,
    getTotalCount,
    getBackPhotoCount,
    clearPhotos,
  }
}
