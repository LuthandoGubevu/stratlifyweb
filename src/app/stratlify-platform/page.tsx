
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar'; // Original Stratlify Navbar
import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, ClipboardList, Repeat, PenSquare } from 'lucide-react';

export default function StratlifyPlatformPage() {
  return (
    <div className="flex flex-col min-h-screen bg-sidebar">
      <Navbar /> {/* Uses the original Stratlify Navbar */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 text-center bg-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-headline font-bold text-white mb-6">
              Master Your Marketing: Plan, Build, and Optimize Ad Campaigns with Precision
            </h1>
            <p className="text-lg sm:text-xl text-gray-200 max-w-3xl mx-auto mb-10">
              Stratlify provides the structure and tools to transform your ad concepts into high-performing campaigns. Centralize your strategy, build with proven frameworks, and iterate towards success.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Briefcase className="w-10 h-10 text-accent" />, title: "Strategic Campaign Hub", description: "Define customer avatars, capture ad concepts, and map out your entire campaign lifecycle in one centralized hub." },
                { icon: <ClipboardList className="w-10 h-10 text-accent" />, title: "Guided Ad Construction", description: "Build high-impact ads with structured inputs for hooks, headlines, body copy, CTAs, and landing page details." },
                { icon: <Repeat className="w-10 h-10 text-accent" />, title: "Iterative Performance Tracking", description: "Track ad versions, document learnings, and systematically improve your campaigns based on performance data." },
                { icon: <PenSquare className="w-10 h-10 text-accent" />, title: "Deep Copywriting Toolkit", description: "Define core desires, convert features to benefits, leverage headline patterns, and articulate unique product mechanisms." },
              ].map((feature, index) => (
                <div key={index} className="bg-card p-6 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-headline font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-foreground/70 flex-grow">{feature.description}</p>
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
