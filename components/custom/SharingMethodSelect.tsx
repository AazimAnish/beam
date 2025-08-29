"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    color: 'bg-blue-500',
  },
  {
    id: 'whatsapp' as SharingMethod,
    label: 'WhatsApp',
    description: 'Share via WhatsApp message',
    icon: MessageCircle,
    color: 'bg-green-500',
  },
  {
    id: 'twitter' as SharingMethod,
    label: 'Twitter',
    description: 'Share on Twitter/X',
    icon: Twitter,
    color: 'bg-sky-500',
  },
  {
    id: 'copy' as SharingMethod,
    label: 'Copy Link',
    description: 'Copy link to share manually',
    icon: Copy,
    color: 'bg-gray-500',
  },
];

export function SharingMethodSelect({ value, onChange, disabled = false }: SharingMethodSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = sharingOptions.find(option => option.id === value);

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between border-2 border-black bg-white hover:bg-gray-50 disabled:opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <div className="flex items-center gap-2">
          {selectedOption && (
            <>
              <div className={`w-3 h-3 rounded-full ${selectedOption.color}`} />
              <selectedOption.icon className="h-4 w-4" />
              <span className="font-medium">{selectedOption.label}</span>
            </>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 w-full z-50 mt-1 border-2 border-black bg-white shadow-lg">
          <CardContent className="p-2">
            {sharingOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                variant="ghost"
                className="w-full justify-start p-3 hover:bg-gray-100"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${option.color}`} />
                  <option.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}