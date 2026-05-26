import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
}

interface ToastFn {
  (props: ToastProps): string | number
  success: typeof sonnerToast.success
  error: typeof sonnerToast.error
  info: typeof sonnerToast.info
  warning: typeof sonnerToast.warning
  dismiss: typeof sonnerToast.dismiss
}

const toastFn = function ({ title, description, variant }: ToastProps) {
  if (variant === "destructive") {
    return sonnerToast.error(title || "Error", {
      description,
    })
  }
  if (variant === "success") {
    return sonnerToast.success(title || "Success", {
      description,
    })
  }
  return sonnerToast(title || "", {
    description,
  })
} as unknown as ToastFn

toastFn.success = sonnerToast.success
toastFn.error = sonnerToast.error
toastFn.info = sonnerToast.info
toastFn.warning = sonnerToast.warning
toastFn.dismiss = sonnerToast.dismiss

export { toastFn as toast }
