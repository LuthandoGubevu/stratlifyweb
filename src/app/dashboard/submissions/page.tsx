
'use client';

import { useState, useEffect, FormEvent } from 'react';
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

// Import types from other pages
import type { CustomerAvatar } from '../customer-avatars/page';
import type { Idea } from '../idea-tracker/page';
import type { MassDesire } from '../mass-desires/page';
import type { FeatureBenefitPair } from '../features-to-benefits/page';

// localStorage keys used by other pages
const LOCAL_STORAGE_AVATARS_KEY = 'customerAvatarsEntries';
const LOCAL_STORAGE_IDEAS_KEY = 'ideaTrackerEntries'; // For Ad Concepts
const LOCAL_STORAGE_DESIRES_KEY = 'massDesiresEntries';
const LOCAL_STORAGE_FB_KEY = 'featuresBenefitsEntries';

export default function SubmissionsPage() {
  const [title, setTitle] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedAdConcept, setSelectedAdConcept] = useState('');
  const [selectedMassDesire, setSelectedMassDesire] = useState('');
  const [selectedFeatureBenefit, setSelectedFeatureBenefit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [avatars, setAvatars] = useState<CustomerAvatar[]>([]);
  const [adConcepts, setAdConcepts] = useState<Idea[]>([]); // Using Idea type for concepts
  const [massDesires, setMassDesires] = useState<MassDesire[]>([]);
  const [featuresBenefits, setFeaturesBenefits] = useState<FeatureBenefitPair[]>([]);

  useEffect(() => {
    try {
      const storedAvatars = localStorage.getItem(LOCAL_STORAGE_AVATARS_KEY);
      if (storedAvatars) setAvatars(JSON.parse(storedAvatars));

      const storedIdeas = localStorage.getItem(LOCAL_STORAGE_IDEAS_KEY);
      if (storedIdeas) setAdConcepts(JSON.parse(storedIdeas));
      
      const storedDesires = localStorage.getItem(LOCAL_STORAGE_DESIRES_KEY);
      if (storedDesires) setMassDesires(JSON.parse(storedDesires));

      const storedFbPairs = localStorage.getItem(LOCAL_STORAGE_FB_KEY);
      if (storedFbPairs) setFeaturesBenefits(JSON.parse(storedFbPairs));
    } catch (error) {
      console.error("Error loading data from localStorage for submissions page:", error);
      toast({
        title: "Error Loading Data",
        description: "Could not load some prerequisite data from local storage.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!title || !selectedAvatar || !selectedAdConcept || !selectedMassDesire || !selectedFeatureBenefit) {
      toast({ title: "Missing Information", description: "Please fill all fields.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    // Simulate submission
    console.log({ 
      title, 
      avatarId: selectedAvatar, 
      adConceptId: selectedAdConcept, 
      massDesireId: selectedMassDesire, 
      featureBenefitId: selectedFeatureBenefit 
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Campaign Submitted',
      description: `"${title}" has been submitted for review.`,
    });
    
    // Reset form
    setTitle('');
    setSelectedAvatar('');
    setSelectedAdConcept('');
    setSelectedMassDesire('');
    setSelectedFeatureBenefit('');
    setIsSubmitting(false);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">New Campaign Submission</CardTitle>
        <CardDescription>Submit your campaign details for review and activation. Data is sourced from your entries on other pages.</CardDescription>
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
            <Select value={selectedAvatar} onValueChange={setSelectedAvatar} required>
              <SelectTrigger id="customer-avatar"><SelectValue placeholder="Select Avatar" /></SelectTrigger>
              <SelectContent>
                {avatars.length > 0 ? (
                  avatars.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)
                ) : (
                  <SelectItem value="no-avatars" disabled>No avatars defined yet. Please add one on the Customer Avatars page.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ad-concept">Ad Concept (from Idea Tracker)</Label>
            <Select value={selectedAdConcept} onValueChange={setSelectedAdConcept} required>
              <SelectTrigger id="ad-concept"><SelectValue placeholder="Select Ad Concept" /></SelectTrigger>
              <SelectContent>
                {adConcepts.length > 0 ? (
                  adConcepts.map(item => <SelectItem key={item.id} value={item.id}>{item.concept}</SelectItem>)
                ) : (
                   <SelectItem value="no-concepts" disabled>No concepts found. Please add one on the Idea Tracker page.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mass-desire">Mass Desire</Label>
            <Select value={selectedMassDesire} onValueChange={setSelectedMassDesire} required>
              <SelectTrigger id="mass-desire"><SelectValue placeholder="Select Mass Desire" /></SelectTrigger>
              <SelectContent>
                {massDesires.length > 0 ? (
                  massDesires.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>)
                ) : (
                  <SelectItem value="no-desires" disabled>No mass desires defined. Please add one on the Mass Desires page.</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feature-benefit">Feature & Benefit</Label>
            <Select value={selectedFeatureBenefit} onValueChange={setSelectedFeatureBenefit} required>
              <SelectTrigger id="feature-benefit"><SelectValue placeholder="Select Feature & Benefit" /></SelectTrigger>
              <SelectContent>
                {featuresBenefits.length > 0 ? (
                  featuresBenefits.map(item => <SelectItem key={item.id} value={item.id}>{`${item.productFeature} -> ${item.directBenefit}`}</SelectItem>)
                ) : (
                  <SelectItem value="no-fb" disabled>No feature-benefit pairs. Please add some on the Features to Benefits page.</SelectItem>
                )}
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
