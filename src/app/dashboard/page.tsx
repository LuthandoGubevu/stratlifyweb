
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Heart, Lightbulb, Package, ArrowRight, Clock, Edit3, Gift, Tags, Map, PenSquare, Repeat, Sparkles, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistanceToNow, parseISO } from 'date-fns';

import type { CustomerAvatar } from './customer-avatars/page';
import type MassDesire from './mass-desires/page';
import type Idea from './idea-tracker/page';
import type { StoredAdCreationEntry, AdCreationFormValues } from './ad-creation/page';
import type { HeadlinePattern } from './headline-patterns/page';
import type { CompiledCampaignSubmission } from './submissions/page';
import type FeatureBenefitPair from './features-to-benefits/page';
import type MasterFieldEntry from './master-fields/page';
import type { RoadmapEntry } from './creative-roadmap/page';
import type IterationEntry from './iteration-tracker/page';
import type { Mechanism } from './mechanization/page';


// Re-declare localStorage keys as constants here if not directly importable or for clarity
const AVATARS_KEY = 'customerAvatarsEntries';
const DESIRES_KEY = 'massDesiresEntries';
const IDEAS_KEY = 'ideaTrackerEntries';
const ADS_KEY = 'adCreationEntries';
const HEADLINES_KEY = 'headlinePatterns';
const SUBMISSIONS_KEY = 'compiledCampaignSubmissions';
const FEATURES_BENEFITS_KEY = 'featuresBenefitsEntries';
const MASTER_FIELDS_KEY = 'masterFieldEntries';
const ROADMAP_KEY = 'creativeRoadmapEntries';
const ITERATIONS_KEY = 'iterationTrackerEntries';
const MECHANISMS_KEY = 'productMechanisms';


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
  const [featureBenefitCount, setFeatureBenefitCount] = useState(0);
  const [masterFieldCount, setMasterFieldCount] = useState(0);
  const [roadmapEntryCount, setRoadmapEntryCount] = useState(0);
  const [headlinePatternCount, setHeadlinePatternCount] = useState(0);
  const [iterationTrackerCount, setIterationTrackerCount] = useState(0);
  const [mechanismCount, setMechanismCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationItemProps[]>([]);

  useEffect(() => {
    const loadData = () => {
      const safelyParseLocalStorage = <T,>(key: string, defaultValue: T[] = []): T[] => {
        try {
          const storedData = localStorage.getItem(key);
          return storedData ? JSON.parse(storedData) : defaultValue;
        } catch (e) {
          console.error(`Failed to parse ${key} from localStorage`, e);
          return defaultValue;
        }
      };

      const avatars: CustomerAvatar[] = safelyParseLocalStorage<CustomerAvatar>(AVATARS_KEY);
      setAvatarCount(avatars.length);

      const desires: MassDesire[] = safelyParseLocalStorage<MassDesire>(DESIRES_KEY);
      setDesireCount(desires.length);

      const ideas: Idea[] = safelyParseLocalStorage<Idea>(IDEAS_KEY);
      setAdConceptCount(ideas.length);

      const ads: StoredAdCreationEntry[] = safelyParseLocalStorage<StoredAdCreationEntry>(ADS_KEY);
      setMarketingAssetCount(ads.length);

      const featureBenefits: FeatureBenefitPair[] = safelyParseLocalStorage<FeatureBenefitPair>(FEATURES_BENEFITS_KEY);
      setFeatureBenefitCount(featureBenefits.length);
      
      const masterFields: MasterFieldEntry[] = safelyParseLocalStorage<MasterFieldEntry>(MASTER_FIELDS_KEY);
      setMasterFieldCount(masterFields.length);

      const roadmapEntries: RoadmapEntry[] = safelyParseLocalStorage<RoadmapEntry>(ROADMAP_KEY);
      setRoadmapEntryCount(roadmapEntries.length);

      const headlinePatterns: HeadlinePattern[] = safelyParseLocalStorage<HeadlinePattern>(HEADLINES_KEY);
      setHeadlinePatternCount(headlinePatterns.length);

      const iterations: IterationEntry[] = safelyParseLocalStorage<IterationEntry>(ITERATIONS_KEY);
      setIterationTrackerCount(iterations.length);

      const mechanisms: Mechanism[] = safelyParseLocalStorage<Mechanism>(MECHANISMS_KEY);
      setMechanismCount(mechanisms.length);
      
      const submissions: CompiledCampaignSubmission[] = safelyParseLocalStorage<CompiledCampaignSubmission>(SUBMISSIONS_KEY);
      setSubmissionCount(submissions.length);

      // Generate Recent Activities
      let activities: ActivityItem[] = [];
      avatars.slice(0, 5).forEach(a => activities.push({ id: `avatar-${a.id}`, action: `New customer avatar "${a.name}" created.`, time: formatDistanceToNow(parseISO(a.createdAt), { addSuffix: true }), timestamp: parseISO(a.createdAt), link: '/dashboard/customer-avatars'  }));
      ideas.slice(0, 5).forEach(i => activities.push({ id: `idea-${i.id}`, action: `Ad concept "${i.concept}" (Status: ${i.status}).`, time: formatDistanceToNow(parseISO(i.createdAt), { addSuffix: true }), timestamp: parseISO(i.createdAt), link: '/dashboard/idea-tracker'  }));
      ads.slice(0,3).forEach(ad => activities.push({ id: `ad-${ad.id}`, action: `Ad draft "${ad.data.adConcept || ad.data.batchDctNumber || 'Untitled Ad'}" saved.`, time: formatDistanceToNow(parseISO(ad.createdAt), { addSuffix: true }), timestamp: parseISO(ad.createdAt), link: '/dashboard/ad-creation' }));
      submissions.slice(0,3).forEach(s => {
        const subTimestamp = typeof s.submittedAt === 'string' ? parseISO(s.submittedAt) : new Date(); // Simplified for local
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
        newRecommendations.push({ title: 'Develop Raw Ideas', description: `You have ${rawIdeas} 'Raw' ad concepts. Try developing them further.`, actionText: 'View Ideas', actionLink: '/dashboard/idea-tracker', bgColorClass: 'bg-purple-500', icon: <Lightbulb className="h-4 w-4 text-purple-700" /> });
      }
      if (headlinePatterns.length < 3) {
        newRecommendations.push({ title: 'Expand Headline Arsenal', description: 'Boost your ad copy by adding more headline patterns.', actionText: 'Add Patterns', actionLink: '/dashboard/headline-patterns', bgColorClass: 'bg-green-500', icon: <Edit3 className="h-4 w-4 text-green-700" /> });
      }
       if (newRecommendations.length < 3 && marketingAssetCount < 1) {
        newRecommendations.push({ title: 'Create Your First Ad', description: 'Start building your first marketing asset using the ad creation tool.', actionText: 'Create Ad', actionLink: '/dashboard/ad-creation', bgColorClass: 'bg-yellow-500', icon: <Package className="h-4 w-4 text-yellow-700" /> });
      }
      setRecommendations(newRecommendations.slice(0,3));
    };

    loadData();
    const intervalId = setInterval(loadData, 30000);
    return () => clearInterval(intervalId);

  }, []);


  const metricCardsData: MetricCardProps[] = [
    { title: 'Customer Avatars', value: String(avatarCount), icon: <Users className="h-5 w-5" />, viewLink: '/dashboard/customer-avatars' },
    { title: 'Mass Desires', value: String(desireCount), icon: <Heart className="h-5 w-5" />, viewLink: '/dashboard/mass-desires' },
    { title: 'Ad Concepts', value: String(adConceptCount), icon: <Lightbulb className="h-5 w-5" />, viewLink: '/dashboard/idea-tracker' },
    { title: 'Marketing Assets', value: String(marketingAssetCount), icon: <Package className="h-5 w-5" />, viewLink: '/dashboard/ad-creation' },
    { title: 'Benefit Conversions', value: String(featureBenefitCount), icon: <Gift className="h-5 w-5" />, viewLink: '/dashboard/features-to-benefits' },
    { title: 'Master Field Entries', value: String(masterFieldCount), icon: <Tags className="h-5 w-5" />, viewLink: '/dashboard/master-fields' },
    { title: 'Roadmap Items', value: String(roadmapEntryCount), icon: <Map className="h-5 w-5" />, viewLink: '/dashboard/creative-roadmap' },
    { title: 'Headline Patterns', value: String(headlinePatternCount), icon: <PenSquare className="h-5 w-5" />, viewLink: '/dashboard/headline-patterns' },
    { title: 'Tracked Iterations', value: String(iterationTrackerCount), icon: <Repeat className="h-5 w-5" />, viewLink: '/dashboard/iteration-tracker' },
    { title: 'Product Mechanisms', value: String(mechanismCount), icon: <Sparkles className="h-5 w-5" />, viewLink: '/dashboard/mechanization' },
    { title: 'Campaign Submissions', value: String(submissionCount), icon: <Send className="h-5 w-5" />, viewLink: '/dashboard/submissions' },
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metricCardsData.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> {/* Changed from lg:grid-cols-3 */}
        {/* Removed Ad Concepts per Persona Card */}
        <div className="lg:col-span-1 space-y-6"> {/* This will now take up one half on large screens */}
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
            {recentActivities.length > 0 && (
                <CardFooter>
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href="#">View all activity</Link>
                </Button>
                </CardFooter>
            )}
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6"> {/* This will now take up the other half on large screens */}
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

    