
"use client";

import React from 'react';
import { Logo } from '@/components/brand/Logo';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Bell, 
  Plus, 
  Search,
  Clock,
  TrendingUp,
  ExternalLink,
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
          <NavItem icon={<ClipboardList className="w-5 h-5" />} label="Onboarding" />
          <NavItem icon={<FileText className="w-5 h-5" />} label="Bids & Tenders" />
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
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
              JD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-headline font-bold">Welcome back!</h1>
            <Button className="bg-primary gap-2 h-11 px-6 rounded-xl">
              <Plus className="w-5 h-5" /> New Bid Project
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<FileText className="text-blue-500" />} label="Active Bids" value="12" trend="+2 this week" />
            <StatCard icon={<TrendingUp className="text-green-500" />} label="Win Rate" value="68%" trend="+5% vs last month" />
            <StatCard icon={<Clock className="text-orange-500" />} label="Deadlines Today" value="3" trend="Next in 4h" />
            <StatCard icon={<ClipboardList className="text-purple-500" />} label="Onboarding Status" value="85%" trend="Almost complete" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Active Bids Table */}
            <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Recent Tender Activity</CardTitle>
                  <CardDescription>Monitor your ongoing submission progress.</CardDescription>
                </div>
                <Button variant="ghost" className="text-primary text-sm font-bold">View All</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#F8FAFC] text-muted-foreground font-medium border-y">
                      <tr>
                        <th className="px-6 py-4">Tender Name</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Probability</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <BidRow name="City Infrastructure Upgrade" status="In Review" date="Oct 24, 2023" prob="High" />
                      <BidRow name="Regional Health IT Services" status="Drafting" date="Nov 12, 2023" prob="Medium" />
                      <BidRow name="Global Logistics Tender 2024" status="Strategy" date="Dec 05, 2023" prob="High" />
                      <BidRow name="School District Facility Management" status="Completed" date="Oct 15, 2023" prob="N/A" won />
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Workspace Links */}
            <Card className="rounded-2xl border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Google Workspace</CardTitle>
                <CardDescription>Automated shortcuts to your resources.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <WorkspaceLink title="Shared Bid Folder" desc="Cloud storage for assets" />
                <WorkspaceLink title="Tender Calendar" desc="Deadlines & milestones" />
                <WorkspaceLink title="Team Workspace" desc="Collaborative docs" />
                <div className="pt-4 border-t">
                  <Button variant="outline" className="w-full gap-2 rounded-xl h-11 border-2">
                    Manage Integrations <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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

function BidRow({ name, status, date, prob, won = false }: { name: string, status: string, date: string, prob: string, won?: boolean }) {
  return (
    <tr className="hover:bg-muted/30 transition-colors">
      <td className="px-6 py-4">
        <span className="font-semibold block">{name}</span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${won ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{date}</td>
      <td className="px-6 py-4">
        <span className="font-medium">{prob}</span>
      </td>
    </tr>
  );
}

function WorkspaceLink({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-border/50 hover:border-primary/30 transition-all cursor-pointer group">
      <div>
        <h4 className="font-bold text-sm mb-0.5">{title}</h4>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
    </div>
  );
}
