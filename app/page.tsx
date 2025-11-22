import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Zap, Shield, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
                Generate unbiased, <br className="hidden sm:block" />
                <span className="text-primary">research-grade surveys</span> in seconds.
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Stop guessing what to ask. Let AI craft the perfect questions for your market research, validated for bias and clarity.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link href="/generate">
                  <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg px-8 py-6">
                    Generate Survey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/view">
                  <Button variant="outline" size="lg" className="rounded-full text-lg px-8 py-6">
                    View Examples
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Why Choose SurveySmith?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create professional surveys that deliver actionable insights.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Generate complete surveys in seconds, not hours. No more staring at blank pages.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Bias-Free</h3>
                <p className="text-sm text-muted-foreground">
                  Every question is validated for bias and clarity. Get research-grade results you can trust.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Multiple Formats</h3>
                <p className="text-sm text-muted-foreground">
                  Export to Markdown or Google Forms JSON. Use your surveys anywhere.
                </p>
              </div>

              <div className="p-6 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Research-Grade</h3>
                <p className="text-sm text-muted-foreground">
                  Built for marketers and researchers. Get questions that deliver real insights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Ready to create your first survey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join marketers and researchers who trust SurveySmith for their data collection needs.
            </p>
            <Link href="/generate">
              <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
