
"use client";

import React, { useMemo, useState } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  Search,
  LogOut,
  CheckCircle2,
  Circle,
  ChevronRight,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, query, collection, where, addDoc } from 'firebase/firestore';
import Link from 'next/link';
import { getVisibleOnboardingSteps } from '@/lib/onboarding-steps';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { buildInitialSubmission } from '@/lib/onboarding-submission';

export default function DashboardPage() {
  const auth = useAuth();
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const [isStartingOnboarding, setIsStartingOnboarding] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user || !db) return null;
    return doc(db, 'users', user.uid);
  }, [user, db]);

  const { data: userData } = useDoc(userDocRef);

  const submissionsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, 'onboardingSubmissions'), where('userId', '==', user.uid));
  }, [user, db]);

  const { data: submissions } = useCollection(submissionsQuery);
  const submission = submissions?.[0];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleStartOnboarding = async () => {
    if (!user || !db || isStartingOnboarding) return;

    setIsStartingOnboarding(true);

    try {
      const newSubmission = buildInitialSubmission({
        userId: user.uid,
        businessName: userData?.businessName || 'My Business',
        currentStep: 'welcome_expectations',
      });

      await addDoc(collection(db, 'onboardingSubmissions'), newSubmission);
      router.push('/onboarding/welcome_expectations');
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    } finally {
      setIsStartingOnboarding(false);
    }
  }

  const enabledModules = submission?.enabledModules;

  const visibleSteps = useMemo(() => {
    return getVisibleOnboardingSteps(enabledModules);
  }, [enabledModules]);

  const continueRoute = useMemo(() => {
    if (!submission || !visibleSteps.length) return '/onboarding/welcome_expectations';

    if (submission.currentStep) {
      const isVisible = visibleSteps.some(s => s.key === submission.currentStep);
      if (isVisible) return `/onboarding/${submission.currentStep}`;
    }

    const completedKeys = Object.entries(submission.sectionStatuses || {})
      .filter(([_, status]: [string, any]) => status.status === 'complete')
      .map(([key]) => key);
    
    const firstIncomplete = visibleSteps.find(s => !completedKeys.includes(s.key));
    if (firstIncomplete) return firstIncomplete.route;

    return '/onboarding/final_submission';
  }, [submission, visibleSteps]);

  const completedCount = useMemo(() => {
    if (!submission || !visibleSteps.length) return 0;
    return visibleSteps.filter(s => submission.sectionStatuses?.[s.key]?.status === 'complete').length;
  }, [submission, visibleSteps]);

  const progressValue = submission?.completionPercentage || 0;

  const isSubmitted = submission?.status === 'submitted';

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#F8FAFC] flex font-body">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
          <div className="p-6">
            <Logo />
          </div>
          <nav className="flex-1 px-4 space-y-1">
            <Link href="/dashboard" className="block">
              <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
            </Link>
            <Link href="/settings" className="block">
              <NavItem icon={<SettingsIcon className="w-5 h-5" />} label="Settings" />
            </Link>
          </nav>
          
          <div className="p-4 px-6 border-t">
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Log Out</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
            <div className="relative w-96">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search onboarding steps..." className="pl-10 bg-[#F1F5F9] border-none" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-slate-900 leading-none">{userData?.fullName}</span>
                <span className="text-[10px] text-muted-foreground">{userData?.businessName}</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                {userData?.fullName?.substring(0, 2).toUpperCase() || 'JD'}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-headline font-bold text-slate-900">Onboarding Dashboard</h1>
                <div className="flex items-center gap-3">
                  <Badge variant={isSubmitted ? "default" : "secondary"} className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isSubmitted ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                    {submission?.status?.replace('_', ' ') || 'Not Started'}
                  </Badge>
                  {submission ? (
                    <Button asChild size="sm" className={`gap-2 rounded-xl font-bold ${isSubmitted ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-none' : 'bg-primary shadow-lg shadow-primary/20'}`}>
                      <Link href={continueRoute}>
                        {isSubmitted ? 'View Submitted Pack' : 'Continue Onboarding'} <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={handleStartOnboarding}
                      disabled={isStartingOnboarding}
                      className="gap-2 rounded-xl font-bold bg-primary shadow-lg shadow-primary/20"
                    >
                      {isStartingOnboarding ? 'Starting...' : 'Start Onboarding'} <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-slate-500">Complete the {visibleSteps.length} sections below to set up your profile.</p>
            </div>

            <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Overall Completion</h2>
                    <p className="font-bold font-headline text-4xl">{Math.round(progressValue)}%</p>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {completedCount} of {visibleSteps.length} steps completed
                  </p>
                </div>
                <Progress value={progressValue} className="h-3 bg-slate-100" />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
              {visibleSteps.map((step, idx) => {
                const stepStatus = submission?.sectionStatuses?.[step.key]?.status || 'not_started';
                const isCurrent = submission?.currentStep === step.key;
                
                let status: 'completed' | 'in_progress' | 'pending' | 'needs_attention' = 'pending';
                if (stepStatus === 'complete') status = 'completed';
                else if (stepStatus === 'needs_attention') status = 'needs_attention';
                else if (isCurrent) status = 'in_progress';
                else if (stepStatus === 'not_started') status = 'pending';
                
                return (
                  <StepTile 
                    key={step.key} 
                    title={`${idx + 1}. ${step.shortTitle}`} 
                    icon={<step.icon className="w-5 h-5" />} 
                    status={status}
                    onClick={() => router.push(step.route)}
                  />
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all cursor-pointer ${active ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}

interface StepTileProps {
  title: string;
  icon: React.ReactNode;
  status: 'completed' | 'in_progress' | 'pending' | 'needs_attention';
  onClick: () => void;
}

function StepTile({ title, icon, status, onClick }: StepTileProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'needs_attention': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'in_progress': return <Circle className="w-5 h-5 text-blue-500 fill-blue-50" />;
      default: return <Circle className="w-5 h-5 text-slate-200" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'needs_attention': return 'Needs Attention';
      case 'in_progress': return 'Continue';
      default: return 'Start';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'needs_attention': return 'text-orange-600';
      case 'in_progress': return 'text-blue-600';
      default: return 'text-slate-400';
    }
  };

  return (
    <Card 
      className="group border-none shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md cursor-pointer hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-6 flex flex-col h-full justify-between gap-4 pt-6">
        <div className="flex justify-between items-start">
          <div className={`p-3 rounded-xl ${status === 'completed' ? 'bg-green-50 text-green-600' : status === 'needs_attention' ? 'bg-orange-50 text-orange-600' : status === 'in_progress' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'} group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
          {getStatusIcon()}
        </div>
        <div className="space-y-2">
          <h3 className="font-bold text-sm leading-tight text-slate-800 line-clamp-2">{title}</h3>
          <div className="flex items-center justify-between pt-2">
            <span className={`text-[10px] font-bold uppercase tracking-widest ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
