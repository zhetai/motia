'use client';

import Link from 'next/link';
import {FaArrowRight, FaGithub, FaUsers} from 'react-icons/fa';
import {useEffect, useRef, useState} from 'react';
import Typography from '@/components/Typography';
import CommandDisplay from './CommandDisplay';
import {trackTwitterEvent} from '@/app/utils/tracking';

export default function GetStartedSection() {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});
  const sectionRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const glowElement = glowRef.current;
    if (!section || !glowElement) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      requestAnimationFrame(() => {
        glowElement.style.left = `${x}px`;
        glowElement.style.top = `${y}px`;
      });

      setMousePosition({x, y});
    };

    section.addEventListener('mouseenter', handleMouseEnter);
    section.addEventListener('mouseleave', handleMouseLeave);
    section.addEventListener('mousemove', handleMouseMove);

    return () => {
      section.removeEventListener('mouseenter', handleMouseEnter);
      section.removeEventListener('mouseleave', handleMouseLeave);
      section.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="w-full max-w-7xl mx-auto py-10 px-4 flex flex-col items-center relative overflow-hidden"
    >
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          isHovering ? 'opacity-20' : 'opacity-0'
        }`}
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0, 0, 0, 0.9) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          transform: isHovering ? 'scale(1.05)' : 'scale(0.9)',
          transition: 'opacity 1000ms ease, transform 1000ms ease',
        }}
      />

      <div
        ref={glowRef}
        className={`absolute pointer-events-none ${isHovering ? 'opacity-100' : 'opacity-0'}`}
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 30%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
          transition: 'opacity 0.5s ease',
          mixBlendMode: 'soft-light',
          filter: 'blur(8px)',
          willChange: 'left, top',
        }}
      />

      <div className="text-center mb-12 relative z-10">
        <Typography
          variant="title"
          as="h2"
          className="mb-6"
        >
          Get started
        </Typography>
        <Typography
          variant="description"
          as="p"
          className="max-w-2xl mx-auto"
        >
          Write in any language. Automate anything. From AI agents to backend automation,
          Motia runs event-driven workflows with zero overhead.
        </Typography>
      </div>

      <div className="mb-12 relative z-10 flex justify-center">
        <CommandDisplay
          command="npx motia@latest create -n new-project"
        />
      </div>

      <div className="flex gap-4 mb-16 relative z-10">
        <Link
          href="/docs/getting-started"
          className="bg-white text-purple-900 py-3 px-6 rounded-md transition-colors duration-300 font-dm-mono hover:scale-105 active:scale-95"
        >
          Start building
        </Link>
        <Link
          href="/contact"
          onClick={() => trackTwitterEvent('contact_us_click')}
          className="bg-transparent border border-purple-500 text-white py-3 px-6 rounded-md hover:bg-purple-900 transition font-dm-mono hover:scale-105 active:scale-95"
        >
          Contact us
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10">
        <Link
          href="https://github.com/MotiaDev/motia"
          target="_blank"
          rel="noopener noreferrer"
          className="backdrop-blur-sm rounded-md p-4 flex flex-col h-full border border-[rgba(255,255,255,0.21)] hover:border-purple-700/40 transition-all group"
        >
          <div className="p-3 rounded-lg mr-4 flex items-center justify-center w-12 h-12">
            <FaGithub className="text-white text-2xl"/>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="text-2xl font-bold text-white mb-4">Contribute to Github</h3>
            <div className="mt-auto flex justify-between w-full">
              <p className="text-white/70 mb-6 text-sm">Share flows and debug together</p>
              <div className="text-white/60 group-hover:text-white transition-colors">
                <FaArrowRight className="h-5 w-5"/>
              </div>
            </div>
          </div>
        </Link>

        <Link
          href="https://discord.com/channels/1322278831184281721/1323378241641123952"
          className="backdrop-blur-sm rounded-md p-4 flex flex-col h-full border border-[rgba(255,255,255,0.21)] hover:border-purple-700/40 transition-all group"
        >
          <div className="p-3 rounded-lg mr-4 flex items-center justify-center w-12 h-12">
            <FaUsers className="text-white text-2xl"/>
          </div>
          <div className="flex flex-col items-start">
            <h3 className="text-2xl font-bold text-white mb-4">Join the community</h3>
            <div className="mt-auto flex justify-between w-full">
              <p className="text-white/70 mb-6 text-sm">Share flows and debug together</p>
              <div className="text-white/60 group-hover:text-white transition-colors">
                <FaArrowRight className="h-5 w-5"/>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
} 