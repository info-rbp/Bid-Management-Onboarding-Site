import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { 
  Zap, 
  ArrowRight
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <Logo />
        <nav className="flex items-center gap-4">
          <Button asChild variant="default" className="bg-primary hover:bg-primary/90 rounded-full px-6">
            <Link href="/onboarding">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 py-16 lg:py-24 lg:px-20 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-primary border border-primary/10">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Streamlined Partnership</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-headline font-bold text-foreground leading-tight tracking-tight">
              A Frictionless Path to <span className="text-primary">Bid Excellence</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              We've automated the onboarding process so you can focus on winning. From secure payment to workspace provisioning, your journey starts here.
            </p>
            <div className="flex flex-col sm:row gap-4">
              <Button asChild size="lg" className="bg-primary text-white h-14 px-10 rounded-xl text-lg group shadow-lg shadow-primary/20">
                <Link href="/onboarding">
                  Start Your Onboarding <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-accent/10 rounded-3xl blur-2xl -z-10 animate-pulse" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <Image 
                src={heroImage?.imageUrl || 'https://picsum.photos/seed/bid1/800/600'} 
                alt={heroImage?.description || 'Professional office environment'} 
                width={800} 
                height={600}
                className="w-full h-auto object-cover"
                data-ai-hint="business office"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 lg:px-20 bg-background border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Bid Management Services provided by Remote Business Partner
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-sm font-medium text-muted-foreground hover:text-primary">Terms</Link>
            <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
