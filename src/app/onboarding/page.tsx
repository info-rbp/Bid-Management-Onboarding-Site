
"use client";

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard, 
  User, 
  Building2, 
  Cloud,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type Step = 'welcome' | 'plan' | 'payment' | 'details' | 'google' | 'complete';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('welcome');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState({
    plan: 'professional',
    fullName: '',
    email: '',
    company: '',
    industry: '',
    googleAccount: '',
  });

  const stepsOrder: Step[] = ['welcome', 'plan', 'payment', 'details', 'google', 'complete'];

  useEffect(() => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    setProgress(((currentIndex + 1) / stepsOrder.length) * 100);
  }, [currentStep]);

  const handleNext = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex < stepsOrder.length - 1) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCurrentStep(stepsOrder[currentIndex + 1]);
        setLoading(false);
      }, 800);
    }
  };

  const handleBack = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepsOrder[currentIndex - 1]);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-3xl font-headline font-bold">Welcome to BidFlow</h2>
              <p className="text-muted-foreground text-lg">Let's get your bid management partnership started. This process will take about 5 minutes.</p>
            </div>
            <div className="grid gap-4 mt-8">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">1</div>
                <div>
                  <h4 className="font-semibold">Choose Your Plan</h4>
                  <p className="text-sm text-muted-foreground">Select the service level that fits your business needs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">2</div>
                <div>
                  <h4 className="font-semibold">Secure Payment</h4>
                  <p className="text-sm text-muted-foreground">Integrated Stripe checkout for seamless processing.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-border">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">3</div>
                <div>
                  <h4 className="font-semibold">Workspace Setup</h4>
                  <p className="text-sm text-muted-foreground">Automated Google Workspace resource provisioning.</p>
                </div>
              </div>
            </div>
            <Button onClick={handleNext} className="w-full h-14 rounded-xl text-lg font-semibold bg-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Start Onboarding"}
            </Button>
          </div>
        );

      case 'plan':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Select Service Tier</h2>
              <p className="text-muted-foreground">Choose the plan that aligns with your bidding volume.</p>
            </div>
            <RadioGroup 
              defaultValue={formData.plan} 
              onValueChange={(v) => setFormData({...formData, plan: v})}
              className="grid gap-4"
            >
              <div className="relative">
                <RadioGroupItem value="essential" id="essential" className="peer sr-only" />
                <Label
                  htmlFor="essential"
                  className="flex flex-col p-6 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/50 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">Essential</span>
                    <span className="text-xl font-bold text-primary">$499<span className="text-sm text-muted-foreground">/mo</span></span>
                  </div>
                  <span className="text-sm text-muted-foreground">Perfect for small teams and occasional bidding.</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="professional" id="professional" className="peer sr-only" />
                <Label
                  htmlFor="professional"
                  className="flex flex-col p-6 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/50 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">Professional</span>
                      <span className="bg-accent text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Popular</span>
                    </div>
                    <span className="text-xl font-bold text-primary">$999<span className="text-sm text-muted-foreground">/mo</span></span>
                  </div>
                  <span className="text-sm text-muted-foreground">Strategic support for active bidding pipelines.</span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem value="enterprise" id="enterprise" className="peer sr-only" />
                <Label
                  htmlFor="enterprise"
                  className="flex flex-col p-6 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/50 transition-all"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">Enterprise</span>
                    <span className="text-xl font-bold text-primary">Custom</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Full-service bid office for high-volume organizations.</span>
                </Label>
              </div>
            </RadioGroup>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">Back</Button>
              <Button onClick={handleNext} className="flex-[2] h-12 rounded-xl bg-primary" disabled={loading}>
                Continue to Payment
              </Button>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Complete Subscription</h2>
              <p className="text-muted-foreground">Secure payment processing via Stripe.</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-2xl border space-y-6">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan selected: <span className="capitalize">{formData.plan}</span></span>
                <span className="font-bold">{formData.plan === 'professional' ? '$999.00' : formData.plan === 'essential' ? '$499.00' : 'Contact Us'}</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Information</Label>
                  <div className="relative">
                    <Input placeholder="0000 0000 0000 0000" className="pl-10 h-12" />
                    <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry</Label>
                    <Input placeholder="MM/YY" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input placeholder="123" className="h-12" />
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Your payment is processed securely by Stripe. We do not store your credit card details.
              </p>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">Back</Button>
              <Button onClick={handleNext} className="flex-[2] h-12 rounded-xl bg-accent text-white" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Pay and Continue"}
              </Button>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Business Details</h2>
              <p className="text-muted-foreground">Tell us a bit about your organization.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <Input 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="John Doe" 
                    className="pl-10 h-12" 
                  />
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Work Email</Label>
                <Input 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  type="email" 
                  placeholder="john@company.com" 
                  className="h-12" 
                />
              </div>
              <div className="space-y-2">
                <Label>Company Name</Label>
                <div className="relative">
                  <Input 
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    placeholder="Acme Bid Corp" 
                    className="pl-10 h-12" 
                  />
                  <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">Back</Button>
              <Button 
                onClick={handleNext} 
                className="flex-[2] h-12 rounded-xl bg-primary" 
                disabled={loading || !formData.company || !formData.email}
              >
                Set Up Workspace
              </Button>
            </div>
          </div>
        );

      case 'google':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2">
                <Cloud className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-2xl font-headline font-bold">Workspace Integration</h2>
              <p className="text-muted-foreground">Automating your dedicated Google Workspace resources.</p>
            </div>
            <div className="p-6 border-2 border-dashed rounded-2xl bg-muted/30 text-center space-y-4">
              <p className="text-sm">Connect your Google account to grant access to shared bid folders and calendars.</p>
              <Button variant="outline" className="h-12 w-full flex items-center gap-2 font-semibold">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Connect with Google
              </Button>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Automated Tasks:</p>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Create client-dedicated Shared Drive</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Sync project calendars</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span>Provision internal communication channels</span>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">Back</Button>
              <Button onClick={handleNext} className="flex-[2] h-12 rounded-xl bg-primary" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Complete Setup"}
              </Button>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-headline font-bold">Onboarding Complete!</h2>
            <p className="text-muted-foreground text-lg">Your BidFlow Connect environment is being prepared. You'll receive a confirmation email shortly.</p>
            <div className="p-6 bg-secondary/30 rounded-2xl border border-primary/10 text-left space-y-4">
              <h4 className="font-bold">Next Steps:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Check your inbox for login credentials.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Upload your first tender document.
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  Schedule your kick-off strategy call.
                </li>
              </ul>
            </div>
            <Button onClick={() => router.push('/dashboard')} className="w-full h-14 rounded-xl text-lg font-semibold bg-primary shadow-lg shadow-primary/20">
              Go to Dashboard
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-body">
      <header className="px-6 h-20 flex items-center justify-center border-b bg-white">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              <span>Step {stepsOrder.indexOf(currentStep) + 1} of {stepsOrder.length}</span>
              <span className="text-primary">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8 lg:p-12">
              {renderStep()}
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need help? Contact our support at <span className="font-semibold text-primary">support@bidflowconnect.com</span>
          </p>
        </div>
      </main>
    </div>
  );
}
