'use client'

import { FormEvent } from 'react'
import { FieldValues, SubmissionError, SubmissionSuccess } from '@formspree/core'
import { ValidationError } from '@formspree/react'
import { ArrowRight } from 'lucide-react'
import { BiLoaderAlt } from 'react-icons/bi'
import { FORM_CONTENT } from '../constants'

interface FormState<T extends FieldValues> {
  errors: SubmissionError<T> | null;
  result: SubmissionSuccess | null;
  submitting: boolean;
  succeeded: boolean;
}

interface ContactFormProps {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  state: FormState<FieldValues>;
}

export const ContactForm = ({ handleSubmit, state }: ContactFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {FORM_CONTENT.NAME.LABEL}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder={FORM_CONTENT.NAME.PLACEHOLDER}
          />
          <ValidationError prefix={FORM_CONTENT.NAME.LABEL} field="name" errors={state.errors} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {FORM_CONTENT.EMAIL.LABEL}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            placeholder={FORM_CONTENT.EMAIL.PLACEHOLDER}
          />
          <ValidationError prefix={FORM_CONTENT.EMAIL.LABEL} field="email" errors={state.errors} />
        </div>
      </div>
      <div>
        <label htmlFor="company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {FORM_CONTENT.COMPANY.LABEL}
        </label>
        <input
          type="text"
          id="company"
          name="company"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder={FORM_CONTENT.COMPANY.PLACEHOLDER}
        />
        <ValidationError prefix={FORM_CONTENT.COMPANY.LABEL} field="company" errors={state.errors} />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {FORM_CONTENT.MESSAGE.LABEL}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
          placeholder={FORM_CONTENT.MESSAGE.PLACEHOLDER}
        />
        <ValidationError prefix={FORM_CONTENT.MESSAGE.LABEL} field="message" errors={state.errors} />
      </div>
      <ValidationError errors={state.errors} />
      <div>
        <button
          type="submit"
          disabled={state.submitting}
          className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
        >
          {state.submitting ? (
            <>
              <BiLoaderAlt className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              {FORM_CONTENT.SUBMIT.SENDING}
            </>
          ) : (
            <>
              {FORM_CONTENT.SUBMIT.BUTTON}
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
