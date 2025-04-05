'use client';

import {FaCheck, FaClipboard} from 'react-icons/fa';
import {useCopyToClipboard} from "@/hooks/useCopyToClipboard";

interface CommandDisplayProps {
  command: string;
  className?: string;
}

export default function CommandDisplay({
                                         command,
                                         className = ''
                                       }: CommandDisplayProps) {
  const {copied, copyToClipboard} = useCopyToClipboard("npx motia@latest create -n new-project");

  return (
    <button
      onClick={copyToClipboard}
      className={`relative group inline-flex items-center transparent text-gray-100 font-mono text-sm sm:text-base px-4 py-2 rounded-md border border-purple-500 pr-8 ${className}`}>
      <span>{command}</span>

      <div
        className="
          absolute 
          right-3 
          opacity-0 
          group-hover:opacity-100 
          transition-opacity 
          duration-200
          flex 
          items-center
          justify-center
        "
        aria-label="Copy to clipboard"
      >
        {copied ?
          <FaCheck className="h-[16px] w-[16px] text-gray-300 hover:text-white"/> :
          <FaClipboard className="h-[16px] w-[16px] text-gray-300 hover:text-white"/>
        }
      </div>
    </button>
  );
} 