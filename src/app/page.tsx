import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { 
  ShieldCheck, 
  Zap, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  LayoutDashboard, 
  Users,
  MousePointerClick
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const paymentImage = PlaceHolderImages.find(img => img.id === 'payment-secure');
  const workspaceImage = PlaceHolderImages.find(img => img.id === 'google-workspace');

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

        {/* Process Overview */}
        <section className="bg-white py-24 px-6 lg:px-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-3xl lg:text-4xl font-headline font-bold mb-6">How Your Journey Begins</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Our four-step automated process ensures you are ready to collaborate with our bid experts in minutes, not days.</p>
            </div>

            <div className="space-y-24">
              {/* Step 1 */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/20">1</div>
                  <h3 className="text-2xl font-headline font-bold">Choose Your Strategy</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Select the service tier that matches your bidding volume. Whether you're a growing team or a high-volume enterprise, we have a plan designed for your success.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Flexible tier options
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Transparent monthly pricing
                    </li>
                  </ul>
                </div>
                <div className="flex-1 rounded-3xl overflow-hidden bg-secondary/30 p-8 flex items-center justify-center border border-border/50">
                  <MousePointerClick className="w-32 h-32 text-primary/40" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-accent/20">2</div>
                  <h3 className="text-2xl font-headline font-bold">Secure Stripe Integration</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Complete your subscription securely. We use Stripe to handle all financial data, ensuring PCI compliance and absolute security for your business.
                  </p>
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border/50 w-fit">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-widest">PCI Level 1 Secure</span>
                  </div>
                </div>
                <div className="flex-1 relative">
                  <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                    <Image 
                      src={paymentImage?.imageUrl || 'https://picsum.photos/seed/pay/800/500'} 
                      alt="Secure Payment Processing" 
                      width={800} 
                      height={500}
                      className="w-full h-auto object-cover"
                      data-ai-hint="secure payment"
                    />
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20">3</div>
                  <h3 className="text-2xl font-headline font-bold">Automated Workspace Provisioning</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Connect your Google account and let our system do the heavy lifting. We automatically create dedicated Shared Drives, project calendars, and collaborative folders for your team.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Dedicated Shared Drives
                    </li>
                    <li className="flex items-center gap-3 text-sm font-medium">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Automated permissions management
                    </li>
                  </ul>
                </div>
                <div className="flex-1 relative">
                  <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                    <Image 
                      src={workspaceImage?.imageUrl || 'https://picsum.photos/seed/work/800/500'} 
                      alt="Google Workspace Integration" 
                      width={800} 
                      height={500}
                      className="w-full h-auto object-cover"
                      data-ai-hint="digital workspace"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                <div className="flex-1 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-green-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-green-500/20">4</div>
                  <h3 className="text-2xl font-headline font-bold">Real-time Bid Management</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Gain immediate access to your dashboard. Monitor tender progress, track win rates, and collaborate directly with your dedicated bid partners in your new workspace.
                  </p>
                  <Button asChild variant="outline" className="rounded-xl border-2">
                    <Link href="/onboarding">Ready to Start?</Link>
                  </Button>
                </div>
                <div className="flex-1 rounded-3xl overflow-hidden bg-secondary/30 p-12 flex flex-col items-center justify-center border border-border/50 text-center gap-4">
                  <LayoutDashboard className="w-20 h-20 text-green-500/40" />
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Dashboard Active</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-primary py-20 px-6 lg:px-20 text-white text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-headline font-bold">Ready to win more bids?</h2>
            <p className="text-xl opacity-90">Join the elite organizations using Bid Manager to streamline their strategic bidding operations.</p>
            <Button asChild size="lg" variant="secondary" className="h-16 px-12 rounded-2xl text-xl font-bold hover:scale-105 transition-transform">
              <Link href="/onboarding">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="px-6 py-12 lg:px-20 bg-background border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Bid Manager. A subsidiary of Remote Business Partner.
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
