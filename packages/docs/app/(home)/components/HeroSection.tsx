import Link from 'next/link'
import styles from '../page.module.css'
import Typography from '@/components/Typography'
import CommandDisplay from './CommandDisplay'
import Image from 'next/image'
import illustration from './images/Illustration.png'

export default function HeroSection() {
  return (
    <div
      className={
        'w-full max-w-7xl mx-auto flex flex-col md:flex-row py-10 px-4 gap-12 items-start relative ' +
        styles.firstSection
      }
    >
      <Image
        alt="illustration"
        src={illustration}
        placeholder="blur"
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 85vw, (max-width: 1024px) 75vw, 1280px"
        priority
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      <div className="md:w-1/2 flex flex-col justify-center relative overflow-hidden z-10">
        <Typography variant="title" as="h1" className="mb-6 relative z-10 text-left">
          AI Agent Framework
          <br/>
          for Software Engineers
        </Typography>
      </div>
      <div className="md:w-1/2 flex flex-col justify-center items-end z-10">
        <div>
          <Typography variant="description" as="p" className="mb-4 max-w-md text-left">
            Write in any language. Automate anything. From AI agents to backend automation, Motia runs event-driven
            workflows with zero overhead.
          </Typography>

          <CommandDisplay
            command="npx motia@latest create -n new-project"
            className="mb-8"
          />

          <div className="flex gap-4">
            <Link
              href="/docs/getting-started"
              className="bg-white text-purple-900 py-3 px-6 rounded-md hover:scale-105 active:scale-95 transition-colors duration-300 font-dm-mono"
            >
              Start building
            </Link>
            <Link
              href="/docs"
              className="bg-transparent border border-purple-500 text-white py-3 px-6 rounded-md hover:scale-105 active:scale-95 transition-colors duration-300 font-dm-mono"
            >
              Docs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
