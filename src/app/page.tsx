
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import Image from 'next/image';
import { Lightbulb, Target, TrendingUp, Users, Edit3 } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-sidebar">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 text-center bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-white mb-6">
              Elevate Your Ad Strategy with Stratlify
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-10">
              Track, test, and optimize your creative ad campaigns using deep copywriting frameworks, iteration tracking, and structured ad building.
            </p>
            <div className="space-x-4">
              <Button size="lg" asChild className="font-semibold">
                <Link href="/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="font-semibold bg-transparent text-white border-white hover:bg-white hover:text-sidebar">
                <Link href="/login">Login to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-headline font-semibold text-center text-white mb-12">
              Why Stratlify?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: <Target className="w-10 h-10 text-accent" />, title: "Structured Ad Building", description: "Create compelling ads with proven frameworks and guided inputs." },
                { icon: <TrendingUp className="w-10 h-10 text-accent" />, title: "Iteration Tracking", description: "Monitor and analyze ad performance across multiple iterations effortlessly." },
                { icon: <Edit3 className="w-10 h-10 text-accent" />, title: "Copywriter-Centric UI", description: "A clean, minimalistic interface designed for creative professionals." },
                { icon: <Lightbulb className="w-10 h-10 text-accent" />, title: "AI-Powered Insights", description: "Leverage AI to generate unique mechanisms and ad copy variations." },
                { icon: <Users className="w-10 h-10 text-accent" />, title: "Team Collaboration", description: "Streamline your team's workflow with centralized campaign management." },
                { icon: <Image src="https://placehold.co/100x100.png" alt="Feature placeholder" width={100} height={100} className="rounded-lg object-cover w-10 h-10" data-ai-hint="strategy tools" />, title: "Comprehensive Toolset", description: "From idea tracking to headline patterns, all tools in one place." },
              ].map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-headline font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-foreground/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-transparent text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-headline font-semibold mb-6">
              Ready to Revolutionize Your Ad Campaigns?
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto mb-8">
              Join Stratlify today and start building high-performing ads that convert.
            </p>
            <Button size="lg" asChild className="font-semibold">
              <Link href="/register">Sign Up Now</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 bg-transparent border-t border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Stratlify. All rights reserved.</p>
          <p className="text-sm">A platform for modern advertising teams.</p>
        </div>
      </footer>
    </div>
  );
}
