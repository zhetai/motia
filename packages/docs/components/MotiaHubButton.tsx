'use client'
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import Typography from "@/components/Typography";
import {SignupForm} from "@/app/(home)/components/SignupForm";
import {useForm} from "@formspree/react";
import {useEffect} from "react";

function MotiaHubButton() {
  const [state, handleSubmit, reset] = useForm('mqaerbdp')

  useEffect(() => {
    if (state.succeeded) {
      const timer = setTimeout(() => {
        reset()
      }, 10 * 1000)

      return () => clearTimeout(timer)
    }
  }, [state.succeeded, reset])

  return (
    <Dialog>
      <DialogTrigger>
        <div className="flex items-center gap-2">
          MotiaHub
          <span
            className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        Request Access
      </span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            <Typography variant="title" className="mb-4">
              Be the First to Try MotiaHub
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <Typography variant="description" className="max-w-2xl mx-auto" as={"p"}>
          MotiaHub powers motia agents with seamless deployment, logging, and insights—all in one platform. Reserve
          your beta access
        </Typography>

        <div className="w-full max-w-7xl mx-auto py-16 px-4">
          <div className="max-w-md mx-auto">
            <SignupForm handleSubmit={handleSubmit} state={state}/>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


export default MotiaHubButton;