import * as React from "react"

import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false)

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block text-left">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Check if it's a DropdownMenuTrigger by comparing displayName or type
            if (child.type === DropdownMenuTrigger || (child.type as any)?.displayName === 'DropdownMenuTrigger') {
              return React.cloneElement(child, { open, setOpen } as any)
            }
            // Check if it's a DropdownMenuContent
            if (child.type === DropdownMenuContent || (child.type as any)?.displayName === 'DropdownMenuContent') {
              return open ? React.cloneElement(child, { open, setOpen } as any) : null
            }
          }
          return child
        })}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    open?: boolean
    setOpen?: (open: boolean) => void
    asChild?: boolean
  }
>(({ className, children, open, setOpen, asChild, onClick, ...props }, ref) => {
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen?.(!open)
    onClick?.(e as any)
  }

  if (asChild && React.isValidElement(children)) {
    const childProps = children.props as any
    // Check if it's a native button element or a button-like component
    const isButton = children.type === 'button' || 
                    (typeof children.type === 'string' && children.type.toLowerCase() === 'button') ||
                    (children.type as any)?.displayName === 'Button'
    
    if (isButton) {
      // If it's already a button, merge props directly without wrapping
      return React.cloneElement(children, {
        ref,
        onClick: (e: React.MouseEvent) => {
          handleClick(e)
          if (childProps.onClick) {
            childProps.onClick(e)
          }
        },
        className: cn(className, childProps.className),
        ...props,
      } as any)
    } else {
      // If it's not a button, wrap it in a button
      return (
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          className={cn(className, childProps.className)}
          {...props}
        >
          {children}
        </button>
      )
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-popover border border-border z-50",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-4 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center",
        className
      )}
      {...props}
    />
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("h-px bg-border my-1", className)}
      {...props}
    />
  )
})
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}

