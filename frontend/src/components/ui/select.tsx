import * as React from "react"

import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  open?: boolean
  setOpen?: (open: boolean) => void
}>({})

const Select = ({ children, value, onValueChange, defaultValue }: { children: React.ReactNode; value?: string; onValueChange?: (value: string) => void; defaultValue?: string }) => {
  const [open, setOpen] = React.useState(false)
  const [internalValue, setInternalValue] = React.useState(value || defaultValue || "")

  React.useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value)
    }
  }, [value])

  const handleValueChange = (newValue: string) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleValueChange, open, setOpen }}>
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { value: internalValue, onValueChange: handleValueChange, open, setOpen } as any)
          }
          return child
        })}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string
    open?: boolean
    setOpen?: (open: boolean) => void
  }
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => context.setOpen?.(!context.open)}
      {...props}
    >
      {children}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 opacity-50"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const context = React.useContext(SelectContext)
  return <span>{context.value || placeholder || "Select..."}</span>
}
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean
  }
>(({ className, open, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  if (!context.open && !open) return null
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md top-full mt-1 w-full",
        className
      )}
      {...props}
    />
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string
    onValueChange?: (value: string) => void
  }
>(({ className, value: itemValue, onValueChange, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  const isSelected = context.value === itemValue

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent",
        className
      )}
      onClick={() => context.onValueChange?.(itemValue)}
      {...props}
    >
      {children}
    </div>
  )
})
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue }
