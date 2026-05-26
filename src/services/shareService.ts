import { captureRef } from 'react-native-view-shot'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { Dialog } from './dialogService'

export const captureAndShare = async (
  viewRef: React.RefObject<any>,
): Promise<void> => {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    })

    const fileName = `share_${Date.now()}.png`
    const newPath = `${(FileSystem as any).documentDirectory}${fileName}`
    await FileSystem.moveAsync({
      from: uri,
      to: newPath,
    })

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(newPath, {
        mimeType: 'image/png',
        dialogTitle: '分享拍立得收藏',
      })
    } else {
      Dialog.toast('分享功能不可用，图片已保存', 'warning')
    }
  } catch (error) {
    console.error('分享失败:', error)
    Dialog.toast(error instanceof Error ? error.message : '分享失败', 'error')
  }
}
