'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, PieChart as PieChartIcon, Users, DollarSign, Target } from 'lucide-react';
import { Bar, ComposedChart, Line, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import Image from 'next/image';

const campaignPerformanceData = [
  { month: 'Jan', spend: 4000, leads: 240, sales: 150 },
  { month: 'Feb', spend: 3000, leads: 139, sales: 120 },
  { month: 'Mar', spend: 2000, leads: 380, sales: 290 },
  { month: 'Apr', spend: 2780, leads: 300, sales: 200 },
  { month: 'May', spend: 1890, leads: 480, sales: 218 },
  { month: 'Jun', spend: 2390, leads: 380, sales: 250 },
];

const chartConfig = {
  spend: { label: 'Ad Spend ($)', color: 'hsl(var(--chart-1))' },
  leads: { label: 'Leads', color: 'hsl(var(--chart-2))' },
  sales: { label: 'Sales', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;


const adSpendByChannel = [
  { name: 'Facebook Ads', value: 400, fill: 'hsl(var(--chart-1))' },
  { name: 'Google Ads', value: 300, fill: 'hsl(var(--chart-2))' },
  { name: 'LinkedIn Ads', value: 300, fill: 'hsl(var(--chart-3))' },
  { name: 'Twitter Ads', value: 200, fill: 'hsl(var(--chart-4))' },
];

const pieChartConfig = {
  value: { label: 'Ad Spend' },
  ...adSpendByChannel.reduce((acc, cur) => {
    acc[cur.name] = { label: cur.name, color: cur.fill };
    return acc;
  }, {} as ChartConfig)
} satisfies ChartConfig


export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Analytics & Reports</CardTitle>
          <CardDescription>Key metrics and performance insights for your ad campaigns.</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ad Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads Generated</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.6%</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Campaign Performance Over Time</CardTitle>
            <CardDescription>Monthly ad spend, leads, and sales.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="aspect-video h-[300px] w-full">
              <ComposedChart data={campaignPerformanceData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis yAxisId="left" orientation="left" stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend content={<ChartLegend />} />
                <Bar dataKey="spend" fill="var(--color-spend)" radius={4} yAxisId="left" />
                <Line type="monotone" dataKey="leads" stroke="var(--color-leads)" strokeWidth={2} yAxisId="right" dot={false} />
                <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} yAxisId="right" dot={false} />
              </ComposedChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Ad Spend by Channel</CardTitle>
            <CardDescription>Distribution of ad budget across different platforms.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={pieChartConfig} className="mx-auto aspect-square w-full max-w-[300px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={adSpendByChannel} dataKey="value" nameKey="name" labelLine={false} label={({payload, ...props}) => `${payload.name} (${payload.value})`}>
                   {adSpendByChannel.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
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
