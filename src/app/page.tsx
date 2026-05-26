import { Logo } from '@/components/brand/Logo';
import {
  Zap,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { StartOnboardingButton } from '@/components/home/StartOnboardingButton';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');

  return (
    <div className="min-h-screen flex flex-col font-body">
      <header className="px-6 lg:px-20 h-20 flex items-center justify-between border-b bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex-1">
          <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/onboarding-process" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">Onboarding Process</Link>
          <Link href="/document-requirements" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">Documents Requirements</Link>
          <Link href="/faqs" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">FAQ's</Link>
          <Link href="/next-steps" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">Next Steps</Link>
        </nav>
        <div className="flex-1 hidden md:flex justify-end">
          <Link href="/auth" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">Client Login</Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 py-16 lg:py-24 lg:px-20 grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 text-primary border border-primary/10">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold uppercase tracking-wider">Streamlined Partnership</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-headline font-bold text-foreground leading-tight tracking-tight">
              Let's Get Moving On Your <span className="text-primary">Bid Management</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              We have automated our onboarding process to make life easier. The process will take approximately 45 minutes, so make sure you have enough time to complete it carefully.
            </p>
            <div className="flex flex-col sm:row gap-4">
              <StartOnboardingButton />
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
            <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}