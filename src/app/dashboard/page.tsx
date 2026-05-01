"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Search,
  Clock,
  TrendingUp,
  ClipboardList,
  LogOut
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r hidden lg:flex flex-col">
        <div className="p-6">
          <Logo />
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" active />
          <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
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
            <Input placeholder="Search bids, documents..." className="pl-10 bg-[#F1F5F9] border-none" />
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
              JD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-headline font-bold">Welcome back!</h1>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FileText className="text-blue-500" />} label="Active Bids" value="12" trend="+2 this week" />
            <StatCard icon={<TrendingUp className="text-green-500" />} label="Win Rate" value="68%" trend="+5% vs last month" />
            <StatCard icon={<Clock className="text-orange-500" />} label="Deadlines Today" value="3" trend="Next in 4h" />
            <StatCard icon={<ClipboardList className="text-purple-500" />} label="Onboarding Status" value="85%" trend="Almost complete" />
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}

function StatCard({ icon, label, value, trend }: { icon: React.ReactNode, label: string, value: string, trend: string }) {
  return (
    <Card className="border-none shadow-sm rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-[#F1F5F9] rounded-xl">{icon}</div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl font-bold font-headline">{value}</h3>
          <p className="text-xs font-semibold text-green-600">{trend}</p>
        </div>
      </CardContent>
    </Card>
  );
}
