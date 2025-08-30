"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, MessageCircle, Twitter, Copy, ChevronDown } from "lucide-react";

export type SharingMethod = 'email' | 'whatsapp' | 'twitter' | 'copy';

interface SharingMethodSelectProps {
  value: SharingMethod;
  onChange: (method: SharingMethod) => void;
  disabled?: boolean;
}

const sharingOptions = [
  {
    id: 'email' as SharingMethod,
    label: 'Email',
    description: 'Secure delivery to recipient\'s inbox',
    icon: Mail,
    gradient: 'from-blue-500 to-blue-600',
  },
  {
    id: 'whatsapp' as SharingMethod,
    label: 'WhatsApp',
    description: 'Share via WhatsApp message',
    icon: MessageCircle,
    gradient: 'from-green-500 to-green-600',
  },
  {
    id: 'twitter' as SharingMethod,
    label: 'Twitter',
    description: 'Share on Twitter/X',
    icon: Twitter,
    gradient: 'from-sky-500 to-sky-600',
  },
  {
    id: 'copy' as SharingMethod,
    label: 'Copy Link',
    description: 'Copy link to share manually',
    icon: Copy,
    gradient: 'from-gray-400 to-gray-500',
  },
];

export function SharingMethodSelect({ value, onChange, disabled = false }: SharingMethodSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = sharingOptions.find(option => option.id === value);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-between bg-black/60 backdrop-blur-lg border border-white/20 rounded-xl h-14 px-4 text-white hover:bg-black/70 hover:border-white/30 disabled:opacity-50 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {selectedOption && (
            <>
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${selectedOption.gradient} flex-shrink-0`} />
              <selectedOption.icon className="h-4 w-4 text-white flex-shrink-0" />
              <span className="font-sora font-medium text-white truncate">{selectedOption.label}</span>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-300 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 w-full z-50 mt-2">
            <div className="bg-black/80 backdrop-blur-xl border border-white/30 rounded-xl p-3 space-y-1 shadow-2xl">
              {sharingOptions.map((option) => (
                <Button
                  key={option.id}
                  type="button"
                  variant="ghost"
                  className="w-full justify-start p-3 hover:bg-white/20 transition-all duration-200 rounded-lg"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.gradient} shadow-sm flex-shrink-0`} />
                    <option.icon className="h-4 w-4 text-white flex-shrink-0" />
                    <div className="text-left flex-1 min-w-0">
                      <div className="font-sora font-medium text-white text-sm truncate">{option.label}</div>
                      <div className="text-xs text-gray-300 font-ibm-plex-mono truncate">{option.description}</div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}