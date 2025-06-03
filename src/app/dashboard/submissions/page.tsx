'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';

// These would typically come from a data source / context
const dummyAvatars = [{id: '1', name: 'Tech Enthusiast'}, {id: '2', name: 'Busy Parent'}];
const dummyAdConcepts = [{id: 'c1', name: 'Summer Sale Blitz'}, {id: 'c2', name: 'New Feature Launch'}];
const dummyMassDesires = [{id: 'md1', name: 'Save Time'}, {id: 'md2', name: 'Improve Health'}];
const dummyFeaturesBenefits = [{id: 'fb1', name: 'Feature A -> Benefit X'}, {id: 'fb2', name: 'Feature B -> Benefit Y'}];

export default function SubmissionsPage() {
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [adConcept, setAdConcept] = useState('');
  const [massDesire, setMassDesire] = useState('');
  const [featureBenefit, setFeatureBenefit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!title || !avatar || !adConcept || !massDesire || !featureBenefit) {
      toast({ title: "Missing Information", description: "Please fill all fields.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Simulate submission
    console.log({ title, avatar, adConcept, massDesire, featureBenefit });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Campaign Submitted',
      description: `"${title}" has been submitted for review.`,
    });
    
    // Reset form
    setTitle('');
    setAvatar('');
    setAdConcept('');
    setMassDesire('');
    setFeatureBenefit('');
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">New Campaign Submission</CardTitle>
        <CardDescription>Submit your campaign details for review and activation.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Submission Title</Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Q4 Holiday Push - Phase 1" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="customer-avatar">Customer Avatar</Label>
            <Select value={avatar} onValueChange={setAvatar} required>
              <SelectTrigger id="customer-avatar"><SelectValue placeholder="Select Avatar" /></SelectTrigger>
              <SelectContent>
                {dummyAvatars.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad-concept">Ad Concept</Label>
            <Select value={adConcept} onValueChange={setAdConcept} required>
              <SelectTrigger id="ad-concept"><SelectValue placeholder="Select Ad Concept" /></SelectTrigger>
              <SelectContent>
                {dummyAdConcepts.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mass-desire">Mass Desire</Label>
            <Select value={massDesire} onValueChange={setMassDesire} required>
              <SelectTrigger id="mass-desire"><SelectValue placeholder="Select Mass Desire" /></SelectTrigger>
              <SelectContent>
                {dummyMassDesires.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-benefit">Feature & Benefit</Label>
            <Select value={featureBenefit} onValueChange={setFeatureBenefit} required>
              <SelectTrigger id="feature-benefit"><SelectValue placeholder="Select Feature & Benefit" /></SelectTrigger>
              <SelectContent>
                {dummyFeaturesBenefits.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Save Submission'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
