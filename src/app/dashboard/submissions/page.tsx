
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
import { Send, ListChecks, Eye, Copy } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import type { CustomerAvatar } from '../customer-avatars/page';
import type { Idea } from '../idea-tracker/page';
import type { MassDesire } from '../mass-desires/page';
import type { FeatureBenefitPair } from '../features-to-benefits/page';
import type { RoadmapEntry } from '../creative-roadmap/page';
import type { HeadlinePattern } from '../headline-patterns/page';
import type { Mechanism } from '../mechanization/page';
import type { AdCreationFormValues } from '../ad-creation/page';

// Firestore imports
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

interface StoredAdCreationEntry {
  id: string;
  data: AdCreationFormValues;
  createdAt: string;
}

const LOCAL_STORAGE_AVATARS_KEY = 'customerAvatarsEntries';
const LOCAL_STORAGE_IDEAS_KEY = 'ideaTrackerEntries';
const LOCAL_STORAGE_DESIRES_KEY = 'massDesiresEntries';
const LOCAL_STORAGE_FB_KEY = 'featuresBenefitsEntries';
const LOCAL_STORAGE_ROADMAP_KEY = 'creativeRoadmapEntries';
const LOCAL_STORAGE_HEADLINES_KEY = 'headlinePatterns';
const LOCAL_STORAGE_MECHANISMS_KEY = 'productMechanisms';
const LOCAL_STORAGE_AD_CREATION_KEY = 'adCreationEntries';
const LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY = 'compiledCampaignSubmissions'; // For local display

export interface CompiledCampaignSubmission { // Exporting for use in viewer page
  id: string; // This will be localStorage ID for local list, Firestore ID for actual stored doc
  submissionTitle: string;
  submittedBy: string;
  submittedAt: string | Timestamp; // string for localStorage, Timestamp for Firestore
  customerAvatar?: CustomerAvatar;
  ideaTracker?: Idea;
  massDesire?: MassDesire;
  featuresToBenefits?: FeatureBenefitPair;
  creativeRoadmap?: RoadmapEntry;
  headlinePattern?: HeadlinePattern;
  mechanization?: Mechanism;
  adCreation?: AdCreationFormValues;
  firestoreId?: string; // To store the Firestore document ID for share links
}

export default function SubmissionsPage() {
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submittedBy, setSubmittedBy] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedAdConcept, setSelectedAdConcept] = useState('');
  const [selectedMassDesire, setSelectedMassDesire] = useState('');
  const [selectedFeatureBenefit, setSelectedFeatureBenefit] = useState('');
  const [selectedRoadmapEntry, setSelectedRoadmapEntry] = useState('');
  const [selectedHeadlinePattern, setSelectedHeadlinePattern] = useState('');
  const [selectedMechanism, setSelectedMechanism] = useState('');
  const [selectedAdCreation, setSelectedAdCreation] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [avatars, setAvatars] = useState<CustomerAvatar[]>([]);
  const [adConcepts, setAdConcepts] = useState<Idea[]>([]);
  const [massDesires, setMassDesires] = useState<MassDesire[]>([]);
  const [featuresBenefits, setFeaturesBenefits] = useState<FeatureBenefitPair[]>([]);
  const [roadmapEntries, setRoadmapEntries] = useState<RoadmapEntry[]>([]);
  const [headlinePatterns, setHeadlinePatterns] = useState<HeadlinePattern[]>([]);
  const [mechanisms, setMechanisms] = useState<Mechanism[]>([]);
  const [adCreationEntries, setAdCreationEntries] = useState<StoredAdCreationEntry[]>([]);
  
  const [compiledSubmissions, setCompiledSubmissions] = useState<CompiledCampaignSubmission[]>([]);
  const [lastFirestoreSubmissionId, setLastFirestoreSubmissionId] = useState<string | null>(null);


  useEffect(() => {
    const loadData = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T[]>>, name: string) => {
      try {
        const storedData = localStorage.getItem(key);
        if (storedData) setter(JSON.parse(storedData));
      } catch (error) {
        console.error(`Error loading ${name} from localStorage:`, error);
        toast({ title: `Error Loading ${name}`, description: `Could not load ${name} data.`, variant: "destructive" });
      }
    };

    loadData<CustomerAvatar>(LOCAL_STORAGE_AVATARS_KEY, setAvatars, "Avatars");
    loadData<Idea>(LOCAL_STORAGE_IDEAS_KEY, setAdConcepts, "Ad Concepts");
    loadData<MassDesire>(LOCAL_STORAGE_DESIRES_KEY, setMassDesires, "Mass Desires");
    loadData<FeatureBenefitPair>(LOCAL_STORAGE_FB_KEY, setFeaturesBenefits, "Features/Benefits");
    loadData<RoadmapEntry>(LOCAL_STORAGE_ROADMAP_KEY, setRoadmapEntries, "Roadmap Entries");
    loadData<HeadlinePattern>(LOCAL_STORAGE_HEADLINES_KEY, setHeadlinePatterns, "Headline Patterns");
    loadData<Mechanism>(LOCAL_STORAGE_MECHANISMS_KEY, setMechanisms, "Mechanisms");
    loadData<StoredAdCreationEntry>(LOCAL_STORAGE_AD_CREATION_KEY, setAdCreationEntries, "Ad Creation Entries");
    loadData<CompiledCampaignSubmission>(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY, setCompiledSubmissions, "Compiled Submissions (Local)");

  }, [toast]);

  useEffect(() => {
    // Save local list to localStorage
    if (compiledSubmissions.length > 0 || localStorage.getItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY)) {
        localStorage.setItem(LOCAL_STORAGE_COMPILED_SUBMISSIONS_KEY, JSON.stringify(compiledSubmissions));
    }
  }, [compiledSubmissions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLastFirestoreSubmissionId(null);
    
    if (!submissionTitle.trim() || !submittedBy.trim()) {
      toast({ title: "Missing Information", description: "Submission Title and Submitted By are required.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    const findItemById = <T extends {id: string}>(items: T[], id: string): T | undefined => items.find(item => item.id === id);
    const findAdCreationById = (items: StoredAdCreationEntry[], id: string): AdCreationFormValues | undefined => {
        const found = items.find(item => item.id === id);
        return found?.data;
    };

    const firestoreCampaignData = {
      submissionTitle,
      submittedBy,
      submittedAt: Timestamp.now(), // Firestore Timestamp
      customerAvatar: findItemById(avatars, selectedAvatar) || null,
      ideaTracker: findItemById(adConcepts, selectedAdConcept) || null,
      massDesire: findItemById(massDesires, selectedMassDesire) || null,
      featuresToBenefits: findItemById(featuresBenefits, selectedFeatureBenefit) || null,
      creativeRoadmap: findItemById(roadmapEntries, selectedRoadmapEntry) || null,
      headlinePattern: findItemById(headlinePatterns, selectedHeadlinePattern) || null,
      mechanization: findItemById(mechanisms, selectedMechanism) || null,
      adCreation: findAdCreationById(adCreationEntries, selectedAdCreation) || null,
    };
    
    try {
      const docRef = await addDoc(collection(db, "submissions"), firestoreCampaignData);
      setLastFirestoreSubmissionId(docRef.id);
      toast({
        title: 'Campaign Submitted to Firestore!',
        description: `"${submissionTitle}" saved with ID: ${docRef.id}. Share link available.`,
      });

      // Also update local storage list (optional, could be removed if dashboard reads from Firestore)
      const localCampaignData: CompiledCampaignSubmission = {
        ...firestoreCampaignData,
        id: String(Date.now()), // Local unique ID
        submittedAt: new Date().toISOString(), // String for local
        firestoreId: docRef.id
      };
      setCompiledSubmissions(prev => [localCampaignData, ...prev]);

    } catch (error) {
      console.error("Error adding document to Firestore: ", error);
      toast({
        title: 'Firestore Submission Failed',
        description: 'Could not save the campaign to the database. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
       // Reset form partly, keep dropdowns if user wants to make similar submission
      setSubmissionTitle('');
      setSubmittedBy('');
      // Optionally reset all select fields:
      // setSelectedAvatar(''); setSelectedAdConcept(''); ...etc.
    }
  };

  const handleCopyLink = () => {
    if (!lastFirestoreSubmissionId) return;
    const link = `${window.location.origin}/submission/${lastFirestoreSubmissionId}`;
    navigator.clipboard.writeText(link).then(() => {
      toast({ title: "Link Copied!", description: "Shareable link copied to clipboard." });
    }).catch(err => {
      toast({ title: "Copy Failed", description: "Could not copy link.", variant: "destructive" });
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">New Campaign Submission</CardTitle>
          <CardDescription>Compile elements from various modules into a single campaign submission. Data is saved to Firestore and locally.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="submissionTitle">Submission Title *</Label>
                <Input id="submissionTitle" value={submissionTitle} onChange={(e) => setSubmissionTitle(e.target.value)} placeholder="e.g., Q4 Holiday Push - Phase 1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submittedBy">Submitted By (Initials) *</Label>
                <Input id="submittedBy" value={submittedBy} onChange={(e) => setSubmittedBy(e.target.value)} placeholder="e.g., JD" maxLength={5} required />
              </div>
            </div>
            
            <Accordion type="multiple" className="w-full" defaultValue={['item-1', 'item-2']}>
              <AccordionItem value="item-1">
                <AccordionTrigger className="font-semibold">Core Campaign Elements</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customer-avatar">Customer Avatar</Label>
                      <Select value={selectedAvatar} onValueChange={setSelectedAvatar}>
                        <SelectTrigger id="customer-avatar"><SelectValue placeholder="Select Avatar" /></SelectTrigger>
                        <SelectContent>
                          {avatars.length > 0 ? avatars.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>) : <SelectItem value="no-avatars" disabled>No avatars defined.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad-concept">Ad Concept (from Idea Tracker)</Label>
                      <Select value={selectedAdConcept} onValueChange={setSelectedAdConcept}>
                        <SelectTrigger id="ad-concept"><SelectValue placeholder="Select Ad Concept" /></SelectTrigger>
                        <SelectContent>
                          {adConcepts.length > 0 ? adConcepts.map(item => <SelectItem key={item.id} value={item.id}>{item.concept}</SelectItem>) : <SelectItem value="no-concepts" disabled>No concepts found.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mass-desire">Mass Desire</Label>
                      <Select value={selectedMassDesire} onValueChange={setSelectedMassDesire}>
                        <SelectTrigger id="mass-desire"><SelectValue placeholder="Select Mass Desire" /></SelectTrigger>
                        <SelectContent>
                          {massDesires.length > 0 ? massDesires.map(item => <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>) : <SelectItem value="no-desires" disabled>No mass desires defined.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="feature-benefit">Feature & Benefit</Label>
                      <Select value={selectedFeatureBenefit} onValueChange={setSelectedFeatureBenefit}>
                        <SelectTrigger id="feature-benefit"><SelectValue placeholder="Select Feature & Benefit" /></SelectTrigger>
                        <SelectContent>
                          {featuresBenefits.length > 0 ? featuresBenefits.map(item => <SelectItem key={item.id} value={item.id}>{`${item.productFeature.substring(0,20)}... -> ${item.directBenefit.substring(0,20)}...`}</SelectItem>) : <SelectItem value="no-fb" disabled>No feature-benefit pairs.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="font-semibold">Strategy & Execution Elements</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="creative-roadmap">Creative Roadmap Entry</Label>
                      <Select value={selectedRoadmapEntry} onValueChange={setSelectedRoadmapEntry}>
                        <SelectTrigger id="creative-roadmap"><SelectValue placeholder="Select Roadmap Entry" /></SelectTrigger>
                        <SelectContent>
                          {roadmapEntries.length > 0 ? roadmapEntries.map(item => <SelectItem key={item.id} value={item.id}>{item.dctNumber} - {item.adConcept}</SelectItem>) : <SelectItem value="no-roadmap" disabled>No roadmap entries.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="headline-pattern">Headline Pattern</Label>
                      <Select value={selectedHeadlinePattern} onValueChange={setSelectedHeadlinePattern}>
                        <SelectTrigger id="headline-pattern"><SelectValue placeholder="Select Headline Pattern" /></SelectTrigger>
                        <SelectContent>
                          {headlinePatterns.length > 0 ? headlinePatterns.map(item => <SelectItem key={item.id} value={item.id}>{item.pattern.substring(0,50)}...</SelectItem>) : <SelectItem value="no-headlines" disabled>No headline patterns.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mechanization">Product Mechanism</Label>
                      <Select value={selectedMechanism} onValueChange={setSelectedMechanism}>
                        <SelectTrigger id="mechanization"><SelectValue placeholder="Select Mechanism" /></SelectTrigger>
                        <SelectContent>
                          {mechanisms.length > 0 ? mechanisms.map(item => <SelectItem key={item.id} value={item.id}>{item.mechanismName} ({item.product})</SelectItem>) : <SelectItem value="no-mechanisms" disabled>No mechanisms defined.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ad-creation-entry">Ad Creation Draft</Label>
                      <Select value={selectedAdCreation} onValueChange={setSelectedAdCreation}>
                        <SelectTrigger id="ad-creation-entry"><SelectValue placeholder="Select Ad Draft" /></SelectTrigger>
                        <SelectContent>
                          {adCreationEntries.length > 0 ? adCreationEntries.map(item => <SelectItem key={item.id} value={item.id}>{item.data.adConcept || item.data.batchDctNumber} (Saved: {new Date(item.createdAt).toLocaleDateString()})</SelectItem>) : <SelectItem value="no-ad-drafts" disabled>No ad drafts saved.</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

          </CardContent>
          <CardFooter className="flex-col items-start space-y-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Send className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Compile & Save Submission'}
            </Button>
            {lastFirestoreSubmissionId && (
              <div className="w-full p-3 border rounded-md bg-secondary/50 flex items-center justify-between">
                <p className="text-sm text-foreground">
                  Share link for last submission: <code className="bg-muted px-1 rounded text-xs">{window.location.origin}/submission/{lastFirestoreSubmissionId}</code>
                </p>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <Copy className="mr-2 h-3 w-3"/> Copy Link
                </Button>
              </div>
            )}
          </CardFooter>
        </form>
      </Card>

      {compiledSubmissions.length > 0 && (
        <Card className="max-w-3xl mx-auto mt-6">
          <CardHeader>
            <CardTitle className="font-headline text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary"/>Locally Saved Campaign Submissions</CardTitle>
            <CardDescription>This is a list of submissions saved in your browser's local storage. For permanent, shareable submissions, use the "Compile & Save Submission" button above which saves to Firestore.</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {compiledSubmissions.map(submission => (
                <AccordionItem value={submission.id} key={submission.id}>
                  <AccordionTrigger className="font-semibold hover:no-underline">
                    <div className="flex justify-between items-center w-full">
                      <span>{submission.submissionTitle}</span>
                      <span className="text-xs text-muted-foreground mr-2">
                        By: {submission.submittedBy} on {new Date(submission.submittedAt as string).toLocaleDateString()}
                        {submission.firestoreId && <span className="ml-2 text-green-600">(Saved to DB)</span>}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs">
                      {JSON.stringify(submission, (key, value) => 
                        key === 'submittedAt' && typeof value === 'object' && value && 'seconds' in value ? new Date(value.seconds * 1000).toISOString() : value, 
                      2)}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


    