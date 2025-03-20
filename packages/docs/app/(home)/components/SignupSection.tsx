'use client'

import { useForm } from '@formspree/react'
import Typography from '@/components/Typography'
import { SignupForm } from './SignupForm'
import { useEffect } from 'react'

export default function SignupSection() {
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
    <div className="w-full max-w-7xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <Typography variant="title" as="h2" className="mb-4">
          Be the First to Try MotiaHub
        </Typography>
        <Typography variant="description" as="p" className="max-w-2xl mx-auto">
          MotiaHub powers motia agents with seamless deployment, logging, and insights—all in one platform. Reserve your
          beta access
        </Typography>
      </div>

      <div className="max-w-md mx-auto">
        <SignupForm handleSubmit={handleSubmit} state={state} />
      </div>
    </div>
  )
}
