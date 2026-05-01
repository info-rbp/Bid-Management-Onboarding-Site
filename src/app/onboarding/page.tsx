
"use client";

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  CreditCard, 
  User, 
  Building2, 
  Loader2,
  Lock,
  Mail,
  ArrowRight
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

type Step = 'plan' | 'payment' | 'setup' | 'complete';

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>('plan');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();

  const [formData, setFormData] = useState({
    plan: 'professional',
    fullName: '',
    email: '',
    password: '',
    businessName: '',
    industry: '',
  });

  const stepsOrder: Step[] = ['plan', 'payment', 'setup', 'complete'];

  useEffect(() => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    setProgress(((currentIndex + 1) / stepsOrder.length) * 100);
  }, [currentStep]);

  const handleNext = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex < stepsOrder.length - 1) {
      setCurrentStep(stepsOrder[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const currentIndex = stepsOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepsOrder[currentIndex - 1]);
    }
  };

  const handleCreateAccount = async () => {
    if (!formData.email || !formData.password || !formData.fullName || !formData.businessName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields to create your account.",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Auth Profile
      await updateProfile(user, { displayName: formData.fullName });

      // 3. Create Firestore User Profile
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        businessName: formData.businessName,
        role: 'client',
        subscriptionStatus: 'active', // Assuming payment succeeded in previous step
        onboardingStatus: 'not_started',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      handleNext();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Account Creation Failed",
        description: error.message || "An error occurred during account setup.",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'plan':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Select Your Plan</h2>
              <p className="text-muted-foreground">Choose the service tier that fits your business needs.</p>
            </div>
            <RadioGroup 
              defaultValue={formData.plan} 
              onValueChange={(v) => setFormData({...formData, plan: v})}
              className="grid gap-4"
            >
              {['essential', 'professional', 'enterprise'].map((plan) => (
                <div key={plan} className="relative">
                  <RadioGroupItem value={plan} id={plan} className="peer sr-only" />
                  <Label
                    htmlFor={plan}
                    className="flex flex-col p-6 border-2 rounded-2xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-secondary/50 transition-all"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg capitalize">{plan}</span>
                        {plan === 'professional' && (
                          <span className="bg-accent text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Popular</span>
                        )}
                      </div>
                      <span className="text-xl font-bold text-primary">
                        {plan === 'essential' ? '$499' : plan === 'professional' ? '$999' : 'Custom'}
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {plan === 'essential' ? 'Perfect for small teams and occasional bidding.' : 
                       plan === 'professional' ? 'Strategic support for active bidding pipelines.' : 
                       'Full-service bid office for high-volume organizations.'}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
            <Button onClick={handleNext} className="w-full h-12 rounded-xl bg-primary text-lg font-semibold">
              Continue to Payment
            </Button>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Secure Payment</h2>
              <p className="text-muted-foreground">Complete your subscription setup via Stripe.</p>
            </div>
            <div className="bg-muted/50 p-6 rounded-2xl border space-y-6">
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="font-medium">Plan: <span className="capitalize font-bold text-primary">{formData.plan}</span></span>
                <span className="font-bold">{formData.plan === 'professional' ? '$999.00' : formData.plan === 'essential' ? '$499.00' : 'TBD'}</span>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Details</Label>
                  <div className="relative">
                    <Input placeholder="0000 0000 0000 0000" className="pl-10 h-12" />
                    <CreditCard className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="MM/YY" className="h-12" />
                  <Input placeholder="CVC" className="h-12" />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Securely processed by Stripe. No card details are stored on our servers.
              </p>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">Back</Button>
              <Button onClick={handleNext} className="flex-[2] h-12 rounded-xl bg-accent text-white font-bold">
                Pay and Setup Account
              </Button>
            </div>
          </div>
        );

      case 'setup':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-bold">Account Setup</h2>
              <p className="text-muted-foreground">Create your portal access to begin bidding.</p>
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
                <div className="relative">
                  <Input 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    type="email" 
                    placeholder="john@company.com" 
                    className="pl-10 h-12" 
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <div className="relative">
                  <Input 
                    value={formData.businessName}
                    onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                    placeholder="Acme Bid Corp" 
                    className="pl-10 h-12" 
                  />
                  <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Input 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    type="password"
                    placeholder="••••••••" 
                    className="pl-10 h-12" 
                  />
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                </div>
              </div>
            </div>
            <Button 
              onClick={handleCreateAccount} 
              className="w-full h-12 rounded-xl bg-primary font-bold" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Complete Account Setup"}
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-headline font-bold">Registration Complete!</h2>
            <p className="text-muted-foreground text-lg">Your account is active and your workspace is being prepared.</p>
            <Card className="bg-secondary/20 border-none p-6 text-left">
              <h4 className="font-bold mb-2">Welcome aboard, {formData.fullName}!</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You now have access to the Bid Manager dashboard. You can start your onboarding pack immediately to help us understand your business requirements.
              </p>
            </Card>
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full h-14 rounded-xl text-lg font-semibold bg-primary group shadow-lg shadow-primary/20"
            >
              Go to Dashboard <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body">
      <header className="px-6 h-20 flex items-center justify-center border-b bg-white">
        <Logo />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-xl">
          <div className="mb-8 space-y-2">
            <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
              <span>Step {stepsOrder.indexOf(currentStep) + 1} of {stepsOrder.length}</span>
              <span className="text-primary">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-8 lg:p-12">
              {renderStep()}
            </CardContent>
          </Card>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Trusted by organizations globally. Need help? <span className="font-semibold text-primary">Support Center</span>
          </p>
        </div>
      </main>
    </div>
  );
}
