'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart2, Edit, Users, Zap } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div className="bg-card p-6 rounded-lg shadow">
        <h1 className="text-3xl font-headline font-semibold text-primary">
          Welcome back, {user?.displayName || 'Strategist'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your Stratlify dashboard. Let's build some winning campaigns.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Zap className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 since last week</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
            <BarChart2 className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,231.89</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            <Users className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Edit className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Check submissions queue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Quick Actions</CardTitle>
            <CardDescription>Jump right into your creative process.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard/ad-creation">Create New Ad</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/creative-roadmap">View Roadmap</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/iteration-tracker">Track Iterations</Link>
            </Button>
            <Button asChild variant="outline">
             <Link href="/dashboard/mechanization">Develop Mechanism</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-headline text-primary">Recent Activity</CardTitle>
            <CardDescription>Overview of your latest updates.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center text-sm">
                <Image src="https://placehold.co/32x32.png" alt="Activity icon" width={32} height={32} className="rounded-full mr-3" data-ai-hint="update new"/>
                <span>New ad concept "Summer Sale Blitz" created.</span>
              </li>
              <li className="flex items-center text-sm">
                <Image src="https://placehold.co/32x32.png" alt="Activity icon" width={32} height={32} className="rounded-full mr-3" data-ai-hint="data chart"/>
                <span>Campaign "Q2 Growth" iteration 3 results are in.</span>
              </li>
               <li className="flex items-center text-sm">
                <Image src="https://placehold.co/32x32.png" alt="Activity icon" width={32} height={32} className="rounded-full mr-3" data-ai-hint="user profile"/>
                <span>User profile "Tech Savvy Millenial" updated.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
