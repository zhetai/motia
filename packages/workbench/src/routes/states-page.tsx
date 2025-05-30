import { States } from '@/components/states/states'

export const StatesPage = () => {
  return (
    <div className="w-full h-full overflow-hidden bg-background text-foreground">
      <header className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">State details</h1>
        <span className="text-sm text-muted-foreground">Check all states saved locally along with all fields</span>
      </header>
      <States />
    </div>
  )
}
