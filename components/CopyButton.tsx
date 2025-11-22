'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
    text: string;
    label: string;
    className?: string;
}

export default function CopyButton({ text, label, className }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            onClick={handleCopy}
            variant={copied ? 'default' : 'outline'}
            className={cn(
                copied && 'bg-(--color-success) text-(--color-success-foreground) border-(--color-success) hover:opacity-90',
                className
            )}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : label}
        </Button>
    );
}
