'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap, Edit } from 'lucide-react'; // Removed BarChart2, Users

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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently live campaigns</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Edit className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Submissions awaiting review</p>
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

        {/* Recent Activity card removed as it was purely placeholder */}
      </div>
    </div>
  );
}
