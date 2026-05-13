"use client";

import React, { useState, Suspense } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, User, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getSafeReturnUrl } from '@/lib/auth-return-url';

function AuthContent() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const returnUrl = getSafeReturnUrl(searchParams.get('returnUrl'));

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(returnUrl);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const businessName = formData.get('businessName') as string;
    const billingAddress = formData.get('billingAddress') as string;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      const userData = {
        id: user.uid,
        email,
        fullName,
        businessName,
        billingAddress,
        role: 'client',
        subscriptionStatus: 'active', // Set to active by default to allow onboarding access
        onboardingStatus: 'not_started',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);

      // Trigger Email Notification API
      fetch('/api/notifications/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            fullName,
            businessName,
            email,
            billingAddress
        })
      }).catch(err => console.error("Email notification failed", err));

      router.push('/onboarding/welcome_expectations');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: error.message || "Could not create account."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = (document.getElementById('email') as HTMLInputElement)?.value;
    if (!email) {
      toast({
        variant: "destructive",
        title: "Email Required",
        description: "Please enter your email address in the email field.",
      });
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox for instructions to reset your password.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password Reset Failed",
        description: error.message || "Could not send reset email.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
      <div className="mb-8">
        <Logo />
      </div>

      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
        <CardContent className="p-8">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input id="email" name="email" type="email" placeholder="name@company.com" className="pl-10 h-12" required />
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input id="password" name="password" type="password" placeholder="••••••••" className="pl-10 h-12" required />
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="text-right">
                  <Button type="button" variant="link" onClick={handleForgotPassword} className="p-0 h-auto">Forgot Password?</Button>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <Input id="fullName" name="fullName" placeholder="John Doe" className="pl-10 h-12" required />
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <div className="relative">
                    <Input id="businessName" name="businessName" placeholder="Acme Bid Corp" className="pl-10 h-12" required />
                    <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <div className="relative">
                    <Textarea 
                        id="billingAddress" 
                        name="billingAddress" 
                        placeholder="123 Business St, Sydney NSW 2000" 
                        className="pl-10 min-h-[80px]" 
                        required 
                    />
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Input id="signup-email" name="email" type="email" placeholder="name@company.com" className="pl-10 h-12" required />
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input id="signup-password" name="password" type="password" placeholder="••••••••" className="pl-10 h-12" required />
                    <Lock className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold mt-2" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}
