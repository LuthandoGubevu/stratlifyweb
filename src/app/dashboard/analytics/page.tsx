'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// Removed chart-specific imports from lucide-react and recharts
import Image from 'next/image';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Analytics & Reports</CardTitle>
          <CardDescription>Key metrics and performance insights for your ad campaigns.</CardDescription>
        </CardHeader>
      </Card>

      {/* Removed hardcoded stat cards and charts */}
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">More Reports Coming Soon!</CardTitle>
          <CardDescription>We are working on adding more detailed analytics and custom reporting features.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Image src="https://placehold.co/600x300.png" alt="Coming Soon" width={600} height={300} className="mx-auto rounded-lg shadow-md" data-ai-hint="analytics graph"/>
          <p className="mt-4 text-muted-foreground">Stay tuned for updates.</p>
        </CardContent>
      </Card>
    </div>
  );
}
