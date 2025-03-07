'use client';

import { FaClipboard, FaCheck } from 'react-icons/fa';

interface CommandDisplayProps {
  command: string;
  copied: boolean;
  onCopy: () => void;
  className?: string;
}

export default function CommandDisplay({ 
  command, 
  copied, 
  onCopy, 
  className = '' 
}: CommandDisplayProps) {
  return (
    <button onClick={onCopy} className={`w-[342px] rounded-md [background:linear-gradient(180deg,rgb(52.65,21.36,119.16)_0%,rgba(53,21,119,0)_100%)] h-8 relative ${className}`}>
      <p className="absolute top-2.5 left-[38px] font-mono font-normal text-[#cdbcf0] text-[11px] text-center tracking-[-0.99px] leading-[13.2px] whitespace-nowrap">
        {command}
      </p>
      
      <div 
        aria-label={copied ? "Copied" : "Copy to clipboard"}
        className="absolute w-5 h-5 top-1 left-1.5 bg-[#050013] rounded-[3.93px] shadow-[0px_0.71px_1.43px_#000000fa,0px_2.86px_2.86px_#000000d9,0px_6.43px_3.93px_#00000080,0px_11.43px_4.64px_#00000026,0px_17.86px_5px_#00000005] flex items-center justify-center"
      >
        {copied ? 
          <FaCheck className="w-2 h-2" /> : 
          <FaClipboard className="w-2 h-2" />
        }
      </div>
    </button>
  );
} 