
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Heart, Lightbulb, Package, ArrowRight, Clock, Edit3 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import type { CustomerAvatar, LOCAL_STORAGE_AVATARS_KEY as LSAK_Avatars } from './customer-avatars/page';
import type { MassDesire, LOCAL_STORAGE_DESIRES_KEY as LSAK_Desires } from './mass-desires/page';
import type { Idea, LOCAL_STORAGE_IDEAS_KEY as LSAK_Ideas } from './idea-tracker/page';
import type { StoredAdCreationEntry, LOCAL_STORAGE_AD_CREATION_KEY as LSAK_Ads } from './ad-creation/page';
import type { HeadlinePattern, LOCAL_STORAGE_HEADLINES_KEY as LSAK_Headlines } from './headline-patterns/page';
import type { CompiledCampaignSubmission, LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY as LSAK_Submissions } from './submissions/page';

// Re-declare localStorage keys as constants here if not directly importable or for clarity
const AVATARS_KEY = 'customerAvatarsEntries';
const DESIRES_KEY = 'massDesiresEntries';
const IDEAS_KEY = 'ideaTrackerEntries';
const ADS_KEY = 'adCreationEntries';
const HEADLINES_KEY = 'headlinePatterns';
const SUBMISSIONS_KEY = 'compiledCampaignSubmissions';


interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  viewLink: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, viewLink }) => {
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
      </CardContent>
      <CardFooter className="pt-2">
        <Button variant="link" asChild className="p-0 h-auto text-xs text-primary">
          <Link href={viewLink}>View <ArrowRight className="ml-1 h-3 w-3" /></Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

interface ActivityItem {
  id: string;
  action: string;
  time: string;
  timestamp: Date;
  link?: string;
}

const ActivityItemDisplay: React.FC<{activity: ActivityItem}> = ({ activity }) => (
  <li className="flex items-start space-x-3 py-2 border-b border-border last:border-b-0">
    <Clock className="h-4 w-4 text-muted-foreground mt-1" />
    <div>
      <p className="text-sm text-foreground">
        {activity.link ? <Link href={activity.link} className="hover:underline">{activity.action}</Link> : activity.action}
      </p>
      <p className="text-xs text-muted-foreground">{activity.time}</p>
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

  const [avatarCount, setAvatarCount] = useState(0);
  const [desireCount, setDesireCount] = useState(0);
  const [adConceptCount, setAdConceptCount] = useState(0);
  const [marketingAssetCount, setMarketingAssetCount] = useState(0);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItemProps[]>([]);

  useEffect(() => {
    const loadData = () => {
      // Load Avatars
      const storedAvatars = localStorage.getItem(AVATARS_KEY);
      const avatars: CustomerAvatar[] = storedAvatars ? JSON.parse(storedAvatars) : [];
      setAvatarCount(avatars.length);

      // Load Mass Desires
      const storedDesires = localStorage.getItem(DESIRES_KEY);
      const desires: MassDesire[] = storedDesires ? JSON.parse(storedDesires) : [];
      setDesireCount(desires.length);

      // Load Ad Concepts (Ideas)
      const storedIdeas = localStorage.getItem(IDEAS_KEY);
      const ideas: Idea[] = storedIdeas ? JSON.parse(storedIdeas) : [];
      setAdConceptCount(ideas.length);

      // Load Marketing Assets (Ad Creations)
      const storedAds = localStorage.getItem(ADS_KEY);
      const ads: StoredAdCreationEntry[] = storedAds ? JSON.parse(storedAds) : [];
      setMarketingAssetCount(ads.length);
      
      // Load Headline Patterns for recommendations
      const storedHeadlines = localStorage.getItem(HEADLINES_KEY);
      const headlinePatterns: HeadlinePattern[] = storedHeadlines ? JSON.parse(storedHeadlines) : [];

      // Generate Recent Activities
      let activities: ActivityItem[] = [];
      avatars.slice(0, 5).forEach(a => activities.push({ id: `avatar-${a.id}`, action: `New customer avatar "${a.name}" created.`, time: formatDistanceToNow(parseISO(a.createdAt), { addSuffix: true }), timestamp: parseISO(a.createdAt), link: '/dashboard/customer-avatars'  }));
      ideas.slice(0, 5).forEach(i => activities.push({ id: `idea-${i.id}`, action: `Ad concept "${i.concept}" (Status: ${i.status}).`, time: formatDistanceToNow(parseISO(i.createdAt), { addSuffix: true }), timestamp: parseISO(i.createdAt), link: '/dashboard/idea-tracker'  }));
      ads.slice(0,3).forEach(ad => activities.push({ id: `ad-${ad.id}`, action: `Ad draft "${ad.data.adConcept || ad.data.batchDctNumber || 'Untitled Ad'}" saved.`, time: formatDistanceToNow(parseISO(ad.createdAt), { addSuffix: true }), timestamp: parseISO(ad.createdAt), link: '/dashboard/ad-creation' }));
      
      const storedSubmissions = localStorage.getItem(SUBMISSIONS_KEY);
      const submissions: CompiledCampaignSubmission[] = storedSubmissions ? JSON.parse(storedSubmissions) : [];
      submissions.slice(0,3).forEach(s => {
        const subTimestamp = typeof s.submittedAt === 'string' ? parseISO(s.submittedAt) : (s.submittedAt as any).toDate(); // Handle Firestore Timestamp or ISO string
        activities.push({ id: `sub-${s.id}`, action: `Campaign "${s.submissionTitle}" submitted.`, time: formatDistanceToNow(subTimestamp, { addSuffix: true }), timestamp: subTimestamp, link: s.firestoreId ? `/submission/${s.firestoreId}` : '/dashboard/submissions' });
      });


      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setRecentActivities(activities.slice(0, 5));


      // Generate Recommendations
      const newRecommendations: RecommendationItemProps[] = [];
      if (avatars.length < 2) {
        newRecommendations.push({ title: 'Define More Avatars', description: 'Deepen your audience understanding by creating at least two distinct customer avatars.', actionText: 'Create Avatars', actionLink: '/dashboard/customer-avatars', bgColorClass: 'bg-blue-500', icon: <Users className="h-4 w-4 text-blue-700" /> });
      }
      const rawIdeas = ideas.filter(idea => idea.status === 'Raw').length;
      if (rawIdeas > 1 && ideas.length > 0) {
        newRecommendations.push({ title: 'Develop Raw Ideas', description: `You have ${rawIdeas} 'Raw' ad concepts. Try developing them further into actionable plans.`, actionText: 'View Ideas', actionLink: '/dashboard/idea-tracker', bgColorClass: 'bg-purple-500', icon: <Lightbulb className="h-4 w-4 text-purple-700" /> });
      }
      if (headlinePatterns.length < 3) {
        newRecommendations.push({ title: 'Expand Headline Arsenal', description: 'Boost your ad copy by adding more versatile headline patterns to your collection.', actionText: 'Add Patterns', actionLink: '/dashboard/headline-patterns', bgColorClass: 'bg-green-500', icon: <Edit3 className="h-4 w-4 text-green-700" /> });
      }
       if (newRecommendations.length < 3 && marketingAssetCount < 1) {
        newRecommendations.push({ title: 'Create Your First Ad', description: 'Start building your first marketing asset using the ad creation tool.', actionText: 'Create Ad', actionLink: '/dashboard/ad-creation', bgColorClass: 'bg-yellow-500', icon: <Package className="h-4 w-4 text-yellow-700" /> });
      }
      setRecommendations(newRecommendations.slice(0,3));
    };

    loadData();
     // Set up an interval to refresh data every 30 seconds, for example
    const intervalId = setInterval(loadData, 30000);
    return () => clearInterval(intervalId);

  }, []);


  const metricCardsData: MetricCardProps[] = [
    { title: 'Customer Avatars', value: String(avatarCount), icon: <Users className="h-5 w-5" />, viewLink: '/dashboard/customer-avatars' },
    { title: 'Mass Desires', value: String(desireCount), icon: <Heart className="h-5 w-5" />, viewLink: '/dashboard/mass-desires' },
    { title: 'Ad Concepts', value: String(adConceptCount), icon: <Lightbulb className="h-5 w-5" />, viewLink: '/dashboard/idea-tracker' },
    { title: 'Marketing Assets', value: String(marketingAssetCount), icon: <Package className="h-5 w-5" />, viewLink: '/dashboard/ad-creation' },
  ];

  return (
    <div className="space-y-8">
      <Card className="shadow">
        <CardHeader>
          <CardTitle className="text-3xl font-headline font-semibold text-primary">
            Welcome back, {user?.displayName || 'Strategist'}!
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">
            Here's your Stratlify dashboard. Let's build some winning campaigns.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metricCardsData.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="hover:shadow-lg transition-shadow duration-200 h-full">
            <CardHeader>
              <CardTitle className="font-headline text-primary">Ad Concepts per Persona</CardTitle>
              <CardDescription>Visualize the distribution and performance of ad concepts across different customer avatars.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center min-h-[300px] h-full">
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

        <div className="lg:col-span-1 space-y-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="font-headline text-md text-primary">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <ul className="space-y-0">
                  {recentActivities.map((activity) => (
                    <ActivityItemDisplay key={activity.id} activity={activity} />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              )}
            </CardContent>
            {recentActivities.length > 0 && ( // Only show if there's activity
                <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                    {/* This link is a placeholder, real "view all" would need a dedicated page or modal */}
                    <Link href="#">View all activity</Link>
                </Button>
                </CardFooter>
            )}
          </Card>

          {recommendations.length > 0 && (
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
          )}
        </div>
      </div>
    </div>
  );
}

