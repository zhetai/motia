import Footer from '@/components/Footer'
import Navbar from '@/components/ui/Navbar'
import { Metadata } from 'next'
import Image from 'next/image'
import bgManifesto from '@/public/images/landing/bgManifestoPage.svg'
import bgManifestoDeclaration from '@/public/images/landing/bgManifestoDeclaration.svg'
import Title from '@/components/Title'
{
  /* eslint-disable react/no-unescaped-entities */
}
export const metadata: Metadata = {
  title: 'Manifesto',
  description:
    'Motia is the missing framework for AI-native software engineering. Discover why the Step is our core primitive.',
  openGraph: {
    title: 'Manifesto',
    description:
      'Motia is the missing framework for AI-native software engineering. Discover why the Step is our core primitive.',
    url: 'https://yourdomain.com/manifesto',
    siteName: 'Motia',
    type: 'article',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Manifesto',
    description:
      'Motia is the missing framework for AI-native software engineering. Discover why the Step is our core primitive.',
  },
}

// Common utility classes
const gradientText = 'font-medium bg-gradient-to-l from-[#5AC5FF] to-[#FFFFFF] bg-clip-text text-transparent'
const gradientTextBlue = 'bg-gradient-to-r from-[#5AC5FF] to-[#C4E5FF] bg-clip-text text-transparent font-medium'
const headingText = 'text-[24px] font-semibold text-white font-tasa'
const normalText = 'text-[18px] text-white/60 leading-[150%] font-sans'
const textBlue = 'text-[#53B4FF]'

export default function ManifestoPage() {
  return (
    <div className="relative flex w-full flex-col items-center bg-black">
      <Navbar />
      <Image src={bgManifesto} alt="Manifesto Glow" aria-hidden className="absolute top-0 right-0 max-w-full" />
      <div className="relative mx-auto w-full max-w-[1200px] pt-[160px] pb-[200px] max-md:px-[16px]">
        <div className="mx-auto w-[660px] max-w-full">
          <Title className="text-center">
            The Future of Software Development is Here, and It Requires a New Framework
          </Title>
        </div>
        <div className="my-[72px] h-[1px] w-full bg-white/20"></div>
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-[40px]">
          <section className={normalText}>
            <p>
              For years, we've witnessed the undeniable truth:
              <span className={gradientText}> every company is becoming a software company.</span> This digital
              transformation has reshaped industries, turning brick-and-mortar businesses into sophisticated software
              engineering firms.
            </p>
          </section>

          <section className={normalText}>
            <p>
              Now, a new, profound shift is occurring, driven by AI and LLMs. These technologies are automating tasks
              previously handled by humans, enabling an unprecedented transition of workflow
              <span className={textBlue}> steps </span> from people to backend systems. While the vast majority of steps
              in an organization,
              <span className={`${gradientText} !bg-linear-to-r`}> 80% to 90%, are still handled by humans,</span> AI's
              reasoning and data manipulation capabilities are changing this. This creates a{' '}
              <span className={`${gradientText} !bg-linear-to-r from-[#5AC5FF] !to-20%`}>
                {' '}
                massive influx of complexity{' '}
              </span>
              into existing software systems.
            </p>
          </section>

          <section className={normalText}>
            <p>
              History teaches us that such complexity necessitates the birth of{' '}
              <span className={gradientText}> new frameworks, paradigms, and platforms. </span> We saw it with the
              transition from PHP spaghetti code to MVC frameworks like Rails, and again with the rise of front-end
              frameworks like React to handle increasingly complex user interfaces.
            </p>
          </section>

          <section className={normalText}>
            <p>
              Now, we are on the precipice of another, perhaps even larger, paradigm shift. Large Language Models/LLMs
              and People using AI are becoming capable of performing tasks previously handled almost exclusively by
              humans, like reasoning about data, combining it, updating it, and moving it through complex workflows.{' '}
              <span className={gradientText}>
                {' '}
                This means a massive influx of workflow steps is moving from human operators to backend systems.{' '}
              </span>
            </p>
          </section>
          <section className={normalText}>
            <p>
              Just as past complexity demanded new frameworks, this AI-driven influx requires a new solution. We've seen
              the emergence of AI agent frameworks, prompted by this shift, but they are not designed for software
              engineers. The current landscape offers disparate, ill-suited tools:
            </p>
          </section>
          <section className={normalText}>
            <ul className="list-disc space-y-[28px]">
              <li>
                <span className={gradientTextBlue}>No/Low Code Solutions</span> (like Zapier, Make, n8n, Gumloop, and
                Lindy) are great for back-office, non-technical users to build integrations, but{' '}
                <span className={gradientText}>they are not for software engineers.</span> Software engineers want
                coding solutions.
              </li>
              <li>
                <span className={gradientTextBlue}>AI/ML Frameworks</span> (like LangGraph, Langchain, Llama Index, and
                DSPY) are built primarily for data scientists and ML engineers who understand model training and
                evaluation metrics.{' '}
                <span className={gradientText}>They are not backend software engineering frameworks.</span>
              </li>
              <li>
                <span className={gradientTextBlue}>Existing AI Agentic Frameworks</span> use prompts as their primary
                control flow mechanism. Controlling workflow by updating and evaluating prompts is{' '}
                <span className="font-medium text-white">not software engineering.</span>
              </li>
            </ul>
          </section>
          <section className={normalText}>
            <p>
              This leaves a <span className={gradientTextBlue}> giant, critical hole.</span> There has been
              <span className={gradientText}>
                {' '}
                no software engineering framework built specifically to handle the influx of AI-driven complexity{' '}
              </span>{' '}
              in backend systems. Furthermore, attempting to integrate existing AI agent frameworks with traditional API
              servers and background/queuing systems creates a broken setup needing{' '}
              <span className={gradientText}>three very different ways to fix linked problems</span>, forcing teams to
              split up or making engineers learn too many things at once.
            </p>
          </section>

          <section className={normalText}>
            <p>
              <span className={gradientTextBlue}>This is why Motia exists.</span> Motia is designed to fill that missing
              piece, providing a <span className="font-medium text-white">software</span>{' '}
              <span className={gradientTextBlue}> engineering framework specifically for this problem. </span> We looked
              at the lessons learned from past paradigm shifts, particularly React's success with its simple core
              primitive.
            </p>
          </section>
          <section
            className={`${normalText} relative overflow-hidden border-l-[3px] border-white bg-[#17181F] p-[32px]`}
          >
            <Image
              src={bgManifestoDeclaration}
              alt="Manifesto Glow"
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 z-0"
            />
            <div className="relative flex flex-col gap-[20px]">
              <h2 className={headingText}>We Declare: The Step is Our Core Primitive</h2>

              <p>
                Drawing inspiration from the power of simple, elegant primitives like React's 'component', Motia
                introduces the <span className="font-medium text-white">"step"</span>. This core concept distills
                complexity into four fundamental, easy-to-understand elements:
              </p>

              <ul className="list-inside list-disc space-y-[30px]">
                <li>
                  <span className="font-medium text-white">Trigger:</span> How the step is initiated (via API, event
                  bus, or scheduled task).
                </li>
                <li>
                  <span className="font-medium text-white">Receives:</span> It accepts input data.
                </li>
                <li>
                  <span className="font-medium text-white">Activates:</span> It performs logic or an action.
                </li>
                <li>
                  <span className="font-medium text-white">Emits:</span> It can output data or trigger other steps.
                </li>
              </ul>

              <p className="mb-[10px]">
                With just these four concepts, software engineers can build anything they need in Motia.
              </p>

              <p className="mb-[18px]">
                But the power of Motia isn't just in its simplicity; it's in what it abstracts away, mirroring React's
                abstraction of the DOM.
              </p>
            </div>
          </section>
          <section className={normalText}>
            <p>
              Setting up powerful, resilient event-based microservice systems is incredibly difficult to do correctly.{' '}
              <span className={gradientTextBlue}>Motia builds this foundation correctly for you</span>, providing the
              necessary resiliency without requiring engineers to worry about the underlying complexity. They can focus
              on building workflows.
            </p>
          </section>

          <section className={normalText}>
            <p>
              We have <span className={gradientTextBlue}>25 years of knowledge</span> about event-based systems and
              microservices. We don't need completely new ways to connect workflows when we have strong patterns already
              created. Motia uses this knowledge to build a unified system that joins the functions previously spread
              across separate API servers, background systems, and AI agent frameworks.
            </p>
          </section>

          <section className={normalText}>
            <p>
              <span className={gradientTextBlue}>Motia is built as a highly scalable enterprise solution.</span> Motia
              solves key problems that other systems miss. It tackles the hidden, but important, challenges that appear
              when growing large codebases and systems—issues that are hard to truly understand without seeing them
              yourself.
            </p>
          </section>

          <section className={normalText}>
            <p>
              A system like Motia is needed and will happen. Whether Motia or another tool finally becomes the main
              choice, a solution that brings these concerns together and gives a clear, developer-focused approach is
              the natural next step in how software building will change with AI.{' '}
              <span className={gradientTextBlue}>Motia is that system.</span>
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  )
}
