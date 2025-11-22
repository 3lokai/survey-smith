'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles } from 'lucide-react';
import { SignedIn, SignedOut, UserButton } from "@daveyplate/better-auth-ui";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground group-hover:bg-primary-hover transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground tracking-tight">SurveySmith</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/generate" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Generate
            </Link>
            <Link 
              href="/view" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              View Surveys
            </Link>
          </nav>

          {/* CTA Button / Auth */}
          <div className="flex items-center space-x-4">
            <SignedOut>
              <Link href="/auth/sign-in">
                <Button size="sm" variant="ghost" className="hidden sm:flex">
                  Sign In
                </Button>
              </Link>
              <Link href="/generate">
                <Button size="sm" className="hidden sm:flex">
                  <FileText className="w-4 h-4 mr-2" />
                  Get Started
                </Button>
              </Link>
              <Link href="/generate">
                <Button size="sm" className="sm:hidden">
                  <FileText className="w-4 h-4" />
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  );
}

