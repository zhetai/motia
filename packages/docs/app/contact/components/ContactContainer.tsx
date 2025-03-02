'use client';

import { useForm } from '@formspree/react';
import { ContactForm } from './ContactForm';
import { SuccessMessage } from './SuccessMessage';

export const ContactContainer = () => {
  const [state, handleSubmit, reset] = useForm('mqaerbdp');

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 md:p-12">
      {state.succeeded ? (
        <SuccessMessage onReset={() => reset()} />
      ) : (
        <ContactForm handleSubmit={handleSubmit} state={state} />
      )}
    </div>
  );
} 