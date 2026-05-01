import React from 'react';
import { Briefcase } from 'lucide-react';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 font-headline font-bold text-primary ${className}`}>
      <div className="bg-primary p-1.5 rounded-lg">
        <Briefcase className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      <span className="tracking-tight text-xl">Bid <span className="text-accent">Manager</span></span>
    </div>
  );
}
