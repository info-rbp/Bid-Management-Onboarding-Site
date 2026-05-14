
"use client";

import React, { useState, useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  LayoutDashboard, 
  Settings as SettingsIcon, 
  User,
  Building2,
  LogOut,
  Save,
  Loader2
} from 'lucide-react';
import { useOptionalAuth, useOptionalFirestore, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function SettingsPage() {
  const auth = useOptionalAuth();
  const db = useOptionalFirestore();
  const { user, isUserLoading, areServicesAvailable, initializationError } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    businessName: '',
    email: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      if (user && db) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            fullName: data.fullName || '',
            businessName: data.businessName || '',
            email: data.email || ''
          });
        }
      }
    }
    fetchProfile();
  }, [user, db]);

  const handleLogout = async () => {
    try {
      if (auth) await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleSave = async () => {
    if (!user || !db) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        fullName: profile.fullName,
        businessName: profile.businessName,
        updatedAt: new Date().toISOString()
      });
      toast({
        title: "Settings updated",
        description: "Your profile information has been successfully saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Could not save your changes.",
      });
    } finally {
      setLoading(false);
    }
  };


  if (!areServicesAvailable) {
    return <div className="flex h-screen items-center justify-center p-6 text-center">{initializationError?.message || 'Authentication temporarily unavailable.'}</div>;
  }

  if (isUserLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <Link href="/dashboard" className="block">
            <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" />
          </Link>
          <Link href="/settings" className="block">
            <NavItem icon={<SettingsIcon className="w-5 h-5" />} label="Settings" active />
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
          <h1 className="text-xl font-bold font-headline">Settings</h1>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              {profile.fullName?.substring(0, 2).toUpperCase() || 'JD'}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl space-y-8 mx-auto lg:mx-0">
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" /> Profile Information
                </CardTitle>
                <CardDescription>Manage your personal contact details.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    value={profile.fullName} 
                    onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                    placeholder="John Doe" 
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    value={profile.email} 
                    disabled 
                    className="bg-muted/50 h-12 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">Email cannot be changed manually for security reasons.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" /> Business Details
                </CardTitle>
                <CardDescription>Your registered company information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName" 
                    value={profile.businessName} 
                    onChange={(e) => setProfile({...profile, businessName: e.target.value})}
                    placeholder="Acme Bid Corp" 
                    className="h-12 rounded-xl"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={loading} className="gap-2 px-8 h-12 rounded-xl bg-primary text-white font-semibold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <div className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
}
