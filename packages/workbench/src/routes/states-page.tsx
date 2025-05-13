import { States } from '../components/states/states'

export const StatesPage = () => {
  return (
    <div className="w-full h-screen overflow-hidden">
      <header className="p-4 pb-0 border-b border-zinc-800">
        <h1 className="text-xl font-bold">State details</h1>
        <span className="text-sm text-zinc-400">Check all states saved locally along with all fields</span>
      </header>
      <States />
    </div>
  )
}
