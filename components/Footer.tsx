import Link from 'next/link';
import { Sparkles, FileText, Home, Eye } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground group-hover:bg-primary-hover transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground tracking-tight">SurveySmith</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Generate unbiased, research-grade surveys using AI. Perfect for market research and data collection.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/generate" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Survey</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/view" 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Surveys</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">Features</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>AI-Powered Generation</li>
              <li>Bias-Free Questions</li>
              <li>Multiple Question Types</li>
              <li>Export to Google Forms</li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4">About</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>Research-Grade Surveys</li>
              <li>Built for Marketers</li>
              <li>Powered by Google Gemini</li>
              <li>Open & Transparent</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} SurveySmith. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>Made with ❤️ for researchers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

