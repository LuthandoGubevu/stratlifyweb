
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Heart, Lightbulb, Package, TrendingUp, ArrowRight, Eye, Clock, Settings, Edit3 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  viewLink: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon, viewLink }) => {
  const changeColor = changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground';
  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-accent">
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs ${changeColor}`}>
            {change} from last month
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="link" asChild className="p-0 h-auto text-xs text-primary">
          <Link href={viewLink}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ActivityItemProps {
  action: string;
  time: string;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ action, time }) => (
  <li className="flex items-start space-x-3 py-2 border-b border-border last:border-b-0">
    <Clock className="h-4 w-4 text-muted-foreground mt-1" />
    <div>
      <p className="text-sm text-foreground">{action}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </li>
);

interface RecommendationItemProps {
  title: string;
  description: string;
  actionText: string;
  actionLink: string;
  bgColorClass: string;
  icon: React.ReactNode;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({ title, description, actionText, actionLink, bgColorClass, icon }) => (
  <div className={`p-4 rounded-lg ${bgColorClass} bg-opacity-10 border ${bgColorClass.replace('bg-', 'border-')}`}>
    <div className="flex items-center mb-2">
      <div className={`mr-2 p-1.5 rounded-full ${bgColorClass} bg-opacity-20`}>
        {icon}
      </div>
      <h4 className="font-semibold text-sm text-foreground">{title}</h4>
    </div>
    <p className="text-xs text-muted-foreground mb-3">{description}</p>
    <Button variant="link" size="sm" asChild className="p-0 h-auto text-xs text-primary">
      <Link href={actionLink}>{actionText} <ArrowRight className="ml-1 h-3 w-3" /></Link>
    </Button>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();

  const metricCardsData: MetricCardProps[] = [
    { title: 'Customer Avatars', value: '12', change: '+2 from last month', changeType: 'positive', icon: <Users className="h-5 w-5" />, viewLink: '/dashboard/customer-avatars' },
    { title: 'Mass Desires', value: '8', change: '-1 from last month', changeType: 'negative', icon: <Heart className="h-5 w-5" />, viewLink: '/dashboard/mass-desires' },
    { title: 'Ad Concepts', value: '27', change: '+5 from last month', changeType: 'positive', icon: <Lightbulb className="h-5 w-5" />, viewLink: '/dashboard/idea-tracker' },
    { title: 'Marketing Assets', value: '153', icon: <Package className="h-5 w-5" />, viewLink: '/dashboard/ad-creation' }, // Assuming ad-creation holds assets
  ];

  const recentActivities: ActivityItemProps[] = [
    { action: 'New customer avatar "Tech Savvy Millennial" created.', time: '15 minutes ago' },
    { action: 'Ad concept "AI for Writers" moved to "Developed".', time: '1 hour ago' },
    { action: 'Mass desire "Financial Freedom" updated.', time: '3 hours ago' },
    { action: 'Submitted campaign "Q2 Product Launch".', time: 'Yesterday' },
  ];

  const recommendations: RecommendationItemProps[] = [
    { title: 'Refine Your Avatars', description: 'Consider adding more psychographic details to your "Eco Warrior" avatar.', actionText: 'Edit Avatar', actionLink: '/dashboard/customer-avatars', bgColorClass: 'bg-blue-500', icon: <Users className="h-4 w-4 text-blue-700" /> },
    { title: 'Explore New Ad Angles', description: 'You have several "Problem Aware" concepts. Try creating a "Solution Aware" angle for your next campaign.', actionText: 'Create Concept', actionLink: '/dashboard/idea-tracker', bgColorClass: 'bg-purple-500', icon: <Lightbulb className="h-4 w-4 text-purple-700" /> },
    { title: 'Leverage Headline Patterns', description: 'The "How To..." pattern is performing well. Test it with your new product features.', actionText: 'View Patterns', actionLink: '/dashboard/headline-patterns', bgColorClass: 'bg-green-500', icon: <Edit3 className="h-4 w-4 text-green-700" /> },
  ];

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

      {/* Metric Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCardsData.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ad Concepts per Persona (Graph Area) */}
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
            <CardHeader>
              <CardTitle className="font-headline text-primary">Ad Concepts per Persona</CardTitle>
              <CardDescription>Visualize the distribution and performance of ad concepts across different customer avatars.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px] h-full">
              {/* Placeholder for chart */}
              <Image 
                src="https://placehold.co/600x300.png" 
                alt="Ad Concepts per Persona Chart Placeholder" 
                width={600} 
                height={300} 
                className="rounded-md object-contain"
                data-ai-hint="bar chart analytics"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Recommendations */}
        <div className="lg:col-span-1 space-y-6">
          {/* Recent Activity */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="font-headline text-md text-primary">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <ul className="space-y-0">
                  {recentActivities.slice(0, 4).map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity.</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="#">View all activity</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Recommendations */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="font-headline text-md text-primary">Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, index) => (
                <RecommendationItem key={index} {...rec} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
