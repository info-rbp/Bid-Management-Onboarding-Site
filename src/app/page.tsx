import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { ShieldCheck, Zap, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Logo />
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="#process" className="text-sm font-medium hover:text-primary transition-colors">The Process</Link>
          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 rounded-full px-6">
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-32 lg:px-20 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-primary border border-primary/10">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Strategic Onboarding</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-headline font-bold text-foreground leading-tight tracking-tight">
              Scale Your Bid Success with <span className="text-primary">BidFlow Connect</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg font-body">
              Automated onboarding and secure payment processing integrated directly with your Google Workspace. Built for modern bid management partners.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary text-white h-14 px-10 rounded-xl text-lg group shadow-lg shadow-primary/20">
                <Link href="/onboarding">
                  Start Onboarding <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-10 rounded-xl text-lg border-2">
                View Pricing
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl -z-10 animate-pulse" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src={heroImage?.imageUrl || ''} 
                alt={heroImage?.description || ''} 
                width={1200} 
                height={800}
                className="w-full h-auto object-cover"
                data-ai-hint="business office"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-24 px-6 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-6">Built for Efficiency</h2>
              <p className="text-muted-foreground font-body">Our platform bridges the gap between payment and production, ensuring your clients are ready to succeed from day one.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <ShieldCheck className="w-8 h-8 text-primary" />,
                  title: "Secure Payments",
                  desc: "Integrated Stripe processing ensures all transactions are secure, compliant, and tracked automatically."
                },
                {
                  icon: <Globe className="w-8 h-8 text-accent" />,
                  title: "Workspace Integration",
                  desc: "Automatically provision Google Workspace accounts, folders, and shared resources for new clients."
                },
                {
                  icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
                  title: "Guided Workflow",
                  desc: "A frictionless step-by-step onboarding process that eliminates client confusion and data gaps."
                }
              ].map((feature, i) => (
                <div key={i} className="p-10 rounded-3xl bg-background border border-border/50 hover:border-primary/20 transition-all hover:shadow-xl group">
                  <div className="mb-6 p-4 rounded-2xl bg-white w-fit shadow-sm group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-headline font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground font-body leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 lg:px-20 bg-background border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-sm text-muted-foreground font-body">
            © {new Date().getFullYear()} BidFlow Connect. A subsidiary of Remote Business Partner.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
