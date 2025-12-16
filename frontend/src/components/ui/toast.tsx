import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all animate-in fade-in slide-in-from-top-5",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          "destructive group border-destructive bg-destructive text-destructive-foreground",
        success: "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
  onClose?: () => void
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, onClose, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    )
  }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = "ToastDescription"

// Toast Provider and Hook
interface ToastContextType {
  toast: (props: ToastMessageProps) => void
}

interface ToastMessageProps {
  title?: string
  description?: string
  variant?: "default" | "destructive" | "success"
  duration?: number
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Array<ToastMessageProps & { id: string; isRemoving?: boolean }>>([])

  const toast = React.useCallback((props: ToastMessageProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...props, id, isRemoving: false }
    setToasts((prev) => [...prev, newToast])

    const duration = props.duration || 5000
    setTimeout(() => {
      setToasts((prev) => {
        const toastToRemove = prev.find((t) => t.id === id)
        if (toastToRemove) {
          return prev.map((t) => t.id === id ? { ...t, isRemoving: true } : t)
        }
        return prev
      })
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 300)
    }, duration)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => {
      const toastToRemove = prev.find((t) => t.id === id)
      if (toastToRemove) {
        return prev.map((t) => t.id === id ? { ...t, isRemoving: true } : t)
      }
      return prev
    })
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 md:max-w-[420px] pointer-events-none">
          {toasts.map((toastItem) => (
            <Toast
              key={toastItem.id}
              variant={toastItem.variant}
              onClose={() => removeToast(toastItem.id)}
              className={toastItem.isRemoving ? "opacity-0 transition-opacity duration-300" : "opacity-100 transition-opacity duration-300"}
            >
              <div className="grid gap-1">
                {toastItem.title && <ToastTitle>{toastItem.title}</ToastTitle>}
                {toastItem.description && (
                  <ToastDescription>{toastItem.description}</ToastDescription>
                )}
              </div>
            </Toast>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { Toast, ToastTitle, ToastDescription }

