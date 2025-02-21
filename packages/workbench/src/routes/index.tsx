import { Button } from '../components/ui/button'

export const Index = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen gap-10 bg-gradient-to-r from-black to-gray-900">
      <h1 className="text-5xl font-extrabold max-w-[600px] text-center">
        Code-first framework for intelligent workflows
      </h1>

      <div className="max-w-[600px] text-center text-xl font-medium text-gray-400">
        Write in any language. Automate anything. From AI agents to backend automation, Motia runs event-driven
        workflows with zero overhead.
      </div>

      <div className="p-[1px] min-w-[600px] rounded-lg shadow-[0px_7px_14px_0px_rgba(7,0,23,0.98),0px_26px_26px_0px_rgba(7,0,23,0.85),0px_59px_35px_0px_rgba(7,0,23,0.5),0px_105px_42px_0px_rgba(7,0,23,0.15),0px_164px_46px_0px_rgba(7,0,23,0.02)]">
        <div className="rounded-lg bg-black p-8 font-semibold text-xl min-h-[100px] flex items-center">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-[rgb(0,117,255)]">$</span>
            <span className="text-white">npx motia generate step</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 items-center">
        <span className="text-gray-400 text-xl">or</span>
        <a href="https://motia.dev/docs" target="_blank">
          <Button size="lg" className="text-xl py-6 px-8">
            Read developer docs
          </Button>
        </a>
      </div>
    </div>
  )
}
