export type ToastVariant = 'info' | 'success' | 'error' | 'warning'

export interface ConfirmButton {
  text: string
  style: 'cancel' | 'primary' | 'destructive'
}

export interface ConfirmOptions {
  title: string
  message: string
  buttons: ConfirmButton[]
}

type ShowToastFn = (message: string, variant?: ToastVariant) => void
type ShowConfirmFn = (options: ConfirmOptions) => Promise<number>

let _showToast: ShowToastFn | null = null
let _showConfirm: ShowConfirmFn | null = null

export function registerToast(fn: ShowToastFn) {
  _showToast = fn
}

export function registerConfirm(fn: ShowConfirmFn) {
  _showConfirm = fn
}

export const Dialog = {
  toast(message: string, variant: ToastVariant = 'info') {
    if (_showToast) {
      _showToast(message, variant)
    }
  },

  confirm(options: ConfirmOptions): Promise<number> {
    if (_showConfirm) {
      return _showConfirm(options)
    }
    return Promise.resolve(-1)
  },
}
