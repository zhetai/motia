'use client';

import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/app/layout.config';
import { PAGE_CONTENT } from './constants';
import { FormspreeProvider } from '@formspree/react';

// Components
import { PageHeader } from './components/PageHeader';
import { ContactContainer } from './components/ContactContainer';
import { ContactMethods } from './components/ContactMethods';
import { Footer } from './components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <HomeLayout 
        {...baseOptions} 
        className="flex-1 pb-4 lg:pt-32 sm:pt-20 bg-gradient-to-b from-[#0E002D] to-[#2F0093]"
      >
        <FormspreeProvider project="mqaerbdp">
          <div className="container mx-auto px-4 py-16 max-w-5xl">
            <PageHeader 
              title={PAGE_CONTENT.TITLE}
              description={PAGE_CONTENT.DESCRIPTION}
            />

            <ContactContainer />

            <ContactMethods />
          </div>

          <Footer />
        </FormspreeProvider>
      </HomeLayout>
    </div>
  );
} 