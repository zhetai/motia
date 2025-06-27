import {
  forwardRef,
  HTMLAttributes,
  useState,
  createContext,
  useContext,
  useCallback,
  Dispatch,
  SetStateAction,
} from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button.tsx'
import { ChevronDown } from 'lucide-react'

interface ContainerContextType {
  expanded: boolean
  setExpanded: Dispatch<SetStateAction<boolean>>
}

const ContainerContext = createContext<ContainerContextType | null>(null)

const useContainerContext = () => {
  const context = useContext(ContainerContext)
  if (!context) {
    throw new Error('Container components must be used within a Container')
  }
  return context
}

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  defaultExpanded?: boolean
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, defaultExpanded = true, children, ...props }, ref) => {
    const [expanded, setExpanded] = useState<boolean>(defaultExpanded)

    return (
      <ContainerContext.Provider value={{ expanded, setExpanded }}>
        <div
          ref={ref}
          className={cn(
            'border border-border text-foreground rounded-lg overflow-hidden flex flex-col h-full',
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </ContainerContext.Provider>
    )
  },
)
Container.displayName = 'Container'

const containerHeaderVariants = cva('w-full bg-card flex min-h-10 items-center', {
  variants: {
    variant: {
      default: 'px-5 py-2 items-center',
      tabs: 'p-0',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const ContainerHeader = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof containerHeaderVariants>
>(({ className, variant, children, ...props }, ref) => {
  const { expanded, setExpanded } = useContainerContext()

  const onClick = useCallback(() => {
    setExpanded((state: boolean) => !state)
  }, [])

  return (
    <div ref={ref} className={cn(containerHeaderVariants({ variant, className }))} {...props}>
      {children}
      <div className="flex-1"></div>
      <Button variant="ghost" size="icon" className="rounded-full mr-2" onClick={onClick}>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', {
            '-rotate-90': !expanded,
          })}
        />
      </Button>
    </div>
  )
})
ContainerHeader.displayName = 'ContainerHeader'

export const ContainerContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { expanded } = useContainerContext()

    return (
      <div
        ref={ref}
        className={cn(
          'flex-1 overflow-auto bg-default border-border border-t transition-all duration-300',
          {
            'max-h-0 opacity-0': !expanded,
            'max-h-[100vh] opacity-100': expanded,
          },
          className,
        )}
        {...props}
      />
    )
  },
)
ContainerContent.displayName = 'ContainerContent'
